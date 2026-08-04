/**
 * "Three Ways to Use Money" — asset-free content.
 *
 * Every value the Guided Wisdom Engine needs lives here: copy, story beats,
 * response options, decision rules, takeaway options, practice and completion.
 * No image is imported, so Node can load this file directly and the engine can
 * be tested against the same source the application ships.
 *
 * Artwork is bound separately in ./threeWaysToUseMoney.ts.
 */
import type { GuidedPersonalResponseSuggestion } from './types';
import type { GuidedStoryWisdomData } from './types';


const personalResponseSuggestions: GuidedPersonalResponseSuggestion[] = [
  {
    id: 'game-item',
    label: 'I wanted a game item',
    adaptiveResponse:
      'A game item can feel urgent, especially when other players have one. What might change if you waited one day before buying?',
  },
  {
    id: 'toy',
    label: 'I wanted a toy',
    adaptiveResponse:
      'A new toy can stay in your thoughts for a long time. What helped you decide whether to buy the toy?',
  },
  {
    id: 'sweets',
    label: 'I wanted some sweets',
    adaptiveResponse:
      'Sweets give you something enjoyable now, but the feeling may pass quickly. Were you still happy with your choice later?',
  },
  {
    id: 'something-bigger',
    label: 'I wanted to save for something bigger',
    adaptiveResponse:
      'You were already thinking about later. What made the bigger thing worth waiting for?',
  },
  {
    id: 'cannot-remember',
    label: 'I cannot remember',
    adaptiveResponse:
      'That is okay. Next time you really want something, notice what you think and feel before choosing.',
  },
];

