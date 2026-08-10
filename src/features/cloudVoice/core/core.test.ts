import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  CLOUD_VOICE_CHILD_DISCLOSURE,
  buildCloudVoicePrompt,
  buildSaveWisdomReflectionTool,
} from './prompt';
import { parseCloudVoiceReflection } from './reflection';
import {
  assessCloudVoiceSafety,
  detectCloudVoiceSafetyCategory,
  getCloudVoiceSafetyResponse,
} from './safety';
import {
  createInitialCloudVoiceState,
  reduceCloudVoiceState,
} from './stateMachine';
import {
  appendEphemeralTranscript,
  createEphemeralCloudVoiceTranscript,
  transcriptCharacterCount,
} from './transcript';
import type {
  CloudVoiceMachineEvent,
  CloudVoiceWisdomContext,
} from './types';

describe('Cloud voice state machine', () => {
  it('follows the explicit conversation states and ends at the turn limit', () => {
    let state = createInitialCloudVoiceState(
      { maxCloudTurns: 2, maxDurationMs: 1_000 },
      0,
    );
    const apply = (event: CloudVoiceMachineEvent) => {
      state = reduceCloudVoiceState(state, event);
      return state.status;
    };

    assert.equal(apply({ type: 'PERMISSION_REQUESTED', atMs: 1 }), 'requestingPermission');
    assert.equal(apply({ type: 'PERMISSION_GRANTED', atMs: 2 }), 'connecting');
    assert.equal(apply({ type: 'CONNECTED', atMs: 3 }), 'listening');
    assert.equal(apply({ type: 'CHILD_SPEECH_STARTED', atMs: 4 }), 'childSpeaking');
    assert.equal(apply({ type: 'CHILD_SPEECH_ENDED', atMs: 5 }), 'thinking');
    assert.equal(apply({ type: 'CLOUD_RESPONSE_STARTED', atMs: 6 }), 'cloudSpeaking');
    assert.equal(apply({ type: 'MUTED', atMs: 7 }), 'muted');
    assert.equal(state.mutedFrom, 'cloudSpeaking');
    assert.equal(apply({ type: 'CLOUD_RESPONSE_ENDED', atMs: 8 }), 'muted');
    assert.equal(state.mutedFrom, 'listening');
    assert.equal(apply({ type: 'UNMUTED', atMs: 9 }), 'listening');

    apply({ type: 'CHILD_SPEECH_STARTED', atMs: 10 });
    apply({ type: 'CHILD_SPEECH_ENDED', atMs: 11 });
    apply({ type: 'CLOUD_RESPONSE_STARTED', atMs: 12 });
    assert.equal(apply({ type: 'CLOUD_RESPONSE_ENDED', atMs: 13 }), 'ending');
    assert.equal(state.cloudTurns, 2);
    assert.equal(state.endReason, 'turn_limit');
    assert.equal(apply({ type: 'ENDED', atMs: 14 }), 'ended');
  });

  it('models permission, connection, duration, and unavailable failures', () => {
    let denied = createInitialCloudVoiceState(undefined, 0);
    denied = reduceCloudVoiceState(denied, {
      type: 'PERMISSION_REQUESTED',
      atMs: 1,
    });
    denied = reduceCloudVoiceState(denied, {
      type: 'PERMISSION_DENIED',
      atMs: 2,
    });
    assert.equal(denied.status, 'unavailable');
    assert.equal(denied.error?.code, 'permission_denied');

    let failed = createInitialCloudVoiceState(undefined, 0);
    failed = reduceCloudVoiceState(failed, {
      type: 'FAILED',
      atMs: 1,
      error: {
        code: 'connection_failed',
        message: 'offline',
        recoverable: true,
      },
    });
    assert.equal(failed.status, 'error');

    let expired = createInitialCloudVoiceState(undefined, 0);
    expired = reduceCloudVoiceState(expired, {
      type: 'DURATION_LIMIT_REACHED',
      atMs: 10,
    });
    assert.equal(expired.status, 'ending');
    assert.equal(expired.endReason, 'duration_limit');
  });
});

