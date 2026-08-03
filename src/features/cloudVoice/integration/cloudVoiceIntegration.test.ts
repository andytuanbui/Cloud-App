import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { GuidedStoryWisdomContent } from '../../../content/wisdoms/types';
import { buildAdaptiveReflectionResponse } from '../../../services/guidedWisdomResponseService';
import {
  createDefaultAppState,
  migrateAppState,
} from '../../../state/appStateMigration';
import { getCloudVoiceAvailability } from '../core/availability';
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

describe('Cloud voice app integration', () => {
  it('requires persistent parent approval and uses a non-PII safety identifier', () => {
    const defaults = createDefaultAppState('2026-08-03');
    assert.equal(defaults.profile.voiceFeaturesApprovedByParent, false);
    assert.match(defaults.profile.voiceSafetyIdentifier, /^cw_[A-Za-z0-9_-]{20,}$/);
    assert.equal(
      getCloudVoiceAvailability({
        featureEnabled: true,
        parentApproved: false,
        serviceSupported: true,
      }).allowed,
      false,
    );

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

  it('persists only a short structured reflection, never audio or transcript', () => {
    const update = buildGuidedUpdateFromVoiceReflection(
      {
        summary: 'The child connected waiting to a future goal.',
        childExample: 'I could wait and save for headphones.',
        cloudInsight: 'A pause can make room for a future goal.',
        confidence: 0.84,
        safetyStatus: 'safe',
        authoredChoiceId: 'sometimes',
      },
      reflectionFixture.choices.map((choice) => choice.id),
    );

    assert.equal(update.personalResponse?.source, 'voice');
    assert.equal(update.selectedReflectionAnswer, 'sometimes');
    assert.equal(update.voiceReflection?.confidence, 'high');
    const serialized = JSON.stringify(update).toLowerCase();
    assert.doesNotMatch(serialized, /transcript|rawaudio|microphoneaudio|audioblob/);

    const emptyState = JSON.stringify(
      createDefaultAppState('2026-08-03'),
    ).toLowerCase();
    assert.doesNotMatch(emptyState, /transcript|rawaudio|audioblob/);
  });

  it('keeps both suggested and typed authored fallbacks functional', () => {
    const choice = reflectionFixture.choices[0];
    const suggestion = choice.suggestedResponses[0];
    assert.equal(
      buildAdaptiveReflectionResponse({
        selectedReflectionAnswerId: choice.id,
        personalResponse: suggestion.label,
        context: { reflection: reflectionFixture },
      }),
      suggestion.adaptiveResponse,
    );
    assert.match(
      buildAdaptiveReflectionResponse({
        selectedReflectionAnswerId: choice.id,
        personalResponse: 'I wanted a game today',
        context: { reflection: reflectionFixture },
      }),
      /wanted a game today/i,
    );
  });
});
