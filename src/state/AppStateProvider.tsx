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
import {
  createDefaultGuidedWisdomSession,
  GuidedPersonalResponse,
  GuidedTakeaway,
  GuidedWisdomSession,
  GuidedWisdomSessionUpdate,
  PersistedAppState,
  ProfileDetails,
  WisdomProgress,
  WisdomStep,
} from './types';

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
  updateGuidedSession: (wisdomId: string, update: GuidedWisdomSessionUpdate) => void;
  startGuidedWisdomReview: (wisdomId: string) => void;
  completeGuidedWisdom: (wisdomId: string) => void;
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
    isCompleted: false,
    completionCount: 0,
    completed: false,
  };
}

function hasPermanentCompletion(progress: WisdomProgress): boolean {
  return (
    progress.isCompleted === true ||
    progress.completed === true ||
    progress.completionCount > 0
  );
}

function permanentCompletionCount(progress: WisdomProgress): number {
  const savedCount = Number.isInteger(progress.completionCount)
    ? Math.max(0, progress.completionCount)
    : 0;
  return hasPermanentCompletion(progress) ? Math.max(1, savedCount) : 0;
}

function hydrateGuidedSession(
  session?: GuidedWisdomSession,
): GuidedWisdomSession {
  const defaults = createDefaultGuidedWisdomSession();
  return {
    ...defaults,
    ...(session ? definedProperties(session) : {}),
    version: defaults.version,
  };
}

function definedProperties<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as Partial<T>;
}

function mergeGuidedResponse<T extends GuidedPersonalResponse | GuidedTakeaway>(
  current: T | undefined,
  update: Partial<T> | null | undefined,
): T | undefined {
  if (update === null) return undefined;
  if (!update) return current;

  const next = { ...current, ...update };
  return typeof next.source === 'string' && typeof next.text === 'string'
    ? (next as T)
    : current;
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
      const wasCompleted = hasPermanentCompletion(existing);
      const requestsCompletion =
        update.isCompleted === true || update.completed === true;
      const isCompleted = wasCompleted || requestsCompletion;
      const completedAt = isCompleted
        ? existing.completedAt ?? update.completedAt ?? new Date().toISOString()
        : undefined;
      const next: WisdomProgress = {
        ...existing,
        ...update,
        isCompleted,
        completed: isCompleted,
        completionCount: isCompleted
          ? wasCompleted
            ? permanentCompletionCount(existing)
            : 1
          : 0,
        completedAt,
      };

      return {
        ...current,
        wisdomProgress: {
          ...current.wisdomProgress,
          [wisdomId]: next,
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

  const updateGuidedSession = useCallback(
    (wisdomId: string, update: GuidedWisdomSessionUpdate) => {
      setState((current) => {
        const existing = current.wisdomProgress[wisdomId] ?? newProgress(wisdomId);
        const session = hydrateGuidedSession(existing.guidedSession);
        const { personalResponse, selectedTakeaway, ...flatUpdate } = update;
        const guidedSession: GuidedWisdomSession = {
          ...session,
          ...definedProperties(flatUpdate),
          version: session.version,
          personalResponse: mergeGuidedResponse(
            session.personalResponse,
            personalResponse,
          ),
          selectedTakeaway: mergeGuidedResponse(
            session.selectedTakeaway,
            selectedTakeaway,
          ),
          completed: session.completed,
        };

        return {
          ...current,
          wisdomProgress: {
            ...current.wisdomProgress,
            [wisdomId]: { ...existing, guidedSession },
          },
        };
      });
    },
    [],
  );

  const startGuidedWisdomReview = useCallback((wisdomId: string) => {
    setState((current) => {
      const existing = current.wisdomProgress[wisdomId];
      if (!existing || !hasPermanentCompletion(existing)) return current;

      const previousSession = existing.guidedSession
        ? hydrateGuidedSession(existing.guidedSession)
        : undefined;
      const lastCompletedGuidedSession =
        existing.lastCompletedGuidedSession ??
        (previousSession?.completed ? previousSession : undefined);

      return {
        ...current,
        wisdomProgress: {
          ...current.wisdomProgress,
          [wisdomId]: {
            ...existing,
            guidedSession: createDefaultGuidedWisdomSession(),
            lastCompletedGuidedSession,
            isCompleted: true,
            completed: true,
            completionCount: permanentCompletionCount(existing),
          },
        },
      };
    });
  }, []);

  const completeGuidedWisdom = useCallback((wisdomId: string) => {
    setState((current) => {
      const existing = current.wisdomProgress[wisdomId];
      if (!existing || existing.guidedSession?.completed) {
        return current;
      }

      const session = hydrateGuidedSession(existing.guidedSession);
      if (session.currentStage !== 'practice') return current;

      const wasCompleted = hasPermanentCompletion(existing);
      const finishedAt = new Date().toISOString();
      const completedSession: GuidedWisdomSession = {
        ...session,
        currentStage: 'completion',
        completed: true,
      };
      return {
        ...current,
        wisdomProgress: {
          ...current.wisdomProgress,
          [wisdomId]: {
            ...existing,
            currentStep: wasCompleted ? existing.currentStep : 'completion',
            completedSteps: wasCompleted
              ? existing.completedSteps
              : Array.from(new Set([...existing.completedSteps, 'practice'])),
            guidedSession: completedSession,
            lastCompletedGuidedSession: completedSession,
            isCompleted: true,
            completed: true,
            completedAt: existing.completedAt ?? finishedAt,
            completionCount: permanentCompletionCount(existing) + 1,
            lastReviewedAt: wasCompleted ? finishedAt : existing.lastReviewedAt,
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
      updateGuidedSession,
      startGuidedWisdomReview,
      completeGuidedWisdom,
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
      updateGuidedSession,
      startGuidedWisdomReview,
      completeGuidedWisdom,
    ],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}
