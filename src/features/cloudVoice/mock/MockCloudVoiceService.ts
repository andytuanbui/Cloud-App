import { normalizeCloudVoiceReflection } from '../core/reflection';
import {
  assessCloudVoiceSafety,
  getCloudVoiceSafetyResponse,
  minimizeTextForSafety,
} from '../core/safety';
import {
  createInitialCloudVoiceState,
  reduceCloudVoiceState,
} from '../core/stateMachine';
import {
  appendEphemeralTranscript,
  createEphemeralCloudVoiceTranscript,
} from '../core/transcript';
import type {
  CloudVoiceClock,
  CloudVoiceEndReason,
  CloudVoiceError,
  CloudVoiceMachineEvent,
  CloudVoiceMachineState,
  CloudVoiceReflection,
  CloudVoiceSafetyAssessment,
  CloudVoiceSafetyCategory,
  CloudVoiceService,
  CloudVoiceSession,
  CloudVoiceSessionOptions,
  CloudVoiceSessionSnapshot,
  CloudVoiceSpeechOutput,
  CloudVoiceTimerHandle,
  EphemeralCloudVoiceTranscript,
} from '../core/types';
import { systemCloudVoiceClock } from './ManualCloudVoiceClock';

export type MockCloudVoiceScenario =
  | 'success'
  | 'permission-denied'
  | 'network-failure'
  | 'safety-trigger';

export type MockCloudVoiceTimings = {
  permissionMs: number;
  connectionMs: number;
  childSpeakingMs: number;
  thinkingMs: number;
  cloudSpeakingMs: number;
};

export type MockCloudVoiceServiceOptions = {
  scenario?: MockCloudVoiceScenario;
  forcedSafetyCategory?: Exclude<CloudVoiceSafetyCategory, 'safe'>;
  clock?: CloudVoiceClock;
  speechOutput?: CloudVoiceSpeechOutput;
  timings?: Partial<MockCloudVoiceTimings>;
};

const DEFAULT_TIMINGS: MockCloudVoiceTimings = {
  permissionMs: 120,
  connectionMs: 220,
  childSpeakingMs: 180,
  thinkingMs: 260,
  cloudSpeakingMs: 420,
};

export class MockCloudVoiceService implements CloudVoiceService {
  readonly mode = 'mock' as const;
  readonly supported = true;

  private activeSession?: MockCloudVoiceSession;
  private readonly options: Required<
    Pick<MockCloudVoiceServiceOptions, 'scenario' | 'forcedSafetyCategory'>
  > &
    Omit<
      MockCloudVoiceServiceOptions,
      'scenario' | 'forcedSafetyCategory' | 'timings'
    > & { timings: MockCloudVoiceTimings };

  constructor(options: MockCloudVoiceServiceOptions = {}) {
    this.options = {
      scenario: options.scenario ?? 'success',
      forcedSafetyCategory: options.forcedSafetyCategory ?? 'self_harm',
      clock: options.clock,
      speechOutput: options.speechOutput,
      timings: {
        ...DEFAULT_TIMINGS,
        ...normalizeTimings(options.timings),
      },
    };
  }

  createSession(options: CloudVoiceSessionOptions): MockCloudVoiceSession {
    if (this.activeSession) {
      void this.activeSession.close('service_replaced');
    }

    const session = new MockCloudVoiceSession(options, this.options, () => {
      if (this.activeSession === session) this.activeSession = undefined;
    });
    this.activeSession = session;
    return session;
  }

  async dispose(): Promise<void> {
    if (!this.activeSession) return;
    const session = this.activeSession;
    this.activeSession = undefined;
    await session.close('cleanup');
  }
}

export class MockCloudVoiceSession implements CloudVoiceSession {
  readonly id: string;

  private state: CloudVoiceMachineState;
  private transcript: EphemeralCloudVoiceTranscript;
  private reflection?: CloudVoiceReflection;
  private readonly clock: CloudVoiceClock;
  private readonly scenario: MockCloudVoiceScenario;
  private readonly forcedSafetyCategory: Exclude<
    CloudVoiceSafetyCategory,
    'safe'
  >;
  private readonly speechOutput?: CloudVoiceSpeechOutput;
  private readonly timings: MockCloudVoiceTimings;
  private readonly options: CloudVoiceSessionOptions;
  private readonly scheduled = new Set<CloudVoiceTimerHandle>();
  private readonly onClosed: () => void;

