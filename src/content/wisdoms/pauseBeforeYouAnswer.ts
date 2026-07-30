import { WisdomContent } from './types';

export const pauseBeforeYouAnswer: WisdomContent = {
  id: 'pause-before-you-answer',
  title: 'Pause Before You Answer',
  summary: 'Practice taking a short pause before responding when emotions are strong.',
  category: 'Communication Wisdom',
  estimatedMinutes: 6,
  skillOutcome: 'Builds thoughtful communication habits',
  artwork: require('../../../assets/cloud/cloud-helps-friend.png'),
  openingQuestion: {
    question: 'What do you usually do when someone says something upsetting?',
    options: [
      { id: 'answer-fast', label: 'Answer right away' },
      { id: 'take-breath', label: 'Take a breath' },
      { id: 'walk-away', label: 'Step away for a moment' },
      { id: 'not-sure', label: 'I am not sure' },
    ],
    response: 'Strong feelings can make answers come quickly. A short pause gives you more choice.',
  },
  readingSections: [
    {
      title: 'A Pause Creates Space',
      text: ['Pausing does not mean ignoring someone. It gives your thinking time to catch up with your feelings.'],
      examples: ['Take one slow breath', 'Count quietly to three', 'Notice how your body feels'],
    },
    {
      title: 'Choose Your Next Words',
      text: ['After the pause, choose words that explain what you need without trying to hurt the other person.'],
      examples: ['I need a moment to think', 'That upset me', 'Can you explain what you meant?'],
    },
  ],
  cloudConversation: [
    {
      question: 'When could a short pause help you?',
      examples: ['During a disagreement', 'When I feel left out', 'When I hear “no”', 'Another time'],
      cloudResponse: 'Noticing that moment is the first step toward a thoughtful answer.',
    },
    {
      question: 'Which pause could you try?',
      examples: ['One slow breath', 'Count to three', 'Ask for a moment', 'Relax my shoulders'],
      cloudResponse: 'That small action can give you time to choose what you really want to say.',
    },
  ],
  reflection: {
    prompt: 'Remember a time when you answered too quickly.',
    question: 'What might a pause have helped you do?',
    options: [
      { id: 'calmer', label: 'Use calmer words' },
      { id: 'listen', label: 'Listen more carefully' },
      { id: 'explain', label: 'Explain what I needed' },
      { id: 'think', label: 'Understand my feeling' },
    ],
    response: 'A pause can change the direction of a conversation.',
  },
  practice: {
    title: 'Try This Today',
    text: 'The next time a feeling becomes strong, pause for one slow breath before answering.',
    questions: ['What am I feeling?', 'What do I want the other person to understand?'],
    options: [
      { id: 'will-try', label: 'I will try this' },
      { id: 'already-tried', label: 'I already tried this' },
    ],
  },
  quiz: [
    {
      question: 'What does a short pause give you?',
      answers: [
        { id: 'choice', label: 'Time to choose your words' },
        { id: 'win', label: 'A way to win every disagreement' },
        { id: 'ignore', label: 'A reason to ignore people' },
        { id: 'louder', label: 'A chance to speak louder' },
      ],
      correctAnswerId: 'choice',
      feedback: 'A pause gives your thinking time to catch up with your feelings.',
    },
    {
      question: 'Which is a thoughtful response?',
      answers: [
        { id: 'moment', label: 'I need a moment to think' },
        { id: 'mean', label: 'Say something mean quickly' },
        { id: 'shout', label: 'Shout over the other person' },
        { id: 'pretend', label: 'Pretend you never have feelings' },
      ],
      correctAnswerId: 'moment',
      feedback: 'Asking for a moment is a calm way to create thinking space.',
    },
  ],
  completion: {
    title: 'You completed today’s Wisdom',
    message: 'You practiced making space between a strong feeling and your response.',
    cloudMessage: 'A thoughtful pause can help your words match what you truly mean.',
  },
};
