import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { narrationService } from '../../services/narrationService';
import { useAppState } from '../../state/useAppState';
import { cloudVoiceFlags } from './config/cloudVoiceFlags';
import { getCloudVoiceAvailability } from './core/availability';
import {
  createInitialCloudVoiceState,
  isCloudVoiceSessionActive,
  reduceCloudVoiceState,
} from './core/stateMachine';
import type {
  CloudVoiceEndReason,
  CloudVoiceMachineState,
  CloudVoiceReflection,
  CloudVoiceSafetyAssessment,
  CloudVoiceService,
  CloudVoiceSession,
  CloudVoiceTranscriptEntry,
  CloudVoiceWisdomContext,
} from './core/types';
import { createCloudVoiceService } from './runtime/createCloudVoiceService';

const INACTIVITY_LIMIT_MS = 45_000;

type CloudVoiceContextValue = {
  state: CloudVoiceMachineState;
  transcript: CloudVoiceTranscriptEntry[];
  reflection?: CloudVoiceReflection;
  safetyAssessment?: CloudVoiceSafetyAssessment;
  mode: CloudVoiceService['mode'];
  activeWisdomId?: string;
  durationSeconds: number;
  enabled: boolean;
  parentApproved: boolean;
  startConversation: (context: CloudVoiceWisdomContext) => Promise<void>;
  toggleMuted: () => void;
  finishConversation: () => Promise<void>;
  closeConversation: (reason?: CloudVoiceEndReason) => Promise<void>;
  resetConversation: () => Promise<void>;
};

export const CloudVoiceContext = createContext<CloudVoiceContextValue | undefined>(
  undefined,
);