  private started = false;
  private closed = false;
  private speechRevision = 0;
  private speechCleanup?: () => void;
  private lastChildExample = '';
  private lastCloudInsight = '';
  private lastSafetyStatus: CloudVoiceSafetyCategory = 'safe';
  private authoredChoiceId?: string;

  constructor(
    options: CloudVoiceSessionOptions,
    serviceOptions: Required<
      Pick<MockCloudVoiceServiceOptions, 'scenario' | 'forcedSafetyCategory'>
    > &
      Omit<
        MockCloudVoiceServiceOptions,
        'scenario' | 'forcedSafetyCategory' | 'timings'
      > & { timings: MockCloudVoiceTimings },
    onClosed: () => void,
  ) {
    this.id = options.sessionId;
    this.options = options;
    this.clock = serviceOptions.clock ?? systemCloudVoiceClock;
    this.scenario = serviceOptions.scenario;
    this.forcedSafetyCategory = serviceOptions.forcedSafetyCategory;
    this.speechOutput = serviceOptions.speechOutput;
    this.timings = serviceOptions.timings;
    this.onClosed = onClosed;
    this.state = createInitialCloudVoiceState(options.limits, this.clock.now());
    this.transcript = createEphemeralCloudVoiceTranscript();
  }

  async start(): Promise<void> {
    if (this.started || this.closed) return;
    this.started = true;
    this.dispatch({ type: 'PERMISSION_REQUESTED', atMs: this.clock.now() });

    this.schedule(() => {
      if (this.scenario === 'permission-denied') {
        this.dispatch({
          type: 'PERMISSION_DENIED',
          atMs: this.clock.now(),
          message: 'Microphone permission was denied. Continue by typing.',
        });
        return;
      }

      this.dispatch({ type: 'PERMISSION_GRANTED', atMs: this.clock.now() });
      this.schedule(() => {
        if (this.scenario === 'network-failure') {
          this.fail({
            code: 'connection_failed',
            message: 'Mock network connection failed. Continue by typing.',
            recoverable: true,
          });
          return;
        }

        this.dispatch({ type: 'CONNECTED', atMs: this.clock.now() });
        this.scheduleDurationLimit();
      }, this.timings.connectionMs);
    }, this.timings.permissionMs);
  }

  setMuted(muted: boolean): void {
    if (this.closed) return;
    this.dispatch({
      type: muted ? 'MUTED' : 'UNMUTED',
      atMs: this.clock.now(),
    });
  }

  /**
   * Deterministic microphone substitute used only by mock mode and tests.
   * Production transports receive child speech from their media channel.
   */
  submitChildUtterance(text: string, authoredChoiceId?: string): boolean {
    if (this.closed || this.state.status !== 'listening' || !text.trim()) {
      return false;
    }

    const allowedAuthoredChoiceId = this.allowedAuthoredChoiceId(authoredChoiceId);
    if (allowedAuthoredChoiceId) {
      this.authoredChoiceId = allowedAuthoredChoiceId;
    }
    this.dispatch({ type: 'CHILD_SPEECH_STARTED', atMs: this.clock.now() });
    this.schedule(() => this.finishChildUtterance(text), this.timings.childSpeakingMs);
    return true;
  }

  async finish(): Promise<CloudVoiceReflection> {
    if (this.reflection) return this.reflection;
    return this.finalizeWithReflection('child_finished');
  }

  async close(reason: CloudVoiceEndReason = 'cleanup'): Promise<void> {
    if (this.closed) return;
    this.dispatch({ type: 'END_REQUESTED', atMs: this.clock.now(), reason });
    this.clearPendingWork();
    this.dispatch({ type: 'ENDED', atMs: this.clock.now() });
    this.closed = true;
    this.onClosed();
  }

  getSnapshot(): CloudVoiceSessionSnapshot {
    return {
      state: {
        ...this.state,
        limits: { ...this.state.limits },
        ...(this.state.error ? { error: { ...this.state.error } } : {}),
      },
      transcript: this.transcript.entries.map((entry) => ({ ...entry })),
      ...(this.reflection ? { reflection: { ...this.reflection } } : {}),
    };
  }

  private finishChildUtterance(text: string): void {
    if (this.closed) return;
    const assessment = this.assessUtterance(text);
    this.lastSafetyStatus = assessment.category;
    this.lastChildExample = minimizeTextForSafety(text, assessment.category);
    this.appendTranscript('child', text, assessment.category);
    if (assessment.category !== 'safe') {
      this.options.callbacks?.onSafety?.(assessment);
    }
    this.dispatch({ type: 'CHILD_SPEECH_ENDED', atMs: this.clock.now() });

    this.schedule(() => {
      const response =
        assessment.category === 'safe'
          ? buildDeterministicCloudResponse(text)
          : assessment.childSafeResponse ??
            getCloudVoiceSafetyResponse(assessment.category);
      this.lastCloudInsight = buildDeterministicInsight(
        text,
        assessment.category,
      );
      this.beginCloudSpeech(response, assessment);
    }, this.timings.thinkingMs);
  }

