import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { GuidedStoryWisdomContent } from '../../../content/wisdoms/types';
import {
  buildAdaptiveReflectionResponse,
  buildPersonalizedSummary,
} from '../../../services/guidedWisdomResponseService';

const context = {
  reflection: {
    question: 'When was waiting difficult?',
    allowTypedResponse: true,
    maxResponseLength: 120,
    choices: [
      {
        id: 'sometimes',
        label: 'Sometimes',
        cloudResponse: 'Waiting can feel difficult.',
        followUpQuestion: 'What made it difficult?',
        suggestedResponses: [],
        adaptivePrompt:
          'What might feel different if you waited until tomorrow before choosing?',
        summaryLead: 'You said waiting can feel difficult sometimes.',
      },
    ],
  },
  decision: {
    scenario: 'How would you divide the money?',
    totalAmount: 90,
    increment: 10,
    initialPlan: { spend: 30, save: 30, give: 30 },
    categories: [
      { id: 'spend', label: 'Spend now', objectLabel: 'Football cards' },
      { id: 'save', label: 'Save for later', objectLabel: 'Headphones' },
      { id: 'give', label: 'Give or help', objectLabel: 'Mia’s birthday' },
    ],
    rules: {
      balancedMinimumPerCategory: 20,
      balancedMaximumSpread: 20,
      significantGiveMinimum: 40,
    },
    consequenceResponses: {
      spend: 'More for today.',
      save: 'More for later.',
      give: 'More for Mia.',
      balanced: 'Every choice has a place.',
    },
    equalPlanResponse: 'Every choice has a place.',
    reviewQuestion: 'Keep this plan?',
    keepLabel: 'Keep My Plan',
    changeLabel: 'Change My Plan',
  },
  takeaway: {
    question: 'What do you want to remember?',
    allowTypedResponse: true,
    maxResponseLength: 160,
    choices: [
      { id: 'help-others', label: 'Money can help other people' },
    ],
  },
} satisfies Pick<
  GuidedStoryWisdomContent,
  'reflection' | 'decision' | 'takeaway'
>;

describe('Local typed response grounding', () => {
  it('keeps the child’s concrete decision, object, and reason in a two-sentence reply', () => {
    const response = buildAdaptiveReflectionResponse({
      selectedReflectionAnswerId: 'sometimes',
      personalResponse:
        'I would save 30 dollars for headphones because I can wait.',
      context,
    });

    assert.equal(
      response,
      'You would save 30 dollars for headphones because you can wait. What might feel different if you waited until tomorrow before choosing?',
    );
    assert.doesNotMatch(response, /because I can\.|That mattered to you/);
    assert.equal(response.match(/\?/g)?.length, 1);
    assert.equal(response.match(/[.!?](?:\s|$)/g)?.length, 2);
  });

  it('does not cut a concrete gift object into a dangling phrase in the later summary', () => {
    const summary = buildPersonalizedSummary({
      selectedReflectionAnswerId: 'sometimes',
      personalResponse:
        'I would spend some, save some, and help with a birthday gift.',
      moneyPlan: { spend: 30, save: 30, give: 30 },
      takeaway: 'Money can help other people',
      context,
    });

    assert.match(
      summary,
      /^You would spend some, save some, and help with a birthday gift\./,
    );
    assert.doesNotMatch(summary, /help with a\./);
  });
});
