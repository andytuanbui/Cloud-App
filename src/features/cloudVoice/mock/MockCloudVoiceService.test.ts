import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type {
  CloudVoiceMachineEvent,
  CloudVoiceSessionOptions,
  CloudVoiceSpeechCallbacks,
  CloudVoiceSpeechOutput,
} from '../core/types';
import { ManualCloudVoiceClock } from './ManualCloudVoiceClock';
import {
  MockCloudVoiceService,
  type MockCloudVoiceServiceOptions,
} from './MockCloudVoiceService';

const FAST_TIMINGS = {
  permissionMs: 10,
  connectionMs: 20,
  childSpeakingMs: 5,
  thinkingMs: 5,
  cloudSpeakingMs: 5,
};

function sessionOptions(
  overrides: Partial<CloudVoiceSessionOptions> = {},
): CloudVoiceSessionOptions {
  return {
    sessionId: 'mock-session-1',
    privacyPreservingSafetyId: 'local-random-id-123',
    context: {
      wisdomId: 'three-ways-to-use-money',
      wisdomTitle: 'Three Ways to Use Money',
      storySummary: 'Leo can spend, save, or help.',
      currentStoryScene: 'Leo pauses before spending 90 dollars.',
      reflectionGoal: 'Connect waiting with a personal choice.',
      childAgeBand: '8-10',
      authoredChoiceIds: ['save-for-later', 'spend-now'],
    },
    ...overrides,
  };
}

function connectedSession(
  serviceOptions: MockCloudVoiceServiceOptions = {},
  optionOverrides: Partial<CloudVoiceSessionOptions> = {},
) {
  const clock =
    serviceOptions.clock instanceof ManualCloudVoiceClock
      ? serviceOptions.clock
      : new ManualCloudVoiceClock();
  const states: string[] = [];
  const events: CloudVoiceMachineEvent[] = [];
  const service = new MockCloudVoiceService({
    timings: FAST_TIMINGS,
    ...serviceOptions,
    clock,
  });
  const suppliedCallbacks = optionOverrides.callbacks;
  const session = service.createSession(
    sessionOptions({
      ...optionOverrides,
      callbacks: {
        ...suppliedCallbacks,
        onStateChange: (state, event) => {
          states.push(state.status);
          events.push(event);
          suppliedCallbacks?.onStateChange?.(state, event);
        },
      },
    }),
  );
  void session.start();
  clock.advanceBy(FAST_TIMINGS.permissionMs + FAST_TIMINGS.connectionMs);
  return { clock, events, service, session, states };
}

describe('ManualCloudVoiceClock', () => {
  it('runs same-time tasks deterministically and cancels work', () => {
    const clock = new ManualCloudVoiceClock(100);
    const calls: number[] = [];
    const cancelled = clock.setTimeout(() => calls.push(0), 2);
    clock.setTimeout(() => calls.push(1), 5);
    clock.setTimeout(() => calls.push(2), 5);
    clock.clearTimeout(cancelled);
    clock.advanceBy(5);
    assert.deepEqual(calls, [1, 2]);
    assert.equal(clock.now(), 105);
    assert.equal(clock.pendingTaskCount, 0);
  });
});