describe('Cloud voice transcript privacy', () => {
  it('redacts identifiers, minimizes high-risk text, and caps memory', () => {
    let transcript = createEphemeralCloudVoiceTranscript({
      maxEntries: 2,
      maxCharacters: 80,
      maxEntryCharacters: 60,
    });
    transcript = appendEphemeralTranscript(transcript, {
      role: 'child',
      text: 'My email is child@example.com and my phone is 070-123 45 67.',
      createdAtMs: 1,
    });
    assert.doesNotMatch(transcript.entries[0].text, /child@example|070-123/);
    assert.match(transcript.entries[0].text, /removed/);

    transcript = appendEphemeralTranscript(transcript, {
      role: 'cloud',
      text: 'Please keep personal details private.',
      createdAtMs: 2,
      safetyStatus: 'safe',
    });
    transcript = appendEphemeralTranscript(transcript, {
      role: 'child',
      text: 'I want to hurt myself and here are many private details.',
      createdAtMs: 3,
      safetyStatus: 'self_harm',
    });

    assert.equal(transcript.entries.length, 2);
    assert.equal(
      transcript.entries.at(-1)?.text,
      '[Sensitive safety concern omitted]',
    );
    assert.ok(transcriptCharacterCount(transcript.entries) <= 80);
  });
});

describe('Cloud voice local safety', () => {
  const examples = [
    ['My email is child@example.com', 'personal_data'],
    ['Kids keep picking on me', 'bullying'],
    ["I'm really scared", 'fear'],
    ['Someone is hitting me', 'abuse_or_danger'],
    ['I want to hurt myself', 'self_harm'],
    ['I am going to hurt someone', 'threats'],
    ['Someone sent a nude', 'sexual_content'],
    ["Don't tell my parents", 'secrets'],
    ['How can I hack into this account', 'adult_or_illegal'],
    ['I saved for headphones', 'safe'],
  ] as const;

  for (const [text, category] of examples) {
    it(`classifies ${category}`, () => {
      assert.equal(detectCloudVoiceSafetyCategory(text), category);
    });
  }

  it('ends high-risk topics with a short trusted-adult response', () => {
    const assessment = assessCloudVoiceSafety('I want to hurt myself');
    assert.equal(assessment.shouldEndConversation, true);
    assert.match(assessment.childSafeResponse ?? '', /trusted adult/i);
    assert.doesNotMatch(assessment.childSafeResponse ?? '', /diagnos|therapy/i);
    assert.match(getCloudVoiceSafetyResponse('secrets'), /trusted adult/i);
  });
});

