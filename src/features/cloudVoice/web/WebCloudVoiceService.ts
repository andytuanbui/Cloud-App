import { parseCloudVoiceReflection } from '../core/reflection';
import {
  assessCloudVoiceSafety,
  assessCloudVoiceSafetyCategory,
  minimizeTextForSafety,
  redactSensitiveText,
} from '../core/safety';
import {
  createInitialCloudVoiceState,
  reduceCloudVoiceState,
} from '../core/stateMachine';
import {
  appendEphemeralTranscript,
  clearEphemeralCloudVoiceTranscript,
  createEphemeralCloudVoiceTranscript,
} from '../core/transcript';
import type {
  CloudVoiceEndReason,
  CloudVoiceError,
  CloudVoiceMachineEvent,
  CloudVoiceMachineState,
  CloudVoiceReflection,
  CloudVoiceSafetyAssessment,
  CloudVoiceService,
  CloudVoiceSession,
  CloudVoiceSessionOptions,
  CloudVoiceSessionSnapshot,
  CloudVoiceTranscriptEntry,
  EphemeralCloudVoiceTranscript,
} from '../core/types';
import {
  isWebRealtimeVoiceSupported,
  type WebRealtimeEndReason,
  type WebRealtimeTranscriptUpdate,
  type WebRealtimeVoiceError,
  WebRealtimeVoiceService,
  type WebRealtimeVoiceState,
} from './WebRealtimeVoiceService';

const REFLECTION_WAIT_MS = 8_000;

export class WebCloudVoiceService implements CloudVoiceService {
  readonly mode = 'realtime' as const;
  readonly supported = isWebRealtimeVoiceSupported();

  private activeSession?: WebCloudVoiceSession;

  constructor(private readonly serverUrl: string) {}

  createSession(options: CloudVoiceSessionOptions): WebCloudVoiceSession {
    if (this.activeSession) void this.activeSession.close('service_replaced');
    const session = new WebCloudVoiceSession(
      options,
      this.serverUrl,
      () => {
        if (this.activeSession === session) this.activeSession = undefined;
      },
    );
    this.activeSession = session;
    return session;
  }

  async dispose(): Promise<void> {
    const session = this.activeSession;
    this.activeSession = undefined;
    await session?.close('cleanup');
  }
}

class WebCloudVoiceSession implements CloudVoiceSession {
  readonly id: string;

  private state: CloudVoiceMachineState;
  private transcript: EphemeralCloudVoiceTranscript;
  private readonly partialTranscripts = new Map<string, CloudVoiceTranscriptEntry>();
  private reflection?: CloudVoiceReflection;
  private lastSafetyAssessment?: CloudVoiceSafetyAssessment;
  private finishPromise?: Promise<CloudVoiceReflection>;
  private durationTimer?: ReturnType<typeof setTimeout>;
  private safetyFinishTimer?: ReturnType<typeof setTimeout>;
  private awaitingFinalChildTranscript = false;
  private closed = false;
  private readonly transport: WebRealtimeVoiceService;

