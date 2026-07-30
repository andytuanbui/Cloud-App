import React, { createContext, PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';
import { clearAppState, loadAppState, saveAppState } from '../services/storage/appStorage';
import { PersistedAppState, WisdomProgress, WisdomStep } from './types';

const defaultState: PersistedAppState = {
  profile: {
    id: 'alex',
    name: 'Alex',
    age: 10,
    avatar: 'cloud',
    currentIdentity: 'Thoughtful Thinker',
  },
  wisdomProgress: {},
};

type AppStateContextValue = PersistedAppState & {
  isRestoring: boolean;
  getProgress: (wisdomId: string) => WisdomProgress | undefined;
  updateProgress: (wisdomId: string, update: Partial<WisdomProgress>) => void;
  completeStep: (wisdomId: string, step: WisdomStep, nextStep: WisdomStep) => void;
};

export const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

declare global {
  var __cloudwiseReset: (() => Promise<void>) | undefined;
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
  const [state, setState] = useState(defaultState);
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    async function restore() {
      const shouldReset =
        __DEV__ &&
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('resetCloudwise') === '1';

      if (shouldReset) {
        await clearAppState();
        window.history.replaceState({}, '', window.location.pathname);
        setState(defaultState);
      } else {
        const saved = await loadAppState();
        if (saved) setState({ ...defaultState, ...saved });
      }

      setIsRestoring(false);
    }

    void restore();
  }, []);

  useEffect(() => {
    if (!isRestoring) void saveAppState(state);
  }, [isRestoring, state]);

  useEffect(() => {
    if (!__DEV__) return;

    globalThis.__cloudwiseReset = async () => {
      await clearAppState();
      setState(defaultState);
    };

    return () => {
      delete globalThis.__cloudwiseReset;
    };
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
    () => ({ ...state, isRestoring, getProgress, updateProgress, completeStep }),
    [state, isRestoring, getProgress, updateProgress, completeStep],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}
