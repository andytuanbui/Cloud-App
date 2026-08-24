import type { ImageSourcePropType } from 'react-native';

export type Choice = { id: string; label: string };

export type WisdomFormat = 'legacy-quiz' | 'guided-story-v1';

export type WisdomCommonContent = {
  id: string;
  format: WisdomFormat;
  title: string;
  summary: string;
  category: string;
  estimatedMinutes: number;
  skillOutcome: string;
  artwork: ImageSourcePropType;
};

export type ReadingSection = {
  title: string;
  text: string[];
  examples?: string[];
};

export type ConversationPrompt = {
  question: string;
  examples: string[];
  cloudResponse: string;
};

export type QuizQuestion = {
  question: string;
  answers: Choice[];
  correctAnswerId: string;
  feedback: string;
};

export type LegacyQuizWisdomContent = WisdomCommonContent & {
  format: 'legacy-quiz';
  openingQuestion: {
    question: string;
    options: Choice[];
    response: string;
  };
  readingSections: ReadingSection[];
  cloudConversation: ConversationPrompt[];
  reflection: {
    prompt: string;
    question: string;
    options: Choice[];
    response: string;
  };
  practice: {
    title: string;
    text: string;
    questions: string[];
    options: Choice[];
  };
  quiz: QuizQuestion[];
  completion: {
    title: string;
    message: string;
    cloudMessage: string;
  };
};

/** One reusable illustration in a guided Story. */
export type GuidedStoryVisual = {
  id: string;
  artwork: ImageSourcePropType;
  visualLabel: string;
};

/**
 * One paced narrative moment in a guided Story.
 *
 * Several beats can reference the same visual. Narrative pacing therefore
 * does not require a new illustration for every text or narration change.
 */
export type GuidedStoryBeat = {
  id: string;
  visualId: string;
  text: string;
  narrationText: string;
};

export type GuidedPersonalResponseSuggestion = Choice & {
  adaptiveResponse: string;
};

export type GuidedReflectionChoice = Choice & {
  cloudResponse: string;
  followUpQuestion: string;
  suggestedResponses: GuidedPersonalResponseSuggestion[];
  adaptivePrompt: string;
  summaryLead: string;
};

export type MoneyDecisionCategoryId = 'spend' | 'save' | 'give';

export type MoneyDecisionCategory = {
  id: MoneyDecisionCategoryId;
  label: string;
  objectLabel: string;
};

export type MoneyPlan = Record<MoneyDecisionCategoryId, number>;

export type MoneyPlanResponseKind =
  | 'balanced'
  | 'spend'
  | 'save'
  | 'give';

export type GuidedMoneyDecision = {
  scenario: string;
  totalAmount: number;
  increment: number;
  initialPlan: MoneyPlan;
  categories: MoneyDecisionCategory[];
  rules: {
    balancedMinimumPerCategory: number;
    balancedMaximumSpread: number;
    significantGiveMinimum: number;
  };
  consequenceResponses: Record<MoneyPlanResponseKind, string>;
  equalPlanResponse: string;
  reviewQuestion: string;
  keepLabel: string;
  changeLabel: string;
};

export type GuidedTakeawayChoice = Choice;

/**
 * Asset-free form of a guided Wisdom.
 *
 * Identical to `GuidedStoryWisdomContent` minus every image binding, so Node
 * (tests, validation scripts) can import real production content without a
 * bundler resolving PNG modules.
 */
export type GuidedStoryWisdomData = Omit<
  GuidedStoryWisdomContent,
  'artwork' | 'storyVisuals'
> & {
  storyVisuals: Omit<GuidedStoryVisual, 'artwork'>[];
};

export type GuidedStoryWisdomContent = WisdomCommonContent & {
  format: 'guided-story-v1';
  introduction: string;
  learningOutcomes: string[];
  startButtonLabel: string;
  storyVisuals: GuidedStoryVisual[];
  storyBeats: GuidedStoryBeat[];
  reflection: {
    question: string;
    choices: GuidedReflectionChoice[];
    allowTypedResponse: true;
    maxResponseLength: number;
  };
  decision: GuidedMoneyDecision;
  takeaway: {
    question: string;
    choices: GuidedTakeawayChoice[];
    allowTypedResponse: true;
    maxResponseLength: number;
  };
  practice: {
    title: string;
    text: string;
    cardText: string;
    actions: Record<MoneyPlanResponseKind, string>;
    encouragement: string;
    completeButtonLabel: string;
  };
  completion: {
    title: string;
    message: string;
    exitButtonLabel: string;
  };
};

export type WisdomContent = LegacyQuizWisdomContent | GuidedStoryWisdomContent;
