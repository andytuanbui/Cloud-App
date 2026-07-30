import React, { createContext, PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';
import { AppState as NativeAppState } from 'react-native';
import { getLocalDateKey, isValidLocalDateKey } from '../services/date/dateService';
import { clearAppState, loadAppState, saveAppState } from '../services/storage/appStorage';
import { createDefaultAppState, migrateAppState } from './appStateMigration';
import {
  applyProfileDraft,
  completeProfileSetupState,
  updateProfileState,
} from './profileState';
import { validateProfileDetails } from './profileValidation';
import { PersistedAppState, ProfileDetails, WisdomProgress, WisdomStep } from './types';

type AppStateContextValue = PersistedAppState & {
  isRestoring: boolean;
  restoreError: boolean;
  resetRevision: number;
  currentDateKey: string;
  updateProfileDraft: (update: Partial<ProfileDetails>) => void;
  completeProfileSetup: (details: ProfileDetails) => boolean;
  updateProfile: (details: ProfileDetails) => boolean;
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
  const [initialDateKey] = useState(() => {
    const queryDateKey =
      __DEV__ && typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('cloudwiseDate')
        : null;
    return queryDateKey && isValidLocalDateKey(queryDateKey)
      ? queryDateKey
      : getLocalDateKey();
  });
  const [dateOverride, setDateOverride] = useState<string | null>(
    () => {
      const queryDateKey =
        __DEV__ && typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search).get('cloudwiseDate')
          : null;
      return queryDateKey && isValidLocalDateKey(queryDateKey) ? queryDateKey : null;
    },
  );
  const [currentDateKey, setCurrentDateKey] = useState(initialDateKey);
  const [state, setState] = useState(() => createDefaultAppState(initialDateKey));
  const [isRestoring, setIsRestoring] = useState(true);
  const [restoreError, setRestoreError] = useState(false);
  const [canPersist, setCanPersist] = useState(false);
  const [resetRevision, setResetRevision] = useState(0);

  useEffect(() => {
    async function restore() {
      const shouldReset =
        __DEV__ &&
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('resetCloudwise') === '1';

      try {
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
        setCanPersist(true);
      } catch {
        setRestoreError(true);
      } finally {
        setIsRestoring(false);
      }
    }

    void restore();
  }, [initialDateKey]);

  useEffect(() => {
    if (!isRestoring && canPersist) {
      void saveAppState(state).catch(() => {
        // Keep the in-memory experience available; a later state update retries persistence.
      });
    }
  }, [canPersist, isRestoring, state]);

  useEffect(() => {
    if (!__DEV__) return;

    globalThis.__cloudwiseReset = async () => {
      await clearAppState();
      setState(createDefaultAppState(currentDateKey));
      setResetRevision((current) => current + 1);
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

  const updateProfileDraft = useCallback((update: Partial<ProfileDetails>) => {
    setState((current) => applyProfileDraft(current, update));
  }, []);

  const completeProfileSetup = useCallback(
    (details: ProfileDetails) => {
      if (!validateProfileDetails(details.name, details.age).valid) return false;
      const completedAt = new Date().toISOString();
      setState((current) => {
        const next = completeProfileSetupState(
          current,
          details,
          currentDateKey,
          completedAt,
        );
        return next ?? current;
      });
      return true;
    },
    [currentDateKey],
  );

  const updateProfile = useCallback((details: ProfileDetails) => {
    if (!validateProfileDetails(details.name, details.age).valid) return false;
    setState((current) => {
      const next = updateProfileState(current, details);
      return next ?? current;
    });
    return true;
  }, []);

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
    () => ({
      ...state,
      isRestoring,
      restoreError,
      resetRevision,
      currentDateKey,
      updateProfileDraft,
      completeProfileSetup,
      updateProfile,
      getProgress,
      updateProgress,
      completeStep,
    }),
    [
      state,
      isRestoring,
      restoreError,
      resetRevision,
      currentDateKey,
      updateProfileDraft,
      completeProfileSetup,
      updateProfile,
      getProgress,
      updateProgress,
      completeStep,
    ],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}