  constructor(
    private readonly options: CloudVoiceSessionOptions,
    serverUrl: string,
    private readonly onClosed: () => void,
  ) {
    this.id = options.sessionId;
    this.state = createInitialCloudVoiceState(options.limits, Date.now());
    this.transcript = createEphemeralCloudVoiceTranscript();
    const endpoint = `${serverUrl.replace(/\/$/, '')}/api/cloud-voice/realtime-session`;
    this.transport = new WebRealtimeVoiceService({
      safetyIdentifier: options.privacyPreservingSafetyId,
      wisdomId: options.context.wisdomId,
      sceneId: 'wisdom-reflection',
      context: {
        wisdomTitle: options.context.wisdomTitle,
        storySummary: options.context.storySummary,
        currentStoryScene: options.context.currentStoryScene,
        reflectionGoal: options.context.reflectionGoal,
        childAgeBand: options.context.childAgeBand,
        previousAnswer: options.context.previousAnswer,
        moneyDecision: options.context.moneyDecision,
        takeaway: options.context.takeaway,
        maximumConversationTurns: options.context.maximumConversationTurns,
        maximumDurationSeconds: options.context.maximumDurationSeconds,
        authoredChoiceIds: options.context.authoredChoiceIds,
      },
      endpoint,
      maxCloudTurns: this.state.limits.maxCloudTurns,
      callbacks: {
        onStateChange: (status) => this.syncTransportState(status),
        onVadChange: (speaking) => this.handleVadChange(speaking),
        onThinkingChange: (thinking) => {
          if (thinking) this.ensureThinkingState();
        },
        onPlaybackChange: (playing) => this.handlePlaybackChange(playing),
        onTranscript: (update) => this.handleTranscript(update),
        onCloudTurn: (turns) => {
          if (turns >= this.state.limits.maxCloudTurns) {
            this.dispatch({ type: 'TURN_LIMIT_REACHED', atMs: Date.now() });
            void this.finish();
          }
        },
        onMaxTurnsReached: () => void this.finish(),
        onError: (error) => this.handleTransportError(error),
        onEnded: () => this.markEnded(),
      },
      toolHandlers: {
        save_wisdom_reflection: {
          validate: (input) => {
            const parsed = parseCloudVoiceReflection(input);
            return parsed.ok
              ? { ok: true, value: parsed.value }
              : { ok: false, message: parsed.issues.join(' ') };
          },
          onCall: async (call) => {
            await this.waitForFinalChildTranscript();
            const reflection = call.arguments as CloudVoiceReflection;
            const promotedModelSafety = this.promoteModelReportedSafety(reflection);
            this.acceptReflection(reflection, promotedModelSafety);
            if (
              promotedModelSafety ||
              !this.lastSafetyAssessment?.shouldEndConversation
            ) {
              setTimeout(() => void this.finish(), 0);
            }
            return { ok: true, saved: true };
          },
          createResponseAfterOutput: false,
        },
      },
    });
  }

  async start(): Promise<void> {
    if (this.closed) return;
    await this.transport.startFromUserGesture();
    if (this.closed) return;
    this.durationTimer = setTimeout(() => {
      this.dispatch({ type: 'DURATION_LIMIT_REACHED', atMs: Date.now() });
      void this.finish();
    }, this.state.limits.maxDurationMs);
  }

  setMuted(muted: boolean): void {
    if (!this.closed) this.transport.setMuted(muted);
  }

  finish(): Promise<CloudVoiceReflection> {
    if (this.finishPromise) return this.finishPromise;
    this.finishPromise = this.finishOnce();
    return this.finishPromise;
  }

  async close(reason: CloudVoiceEndReason = 'cleanup'): Promise<void> {
    if (this.closed) return;
    this.dispatch({ type: 'END_REQUESTED', atMs: Date.now(), reason });
    this.clearTimers();
    await this.transport.end(mapEndReason(reason));
    this.markEnded();
  }

  getSnapshot(): CloudVoiceSessionSnapshot {
    return {
      state: {
        ...this.state,
        limits: { ...this.state.limits },
        ...(this.state.error ? { error: { ...this.state.error } } : {}),
      },
      transcript: this.visibleTranscript().map((entry) => ({ ...entry })),
      ...(this.reflection ? { reflection: { ...this.reflection } } : {}),
    };
  }

  private async finishOnce(): Promise<CloudVoiceReflection> {
    if (!this.reflection && !this.closed) {
      const shouldInterrupt =
        this.state.status === 'thinking' ||
        this.state.status === 'cloudSpeaking' ||
        (this.state.status === 'muted' &&
          (this.state.mutedFrom === 'thinking' ||
            this.state.mutedFrom === 'cloudSpeaking'));
      this.transport.setMuted(true);
      if (shouldInterrupt) this.transport.interrupt();
      this.dispatch({
        type: 'END_REQUESTED',
        atMs: Date.now(),
        reason: this.state.endReason ?? 'child_finished',
      });
      const requestReflection = (
        this.transport as WebRealtimeVoiceService & {
          requestStructuredReflection?: () => void;
        }
      ).requestStructuredReflection;
      if (requestReflection) {
        try {
          requestReflection.call(this.transport);
          await this.waitForReflection();
        } catch {
          // A bounded, privacy-minimized local result keeps the Wisdom usable.
        }
      }
    }

    if (!this.reflection) this.acceptReflection(this.buildFallbackReflection());
    this.clearTimers();
    if (!this.closed) await this.transport.end('user');
    this.markEnded();
    const result = this.reflection;
    if (!result) throw new Error('Cloud voice reflection was not created.');
    return result;
  }