describe('Cloud voice prompt and tool contract', () => {
  const context: CloudVoiceWisdomContext = {
    wisdomId: 'three-ways-to-use-money',
    wisdomTitle: 'Three Ways to Use Money',
    storySummary: 'Leo can spend, save, or help.',
    currentStoryScene: 'Leo has 90 dollars and pauses before the shop.',
    reflectionGoal: 'Connect waiting with a personal money choice.',
    childAgeBand: '8-10',
    previousAnswer: 'My full name is Private Child.',
    moneyDecision: 'Spend, save, and give 90 dollars.',
    takeaway: 'Balance depends on what matters.',
    authoredChoiceIds: ['save-for-later', 'help-someone', 'bad id'],
    maximumConversationTurns: 99,
    maximumDurationSeconds: 999,
  };

  it('builds a bounded, disclosed, child-safe prompt with redacted context', () => {
    const prompt = buildCloudVoicePrompt(context);
    assert.match(prompt, /You are Cloud/);
    assert.match(prompt, /Cloud is not Leo/);
    assert.match(prompt, new RegExp(CLOUD_VOICE_CHILD_DISCLOSURE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(prompt, /within 6 Cloud turns and 180 seconds/);
    assert.match(prompt, /do not retain sensitive detail/i);
    assert.match(prompt, /do not.*therap/i);
    assert.match(prompt, /save_wisdom_reflection/);
    assert.match(prompt, /save-for-later/);
    assert.doesNotMatch(prompt, /Private Child|bad id/);
  });

  it('grounds a meaningful money answer in concrete details before one follow-up', () => {
    const prompt = buildCloudVoicePrompt(context);
    const childAnswer =
      'I would save 30 dollars for headphones because I can wait.';
    const groundedResponse =
      'You’d save 30 dollars for the headphones because you can wait. What could help you remember your saving plan?';

    assert.match(prompt, /RESPONSE GROUNDING/);
    assert.ok(prompt.includes(`Example child: “${childAnswer}”`));
    assert.ok(prompt.includes(`Good Cloud response: “${groundedResponse}”`));
    assert.match(
      prompt,
      /first sentence must acknowledge at least one concrete detail.*before asking the next question/i,
    );
    assert.match(
      prompt,
      /decision first, then their reason, then a concrete object or goal/i,
    );
    assert.match(prompt, /whole response to one or two short sentences/i);
    assert.match(prompt, /without repeating the child’s whole answer/i);
    assert.equal(groundedResponse.match(/\?/g)?.length, 1);
    assert.match(groundedResponse, /30 dollars/);
    assert.match(groundedResponse, /headphones/);
    assert.match(groundedResponse, /because you can wait/i);
  });

  it('explicitly rejects generic praise and multiple questions', () => {
    const prompt = buildCloudVoicePrompt(context);
    const genericPraise =
      'That’s a thoughtful answer! What else could you do?';
    const multipleQuestions =
      'Would you save the money? Why can you wait?';

    assert.ok(prompt.includes(`Not acceptable: “${genericPraise}”`));
    assert.ok(prompt.includes(`Not acceptable: “${multipleQuestions}”`));
    assert.match(
      prompt,
      /Generic praise followed by a question also fails this rule/i,
    );
    assert.match(prompt, /no more than one question/i);
    assert.equal(multipleQuestions.match(/\?/g)?.length, 2);
  });

  it('keeps privacy and safety responses above the grounding pattern', () => {
    const prompt = buildCloudVoicePrompt(context);
    const groundingIndex = prompt.indexOf('RESPONSE GROUNDING');
    const safetyIndex = prompt.indexOf('PRIVACY AND SAFETY');

    assert.ok(groundingIndex >= 0);
    assert.ok(safetyIndex > groundingIndex);
    assert.match(
      prompt,
      /Privacy and safety instructions override this grounding pattern/i,
    );
    assert.match(
      prompt,
      /For a serious safety concern, stop the normal Wisdom conversation/i,
    );
  });

  it('constrains optional authored choices in the function tool', () => {
    const tool = buildSaveWisdomReflectionTool(context);
    const authored = tool.parameters.properties.authoredChoiceId as {
      enum?: string[];
    };
    assert.deepEqual(authored.enum, ['save-for-later', 'help-someone']);
    assert.equal(tool.parameters.additionalProperties, false);
    assert.deepEqual(tool.parameters.required, [
      'summary',
      'childExample',
      'cloudInsight',
      'confidence',
      'safetyStatus',
    ]);
  });
});

describe('Cloud voice reflection validation', () => {
  it('normalizes a valid short reflection and redacts identifying data', () => {
    const result = parseCloudVoiceReflection({
      summary: '  The child made a plan.  ',
      childExample: 'My email is child@example.com and I saved for a game.',
      cloudInsight: '  Waiting can help a goal. ',
      confidence: 0.876,
      safetyStatus: 'personal_data',
      authoredChoiceId: 'save-for-later',
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.value.confidence, 0.88);
    assert.doesNotMatch(result.value.childExample, /child@example/);
    assert.equal(result.value.authoredChoiceId, 'save-for-later');
  });

  it('removes high-risk detail and rejects malformed results', () => {
    const sensitive = parseCloudVoiceReflection({
      summary: 'A safety concern was raised.',
      childExample: 'Detailed sensitive content that should not remain.',
      cloudInsight: 'Cloud suggested a trusted adult nearby.',
      confidence: 0.9,
      safetyStatus: 'self_harm',
    });
    assert.equal(sensitive.ok, true);
    if (sensitive.ok) {
      assert.equal(
        sensitive.value.childExample,
        '[Sensitive safety concern omitted]',
      );
    }

    const invalid = parseCloudVoiceReflection({
      summary: '',
      childExample: 'Example',
      cloudInsight: 'Insight',
      confidence: 2,
      safetyStatus: 'diagnosis',
    });
    assert.equal(invalid.ok, false);
    if (!invalid.ok) assert.ok(invalid.issues.length >= 3);
  });
});
