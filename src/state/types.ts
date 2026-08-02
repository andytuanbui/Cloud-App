export const wisdomSteps = ['opening', 'read', 'talk', 'reflect', 'practice', 'quiz', 'completion'] as const;
export type WisdomStep = (typeof wisdomSteps)[number];

export const guidedWisdomStages = [
  'welcome',
  'story',
  'talk',
  'choice',
  'takeaway',
  'practice',
  'completion',
] as const;
export type GuidedWisdomStage = (typeof guidedWisdomStages)[number];

export const CURRENT_GUIDED_WISDOM_SESSION_VERSION = 1 as const;
export const CURRENT_SCHEMA_VERSION = 5 as const;

export type GuidedResponseSource = 'suggested' | 'typed';

export type GuidedPersonalResponse = {
  source: GuidedResponseSource;
  text: string;
};

export type GuidedTakeaway = {
  source: GuidedResponseSource;
  choiceId?: string;
  text: string;
};

export type GuidedWisdomSession = {
  version: typeof CURRENT_GUIDED_WISDOM_SESSION_VERSION;
  currentStage: GuidedWisdomStage;
  currentStoryScene: number;
  selectedReflectionAnswer?: string;
  personalResponse?: GuidedPersonalResponse;
  adaptiveResponse: string;
  spendAmount: number;
  saveAmount: number;
  giveAmount: number;
  moneyResponse: string;
  planDecision?: 'kept' | 'changed';
  planRevisionCount: number;
  selectedTakeaway?: GuidedTakeaway;
  personalizedSummary: string;
  completed: boolean;
};

export type GuidedWisdomSessionUpdate = Partial<
  Omit<
    GuidedWisdomSession,
    'version' | 'personalResponse' | 'selectedTakeaway' | 'completed'
  >
> & {
  personalResponse?: Partial<GuidedPersonalResponse> | null;
  selectedTakeaway?: Partial<GuidedTakeaway> | null;
};

export function createDefaultGuidedWisdomSession(): GuidedWisdomSession {
  return {
    version: CURRENT_GUIDED_WISDOM_SESSION_VERSION,
    currentStage: 'welcome',
    currentStoryScene: 0,
    adaptiveResponse: '',
    spendAmount: 30,
    saveAmount: 30,
    giveAmount: 30,
    moneyResponse: '',
    planRevisionCount: 0,
    personalizedSummary: '',
    completed: false,
  };
}

export type ChildProfile = {
  id: string;
  name: string;
  age: number | null;
  avatar: string;
  currentIdentity: string;
  setupCompleted: boolean;
  setupCompletedAt: string | null;
  programStartedAt: string | null;
  programStartDateKey: string | null;
  lastOpenedDateKey: string;
};

export type ProfileDetails = {
  name: string;
  age: number;
};

export type WisdomProgress = {
  wisdomId: string;
  currentStep: WisdomStep;
  completedSteps: WisdomStep[];
  openingAnswer?: string;
  conversationResponses: string[];
  reflectionAnswer?: string;
  practiceStatus?: string;
  quizProgress: { questionIndex: number; completedAnswerIds: string[] };
  guidedSession?: GuidedWisdomSession;
  lastCompletedGuidedSession?: GuidedWisdomSession;
  isCompleted: boolean;
  completionCount: number;
  lastReviewedAt?: string;
  /** Legacy compatibility alias. Permanent completion is represented by isCompleted. */
  completed: boolean;
  completedAt?: string;
};

export type PersistedAppState = {
  schemaVersion: typeof CURRENT_SCHEMA_VERSION;
  profile: ChildProfile;
  wisdomProgress: Record<string, WisdomProgress>;
};
