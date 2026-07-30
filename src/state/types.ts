export const wisdomSteps = ['opening', 'read', 'talk', 'reflect', 'practice', 'quiz', 'completion'] as const;
export type WisdomStep = (typeof wisdomSteps)[number];

export const CURRENT_SCHEMA_VERSION = 3 as const;

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
  completed: boolean;
  completedAt?: string;
};

export type PersistedAppState = {
  schemaVersion: typeof CURRENT_SCHEMA_VERSION;
  profile: ChildProfile;
  wisdomProgress: Record<string, WisdomProgress>;
};