  private waitForReflection(): Promise<void> {
    if (this.reflection) return Promise.resolve();
    return new Promise((resolve) => {
      const startedAt = Date.now();
      const poll = () => {
        if (this.reflection || this.closed || Date.now() - startedAt >= REFLECTION_WAIT_MS) {
          resolve();
          return;
        }
        setTimeout(poll, 50);
      };
      poll();
    });
  }

  private acceptReflection(
    reflection: CloudVoiceReflection,
    modelSafetyPromoted = false,
  ): void {
    const localSafety = this.lastSafetyAssessment;
    if (this.reflection && (!localSafety || localSafety.category === 'safe')) {
      return;
    }
    const safeReflection = modelSafetyPromoted && localSafety
      ? {
          summary: localSafety.shouldEndConversation
            ? 'The conversation was limited after a safety concern.'
            : 'Cloud kept sensitive details out of the saved reflection.',
          childExample: '[Sensitive safety concern omitted]',
          cloudInsight: localSafety.shouldEndConversation
            ? 'Cloud encouraged support from a trusted adult nearby.'
            : 'Cloud encouraged a safe and private next step.',
          confidence: Math.min(reflection.confidence, 0.5),
          safetyStatus: localSafety.category,
        }
      : localSafety && localSafety.category !== 'safe'
        ? {
            ...reflection,
            summary: localSafety.shouldEndConversation
              ? 'The conversation was limited after a safety concern.'
              : redactSensitiveText(reflection.summary),
            childExample: minimizeTextForSafety(
              reflection.childExample,
              localSafety.category,
            ),
            cloudInsight: localSafety.shouldEndConversation
              ? 'Cloud encouraged support from a trusted adult nearby.'
              : redactSensitiveText(reflection.cloudInsight),
            safetyStatus: localSafety.category,
          }
        : reflection;
    this.reflection = safeReflection;
    this.options.callbacks?.onReflection?.({ ...safeReflection });
  }

  private promoteModelReportedSafety(reflection: CloudVoiceReflection): boolean {
    if (reflection.safetyStatus === 'safe') {
      return false;
    }

    const assessment = assessCloudVoiceSafetyCategory(reflection.safetyStatus);
    if (
      this.lastSafetyAssessment?.category !== undefined &&
      this.lastSafetyAssessment.category !== 'safe' &&
      (this.lastSafetyAssessment.shouldEndConversation ||
        !assessment.shouldEndConversation)
    ) {
      return false;
    }
    this.lastSafetyAssessment = assessment;
    if (assessment.shouldMinimizeTranscript) {
      this.partialTranscripts.clear();
      this.transcript = appendEphemeralTranscript(
        clearEphemeralCloudVoiceTranscript(this.transcript),
        {
          role: 'child',
          text: '[Sensitive safety concern omitted]',
          createdAtMs: Date.now(),
          final: true,
          safetyStatus: assessment.category,
        },
      );
      this.options.callbacks?.onTranscriptChange?.(this.visibleTranscript());
    }
    this.options.callbacks?.onSafety?.(assessment);
    this.dispatch({
      type: 'SAFETY_ESCALATED',
      atMs: Date.now(),
      category: reflection.safetyStatus,
    });
    return true;
  }

  private buildFallbackReflection(): CloudVoiceReflection {
    const childEntry = [...this.transcript.entries]
      .reverse()
      .find((entry) => entry.role === 'child');
    const safetyStatus =
      this.lastSafetyAssessment?.category ?? this.state.safetyStatus;
    const childExample = childEntry?.text || 'No personal example was shared.';
    return {
      summary:
        safetyStatus === 'safe'
          ? 'The voice conversation ended before Cloud saved its full reflection.'
          : 'The conversation was limited after a safety concern.',
      childExample: minimizeTextForSafety(childExample, safetyStatus).slice(0, 180),
      cloudInsight:
        safetyStatus === 'safe'
          ? 'Cloud invited the child to pause and think about what matters.'
          : 'Cloud encouraged support from a trusted adult nearby.',
      confidence: childEntry ? 0.35 : 0.15,
      safetyStatus,
    };
  }

