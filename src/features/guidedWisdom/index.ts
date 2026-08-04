/**
 * Guided Wisdom Engine.
 *
 * Content-driven six-stage experience. Screens resolve a definition by Wisdom
 * id and read everything from it: copy, destinations, rules, takeaway options
 * and completion recognition.
 */
export * from './types';
export * from './stages';
export * from './allocation';
export * from './completion';
export * from './validation';
export {
  assertRegistryIsValid,
  getGuidedWisdom,
  isGuidedWisdomId,
  listGuidedWisdoms,
  requireGuidedWisdom,
  threeWaysToUseMoneyDefinition,
} from './registry';
