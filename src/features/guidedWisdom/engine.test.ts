import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  applyAllocationStep,
  canDecrease,
  canIncrease,
  createEmptyAllocation,
  createEvenAllocation,
  evaluateAllocation,
  formatPlacedOfTotal,
  formatUnits,
} from './allocation';
import { buildCompletionSummary } from './completion';
import { testGuidedWisdomDefinition } from './fixtures/testGuidedWisdom';
import {
  getNextScreen,
  getNextStoryScene,
  getPreviousScreen,
  getPreviousStoryScene,
  getStageLabel,
  getStageNumber,
  getWisdomStatus,
  totalGuidedStages,
} from './stages';
import type { GuidedWisdomDefinition, GuidedWisdomProgressRecord } from './types';
import { validateWisdomDefinition, validateWisdomRegistry } from './validation';

const fixture = testGuidedWisdomDefinition;
const config = fixture.allocation;

function progressFor(
  wisdomId: string,
  overrides: Partial<GuidedWisdomProgressRecord> = {},
): GuidedWisdomProgressRecord {
  return {
    wisdomId,
    currentStage: 'welcome',
    started: false,
    learned: false,
    reviewing: false,
    storySceneIndex: 0,
    allocation: {},
    practiceAccepted: false,
    completionCount: 0,
    ...overrides,
  };
}

describe('stage navigation', () => {
  it('exposes six stages with labels', () => {
    assert.equal(totalGuidedStages, 6);
    assert.equal(getStageLabel('talk'), 'Talk with Cloud');
    assert.equal(getStageNumber('welcome'), 1);
    assert.equal(getStageNumber('practice'), 6);
  });

  it('moves forward through every stage and into completion', () => {
    assert.equal(getNextScreen('welcome'), 'story');
    assert.equal(getNextScreen('choice'), 'takeaway');
    assert.equal(getNextScreen('practice'), 'completion');
    assert.equal(getNextScreen('completion'), undefined);
  });

  it('moves backward and stops before welcome', () => {
    assert.equal(getPreviousScreen('story'), 'welcome');
    assert.equal(getPreviousScreen('completion'), 'practice');
    assert.equal(getPreviousScreen('welcome'), undefined);
  });

  it('steps story scenes before advancing the stage', () => {
    assert.deepEqual(getNextStoryScene(0, 3), { sceneIndex: 1, advanceStage: false });
    assert.deepEqual(getNextStoryScene(2, 3), { sceneIndex: 2, advanceStage: true });
    assert.deepEqual(getPreviousStoryScene(1), { sceneIndex: 0, returnToWelcome: false });
    assert.deepEqual(getPreviousStoryScene(0), { sceneIndex: 0, returnToWelcome: true });
  });
});

describe('wisdom status', () => {
  it('separates new, in progress, learned and reviewing', () => {
    assert.equal(getWisdomStatus(undefined), 'new');
    assert.equal(getWisdomStatus(progressFor('a')), 'new');
    assert.equal(
      getWisdomStatus(progressFor('a', { started: true })),
      'in-progress',
    );
    assert.equal(
      getWisdomStatus(progressFor('a', { started: true, learned: true })),
      'learned',
    );
    assert.equal(
      getWisdomStatus(
        progressFor('a', { started: true, learned: true, reviewing: true }),
      ),
      'reviewing',
    );
  });
});

describe('allocation engine', () => {
  it('starts empty and evenly', () => {
    assert.deepEqual(createEmptyAllocation(config), { spend: 0, save: 0, give: 0 });
    assert.deepEqual(createEvenAllocation(config), { spend: 20, save: 20, give: 20 });
  });

  it('is incomplete until everything is placed', () => {
    const partial = evaluateAllocation(config, { spend: 20, save: 20, give: 0 });
    assert.equal(partial.placedUnits, 40);
    assert.equal(partial.remainingUnits, 20);
    assert.equal(partial.isComplete, false);
    assert.ok(partial.issues.some((issue) => issue.code === 'incomplete'));
  });

  it('accepts an exact, unequal distribution', () => {
    const state = evaluateAllocation(config, { spend: 30, save: 20, give: 10 });
    assert.equal(state.isComplete, true);
    assert.equal(state.remainingUnits, 0);
    assert.deepEqual(state.issues, []);
  });

  it('rejects wrong increments and negatives', () => {
    const odd = evaluateAllocation(config, { spend: 25, save: 20, give: 15 });
    assert.ok(odd.issues.some((issue) => issue.code === 'wrong-increment'));
    const negative = evaluateAllocation(config, { spend: -10, save: 40, give: 30 });
    assert.ok(negative.issues.some((issue) => issue.code === 'negative'));
  });

  it('refuses steps that would exceed the total', () => {
    const full = { spend: 20, save: 20, give: 20 };
    assert.equal(canIncrease(config, full, 'spend'), false);
    assert.deepEqual(applyAllocationStep(config, full, 'spend', 'increase'), full);
    assert.equal(canDecrease(config, full, 'spend'), true);
  });

  it('refuses steps below zero', () => {
    const empty = createEmptyAllocation(config);
    assert.equal(canDecrease(config, empty, 'give'), false);
  });

  it('formats units from the config rather than a component', () => {
    assert.equal(formatUnits(config, 30), '30 minutes');
    assert.equal(formatPlacedOfTotal(config, 60), '60 of 60 minutes');
  });
});

