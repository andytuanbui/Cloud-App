import { ImageSourcePropType } from 'react-native';

export type Choice = { id: string; label: string };
export type ReadingSection = { title: string; text: string[]; examples?: string[] };
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

export type WisdomContent = {
  id: string;
  title: string;
  summary: string;
  category: string;
  estimatedMinutes: number;
  skillOutcome: string;
  artwork: ImageSourcePropType;
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
