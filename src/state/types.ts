export const wisdomSteps = ['opening', 'read', 'talk', 'reflect', 'practice', 'quiz', 'completion'] as const;
export type WisdomStep = (typeof wisdomSteps)[number];

export type ChildProfile = {
  id: string;
  name: string;
  age: number;
  avatar: string;
  currentIdentity: string;
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
  profile: ChildProfile;
  wisdomProgress: Record<string, WisdomProgress>;
};