export function CloudVoiceProvider({ children }: PropsWithChildren) {
  const { profile } = useAppState();
  const serviceRef = useRef<CloudVoiceService | undefined>(undefined);
  if (!serviceRef.current) serviceRef.current = createCloudVoiceService();
  const service = serviceRef.current;
  const sessionRef = useRef<CloudVoiceSession | undefined>(undefined);
  const automationTimers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const automatedTurns = useRef(new Set<number>());
  const [state, setState] = useState(() =>
    createInitialCloudVoiceState(
      {
        maxCloudTurns: cloudVoiceFlags.maxTurns,
        maxDurationMs: cloudVoiceFlags.maxDurationMs,
      },
      Date.now(),
    ),
  );
  const [transcript, setTranscript] = useState<CloudVoiceTranscriptEntry[]>([]);
  const [reflection, setReflection] = useState<CloudVoiceReflection>();
  const [safetyAssessment, setSafetyAssessment] =
    useState<CloudVoiceSafetyAssessment>();
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [activeWisdomId, setActiveWisdomId] = useState<string>();

  useEffect(() => {
    narrationService.setSafetyIdentifier(profile.voiceSafetyIdentifier);
  }, [profile.voiceSafetyIdentifier]);

  const clearAutomation = useCallback(() => {
    for (const timer of automationTimers.current) clearTimeout(timer);
    automationTimers.current.clear();
    automatedTurns.current.clear();
  }, []);

  const scheduleMockTurn = useCallback(
    (session: CloudVoiceSession, next: CloudVoiceMachineState) => {
      if (service.mode !== 'mock' || next.status !== 'listening') return;
      const mockSession = session as CloudVoiceSession & {
        submitChildUtterance?: (text: string, authoredChoiceId?: string) => boolean;
      };
      if (!mockSession.submitChildUtterance || automatedTurns.current.has(next.cloudTurns)) {
        return;
      }
      automatedTurns.current.add(next.cloudTurns);
      const timer = setTimeout(() => {
        automationTimers.current.delete(timer);
        if (next.cloudTurns >= 3) {
          void session.finish();
          return;
        }
        const examples = [
          'I wanted football cards right away, and waiting felt difficult.',
          'I could wait and save some money for headphones.',
          'I would spend some, save some, and help with a birthday gift.',
        ];
        const authoredChoice = next.cloudTurns === 0 ? 'sometimes' : undefined;
        mockSession.submitChildUtterance?.(
          examples[Math.min(next.cloudTurns, examples.length - 1)],
          authoredChoice,
        );
      }, 420);
      automationTimers.current.add(timer);
    },
    [service.mode],
  );

  const startConversation = useCallback(
    async (context: CloudVoiceWisdomContext) => {
      const availability = getCloudVoiceAvailability({
        featureEnabled: cloudVoiceFlags.cloudVoiceEnabled,
        parentApproved: profile.voiceFeaturesApprovedByParent,
        serviceSupported: service.supported,
      });
      if (!availability.allowed) {
        setState((current) =>
          reduceCloudVoiceState(current, {
            type: 'MARKED_UNAVAILABLE',
            atMs: Date.now(),
            message: availability.message,
          }),
        );
        return;
      }

      const previousSession = sessionRef.current;
      if (previousSession) await previousSession.close('service_replaced');
      clearAutomation();
      narrationService.stop();
      setTranscript([]);
      setReflection(undefined);
      setSafetyAssessment(undefined);
      setDurationSeconds(0);
      setActiveWisdomId(context.wisdomId);
      const initial = createInitialCloudVoiceState(
        {
          maxCloudTurns: cloudVoiceFlags.maxTurns,
          maxDurationMs: cloudVoiceFlags.maxDurationMs,
        },
        Date.now(),
      );
      setState(initial);

      let session: CloudVoiceSession;
      session = service.createSession({
        sessionId: createSessionId(),
        privacyPreservingSafetyId: profile.voiceSafetyIdentifier,
        context: {
          ...context,
          maximumConversationTurns: cloudVoiceFlags.maxTurns,
          maximumDurationSeconds: Math.floor(
            cloudVoiceFlags.maxDurationMs / 1_000,
          ),
        },
        limits: {
          maxCloudTurns: cloudVoiceFlags.maxTurns,
          maxDurationMs: cloudVoiceFlags.maxDurationMs,
        },
        callbacks: {
          onStateChange: (next) => {
            if (sessionRef.current !== session) return;
            setState(next);
            scheduleMockTurn(session, next);
          },
          onTranscriptChange: (next) => {
            if (sessionRef.current === session) setTranscript(next);
          },
          onReflection: (next) => {
            if (sessionRef.current === session) setReflection(next);
          },
          onSafety: (next) => {
            if (sessionRef.current === session) setSafetyAssessment(next);
          },
          onError: () => {
            // Transport owns teardown; UI state arrives through onStateChange.
          },
        },
      });
      sessionRef.current = session;
      setState(session.getSnapshot().state);
      try {
        await session.start();
      } catch (error) {
        if (sessionRef.current !== session) return;
        const failedSnapshot = session.getSnapshot().state;
        setState(
          failedSnapshot.status === 'error' ||
            failedSnapshot.status === 'unavailable'
            ? failedSnapshot
            : reduceCloudVoiceState(failedSnapshot, {
                type: 'FAILED',
                atMs: Date.now(),
                error: {
                  code: 'connection_failed',
                  message:
                    error instanceof Error
                      ? error.message
                      : 'Could not connect. Continue by typing.',
                  recoverable: true,
                },
              }),
        );
      }
    },
    [clearAutomation, profile, scheduleMockTurn, service],
  );

  const finishConversation = useCallback(async () => {
    const session = sessionRef.current;
    if (!session) return;
    clearAutomation();
    try {
      const result = await session.finish();
      if (sessionRef.current !== session) return;
      setReflection(result);
      const snapshot = session.getSnapshot();
      setState(snapshot.state);
      setTranscript(snapshot.transcript);
    } catch (error) {
      setState((current) =>
        reduceCloudVoiceState(current, {
          type: 'FAILED',
          atMs: Date.now(),
          error: {
            code: 'session_failed',
            message:
              error instanceof Error
                ? error.message
                : 'The conversation could not be finished. Continue by typing.',
            recoverable: true,
          },
        }),
      );
    }
  }, [clearAutomation]);

  const closeConversation = useCallback(
    async (reason: CloudVoiceEndReason = 'screen_exit') => {
      clearAutomation();
      const session = sessionRef.current;
      sessionRef.current = undefined;
      setState(
        createInitialCloudVoiceState(
          {
            maxCloudTurns: cloudVoiceFlags.maxTurns,
            maxDurationMs: cloudVoiceFlags.maxDurationMs,
          },
          Date.now(),
        ),
      );
      setTranscript([]);
      setReflection(undefined);
      setSafetyAssessment(undefined);
      setDurationSeconds(0);
      setActiveWisdomId(undefined);
      if (session) await session.close(reason);
    },
    [clearAutomation],
  );

  const resetConversation = useCallback(async () => {
    await closeConversation('screen_exit');
    setState(
      createInitialCloudVoiceState(
        {
          maxCloudTurns: cloudVoiceFlags.maxTurns,
          maxDurationMs: cloudVoiceFlags.maxDurationMs,
        },
        Date.now(),
      ),
    );
    setTranscript([]);
    setReflection(undefined);
    setSafetyAssessment(undefined);
    setDurationSeconds(0);
    setActiveWisdomId(undefined);
  }, [closeConversation]);

  const toggleMuted = useCallback(() => {
    const session = sessionRef.current;
    if (!session) return;
    session.setMuted(state.status !== 'muted');
    setState(session.getSnapshot().state);
  }, [state.status]);

  useEffect(() => {
    if (!isCloudVoiceSessionActive(state.status) || state.startedAtMs === undefined) {
      return;
    }
    const update = () =>
      setDurationSeconds(
        Math.max(0, Math.floor((Date.now() - state.startedAtMs!) / 1_000)),
      );
    update();
    const interval = setInterval(update, 1_000);
    return () => clearInterval(interval);
  }, [state.startedAtMs, state.status]);

  useEffect(() => {
    if (state.status !== 'listening') return;
    const timer = setTimeout(() => {
      void finishConversation();
    }, INACTIVITY_LIMIT_MS);
    return () => clearTimeout(timer);
  }, [finishConversation, state.lastTransitionAtMs, state.status]);

  useEffect(
    () => () => {
      clearAutomation();
      void service.dispose();
    },
    [clearAutomation, service],
  );

  const value = useMemo<CloudVoiceContextValue>(
    () => ({
      state,
      transcript,
      reflection,
      safetyAssessment,
      mode: service.mode,
      activeWisdomId,
      durationSeconds,
      enabled: cloudVoiceFlags.cloudVoiceEnabled,
      parentApproved: profile.voiceFeaturesApprovedByParent,
      startConversation,
      toggleMuted,
      finishConversation,
      closeConversation,
      resetConversation,
    }),
    [
      state,
      transcript,
      reflection,
      safetyAssessment,
      service.mode,
      activeWisdomId,
      durationSeconds,
      profile.voiceFeaturesApprovedByParent,
      startConversation,
      toggleMuted,
      finishConversation,
      closeConversation,
      resetConversation,
    ],
  );

  return (
    <CloudVoiceContext.Provider value={value}>
      {children}
    </CloudVoiceContext.Provider>
  );
}

function createSessionId(): string {
  return `voice-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
