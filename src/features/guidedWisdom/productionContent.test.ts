import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { evaluateAllocation } from './allocation';
import { buildCompletionSummary } from './completion';
import {
  createAllocationConfig,
  getEngineDefinition,
  guidedWisdomEngineDefinitions,
  listEngineWisdomIds,
  threeWaysToUseMoneyEngineDefinition,
} from './definitions';
import { guidedStageOrder } from './types';
import type { GuidedWisdomDefinition } from './types';
import { validateWisdomDefinition, validateWisdomRegistry } from './validation';

/**
 * Coverage for the real "Three Ways to Use Money" definition.
 *
 * These assertions read the same asset-free module the application binds
 * artwork to, so this is the shipped content and not a copy.
 */

const definition = threeWaysToUseMoneyEngineDefinition;
const content = definition.data;
const allocation = definition.allocation;

/** Artwork stand-in so the shipped content can run through validation. */
const stubArtwork = { testUri: 'stub' } as unknown as GuidedWisdomDefinition['content']['artwork'];

function asFullDefinition(): GuidedWisdomDefinition {
  return {
    id: definition.id,
    allocation,
    content: {
      ...content,
      artwork: stubArtwork,
      storyScenes: content.storyScenes.map((scene) => ({
        ...scene,
        artwork: stubArtwork,
      })),
    },
  };
}

describe('Three Ways to Use Money — identity', () => {
  it('has the production Wisdom id, title and category', () => {
    assert.equal(definition.id, 'three-ways-to-use-money');
    assert.equal(content.id, 'three-ways-to-use-money');
    assert.equal(content.title, 'Three Ways to Use Money');
    assert.equal(content.category, 'Money Wisdom');
    assert.equal(content.format, 'guided-story-v1');
  });
});

describe('Three Ways to Use Money — stages', () => {
  it('declares the six engine stages in order', () => {
    assert.deepEqual(guidedStageOrder, [
      'welcome',
      'story',
      'talk',
      'choice',
      'takeaway',
      'practice',
    ]);
  });

  it('supplies content for every stage', () => {
    assert.ok(content.introduction.includes('90 kr'), 'welcome copy');
    assert.equal(content.storyScenes.length, 6, 'story scenes');
    content.storyScenes.forEach((scene, index) => {
      assert.ok(scene.text.trim().length > 0, `scene ${index} text`);
      assert.ok(scene.narrationText.trim().length > 0, `scene ${index} narration`);
    });
    assert.ok(content.reflection.question.trim().length > 0, 'talk question');
    assert.ok(content.reflection.choices.length >= 2, 'talk choices');
    assert.ok(content.decision.categories.length === 3, 'choice destinations');
    assert.ok(content.takeaway.choices.length >= 2, 'takeaway options');
    assert.ok(content.practice.cardText.trim().length > 0, 'practice instruction');
    assert.ok(content.completion.title.trim().length > 0, 'completion configuration');
  });
});

describe('Three Ways to Use Money — allocation', () => {
  it('allocates 90 kr in 10 kr steps', () => {
    assert.equal(allocation.totalUnits, 90);
    assert.equal(allocation.increment, 10);
    assert.equal(allocation.unitSuffix, 'kr');
  });

  it('offers football cards, headphones and Mia’s birthday', () => {
    assert.deepEqual(
      allocation.destinations.map((destination) => destination.objectLabel),
      ['Football cards', 'Headphones', 'Mia’s birthday'],
    );
    assert.deepEqual(
      allocation.destinations.map((destination) => destination.id),
      ['spend', 'save', 'give'],
    );
  });

  it('is complete only when all 90 kr are placed', () => {
    assert.equal(
      evaluateAllocation(allocation, { spend: 30, save: 30, give: 30 }).isComplete,
      true,
    );
    assert.equal(
      evaluateAllocation(allocation, { spend: 40, save: 30, give: 20 }).isComplete,
      true,
    );
    assert.equal(
      evaluateAllocation(allocation, { spend: 30, save: 30, give: 20 }).isComplete,
      false,
    );
    assert.equal(
      evaluateAllocation(allocation, { spend: 50, save: 30, give: 20 }).placedUnits,
      100,
    );
  });

  it('derives the same config the registry uses', () => {
    assert.deepEqual(createAllocationConfig(content.decision, 'kr'), allocation);
  });
});

describe('Three Ways to Use Money — registry and validation', () => {
  it('is reachable by its production Wisdom id', () => {
    assert.ok(getEngineDefinition('three-ways-to-use-money'));
    assert.equal(getEngineDefinition('not-a-wisdom'), undefined);
    assert.ok(listEngineWisdomIds().includes('three-ways-to-use-money'));
  });

  it('passes definition validation with no issues', () => {
    assert.deepEqual(validateWisdomDefinition(asFullDefinition()), []);
  });

  it('produces a registry with no issues', () => {
    assert.equal(guidedWisdomEngineDefinitions.length >= 1, true);
    assert.deepEqual(validateWisdomRegistry([asFullDefinition()]), []);
  });
});

describe('Three Ways to Use Money — completion copy', () => {
  it('reproduces the approved recognition for the captured state', () => {
    const summary = buildCompletionSummary(asFullDefinition(), {
      allocation: { spend: 30, save: 30, give: 30 },
      selectedTakeawayId: 'help-others',
    });
    assert.equal(
      summary.message,
      'You gave football cards, headphones, and Mia’s birthday a place in your plan. ' +
        'You remembered that money can help other people.',
    );
  });

  it('names the leading destination when one dominates', () => {
    const summary = buildCompletionSummary(asFullDefinition(), {
      allocation: { spend: 50, save: 20, give: 20 },
      selectedTakeawayId: 'future-goals',
    });
    assert.equal(
      summary.message,
      'You gave football cards the biggest place in your plan. ' +
        'You remembered that saving helps future goals.',
    );
  });

  it('reflects the latest saved plan amounts', () => {
    const summary = buildCompletionSummary(asFullDefinition(), {
      allocation: { spend: 20, save: 20, give: 50 },
      selectedTakeawayId: 'help-others',
    });
    assert.deepEqual(
      summary.plan.map((entry) => entry.units),
      [20, 20, 50],
    );
  });
});
