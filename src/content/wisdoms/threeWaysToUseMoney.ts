import { WisdomContent } from './types';

export const threeWaysToUseMoney: WisdomContent = {
  id: 'three-ways-to-use-money',
  title: 'Three Ways to Use Money',
  summary: 'Learn how money can be used for spending, saving, and sharing.',
  category: 'Money Wisdom',
  estimatedMinutes: 7,
  skillOutcome: 'Builds balanced money habits',
  artwork: require('../../../assets/cloud/cat-money.png'),
  openingQuestion: {
    question: 'If you received some money today, what would you most like to do first?',
    options: [
      { id: 'spend', label: 'Buy something' },
      { id: 'save', label: 'Keep it for later' },
      { id: 'share', label: 'Help someone' },
      { id: 'mix', label: 'Use it in different ways' },
    ],
    response: 'Money can have more than one job. Thinking about each job helps you decide.',
  },
  readingSections: [
    {
      title: 'Spend',
      text: ['Spending means using money for something now. A plan helps you spend on what matters to you.'],
      examples: ['A snack', 'A book', 'A birthday gift'],
    },
    {
      title: 'Save',
      text: ['Saving means keeping money for later. Small amounts can grow toward something important.'],
      examples: ['A larger purchase', 'A future activity', 'An unexpected need'],
    },
    {
      title: 'Share',
      text: ['Sharing means using some money to help another person or a cause you care about.'],
      examples: ['A helpful gift', 'A community collection', 'Food for someone in need'],
    },
  ],
  cloudConversation: [
    {
      question: 'Which job for money feels easiest to you?',
      examples: ['Spending', 'Saving', 'Sharing', 'It depends'],
      cloudResponse: 'Everyone has different habits. Understanding yours helps you make balanced choices.',
    },
    {
      question: 'What is something you might save for?',
      examples: ['A book', 'An activity', 'A special gift', 'Something else'],
      cloudResponse: 'A clear reason can make saving feel more meaningful.',
    },
  ],
  reflection: {
    prompt: 'Imagine you have 90 kr to plan.',
    question: 'Which plan feels most balanced?',
    options: [
      { id: 'three', label: 'Use some now, save some, share some' },
      { id: 'all-now', label: 'Use all of it right away' },
      { id: 'no-plan', label: 'Decide without thinking' },
      { id: 'copy', label: 'Copy what a friend does' },
    ],
    response: 'Balance does not require equal amounts. It means choosing each part with care.',
  },
  practice: {
    title: 'Try This Today',
    text: 'Draw three spaces labeled Spend, Save, and Share. Make a plan for the next money you receive.',
    questions: ['What matters now?', 'What matters later?', 'Who or what could I help?'],
    options: [
      { id: 'will-try', label: 'I will make a plan' },
      { id: 'already-tried', label: 'I already made one' },
    ],
  },
  quiz: [
    {
      question: 'What does saving mean?',
      answers: [
        { id: 'later', label: 'Keeping money for later' },
        { id: 'now', label: 'Using all money now' },
        { id: 'lose', label: 'Forgetting where money is' },
        { id: 'borrow', label: 'Always borrowing money' },
      ],
      correctAnswerId: 'later',
      feedback: 'Saving keeps money ready for a future choice.',
    },
    {
      question: 'What makes a money plan balanced?',
      answers: [
        { id: 'care', label: 'Choosing each part with care' },
        { id: 'equal', label: 'Always using exactly equal amounts' },
        { id: 'friend', label: 'Doing whatever a friend does' },
        { id: 'fast', label: 'Deciding as fast as possible' },
      ],
      correctAnswerId: 'care',
      feedback: 'A balanced plan reflects what matters now, later, and to others.',
    },
  ],
  completion: {
    title: 'You completed today’s Wisdom',
    message: 'You practiced giving money different jobs: spending, saving, and sharing.',
    cloudMessage: 'A balanced plan helps your money reflect what matters to you.',
  },
};
