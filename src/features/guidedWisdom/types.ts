import type { GuidedStoryWisdomContent } from '../../content/wisdoms';

/**
 * Engine-level types for the Guided Wisdom experience.
 *
 * A Guided Wisdom is described entirely by content. The screens read a
 * definition and the child's saved progress; they never carry lesson copy,
 * values, labels or rules of their own. Adding a Wisdom means adding a
 * definition to the registry, not another six screens.
 */

/** The six stages a child moves through, in order. */
export const guidedStageOrder = [
  'welcome',
  'story',
  'talk',
  'choice',
  'takeaway',
  'practice',
] as const;

export type GuidedStageId = (typeof guidedStageOrder)[number];

/** `completion` sits after the six stages and is not itself a stage. */
export type GuidedScreenId = GuidedStageId | 'completion';

/** Where a child stands with a Wisdom, used by cards and by the flow. */
export type GuidedWisdomStatus =
  | 'new'
  | 'in-progress'
  | 'learned'
  | 'reviewing';

/**
 * One place a measurable value can be put.
 *
 * Deliberately not money-specific: a destination can hold kronor, minutes,
 * attention or items. "Three Ways to Use Money" supplies kronor.
 */
export type AllocationDestination = {
  id: string;
  /** Short category, e.g. "Spend now". */
  label: string;
  /** The concrete thing, e.g. "Football cards". */
  objectLabel: string;
  /** Optional floor and ceiling for a single destination. */
  minimumUnits?: number;
  maximumUnits?: number;
};

/**
 * Rules for a decision exercise where a child distributes a fixed value
 * across several destinations.
 */
export type AllocationConfig = {
  /** Everything that must be placed, e.g. 90. */
  totalUnits: number;
  /** Step size for a single adjustment, e.g. 10. */
  increment: number;
  /** Rendered after an amount, e.g. "kr". Kept out of components. */
  unitSuffix: string;
  destinations: readonly AllocationDestination[];
};

/** Amount currently placed against each destination id. */
export type AllocationValues = Readonly<Record<string, number>>;

export type AllocationState = {
  values: AllocationValues;
  placedUnits: number;
  remainingUnits: number;
  /** True only when every unit is placed and each destination is legal. */
  isComplete: boolean;
  issues: readonly AllocationIssue[];
};

export type AllocationIssueCode =
  | 'not-whole'
  | 'negative'
  | 'wrong-increment'
  | 'below-minimum'
  | 'above-maximum'
  | 'above-total'
  | 'incomplete';

export type AllocationIssue = {
  code: AllocationIssueCode;
  destinationId?: string;
};

/**
 * Per-Wisdom progress. One record per Wisdom id; writing one never touches
 * another.
 */
export type GuidedWisdomProgressRecord = {
  wisdomId: string;
  currentStage: GuidedScreenId;
  started: boolean;
  learned: boolean;
  reviewing: boolean;
  storyBeatIndex: number;
  /** Chosen reflection answer id from the definition's talk stage. */
  talkChoiceId?: string;
  /** What the child said back, either a suggestion label or their own words. */
  talkResponse?: { source: 'suggested' | 'written'; text: string };
  allocation: AllocationValues;
  selectedTakeawayId?: string;
  writtenTakeaway?: string;
  practiceAccepted: boolean;
  completionCount: number;
  completedAt?: string;
  lastReviewedAt?: string;
};

/** A validation problem, always naming the Wisdom and the field at fault. */
export type WisdomDefinitionIssue = {
  wisdomId: string;
  field: string;
  message: string;
};

/**
 * The definition the engine consumes.
 *
 * It reuses the approved `GuidedStoryWisdomContent` shape so the existing
 * screens keep rendering exactly what they render today, and adds the
 * engine-facing allocation config derived from that content.
 */
export type GuidedWisdomDefinition = {
  id: string;
  content: GuidedStoryWisdomContent;
  allocation: AllocationConfig;
  /** Excluded from Home and Library. Used by tests and dev validation only. */
  testOnly?: boolean;
};