describe('MockCloudVoiceService', () => {
  it('runs a deterministic successful conversation and structured result', async () => {
    const transcriptSizes: number[] = [];
    const reflections: string[] = [];
    const { clock, session, states } = connectedSession(
      {},
      {
        limits: { maxCloudTurns: 3, maxDurationMs: 2_000 },
        callbacks: {
          onTranscriptChange: (entries) => transcriptSizes.push(entries.length),
          onReflection: (reflection) => reflections.push(reflection.summary),
        },
      },
    );

    assert.equal(session.getSnapshot().state.status, 'listening');
    assert.equal(
      session.submitChildUtterance('I want to save for headphones.', 'save-for-later'),
      true,
    );
    assert.equal(session.getSnapshot().state.status, 'childSpeaking');

    clock.advanceBy(FAST_TIMINGS.childSpeakingMs);
    assert.equal(session.getSnapshot().state.status, 'thinking');
    clock.advanceBy(FAST_TIMINGS.thinkingMs);
    assert.equal(session.getSnapshot().state.status, 'cloudSpeaking');
    clock.advanceBy(FAST_TIMINGS.cloudSpeakingMs);
    assert.equal(session.getSnapshot().state.status, 'listening');

    const result = await session.finish();
    assert.equal(result.safetyStatus, 'safe');
    assert.equal(result.authoredChoiceId, 'save-for-later');
    assert.match(result.childExample, /save for headphones/i);
    assert.match(result.cloudInsight, /future goal/i);
    assert.equal(session.getSnapshot().state.status, 'ended');
    assert.deepEqual(transcriptSizes, [1, 2]);
    assert.equal(reflections.length, 1);
    assert.deepEqual(states.slice(0, 3), [
      'requestingPermission',
      'connecting',
      'listening',
    ]);
  });

  it('grounds the first response in a concrete decision before one question', () => {
    const { clock, session } = connectedSession();

    assert.equal(
      session.submitChildUtterance(
        'I would save 30 dollars for headphones because I can wait.',
        'save-for-later',
      ),
      true,
    );
    clock.advanceBy(FAST_TIMINGS.childSpeakingMs + FAST_TIMINGS.thinkingMs);

    const cloudResponse = session
      .getSnapshot()
      .transcript.findLast((entry) => entry.role === 'cloud')?.text;
    assert.equal(
      cloudResponse,
      'You’d save 30 dollars for the headphones because you can wait. What could help you remember your saving plan?',
    );
    assert.equal(cloudResponse?.match(/\?/g)?.length, 1);
    assert.doesNotMatch(cloudResponse ?? '', /great job|thoughtful answer/i);
  });

  it('preserves the last valid authored choice when later turns omit it', async () => {
    const { clock, session } = connectedSession();

    assert.equal(
      session.submitChildUtterance(
        'I want to save for headphones.',
        'save-for-later',
      ),
      true,
    );
    clock.advanceBy(
      FAST_TIMINGS.childSpeakingMs +
        FAST_TIMINGS.thinkingMs +
        FAST_TIMINGS.cloudSpeakingMs,
    );

    assert.equal(
      session.submitChildUtterance('Waiting would still be difficult.'),
      true,
    );
    clock.advanceBy(
      FAST_TIMINGS.childSpeakingMs +
        FAST_TIMINGS.thinkingMs +
        FAST_TIMINGS.cloudSpeakingMs,
    );

    const result = await session.finish();
    assert.equal(result.authoredChoiceId, 'save-for-later');
  });

  it('simulates permission denial without scheduling a connection', () => {
    const clock = new ManualCloudVoiceClock();
    const service = new MockCloudVoiceService({
      scenario: 'permission-denied',
      clock,
      timings: FAST_TIMINGS,
    });
    const session = service.createSession(sessionOptions());
    void session.start();
    assert.equal(session.getSnapshot().state.status, 'requestingPermission');
    clock.advanceBy(FAST_TIMINGS.permissionMs);
    assert.equal(session.getSnapshot().state.status, 'unavailable');
    assert.equal(session.getSnapshot().state.error?.code, 'permission_denied');
    assert.equal(clock.pendingTaskCount, 0);
  });

  it('simulates a recoverable network failure and typed fallback', () => {
    const errors: string[] = [];
    const clock = new ManualCloudVoiceClock();
    const service = new MockCloudVoiceService({
      scenario: 'network-failure',
      clock,
      timings: FAST_TIMINGS,
    });
    const session = service.createSession(
      sessionOptions({
        callbacks: { onError: (error) => errors.push(error.code) },
      }),
    );
    void session.start();
    clock.advanceBy(FAST_TIMINGS.permissionMs + FAST_TIMINGS.connectionMs);
    assert.equal(session.getSnapshot().state.status, 'error');
    assert.deepEqual(errors, ['connection_failed']);
    assert.equal(clock.pendingTaskCount, 0);
  });

  it('minimizes a safety trigger, speaks support, and ends normally', () => {
    const safetyCategories: string[] = [];
    const { clock, session } = connectedSession(
      { scenario: 'safety-trigger', forcedSafetyCategory: 'self_harm' },
      {
        callbacks: {
          onSafety: (assessment) => safetyCategories.push(assessment.category),
        },
      },
    );

    session.submitChildUtterance('A private unsafe detail.');
    clock.advanceBy(
      FAST_TIMINGS.childSpeakingMs +
        FAST_TIMINGS.thinkingMs +
        FAST_TIMINGS.cloudSpeakingMs,
    );

    const snapshot = session.getSnapshot();
    assert.equal(snapshot.state.status, 'ended');
    assert.equal(snapshot.state.endReason, 'safety');
    assert.equal(snapshot.reflection?.safetyStatus, 'self_harm');
    assert.equal(
      snapshot.transcript.find((entry) => entry.role === 'child')?.text,
      '[Sensitive safety concern omitted]',
    );
    assert.match(
      snapshot.transcript.find((entry) => entry.role === 'cloud')?.text ?? '',
      /trusted adult/i,
    );
    assert.deepEqual(safetyCategories, ['self_harm']);
  });

  it('honors injected speech callbacks and ignores them after cleanup', async () => {
    let speechCallbacks: CloudVoiceSpeechCallbacks | undefined;
    let cleanupCalls = 0;
    let cancelCalls = 0;
    const speechOutput: CloudVoiceSpeechOutput = {
      speak: (_text, callbacks) => {
        speechCallbacks = callbacks;
        return () => {
          cleanupCalls += 1;
        };
      },
      cancel: () => {
        cancelCalls += 1;
      },
    };
    const { clock, session } = connectedSession({ speechOutput });
    session.submitChildUtterance('I might spend it now.');
    clock.advanceBy(FAST_TIMINGS.childSpeakingMs + FAST_TIMINGS.thinkingMs);
    assert.equal(session.getSnapshot().state.status, 'thinking');

    speechCallbacks?.onStart();
    assert.equal(session.getSnapshot().state.status, 'cloudSpeaking');
    await session.close('screen_exit');
    assert.equal(session.getSnapshot().state.status, 'ended');
    assert.equal(cleanupCalls, 1);
    assert.equal(cancelCalls, 1);
    assert.equal(clock.pendingTaskCount, 0);

    speechCallbacks?.onComplete();
    assert.equal(session.getSnapshot().state.status, 'ended');
  });

  it('automatically ends on maximum turns and maximum duration', () => {
    const turnLimited = connectedSession(
      {},
      { limits: { maxCloudTurns: 1, maxDurationMs: 1_000 } },
    );
    turnLimited.session.submitChildUtterance('I would save it.');
    turnLimited.clock.advanceBy(
      FAST_TIMINGS.childSpeakingMs +
        FAST_TIMINGS.thinkingMs +
        FAST_TIMINGS.cloudSpeakingMs,
    );
    assert.equal(turnLimited.session.getSnapshot().state.status, 'ended');
    assert.equal(turnLimited.session.getSnapshot().state.endReason, 'turn_limit');

    const durationLimited = connectedSession(
      {},
      { limits: { maxCloudTurns: 6, maxDurationMs: 25 } },
    );
    durationLimited.clock.advanceBy(25);
    assert.equal(durationLimited.session.getSnapshot().state.status, 'ended');
    assert.equal(
      durationLimited.session.getSnapshot().state.endReason,
      'duration_limit',
    );
    assert.equal(durationLimited.clock.pendingTaskCount, 0);
  });

  it('allows only one active service session and cleans the replaced session', () => {
    const clock = new ManualCloudVoiceClock();
    const service = new MockCloudVoiceService({ clock, timings: FAST_TIMINGS });
    const first = service.createSession(sessionOptions());
    void first.start();
    const second = service.createSession(
      sessionOptions({ sessionId: 'mock-session-2' }),
    );
    assert.equal(first.getSnapshot().state.status, 'ended');
    assert.equal(first.getSnapshot().state.endReason, 'service_replaced');
    assert.equal(clock.pendingTaskCount, 0);
    assert.equal(second.getSnapshot().state.status, 'idle');
  });
});
