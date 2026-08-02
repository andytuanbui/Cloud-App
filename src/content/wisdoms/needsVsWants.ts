import { WisdomContent } from './types';

export const needsVsWants: WisdomContent = {
  id: 'needs-vs-wants',
  format: 'legacy-quiz',
  title: 'Needs vs Wants',
  summary: 'Learn how to tell the difference between something you need and something you want.',
  category: 'Money Wisdom',
  estimatedMinutes: 8,
  skillOutcome: 'Builds thoughtful money choices',
  artwork: require('../../../assets/cloud/needs-wants-jars.png'),
  openingQuestion: {
    question: 'You have 100 kr. Which would you choose first?',
    options: [
      { id: 'food', label: 'Food for lunch' },
      { id: 'toy', label: 'A new toy' },
      { id: 'jacket', label: 'A warm jacket' },
      { id: 'candy', label: 'Candy' },
    ],
    response: 'Interesting choice. Let’s look at what makes something a need or a want.',
  },
  readingSections: [
    {
      title: 'What Is a Need?',
      text: ['A need is something that helps you stay safe, healthy, or able to live your daily life.'],
      examples: ['Food', 'Water', 'A safe home', 'Clothes for the weather', 'Medicine when you are sick'],
    },
    {
      title: 'What Is a Want?',
      text: ['A want can make life more fun or comfortable, but you can live without it.'],
      examples: [
        'A new toy',
        'Candy',
        'Extra toys',
        'Brand-name shoes when your current shoes still work',
        'A newer phone when your current phone works',
      ],
    },
    {
      title: 'The Choice Is Not Always Easy',
      text: [
        'Some things can be a need in one situation and a want in another.',
        'A jacket can be a need when it is cold. A fifth jacket in a different color may be a want.',
        'A phone can help a child contact their family. The newest phone may still be a want when the current phone works.',
      ],
    },
    {
      title: 'Pause Before You Choose',
      text: ['Before buying something, ask:'],
      examples: [
        'Do I need this now?',
        'Can I wait?',
        'Do I already have something that works?',
        'What will I give up if I spend my money on this?',
      ],
    },
  ],
  cloudConversation: [
    {
      question: 'Tell me about something you wanted recently.',
      examples: ['A new book', 'New shoes', 'A toy', 'Something else'],
      cloudResponse: 'Wanting something is normal. The important part is understanding why you want it.',
    },
    {
      question: 'What made you want it?',
      examples: ['It looked fun', 'A friend had it', 'Mine felt old', 'I was curious'],
      cloudResponse: 'That is thoughtful. Waiting can help you decide whether something matters.',
    },
    {
      question: 'Would your daily life still work without it?',
      examples: ['Yes, it would', 'Maybe', 'Not sure yet', 'No, I need it'],
      cloudResponse: 'You are practicing how to make your own money choices.',
    },
  ],
  reflection: {
    prompt: 'Think about something you wanted but did not buy.',
    question: 'What happened after you waited?',
    options: [
      { id: 'still', label: 'I still wanted it' },
      { id: 'forgot', label: 'I forgot about it' },
      { id: 'else', label: 'I found something else' },
      { id: 'not-needed', label: 'I decided I did not need it' },
    ],
    response: 'Waiting gives your brain time to make a calmer decision.',
  },
  practice: {
    title: 'Try This Today',
    text: 'Choose one thing you want today. Before asking for it or buying it, wait until tomorrow.',
    questions: ['Do I still want it?', 'Do I need it?', 'What else could I do with the money?'],
    options: [
      { id: 'will-try', label: 'I will try this' },
      { id: 'already-tried', label: 'I already tried this' },
    ],
  },
  quiz: [
    {
      question: 'Which of these is usually a need?',
      answers: [
        { id: 'water', label: 'Clean drinking water' },
        { id: 'new-toy', label: 'A new toy' },
        { id: 'candy', label: 'Candy' },
        { id: 'tablet', label: 'A second tablet' },
      ],
      correctAnswerId: 'water',
      feedback: 'Clean drinking water helps people stay healthy.',
    },
    {
      question: 'Which question can help before buying something?',
      answers: [
        { id: 'need-now', label: 'Do I need this now?' },
        { id: 'impressed', label: 'Will my friend be impressed?' },
        { id: 'newest', label: 'Is it the newest version?' },
        { id: 'package', label: 'Does the package look cool?' },
      ],
      correctAnswerId: 'need-now',
      feedback: 'Pausing to ask what you need helps you make a thoughtful choice.',
    },
    {
      question: 'A winter jacket can be a need when:',
      answers: [
        { id: 'cold', label: 'The weather is cold' },
        { id: 'five', label: 'You already own five warm jackets' },
        { id: 'color', label: 'You want another color' },
        { id: 'friend', label: 'A friend bought one' },
      ],
      correctAnswerId: 'cold',
      feedback: 'Warm clothes help keep you safe and healthy in cold weather.',
    },
    {
      question: 'What can waiting help you do?',
      answers: [
        { id: 'calmer', label: 'Make a calmer choice' },
        { id: 'faster', label: 'Spend money faster' },
        { id: 'forget', label: 'Forget what money is' },
        { id: 'later', label: 'Always buy the item later' },
      ],
      correctAnswerId: 'calmer',
      feedback: 'Waiting gives your brain time to think before deciding.',
    },
  ],
  completion: {
    title: 'You completed today’s Wisdom',
    message: 'You practiced how to pause and understand the difference between needs and wants.',
    cloudMessage: 'Wise choices begin when you stop and think before deciding.',
  },
};
