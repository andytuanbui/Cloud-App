import React, { createContext, PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';
import { AppState as NativeAppState } from 'react-native';
import { getLocalDateKey, isValidLocalDateKey } from '../services/date/dateService';
import { clearAppState, loadAppState, saveAppState } from '../services/storage/appStorage';
import { createDefaultAppState, migrateAppState } from './appStateMigration';
import { PersistedAppState, WisdomProgress, WisdomStep } from './types';

type AppStateContextValue = PersistedAppState & {
  isRestoring: boolean;
  currentDateKey: string;
  getProgress: (wisdomId: string) => WisdomProgress | undefined;
  updateProgress: (wisdomId: string, update: Partial<WisdomProgress>) => void;
  completeStep: (wisdomId: string, step: WisdomStep, nextStep: WisdomStep) => void;
};

export const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

declare global {
  var __cloudwiseReset: (() => Promise<void>) | undefined;
  var __cloudwiseSetDate: ((dateKey: string) => void) | undefined;
  var __cloudwiseClearDate: (() => void) | undefined;
}

function newProgress(wisdomId: string): WisdomProgress {
  return {
    wisdomId,
    currentStep: 'opening',
    completedSteps: [],
    conversationResponses: [],
    quizProgress: { questionIndex: 0, completedAnswerIds: [] },
    completed: false,
  };
}

export function AppStateProvider({ children }: PropsWithChildren) {
  const queryDateKey =
    __DEV__ && typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('cloudwiseDate')
      : null;
  const initialDateKey =
    queryDateKey && isValidLocalDateKey(queryDateKey) ? queryDateKey : getLocalDateKey();
  const [dateOverride, setDateOverride] = useState<string | null>(
    queryDateKey && isValidLocalDateKey(queryDateKey) ? queryDateKey : null,
  );
  const [currentDateKey, setCurrentDateKey] = useState(initialDateKey);
  const [state, setState] = useState(() => createDefaultAppState(initialDateKey));
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    async function restore() {
      const shouldReset =
        __DEV__ &&
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('resetCloudwise') === '1';

      if (shouldReset) {
        await clearAppState();
        const params = new URLSearchParams(window.location.search);
        params.delete('resetCloudwise');
        const search = params.toString();
        window.history.replaceState({}, '', `${window.location.pathname}${search ? `?${search}` : ''}`);
        setState(createDefaultAppState(initialDateKey));
      } else {
        const saved = await loadAppState();
        setState(migrateAppState(saved, initialDateKey));
      }

      setIsRestoring(false);
    }

    void restore();
  }, [initialDateKey]);

  useEffect(() => {
    if (!isRestoring) void saveAppState(state);
  }, [isRestoring, state]);

  useEffect(() => {
    if (!__DEV__) return;

    globalThis.__cloudwiseReset = async () => {
      await clearAppState();
      setState(createDefaultAppState(currentDateKey));
    };
    globalThis.__cloudwiseSetDate = (dateKey: string) => {
      if (!isValidLocalDateKey(dateKey)) throw new Error('Use a valid YYYY-MM-DD local date key');
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('cloudwiseDate', dateKey);
        window.history.replaceState({}, '', `${url.pathname}${url.search}`);
      }
      setDateOverride(dateKey);
      setCurrentDateKey(dateKey);
    };
    globalThis.__cloudwiseClearDate = () => {
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('cloudwiseDate');
        window.history.replaceState({}, '', `${url.pathname}${url.search}`);
      }
      setDateOverride(null);
      setCurrentDateKey(getLocalDateKey());
    };

    return () => {
      delete globalThis.__cloudwiseReset;
      delete globalThis.__cloudwiseSetDate;
      delete globalThis.__cloudwiseClearDate;
    };
  }, [currentDateKey]);

  const refreshDate = useCallback(() => {
    setCurrentDateKey(dateOverride ?? getLocalDateKey());
  }, [dateOverride]);

  useEffect(() => {
    const subscription = NativeAppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') refreshDate();
    });
    return () => subscription.remove();
  }, [refreshDate]);

  useEffect(() => {
    if (isRestoring) return;
    setState((current) =>
      current.profile.lastOpenedDateKey === currentDateKey
        ? current
        : {
            ...current,
            profile: { ...current.profile, lastOpenedDateKey: currentDateKey },
          },
    );
  }, [currentDateKey, isRestoring]);

  const getProgress = useCallback(
    (wisdomId: string) => state.wisdomProgress[wisdomId],
    [state.wisdomProgress],
  );

  const updateProgress = useCallback((wisdomId: string, update: Partial<WisdomProgress>) => {
    setState((current) => {
      const existing = current.wisdomProgress[wisdomId] ?? newProgress(wisdomId);
      return {
        ...current,
        wisdomProgress: {
          ...current.wisdomProgress,
          [wisdomId]: { ...existing, ...update },
        },
      };
    });
  }, []);

  const completeStep = useCallback((wisdomId: string, step: WisdomStep, nextStep: WisdomStep) => {
    setState((current) => {
      const existing = current.wisdomProgress[wisdomId] ?? newProgress(wisdomId);
      return {
        ...current,
        wisdomProgress: {
          ...current.wisdomProgress,
          [wisdomId]: {
            ...existing,
            currentStep: nextStep,
            completedSteps: Array.from(new Set([...existing.completedSteps, step])),
          },
        },
      };
    });
  }, []);

  const value = useMemo(
    () => ({ ...state, isRestoring, currentDateKey, getProgress, updateProgress, completeStep }),
    [state, isRestoring, currentDateKey, getProgress, updateProgress, completeStep],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}
