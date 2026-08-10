import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import {
  currencyConfig,
  formatCurrencyAccessibility,
  formatCurrencyDisplay,
  formatCurrencySpoken,
} from '../../../config/currency';
import type { GuidedStoryWisdomContent } from '../../../content/wisdoms/types';

let wisdom: GuidedStoryWisdomContent;

before(async () => {
  require.extensions['.png'] = (module, filename) => {
    module.exports = filename;
  };
  ({ threeWaysToUseMoney: wisdom } = await import(
    '../../../content/wisdoms/threeWaysToUseMoney'
  ));
});

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

describe('CloudWise USD currency', () => {
  it('defines one USD configuration and its display, spoken, and accessible formats', () => {
    assert.deepEqual(currencyConfig, {
      currencyCode: 'USD',
      currencySymbol: '$',
      spokenCurrencySingular: 'dollar',
      spokenCurrencyPlural: 'dollars',
      symbolPosition: 'before',
    });

    assert.equal(formatCurrencyDisplay(90), '$90');
    assert.equal(formatCurrencyDisplay(30), '$30');
    assert.equal(formatCurrencyDisplay(10), '$10');
    assert.equal(formatCurrencySpoken(90), 'ninety dollars');
    assert.equal(formatCurrencySpoken(30), 'thirty dollars');
    assert.equal(formatCurrencySpoken(10), 'ten dollars');
    assert.equal(formatCurrencySpoken(1), 'one dollar');
    assert.equal(formatCurrencyAccessibility(90), '90 dollars');
  });
});

describe('Three Ways to Use Money story', () => {
  it('contains exactly eight substantial scenes and 400–500 authored words', () => {
    const sceneWordCounts = wisdom.storyScenes.map((scene) =>
      countWords(scene.narrationText),
    );
    const totalWordCount = sceneWordCounts.reduce(
      (total, sceneWordCount) => total + sceneWordCount,
      0,
    );

    assert.equal(wisdom.storyScenes.length, 8);
    sceneWordCounts.forEach((sceneWordCount, index) => {
      assert.ok(
        sceneWordCount >= 45 && sceneWordCount <= 70,
        `scene ${index + 1} has ${sceneWordCount} words`,
      );
    });
    assert.ok(
      totalWordCount >= 400 && totalWordCount <= 500,
      `story has ${totalWordCount} words`,
    );
  });

  it('keeps symbols visible while narration and Realtime context say dollars', () => {
    const visibleStory = wisdom.storyScenes.map((scene) => scene.text).join(' ');
    const spokenStory = wisdom.storyScenes
      .map((scene) => scene.narrationText)
      .join(' ');

    assert.equal(wisdom.decision.totalAmount, 90);
    assert.equal(wisdom.decision.increment, 10);
    assert.match(wisdom.introduction, /\$90/);
    assert.match(visibleStory, /\$90/);
    assert.match(visibleStory, /\$30/);
    assert.match(visibleStory, /\$10/);
    assert.match(spokenStory, /ninety dollars/i);
    assert.match(spokenStory, /thirty dollars/i);
    assert.match(spokenStory, /ten dollars/i);
    assert.doesNotMatch(spokenStory, /\$|\bkr\b/i);
    assert.match(wisdom.decision.scenario, /90 dollars/i);
  });
});
