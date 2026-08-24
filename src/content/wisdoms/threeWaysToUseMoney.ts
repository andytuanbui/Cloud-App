import { threeWaysToUseMoneyData } from './threeWaysToUseMoney.data';
import type { GuidedStoryWisdomContent } from './types';

/**
 * "Three Ways to Use Money" — application binding.
 *
 * Attaches React Native image modules to the asset-free content in
 * ./threeWaysToUseMoney.data.ts. Splitting the two keeps every value testable
 * from Node while the app still receives one fully-formed Wisdom.
 */

const moneyArtwork = require('../../../assets/cloud/cat-money.png');
const savingsArtwork = require('../../../assets/cloud/cloud-thinking.png');
const birthdayArtwork = require('../../../assets/cloud/cloud-helps-friend.png');
const choicesArtwork = require('../../../assets/cloud/cloud-neighborhood-home.png');
const pauseArtwork = require('../../../assets/cloud/cat-thinking.png');
const planArtwork = require('../../../assets/cloud/cloud-hero-wave.png');

/** Visual-scene id → artwork. Keyed by id so narrative beats can reuse art. */
const sceneArtwork: Record<string, GuidedStoryWisdomContent['artwork']> = {
  'leo-wants-the-cards-now': moneyArtwork,
  'leo-remembers-the-headphones': savingsArtwork,
  'leo-remembers-mias-birthday': birthdayArtwork,
  'leo-sees-three-choices': choicesArtwork,
  'leo-pauses': pauseArtwork,
  'leo-makes-a-plan': planArtwork,
};

export const threeWaysToUseMoney: GuidedStoryWisdomContent = {
  ...threeWaysToUseMoneyData,
  artwork: moneyArtwork,
  storyVisuals: threeWaysToUseMoneyData.storyVisuals.map((visual) => ({
    ...visual,
    artwork: sceneArtwork[visual.id] ?? moneyArtwork,
  })),
};