  private handleTranscript(update: WebRealtimeTranscriptUpdate): void {
    const assessment =
      update.role === 'child'
        ? assessCloudVoiceSafety(update.text)
        : ({
            category: 'safe',
            shouldEndConversation: false,
            shouldMinimizeTranscript: false,
          } satisfies CloudVoiceSafetyAssessment);
    const safeText = minimizeTextForSafety(update.text, assessment.category);
    if (update.final) {
      this.partialTranscripts.delete(update.itemId);
      this.transcript = appendEphemeralTranscript(this.transcript, {
        role: update.role,
        text: safeText,
        createdAtMs: Date.now(),
        final: true,
        safetyStatus: assessment.category,
      });
    } else {
      this.partialTranscripts.set(update.itemId, {
        id: `live-${update.itemId}`,
        role: update.role,
        text: redactSensitiveText(safeText).slice(0, 320),
        createdAtMs: Date.now(),
        final: false,
        safetyStatus: assessment.category,
      });
    }
    this.options.callbacks?.onTranscriptChange?.(this.visibleTranscript());

    if (update.role === 'child' && update.final) {
      this.awaitingFinalChildTranscript = false;
    }

    if (
      update.role === 'child' &&
      update.final &&
      assessment.category !== 'safe'
    ) {
      this.lastSafetyAssessment = assessment;
      if (this.reflection) this.acceptReflection(this.reflection);
      this.options.callbacks?.onSafety?.(assessment);
      if (assessment.shouldEndConversation) {
        this.transport.setMuted(true);
        this.transport.interrupt();
        this.dispatch({
          type: 'SAFETY_ESCALATED',
          atMs: Date.now(),
          category: assessment.category,
        });
        const requestResponse = (
          this.transport as WebRealtimeVoiceService & {
            requestResponse?: (instructions: string) => void;
          }
        ).requestResponse;
        try {
          requestResponse?.call(
            this.transport,
            `Say this safety response briefly and calmly, then call save_wisdom_reflection: ${assessment.childSafeResponse}`,
          );
        } catch {
          // The fixed local safety result below remains available if transport fails.
        }
        this.safetyFinishTimer = setTimeout(() => void this.finish(), 6_000);
      }
    }
  }

  private visibleTranscript(): CloudVoiceTranscriptEntry[] {
    return [
      ...this.transcript.entries,
      ...this.partialTranscripts.values(),
    ].slice(-12);
  }

  private syncTransportState(status: WebRealtimeVoiceState): void {
    const now = Date.now();
    switch (status) {
      case 'requestingPermission':
        this.dispatch({ type: 'PERMISSION_REQUESTED', atMs: now });
        break;
      case 'connecting':
        this.dispatch({ type: 'PERMISSION_GRANTED', atMs: now });
        break;
      case 'listening':
        if (this.state.status === 'connecting') {
          this.dispatch({ type: 'CONNECTED', atMs: now });
        } else if (this.state.status === 'cloudSpeaking') {
          this.dispatch({ type: 'CLOUD_RESPONSE_ENDED', atMs: now });
        } else if (this.state.status === 'muted') {
          this.dispatch({ type: 'UNMUTED', atMs: now });
        }
        break;
      case 'childSpeaking':
        if (this.state.status === 'listening') {
          this.dispatch({ type: 'CHILD_SPEECH_STARTED', atMs: now });
        }
        break;
      case 'thinking':
        if (this.state.status === 'childSpeaking') {
          this.dispatch({ type: 'CHILD_SPEECH_ENDED', atMs: now });
        }
        break;
      case 'cloudSpeaking':
        if (this.state.status === 'thinking') {
          this.dispatch({ type: 'CLOUD_RESPONSE_STARTED', atMs: now });
        }
        break;
      case 'muted':
        this.dispatch({ type: 'MUTED', atMs: now });
        break;
      case 'ended':
        this.markEnded();
        break;
      case 'unavailable':
        this.dispatch({
          type: 'MARKED_UNAVAILABLE',
          atMs: now,
          message: 'Live voice is unavailable in this browser. Continue by typing.',
        });
        break;
      case 'idle':
      case 'ending':
      case 'error':
        break;
    }
  }

