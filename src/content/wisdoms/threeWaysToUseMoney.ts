import type {
  GuidedPersonalResponseSuggestion,
  GuidedStoryWisdomContent,
} from './types';
import {
  formatCurrencyAccessibility,
  formatCurrencyDisplay,
  formatCurrencySpoken,
} from '../../config/currency';

const moneyArtwork = require('../../../assets/cloud/cat-money.png');
const savingsArtwork = require('../../../assets/cloud/cloud-thinking.png');
const birthdayArtwork = require('../../../assets/cloud/cloud-helps-friend.png');
const choicesArtwork = require('../../../assets/cloud/cloud-neighborhood-home.png');
const pauseArtwork = require('../../../assets/cloud/cat-thinking.png');
const planArtwork = require('../../../assets/cloud/cloud-hero-wave.png');

const TOTAL_AMOUNT = 90;
const HEADPHONE_GOAL_AMOUNT = 120;
const CARD_AMOUNT = 30;
const DECISION_INCREMENT = 10;

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

export const threeWaysToUseMoney: GuidedStoryWisdomContent = {
  id: 'three-ways-to-use-money',
  format: 'guided-story-v1',
  title: 'Three Ways to Use Money',
  summary: 'Learn how money can be used for spending, saving, and sharing.',
  category: 'Money Wisdom',
  estimatedMinutes: 7,
  skillOutcome: 'Builds balanced money habits',
  artwork: moneyArtwork,
  introduction:
    `Leo has ${formatCurrencyDisplay(TOTAL_AMOUNT)}.\n\nHe wants football cards, new headphones, and a birthday present for his sister.\n\nHe cannot afford everything.\n\nWhat should he do?`,
  learningOutcomes: [
    'Enjoy some now',
    'Keep some for later',
    'Think about someone else',
  ],
  startButtonLabel: 'Start the Story',
  storyScenes: [
    {
      id: 'leo-has-a-choice',
      text:
        `Leo counted the money on his desk twice: ${formatCurrencyDisplay(TOTAL_AMOUNT)}. It was the first time he had so much that was truly his to decide about. He spread the bills in a neat row and grinned. “I could do almost anything with this,” he said, feeling as if three bright doors had opened at once.`,
      narrationText:
        `Leo counted the money on his desk twice: ${formatCurrencySpoken(TOTAL_AMOUNT)}. It was the first time he had so much that was truly his to decide about. He spread the bills in a neat row and grinned. “I could do almost anything with this,” he said, feeling as if three bright doors had opened at once.`,
      artwork: moneyArtwork,
      visualLabel: 'Leo’s money and three possible choices',
    },
    {
      id: 'leo-wants-the-cards-now',
      text:
        'On the way to the park, Leo stopped at the corner shop. A shiny new pack of football cards sat beside the register. His friends had been trading cards all week, and Leo imagined opening a rare one. “I could buy several packs right now,” he thought. His hand moved toward the money in his pocket.',
      narrationText:
        'On the way to the park, Leo stopped at the corner shop. A shiny new pack of football cards sat beside the register. His friends had been trading cards all week, and Leo imagined opening a rare one. “I could buy several packs right now,” he thought. His hand moved toward the money in his pocket.',
      artwork: moneyArtwork,
      visualLabel: 'Football cards at the corner shop',
    },
    {
      id: 'leo-remembers-the-headphones',
      text:
        `Then a song played through the shop speakers, and Leo remembered the headphones he had wanted for months. His old pair only worked when he held the wire at a funny angle. The new headphones cost ${formatCurrencyDisplay(HEADPHONE_GOAL_AMOUNT)}. If he saved some of his ${formatCurrencyDisplay(TOTAL_AMOUNT)}, that faraway goal would suddenly feel much closer.`,
      narrationText:
        `Then a song played through the shop speakers, and Leo remembered the headphones he had wanted for months. His old pair only worked when he held the wire at a funny angle. The new headphones cost ${formatCurrencySpoken(HEADPHONE_GOAL_AMOUNT)}. If he saved some of his ${formatCurrencySpoken(TOTAL_AMOUNT)}, that faraway goal would suddenly feel much closer.`,
      artwork: savingsArtwork,
      visualLabel: 'Headphones and a savings goal',
    },
    {
      id: 'leo-remembers-mias-birthday',
      text:
        'Outside the shop, Leo saw a window filled with ribbons. Mia’s birthday was Saturday. She had been drawing tiny animals on every scrap of paper she could find, and Leo knew she would love a new sketchbook. He pictured her surprised smile. Buying something for Mia felt different from buying something for himself, but just as exciting.',
      narrationText:
        'Outside the shop, Leo saw a window filled with ribbons. Mia’s birthday was Saturday. She had been drawing tiny animals on every scrap of paper she could find, and Leo knew she would love a new sketchbook. He pictured her surprised smile. Buying something for Mia felt different from buying something for himself, but just as exciting.',
      artwork: birthdayArtwork,
      visualLabel: 'A sketchbook for Mia’s birthday',
    },
    {
      id: 'leo-sees-what-spending-all-would-change',
      text:
        `Leo looked back at the football cards. For one thrilling second, he imagined spending all ${formatCurrencyDisplay(TOTAL_AMOUNT)} on packs and tearing them open across his bed. Then the picture changed: no money closer to his headphones, and nothing chosen for Mia. The cards were still tempting, but spending everything now would quietly close the other two doors.`,
      narrationText:
        `Leo looked back at the football cards. For one thrilling second, he imagined spending all ${formatCurrencySpoken(TOTAL_AMOUNT)} on packs and tearing them open across his bed. Then the picture changed: no money closer to his headphones, and nothing chosen for Mia. The cards were still tempting, but spending everything now would quietly close the other two doors.`,
      artwork: choicesArtwork,
      visualLabel: 'Three choices and what could be lost',
    },
    {
      id: 'leo-tries-different-plans',
      text:
        `Leo sat on a bench and drew three circles on an old receipt. Over them he wrote Spend, Save, and Give. “They don’t have to be equal,” Leo whispered. He tried one plan, crossed it out, and tried another. Each time he moved ${formatCurrencyDisplay(DECISION_INCREMENT)}, one choice grew while another had to shrink. That made him pause.`,
      narrationText:
        `Leo sat on a bench and drew three circles on an old receipt. Over them he wrote Spend, Save, and Give. “They don’t have to be equal,” Leo whispered. He tried one plan, crossed it out, and tried another. Each time he moved ${formatCurrencySpoken(DECISION_INCREMENT)}, one choice grew while another had to shrink. That made him pause.`,
      artwork: pauseArtwork,
      visualLabel: 'Leo trying different money plans',
    },
    {
      id: 'leo-chooses-his-plan',
      text:
        `At last, Leo chose a plan that felt like his. He kept ${formatCurrencyDisplay(CARD_AMOUNT)} for football cards, placed a larger part in his headphone envelope, and set the rest aside for Mia’s sketchbook. At the shop, he bought only the cards he wanted most. Walking home, he felt happy about today—and still excited about what came next.`,
      narrationText:
        `At last, Leo chose a plan that felt like his. He kept ${formatCurrencySpoken(CARD_AMOUNT)} for football cards, placed a larger part in his headphone envelope, and set the rest aside for Mia’s sketchbook. At the shop, he bought only the cards he wanted most. Walking home, he felt happy about today—and still excited about what came next.`,
      artwork: planArtwork,
      visualLabel: 'Leo’s spend, save, and give plan',
    },
    {
      id: 'leos-choices-show-what-matters',
      text:
        `On Saturday, Mia opened the sketchbook and began drawing before the ribbon was off the table. Later, Leo traded his favorite new card with a friend and added the saved money to his headphone envelope. His ${formatCurrencyDisplay(TOTAL_AMOUNT)} had become three different things: fun now, hope for later, and kindness for someone else. Money gave him choices, and his choices showed what mattered.`,
      narrationText:
        `On Saturday, Mia opened the sketchbook and began drawing before the ribbon was off the table. Later, Leo traded his favorite new card with a friend and added the saved money to his headphone envelope. His ${formatCurrencySpoken(TOTAL_AMOUNT)} had become three different things: fun now, hope for later, and kindness for someone else. Money gave him choices, and his choices showed what mattered.`,
      artwork: choicesArtwork,
      visualLabel: 'Fun now, hope for later, and kindness for Mia',
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
      `Leo has ${formatCurrencyAccessibility(TOTAL_AMOUNT)}. How would you divide it between football cards, headphones, and Mia’s birthday?`,
    totalAmount: TOTAL_AMOUNT,
    increment: DECISION_INCREMENT,
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
