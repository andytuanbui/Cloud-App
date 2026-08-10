import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import {
  formatCurrencyAccessibility,
  formatCurrencyDisplay,
} from '../../../config/currency';
import type { GuidedStoryWisdomContent } from '../../../content/wisdoms/types';
import {
  buildAdaptiveReflectionResponse,
  validateMoneyPlan,
} from '../../../services/guidedWisdomResponseService';
import {
  createDefaultAppState,
  migrateAppState,
} from '../../../state/appStateMigration';
import {
  createDefaultGuidedWisdomSession,
  type GuidedWisdomSession,
  type PersistedAppState,
} from '../../../state/types';
import { getCloudVoiceAvailability } from '../core/availability';
import { isCompleteCloudVoiceReflection } from '../core/reflection';
import type {
  CloudVoiceReflection,
  CloudVoiceSessionOptions,
} from '../core/types';
import { ManualCloudVoiceClock } from '../mock/ManualCloudVoiceClock';
import { MockCloudVoiceService } from '../mock/MockCloudVoiceService';
import { buildGuidedUpdateFromVoiceReflection } from './guidedReflection';

const reflectionFixture = {
  question: 'Have you ever wanted something so much that waiting felt difficult?',
  allowTypedResponse: true,
  maxResponseLength: 120,
  choices: [
    {
      id: 'sometimes',
      label: 'Sometimes',
      cloudResponse: 'Some things are easier to wait for than others.',
      followUpQuestion: 'What made waiting difficult?',
      adaptivePrompt: 'What might feel different if you waited?',
      summaryLead: 'You said waiting can feel difficult sometimes.',
      suggestedResponses: [
        {
          id: 'game',
          label: 'A game',
          adaptiveResponse: 'A game can feel exciting. What could waiting change?',
        },
      ],
    },
    {
      id: 'not-sure',
      label: 'I am not sure',
      cloudResponse: 'That is okay.',
      followUpQuestion: 'What happened last time?',
      adaptivePrompt: 'What could you notice next time?',
      summaryLead: 'You took time to think.',
      suggestedResponses: [],
    },
  ],
} satisfies GuidedStoryWisdomContent['reflection'];

const validVoiceReflection = {
  summary: 'The child connected waiting to a future goal.',
  childExample: 'I could wait and save for headphones.',
  cloudInsight: 'A pause can make room for a future goal.',
  confidence: 0.84,
  safetyStatus: 'safe',
  authoredChoiceId: 'sometimes',
} satisfies CloudVoiceReflection;

const guidedMoneyWisdomId = 'three-ways-to-use-money';

function createMockSessionOptions(): CloudVoiceSessionOptions {
  return {
    sessionId: 'guided-integration-session',
    privacyPreservingSafetyId: 'cw_guided_integration_test',
    context: {
      wisdomId: guidedMoneyWisdomId,
      wisdomTitle: 'Three Ways to Use Money',
      storySummary: 'Leo has ninety dollars and can spend, save, or help.',
      currentStoryScene: 'Leo paused before entering the shop.',
      reflectionGoal: reflectionFixture.question,
      childAgeBand: '9-10',
      authoredChoiceIds: reflectionFixture.choices.map(
        (choice) => choice.id,
      ),
    },
  };
}

function authoredFallbackResponses() {
  const choice = reflectionFixture.choices[0];
  const suggestion = choice.suggestedResponses[0];
  return {
    suggested: buildAdaptiveReflectionResponse({
      selectedReflectionAnswerId: choice.id,
      personalResponse: suggestion.label,
      context: { reflection: reflectionFixture },
    }),
    typed: buildAdaptiveReflectionResponse({
      selectedReflectionAnswerId: choice.id,
      personalResponse: 'I wanted a game today',
      context: { reflection: reflectionFixture },
    }),
  };
}