  private beginCloudSpeech(
    text: string,
    assessment: CloudVoiceSafetyAssessment,
  ): void {
    if (this.closed) return;
    const revision = ++this.speechRevision;
    let started = false;
    let completed = false;

    const isCurrent = () => !this.closed && revision === this.speechRevision;
    const onStart = () => {
      if (!isCurrent() || started) return;
      started = true;
      this.dispatch({
        type: 'CLOUD_RESPONSE_STARTED',
        atMs: this.clock.now(),
      });
      this.appendTranscript('cloud', text, 'safe');
    };
    const onComplete = () => {
      if (!isCurrent() || completed) return;
      onStart();
      if (!isCurrent()) return;
      completed = true;
      this.releaseSpeechCleanup();

      if (assessment.shouldEndConversation) {
        this.dispatch({
          type: 'SAFETY_ESCALATED',
          atMs: this.clock.now(),
          category: assessment.category as Exclude<
            CloudVoiceSafetyCategory,
            'safe'
          >,
        });
      } else {
        this.dispatch({
          type: 'CLOUD_RESPONSE_ENDED',
          atMs: this.clock.now(),
        });
      }

      if (this.state.status === 'ending') {
        this.finalizeWithReflection(this.state.endReason ?? 'connection_closed');
      }
    };
    const onError = (message: string) => {
      if (!isCurrent() || completed) return;
      completed = true;
      this.releaseSpeechCleanup();
      this.fail({
        code: 'speech_failed',
        message: message || 'Mock speech output failed. Continue by typing.',
        recoverable: true,
      });
    };

    if (this.speechOutput) {
      try {
        const cleanup = this.speechOutput.speak(text, {
          onStart,
          onComplete,
          onError,
        });
        if (!completed && isCurrent() && typeof cleanup === 'function') {
          this.speechCleanup = cleanup;
        } else if (typeof cleanup === 'function') {
          cleanup();
        }
      } catch (error) {
        onError(
          error instanceof Error
            ? error.message
            : 'Mock speech output failed. Continue by typing.',
        );
      }
      return;
    }

    this.schedule(onStart, 0);
    this.schedule(onComplete, this.timings.cloudSpeakingMs);
  }

  private assessUtterance(text: string): CloudVoiceSafetyAssessment {
    const detected = assessCloudVoiceSafety(text);
    if (this.scenario !== 'safety-trigger' || detected.category !== 'safe') {
      return detected;
    }
    const category = this.forcedSafetyCategory;
    return {
      category,
      shouldEndConversation: true,
      shouldMinimizeTranscript: true,
      childSafeResponse: getCloudVoiceSafetyResponse(category),
    };
  }

  private appendTranscript(
    role: 'child' | 'cloud',
    text: string,
    safetyStatus: CloudVoiceSafetyCategory,
  ): void {
    this.transcript = appendEphemeralTranscript(this.transcript, {
      role,
      text,
      safetyStatus,
      createdAtMs: this.clock.now(),
    });
    this.options.callbacks?.onTranscriptChange?.(
      this.transcript.entries.map((entry) => ({ ...entry })),
    );
  }

  private dispatch(event: CloudVoiceMachineEvent): void {
    const next = reduceCloudVoiceState(this.state, event);
    if (next === this.state) return;
    this.state = next;
    this.options.callbacks?.onStateChange?.(this.getSnapshot().state, event);
    if (event.type === 'FAILED') {
      this.options.callbacks?.onError?.(event.error);
    }
  }

  private fail(error: CloudVoiceError): void {
    this.clearPendingWork();
    this.dispatch({ type: 'FAILED', atMs: this.clock.now(), error });
  }

  private scheduleDurationLimit(): void {
    this.schedule(() => {
      this.dispatch({
        type: 'DURATION_LIMIT_REACHED',
        atMs: this.clock.now(),
      });
      this.finalizeWithReflection('duration_limit');
    }, this.state.limits.maxDurationMs);
  }

