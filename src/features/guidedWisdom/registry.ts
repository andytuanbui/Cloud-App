import { threeWaysToUseMoney } from '../../content/wisdoms/threeWaysToUseMoney';
import { threeWaysToUseMoneyEngineDefinition } from './definitions';
import type { GuidedWisdomDefinition } from './types';
import { formatIssues, validateWisdomRegistry } from './validation';

/**
 * The Guided Wisdom registry.
 *
 * Screens resolve content through this by Wisdom id. Adding a Wisdom means
 * adding a definition here — no new route, screen or navigation branch.
 */

/**
 * "Three Ways to Use Money".
 *
 * The allocation config mirrors the approved decision content so the engine
 * and the existing response service read the same numbers.
 */
export const threeWaysToUseMoneyDefinition: GuidedWisdomDefinition = {
  id: threeWaysToUseMoneyEngineDefinition.id,
  // Artwork-bound content for the screens; the engine rules come from the
  // asset-free definition so tests and the app read the same numbers.
  content: threeWaysToUseMoney,
  allocation: threeWaysToUseMoneyEngineDefinition.allocation,
};

const definitions: readonly GuidedWisdomDefinition[] = [
  threeWaysToUseMoneyDefinition,
];

const byId = new Map(definitions.map((definition) => [definition.id, definition]));

/** Every Wisdom a child can reach from Home or Library. */
export function listGuidedWisdoms(): readonly GuidedWisdomDefinition[] {
  return definitions.filter((definition) => !definition.testOnly);
}

export function getGuidedWisdom(id: string): GuidedWisdomDefinition | undefined {
  return byId.get(id);
}

/** Use when a missing Wisdom is a programming error rather than a user path. */
export function requireGuidedWisdom(id: string): GuidedWisdomDefinition {
  const definition = byId.get(id);
  if (!definition) {
    throw new Error(`Unknown Guided Wisdom id: "${id}"`);
  }
  return definition;
}

export function isGuidedWisdomId(id: string): boolean {
  return byId.has(id);
}

/**
 * Development-time guard. Surfaces malformed content at startup with the
 * Wisdom id and field named, instead of a blank stage during a session.
 */
export function assertRegistryIsValid(): void {
  const issues = validateWisdomRegistry(definitions);
  if (issues.length > 0) {
    throw new Error(`Invalid Guided Wisdom registry:\n${formatIssues(issues)}`);
  }
}

// `__DEV__` only exists inside the React Native runtime, so the guard keeps
// this module importable from plain Node (tests, scripts).
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  assertRegistryIsValid();
}
