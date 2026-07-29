import React, { createContext, PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';
import { loadAppState, saveAppState } from '../services/storage/appStorage';
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
    loadAppState()
      .then((saved) => {
        if (saved) setState({ ...defaultState, ...saved });
      })
      .finally(() => setIsRestoring(false));
  }, []);

  useEffect(() => {
    if (!isRestoring) void saveAppState(state);
  }, [isRestoring, state]);

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
