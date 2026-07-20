import { Ionicons } from '@expo/vector-icons';
import { NavigatorScreenParams } from '@react-navigation/native';
import { ImageSourcePropType } from 'react-native';

export type IconName = keyof typeof Ionicons.glyphMap;
export type GradientPair = [string, string];
export type WisdomStatus = 'locked' | 'available' | 'completed';
export type WisdomDifficulty = 'beginner' | 'growing' | 'advanced';
export type StoryEmotion = 'curious' | 'happy' | 'thoughtful' | 'proud' | 'calm';
export type StoryInteractionType = 'none' | 'tap' | 'choice' | 'reflection' | 'challenge' | 'becoming';

export type Category = {
  id: string;
  title: string;
  shortTitle: string;
  icon: IconName;
  color: GradientPair;
  description: string;
  image: ImageSourcePropType;
  background: GradientPair;
  heroColors: GradientPair;
  lockedColors: GradientPair;
};

export type Wisdom = {
  id: string;
  categoryId: string;
  title: string;
  displayTitle: string;
  subtitle: string;
  coverImage: ImageSourcePropType;
  estimatedMinutes: number;
  difficulty: WisdomDifficulty;
  becomingTitle: string;
  nextIdentity: string;
  storyId: string;
  challengeId: string;
  conversationId: string;
  rewardId: string;
  order: number;
  isPremium: boolean;
  tags: string[];
  status: WisdomStatus;
  locale: string;
};

export type StoryChoiceOption = {
  id: string;
  title: string;
  body: string;
  image: ImageSourcePropType;
  colors: GradientPair;
  branchId: string;
};

export type StoryPage = {
  id: string;
  wisdomId: string;
  image: ImageSourcePropType;
  eyebrow: string;
  title: string;
  body: string[];
  emotion: StoryEmotion;
  interactionType: StoryInteractionType;
  branchId?: string;
  buttonLabel?: string;
  choiceOptions?: StoryChoiceOption[];
};

export type Story = {
  id: string;
  wisdomId: string;
  pages: StoryPage[];
};

export type ChallengeStep = {
  id: string;
  title: string;
  body: string;
  icon: IconName;
};

export type Challenge = {
  id: string;
  wisdomId: string;
  title: string;
  description: string;
  steps: ChallengeStep[];
};

export type Conversation = {
  id: string;
  wisdomId: string;
  openingQuestion: string;
  suggestedReplies: string[];
};

export type Reward = {
  id: string;
  wisdomId: string;
  title: string;
  description: string;
};

export type GlobalIdentity = {
  current: string;
  completed: string;
  next: string;
};

export type WisdomWorld = {
  key: string;
  label: string;
  icon: IconName;
  colors: GradientPair;
  image: ImageSourcePropType;
  background: GradientPair;
  heroTitle: string;
  heroDescription: string;
  heroMinutes: number;
  heroImage: ImageSourcePropType;
  heroColors: GradientPair;
  lockedTitle: string;
  lockedDescription: string;
  lockedMinutes: number;
  lockedImage: ImageSourcePropType;
  lockedColors: GradientPair;
  heroWisdomId: string;
  lockedWisdomId: string;
};

export type RecommendedWisdomCard = {
  title: string;
  image: ImageSourcePropType;
  colors: GradientPair;
};

export type DetailSource = 'hero' | 'locked';

export type WisdomJourneyParamList = {
  QuestionBeforeWisdom: {
    wisdomId: string;
  };
  Reading: {
    wisdomId: string;
  };
  TalkWithCloud: {
    wisdomId: string;
  };
  Challenge: {
    wisdomId: string;
  };
  Congratulations: {
    wisdomId: string;
  };
};

export type RootStackParamList = {
  Home: undefined;
  Library: undefined;
  Journey: undefined;
  Cloud: undefined;
  Profile: undefined;
  WisdomDetail: {
    wisdomId: string;
  };
  WisdomJourney: NavigatorScreenParams<WisdomJourneyParamList>;
};