describe('progress isolation', () => {
  it('keeps two Wisdoms independent', () => {
    const store: Record<string, GuidedWisdomProgressRecord> = {};
    store.a = progressFor('a', { started: true, storySceneIndex: 2 });
    store.b = progressFor('b', { started: true, learned: true, completionCount: 1 });

    store.a = { ...store.a, allocation: { spend: 10 } };

    assert.equal(store.b.storySceneIndex, 0);
    assert.deepEqual(store.b.allocation, {});
    assert.equal(store.b.learned, true);
    assert.equal(store.a.learned, false);
  });

  it('records selected and written takeaways separately', () => {
    const selected = progressFor('a', { selectedTakeawayId: 'fixture-rest-matters' });
    const written = progressFor('a', { writtenTakeaway: 'I can plan my time' });
    assert.equal(selected.writtenTakeaway, undefined);
    assert.equal(written.selectedTakeawayId, undefined);
  });
});

describe('completion summary', () => {
  it('names every destination for a balanced plan', () => {
    const summary = buildCompletionSummary(fixture, {
      allocation: { spend: 20, save: 20, give: 20 },
      selectedTakeawayId: 'fixture-help-others',
    });
    assert.equal(
      summary.message,
      'You gave quiet rest, practice time, and a friend’s project a place in your plan. ' +
        'You remembered that time can help other people.',
    );
    assert.equal(summary.plan.length, 3);
    assert.equal(summary.plan[0].units, 20);
  });

  it('names the leading destination for a dominant plan', () => {
    const summary = buildCompletionSummary(fixture, {
      allocation: { spend: 40, save: 10, give: 10 },
      selectedTakeawayId: 'fixture-rest-matters',
    });
    assert.equal(
      summary.message,
      'You gave quiet rest the biggest place in your plan. ' +
        'You remembered that rest matters too.',
    );
  });

  it('prefers a written takeaway and drops the sentence when there is none', () => {
    const written = buildCompletionSummary(fixture, {
      allocation: { spend: 20, save: 20, give: 20 },
      writtenTakeaway: 'I can plan my time',
    });
    assert.ok(written.message.endsWith('You remembered that you can plan my time.'));

    const none = buildCompletionSummary(fixture, {
      allocation: { spend: 20, save: 20, give: 20 },
    });
    assert.equal(none.message.includes('You remembered'), false);
  });
});

describe('definition validation', () => {
  it('accepts the fixture', () => {
    assert.deepEqual(validateWisdomDefinition(fixture), []);
  });

  it('reports the Wisdom id and field for each problem', () => {
    const broken: GuidedWisdomDefinition = {
      ...fixture,
      allocation: { ...config, increment: 7 },
    };
    const issues = validateWisdomDefinition(broken);
    assert.ok(issues.length > 0);
    assert.ok(issues.every((issue) => issue.wisdomId === fixture.id));
    assert.ok(issues.some((issue) => issue.field === 'allocation.totalUnits'));
  });

  it('detects a missing takeaway option', () => {
    const broken: GuidedWisdomDefinition = {
      ...fixture,
      content: { ...fixture.content, takeaway: { ...fixture.content.takeaway, choices: [] } },
    };
    const issues = validateWisdomDefinition(broken);
    assert.ok(issues.some((issue) => issue.field === 'content.takeaway.choices'));
  });

  it('detects duplicate Wisdom ids across the registry', () => {
    const issues = validateWisdomRegistry([fixture, fixture]);
    assert.ok(
      issues.some(
        (issue) => issue.field === 'id' && issue.message.includes('Duplicate'),
      ),
    );
  });
});