  private schedule(callback: () => void, delayMs: number): void {
    if (this.closed) return;
    let handle: CloudVoiceTimerHandle;
    handle = this.clock.setTimeout(() => {
      this.scheduled.delete(handle);
      if (!this.closed) callback();
    }, delayMs);
    this.scheduled.add(handle);
  }

  private clearPendingWork(): void {
    for (const handle of this.scheduled) this.clock.clearTimeout(handle);
    this.scheduled.clear();
    this.speechRevision += 1;
    this.releaseSpeechCleanup();
    this.speechOutput?.cancel?.();
  }

  private releaseSpeechCleanup(): void {
    const cleanup = this.speechCleanup;
    this.speechCleanup = undefined;
    cleanup?.();
  }

  private finalizeWithReflection(reason: CloudVoiceEndReason): CloudVoiceReflection {
    if (this.reflection) return this.reflection;
    if (this.state.status !== 'ending') {
      this.dispatch({
        type: 'END_REQUESTED',
        atMs: this.clock.now(),
        reason,
      });
    }
    this.clearPendingWork();
    this.reflection = this.buildReflection();
    this.options.callbacks?.onReflection?.({ ...this.reflection });
    this.dispatch({ type: 'ENDED', atMs: this.clock.now() });
    this.closed = true;
    this.onClosed();
    return this.reflection;
  }

  private buildReflection(): CloudVoiceReflection {
    const hadSafetyConcern = this.lastSafetyStatus !== 'safe';
    const summary = hadSafetyConcern
      ? 'The conversation was limited after a safety concern.'
      : this.lastChildExample
        ? 'The child connected the Wisdom to a personal choice.'
        : 'The conversation ended before a personal example was shared.';
    const childExample = hadSafetyConcern
      ? this.lastChildExample || '[Sensitive safety concern omitted]'
      : this.lastChildExample || 'No personal example was shared.';
    const cloudInsight = hadSafetyConcern
      ? 'Cloud gave a short safety response and encouraged a trusted adult nearby.'
      : this.lastCloudInsight ||
        'Cloud invited the child to pause and think about what matters.';

    return normalizeCloudVoiceReflection({
      summary,
      childExample,
      cloudInsight,
      confidence: this.lastChildExample ? 0.9 : 0.25,
      safetyStatus: this.lastSafetyStatus,
      ...(this.authoredChoiceId ? { authoredChoiceId: this.authoredChoiceId } : {}),
    });
  }

  private allowedAuthoredChoiceId(value: string | undefined): string | undefined {
    const normalized = value?.trim();
    return normalized && this.options.context.authoredChoiceIds?.includes(normalized)
      ? normalized
      : undefined;
  }
}

function buildDeterministicCloudResponse(childText: string): string {
  const normalized = childText.toLocaleLowerCase();
  if (/\b(?:save|saving|headphones?|later)\b/.test(normalized)) {
    return 'Saving can move a future goal closer. What makes that goal worth waiting for?';
  }
  if (/\b(?:give|giving|help|mia|birthday|gift)\b/.test(normalized)) {
    return 'Helping someone can be part of a money choice. How would that choice make you feel?';
  }
  if (/\b(?:spend|cards?|buy|today|now)\b/.test(normalized)) {
    return 'Enjoying something now can matter too. What might help you pause before buying?';
  }
  return 'Waiting can feel hard when something matters now. What could help you pause before choosing?';
}

function buildDeterministicInsight(
  childText: string,
  safetyStatus: CloudVoiceSafetyCategory,
): string {
  if (safetyStatus !== 'safe') {
    return 'Cloud prioritized safety and support from a trusted adult.';
  }
  const normalized = childText.toLocaleLowerCase();
  if (/\b(?:save|saving|headphones?|later)\b/.test(normalized)) {
    return 'The child connected waiting with a future goal.';
  }
  if (/\b(?:give|giving|help|mia|birthday|gift)\b/.test(normalized)) {
    return 'The child connected money with helping someone else.';
  }
  if (/\b(?:spend|cards?|buy|today|now)\b/.test(normalized)) {
    return 'The child connected spending with enjoying something now.';
  }
  return 'The child considered pausing before making a choice.';
}

function normalizeTimings(
  timings: Partial<MockCloudVoiceTimings> | undefined,
): Partial<MockCloudVoiceTimings> {
  if (!timings) return {};
  return Object.fromEntries(
    Object.entries(timings).map(([key, value]) => [
      key,
      typeof value === 'number' && Number.isFinite(value)
        ? Math.max(0, Math.floor(value))
        : DEFAULT_TIMINGS[key as keyof MockCloudVoiceTimings],
    ]),
  );
}
