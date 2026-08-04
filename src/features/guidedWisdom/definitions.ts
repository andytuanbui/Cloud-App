import { threeWaysToUseMoneyData } from '../../content/wisdoms/threeWaysToUseMoney.data';
import type { GuidedStoryWisdomData } from '../../content/wisdoms';
import type { AllocationConfig } from './types';

/**
 * Asset-free engine definitions.
 *
 * This is the single source of truth for what a Guided Wisdom *is* — its id,
 * copy, stages, decision rules and allocation config. It imports no images, so
 * Node tests and validation scripts read exactly what the application ships.
 *
 * `registry.ts` layers React Native artwork on top for the screens.
 */

export type GuidedWisdomEngineDefinition = {
  id: string;
  data: GuidedStoryWisdomData;
  allocation: AllocationConfig;
  testOnly?: boolean;
};

/**
 * Derives allocation rules from a Wisdom's decision content so the engine and
 * the response service can never disagree about totals or increments.
 */
export function createAllocationConfig(
  decision: GuidedStoryWisdomData['decision'],
  unitSuffix: string,
): AllocationConfig {
  return {
    totalUnits: decision.totalAmount,
    increment: decision.increment,
    unitSuffix,
    destinations: decision.categories.map((category) => ({
      id: category.id,
      label: category.label,
      objectLabel: category.objectLabel,
    })),
  };
}

export const threeWaysToUseMoneyEngineDefinition: GuidedWisdomEngineDefinition = {
  id: threeWaysToUseMoneyData.id,
  data: threeWaysToUseMoneyData,
  allocation: createAllocationConfig(threeWaysToUseMoneyData.decision, 'kr'),
};

/** Every production Guided Wisdom, asset-free. */
export const guidedWisdomEngineDefinitions: readonly GuidedWisdomEngineDefinition[] =
  [threeWaysToUseMoneyEngineDefinition];

export function getEngineDefinition(
  id: string,
): GuidedWisdomEngineDefinition | undefined {
  return guidedWisdomEngineDefinitions.find((definition) => definition.id === id);
}

export function listEngineWisdomIds(): readonly string[] {
  return guidedWisdomEngineDefinitions
    .filter((definition) => !definition.testOnly)
    .map((definition) => definition.id);
}