  private handleVadChange(speaking: boolean): void {
    if (speaking) {
      this.awaitingFinalChildTranscript = true;
      this.dispatch({ type: 'CHILD_SPEECH_STARTED', atMs: Date.now() });
    } else {
      this.dispatch({ type: 'CHILD_SPEECH_ENDED', atMs: Date.now() });
    }
  }

  private ensureThinkingState(): void {
    if (
      this.state.status === 'listening' ||
      (this.state.status === 'muted' && this.state.mutedFrom === 'listening')
    ) {
      this.dispatch({ type: 'CHILD_SPEECH_STARTED', atMs: Date.now() });
    }
    if (
      this.state.status === 'childSpeaking' ||
      (this.state.status === 'muted' && this.state.mutedFrom === 'childSpeaking')
    ) {
      this.dispatch({ type: 'CHILD_SPEECH_ENDED', atMs: Date.now() });
    }
  }

  private handlePlaybackChange(playing: boolean): void {
    if (playing) {
      this.ensureThinkingState();
      this.dispatch({ type: 'CLOUD_RESPONSE_STARTED', atMs: Date.now() });
    } else {
      this.dispatch({ type: 'CLOUD_RESPONSE_ENDED', atMs: Date.now() });
      if (
        (this.state.status === 'ending' &&
          this.state.endReason === 'turn_limit') ||
        (this.lastSafetyAssessment?.shouldEndConversation && this.reflection)
      ) {
        void this.finish();
      }
    }
  }

  private waitForFinalChildTranscript(): Promise<void> {
    if (!this.awaitingFinalChildTranscript) return Promise.resolve();
    return new Promise((resolve) => {
      const startedAt = Date.now();
      const poll = () => {
        if (
          !this.awaitingFinalChildTranscript ||
          this.closed ||
          Date.now() - startedAt >= 3_000
        ) {
          resolve();
          return;
        }
        setTimeout(poll, 50);
      };
      poll();
    });
  }

  private handleTransportError(error: WebRealtimeVoiceError): void {
    if (error.code === 'tool-error') return;
    const mapped: CloudVoiceError = {
      code:
        error.code === 'permission-denied'
          ? 'permission_denied'
          : error.code === 'unavailable'
            ? 'unavailable'
            : 'connection_failed',
      message: error.message,
      recoverable: error.recoverable,
    };
    this.dispatch({ type: 'FAILED', atMs: Date.now(), error: mapped });
    this.options.callbacks?.onError?.(mapped);
    this.transport.teardownAfterError();
  }

  private dispatch(event: CloudVoiceMachineEvent): void {
    const next = reduceCloudVoiceState(this.state, event);
    if (next === this.state) return;
    this.state = next;
    this.options.callbacks?.onStateChange?.(this.getSnapshot().state, event);
  }

  private markEnded(): void {
    if (this.closed) return;
    this.clearTimers();
    this.dispatch({ type: 'ENDED', atMs: Date.now() });
    this.closed = true;
    this.onClosed();
  }

  private clearTimers(): void {
    if (this.durationTimer) clearTimeout(this.durationTimer);
    if (this.safetyFinishTimer) clearTimeout(this.safetyFinishTimer);
    this.durationTimer = undefined;
    this.safetyFinishTimer = undefined;
  }
}

function mapEndReason(reason: CloudVoiceEndReason): WebRealtimeEndReason {
  if (reason === 'screen_exit') return 'screen-exit';
  if (reason === 'turn_limit') return 'max-turns';
  if (reason === 'connection_closed') return 'connection-closed';
  if (reason === 'cleanup' || reason === 'service_replaced') return 'disposed';
  return 'user';
}