export const threeWaysToUseMoneyData: GuidedStoryWisdomData = {
  id: 'three-ways-to-use-money',
  format: 'guided-story-v1',
  title: 'Three Ways to Use Money',
  summary: 'Learn how money can be used for spending, saving, and sharing.',
  category: 'Money Wisdom',
  estimatedMinutes: 7,
  skillOutcome: 'Builds balanced money habits',
  introduction:
    'Leo has 90 kr.\n\nHe wants football cards, new headphones, and a birthday present for his sister.\n\nHe cannot afford everything.\n\nWhat should he do?',
  learningOutcomes: [
    'Enjoy some now',
    'Keep some for later',
    'Think about someone else',
  ],
  startButtonLabel: 'Start the Story',
  storyScenes: [
    {
      id: 'leo-wants-the-cards-now',
      text:
        'Leo squeezed the 90 kr in his hand. A new pack of football cards was waiting at the shop, and he wanted the cards now.',
      narrationText:
        'Leo squeezed the 90 kr in his hand. A new pack of football cards was waiting at the shop, and he wanted the cards now.',
      visualLabel: 'Money and football cards',
    },
    {
      id: 'leo-remembers-the-headphones',
      text:
        'Then Leo remembered the headphones he had been saving for. He was still 120 kr away.',
      narrationText:
        'Then Leo remembered the headphones he had been saving for. He was still 120 kr away.',
      visualLabel: 'Headphones and savings progress',
    },
    {
      id: 'leo-remembers-mias-birthday',
      text:
        'His younger sister Mia’s birthday was on Saturday. Leo wanted to bring her a small surprise.',
      narrationText:
        'His younger sister Mia’s birthday was on Saturday. Leo wanted to bring her a small surprise.',
      visualLabel: 'A birthday gift for Mia',
    },
    {
      id: 'leo-sees-three-choices',
      text:
        'The football cards would feel good today. Saving would move him closer to the headphones. A gift would make Mia smile.',
      narrationText:
        'The football cards would feel good today. Saving would move him closer to the headphones. A gift would make Mia smile.',
      visualLabel: 'Football cards, headphones, and a birthday gift',
    },
    {
      id: 'leo-pauses',
      text:
        'Leo paused before entering the shop. He realised he did not have to choose only one.',
      narrationText:
        'Leo paused before entering the shop. He realised he did not have to choose only one.',
      visualLabel: 'Leo pausing to think',
    },
    {
      id: 'leo-makes-a-plan',
      text:
        'Leo chose 40 kr for football cards, 30 kr for his headphones, and 20 kr for Mia. The amounts were different because each choice mattered in a different way.',
      narrationText:
        'Leo chose 40 kr for football cards, 30 kr for his headphones, and 20 kr for Mia. The amounts were different because each choice mattered in a different way.',
      visualLabel: 'Leo’s completed money plan',
    },
  ],
  reflection: {
    question:
      'Have you ever wanted something so much that waiting felt difficult?',
    allowTypedResponse: true,
    maxResponseLength: 120,
    choices: [
      {
        id: 'yes-many-times',
        label: 'Yes, many times',
        cloudResponse: 'That feeling can become very strong.',
        followUpQuestion: 'What was something you really wanted?',
        suggestedResponses: personalResponseSuggestions,
        adaptivePrompt:
          'What could change if you waited until tomorrow before deciding?',
        summaryLead: 'You said waiting can feel difficult.',
      },
      {
        id: 'sometimes',
        label: 'Sometimes',
        cloudResponse: 'Some things are easier to wait for than others.',
        followUpQuestion: 'What made waiting difficult?',
        suggestedResponses: personalResponseSuggestions,
        adaptivePrompt:
          'What might feel different if you waited until tomorrow before choosing?',
        summaryLead: 'You said waiting can feel difficult sometimes.',
      },
      {
        id: 'no',
        label: 'No',
        cloudResponse: 'You may already be good at waiting.',
        followUpQuestion: 'What helps you slow down before choosing?',
        suggestedResponses: personalResponseSuggestions,
        adaptivePrompt: 'How could that help you decide what matters most?',
        summaryLead: 'You said you are good at waiting.',
      },
      {
        id: 'not-sure',
        label: 'I am not sure',
        cloudResponse: 'That is okay.',
        followUpQuestion:
          'Think about the last time you saw something you wanted. What happened next?',
        suggestedResponses: personalResponseSuggestions,
        adaptivePrompt: 'What could you notice next time before you choose?',
        summaryLead: 'You took time to think about waiting.',
      },
    ],
  },
  decision: {
    scenario:
      'Leo has 90 kr. How would you divide it between football cards, headphones, and Mia’s birthday?',
    totalAmount: 90,
    increment: 10,
    initialPlan: { spend: 30, save: 30, give: 30 },
    categories: [
      { id: 'spend', label: 'Spend now', objectLabel: 'Football cards' },
      { id: 'save', label: 'Save for later', objectLabel: 'Headphones' },
      { id: 'give', label: 'Give or help', objectLabel: 'Mia’s birthday' },
    ],
    rules: {
      balancedMinimumPerCategory: 20,
      balancedMaximumSpread: 20,
      significantGiveMinimum: 40,
    },
    consequenceResponses: {
      spend:
        'You chose more for football cards today. That gives Leo more to enjoy now, but the headphones will take longer.',
      save:
        'You chose more for the headphones. Leo moves closer to his bigger goal, but has less for today.',
      give:
        'You chose more for Mia’s birthday. Leo is thinking carefully about someone else. His own plans still need some room.',
      balanced:
        'You made room for football cards, headphones, and Mia. The amounts are different, but every choice has a place.',
    },
    equalPlanResponse:
      'You made room for football cards, headphones, and Mia. Every choice has a place.',
    reviewQuestion: 'Would you keep this plan or change one amount?',
    keepLabel: 'Keep My Plan',
    changeLabel: 'Change My Plan',
  },
  takeaway: {
    question: 'What do you want to remember from today?',
    allowTypedResponse: true,
    maxResponseLength: 160,
    choices: [
      {
        id: 'not-spend-everything',
        label: 'I do not need to spend everything',
      },
      { id: 'future-goals', label: 'Saving helps future goals' },
      { id: 'help-others', label: 'Money can help other people' },
      { id: 'what-matters', label: 'Balance depends on what matters' },
    ],
  },
  practice: {
    title: 'Try This Next Time',
    text: 'One small action can make the next choice easier.',
    cardText:
      'Next time you receive money, divide the money before spending any part.',
    actions: {
      spend:
        'Next time you want to buy something, wait ten minutes. Then decide again.',
      save:
        'Next time you receive money, put the saving part aside first.',
      give: 'Choose one person you would like to help and decide why.',
      balanced:
        'Next time you receive money, divide the money before spending any part.',
    },
    encouragement: 'One small pause can help you choose with care.',
    completeButtonLabel: 'I’ll Try This',
  },
  completion: {
    title: 'You made a thoughtful choice',
    message: 'Cloud noticed the care you put into your choice.',
    exitButtonLabel: 'Back to Home',
  },
};