describe('Cloud voice app integration', () => {
  it('blocks microphone entry without parent approval but leaves both authored fallbacks usable', () => {
    const defaults = createDefaultAppState('2026-08-03');
    assert.equal(defaults.profile.voiceFeaturesApprovedByParent, false);
    assert.match(defaults.profile.voiceSafetyIdentifier, /^cw_[A-Za-z0-9_-]{20,}$/);

    const availability = getCloudVoiceAvailability({
      featureEnabled: true,
      parentApproved: false,
      serviceSupported: true,
    });
    assert.equal(availability.allowed, false);
    assert.match(
      availability.allowed ? '' : availability.message,
      /parent.*approve.*continue by typing/i,
    );
    const fallbacks = authoredFallbackResponses();
    assert.ok(fallbacks.typed);
    assert.ok(fallbacks.suggested);

    const migrated = migrateAppState(
      {
        ...defaults,
        schemaVersion: 5,
        profile: {
          ...defaults.profile,
          voiceFeaturesApprovedByParent: true,
        },
      },
      '2026-08-03',
    );
    assert.equal(migrated.profile.voiceFeaturesApprovedByParent, true);
    assert.equal(
      migrated.profile.voiceSafetyIdentifier,
      defaults.profile.voiceSafetyIdentifier,
    );
  });

  it('turns a complete voice reflection into the Talk-step completion signal', () => {
    assert.equal(isCompleteCloudVoiceReflection(validVoiceReflection), true);
    const update = buildGuidedUpdateFromVoiceReflection(
      validVoiceReflection,
      reflectionFixture.choices.map((choice) => choice.id),
    );

    assert.equal(update.personalResponse?.source, 'voice');
    assert.equal(update.selectedReflectionAnswer, 'sometimes');
    assert.ok(update.adaptiveResponse, 'voice must reveal Make Your Choice');
    assert.deepEqual(update.voiceReflection, {
      summary: validVoiceReflection.summary,
      childExample: validVoiceReflection.childExample,
      cloudInsight: validVoiceReflection.cloudInsight,
      confidence: 'high',
      safetyStatus: 'safe',
    });
  });

  it('persists only the structured voice reflection, never runtime transcript or audio fields', () => {
    const runtimeOnlyTranscript = 'COMPLETE_TRANSCRIPT_MUST_NOT_PERSIST';
    const reflectionWithRuntimeFields = {
      ...validVoiceReflection,
      transcript: [{ role: 'child', text: runtimeOnlyTranscript }],
      rawAudio: 'RAW_AUDIO_MUST_NOT_PERSIST',
    } as CloudVoiceReflection & {
      transcript: Array<{ role: string; text: string }>;
      rawAudio: string;
    };
    const update = buildGuidedUpdateFromVoiceReflection(
      reflectionWithRuntimeFields,
      reflectionFixture.choices.map((choice) => choice.id),
    );
    const personalResponse = update.personalResponse;
    const voiceReflection = update.voiceReflection;
    assert.ok(personalResponse?.source && personalResponse.text);
    assert.ok(voiceReflection);

    const guidedSession: GuidedWisdomSession = {
      ...createDefaultGuidedWisdomSession(),
      currentStage: 'talk',
      selectedReflectionAnswer: update.selectedReflectionAnswer,
      personalResponse: {
        source: personalResponse.source,
        text: personalResponse.text,
      },
      adaptiveResponse: update.adaptiveResponse ?? '',
      voiceReflection,
    };
    const persistedState = {
      ...createDefaultAppState('2026-08-03'),
      wisdomProgress: {
        [guidedMoneyWisdomId]: {
          wisdomId: guidedMoneyWisdomId,
          currentStep: 'talk',
          completedSteps: [],
          conversationResponses: [],
          quizProgress: { questionIndex: 0, completedAnswerIds: [] },
          guidedSession,
          isCompleted: false,
          completionCount: 0,
          completed: false,
        },
      },
    } satisfies PersistedAppState;

    const serialized = JSON.stringify(persistedState);
    assert.doesNotMatch(serialized, /COMPLETE_TRANSCRIPT|RAW_AUDIO/);
    assert.doesNotMatch(
      serialized.toLowerCase(),
      /transcript|rawaudio|microphoneaudio|audioblob/,
    );
  });

  it('lets typed and suggested responses independently complete the Talk step', () => {
    const fallbacks = authoredFallbackResponses();
    assert.equal(
      fallbacks.suggested,
      reflectionFixture.choices[0].suggestedResponses[0].adaptiveResponse,
    );
    assert.match(fallbacks.typed, /wanted a game today/i);
    assert.ok(fallbacks.typed, 'typed response must reveal Make Your Choice');
    assert.ok(
      fallbacks.suggested,
      'suggested response must reveal Make Your Choice',
    );
  });

  it('keeps typed completion available after a voice connection failure', async () => {
    const clock = new ManualCloudVoiceClock();
    const service = new MockCloudVoiceService({
      scenario: 'network-failure',
      clock,
      timings: { permissionMs: 1, connectionMs: 1 },
    });
    const session = service.createSession(createMockSessionOptions());

    await session.start();
    clock.advanceBy(2);
    const snapshot = session.getSnapshot();
    assert.equal(snapshot.state.status, 'error');
    assert.equal(snapshot.state.error?.code, 'connection_failed');
    assert.match(snapshot.state.error?.message ?? '', /continue by typing/i);
    assert.ok(authoredFallbackResponses().typed);

    await service.dispose();
    assert.equal(clock.pendingTaskCount, 0);
  });

  it('closes the active voice session with screen_exit and cancels pending work', async () => {
    const clock = new ManualCloudVoiceClock();
    const service = new MockCloudVoiceService({
      clock,
      timings: { permissionMs: 1, connectionMs: 1 },
    });
    const session = service.createSession(createMockSessionOptions());

    await session.start();
    clock.advanceBy(2);
    assert.equal(session.getSnapshot().state.status, 'listening');
    assert.ok(clock.pendingTaskCount > 0);
    await session.close('screen_exit');

    const snapshot = session.getSnapshot();
    assert.equal(snapshot.state.status, 'ended');
    assert.equal(snapshot.state.endReason, 'screen_exit');
    assert.equal(clock.pendingTaskCount, 0);
  });

  it('keeps the approved money total derived from content and formatted as USD', () => {
    const contentSource = readFileSync(
      join(
        process.cwd(),
        'src/content/wisdoms/threeWaysToUseMoney.ts',
      ),
      'utf8',
    );
    const totalAmount = 90;
    const increment = 10;
    const initialPlanMatch = contentSource.match(
      /initialPlan:\s*\{\s*spend:\s*(\d+),\s*save:\s*(\d+),\s*give:\s*(\d+)\s*\}/,
    );
    assert.ok(initialPlanMatch, 'the approved initial money plan must exist');
    const initialPlan = {
      spend: Number(initialPlanMatch[1]),
      save: Number(initialPlanMatch[2]),
      give: Number(initialPlanMatch[3]),
    };

    assert.match(contentSource, /totalAmount:\s*TOTAL_AMOUNT/);
    assert.match(contentSource, /increment:\s*DECISION_INCREMENT/);
    assert.equal(formatCurrencyDisplay(totalAmount), '$90');
    assert.equal(formatCurrencyDisplay(increment), '$10');
    assert.equal(formatCurrencyDisplay(initialPlan.spend), '$30');
    assert.equal(formatCurrencyAccessibility(totalAmount), '90 dollars');
    assert.match(contentSource, /formatCurrencySpoken\(TOTAL_AMOUNT\)/);
    assert.deepEqual(validateMoneyPlan(initialPlan, { increment, totalAmount }), {
      isValid: true,
      total: 90,
    });
  });

  it('keeps screen cleanup, fallback, completion, and derived-total wiring intact', () => {
    const screenSource = readFileSync(
      join(
        process.cwd(),
        'src/screens/guided/ThreeWaysGuidedWisdomScreen.tsx',
      ),
      'utf8',
    );
    const surfaceSource = readFileSync(
      join(
        process.cwd(),
        'src/features/cloudVoice/components/CloudVoiceConversationSurface.tsx',
      ),
      'utf8',
    );

    assert.match(screenSource, /cloudVoice\.closeConversation\('screen_exit'\)/);
    assert.match(screenSource, /buildGuidedUpdateFromVoiceReflection/);
    assert.match(screenSource, /session\.adaptiveResponse/);
    assert.match(
      screenSource,
      /formatCurrencyDisplay\(wisdom\.decision\.totalAmount\)/,
    );
    assert.match(
      screenSource,
      /formatCurrencyDisplay\(wisdom\.decision\.increment\)/,
    );
    assert.match(screenSource, /narrationService\.read\(scene\.narrationText/);
    assert.match(screenSource, /storyScene\.narrationText/);
    const legacyLongCurrencyLabel = ['kro', 'ner'].join('');
    assert.doesNotMatch(
      screenSource,
      new RegExp(`\\bkr\\b|${legacyLongCurrencyLabel}`, 'i'),
    );
    assert.match(surfaceSource, /status === 'error'/);
    assert.match(surfaceSource, /disabled=\{!canStart\}/);
    assert.match(surfaceSource, /label="Continue by Typing"/);
  });
});
