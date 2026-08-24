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
  storyVisuals: [
    {
      id: 'leo-wants-the-cards-now',
      visualLabel: 'Football cards at the shop',
    },
    {
      id: 'leo-remembers-the-headphones',
      visualLabel: 'Leo’s headphone savings goal',
    },
    {
      id: 'leo-remembers-mias-birthday',
      visualLabel: 'A birthday surprise for Mia',
    },
    {
      id: 'leo-sees-three-choices',
      visualLabel: 'Football cards, headphones, and Mia’s gift',
    },
    {
      id: 'leo-pauses',
      visualLabel: 'Leo pausing outside the shop',
    },
    {
      id: 'leo-makes-a-plan',
      visualLabel: 'Leo trying different ways to divide the money',
    },
  ],
  storyBeats: [
    {
      id: 'the-packet-in-the-window',
      visualId: 'leo-wants-the-cards-now',
      text:
        'On Friday afternoon, Leo stopped so fast outside the corner shop that his backpack bumped his shoulder. In the window was a fresh packet of football cards. The silver wrapper caught the light, and his fingers tingled to tear it open.',
      narrationText:
        'On Friday afternoon, Leo stopped so fast outside the corner shop that his backpack bumped his shoulder. In the window was a fresh packet of football cards. The silver wrapper caught the light, and his fingers tingled to tear it open.',
    },
    {
      id: 'a-card-to-show-his-friends',
      visualId: 'leo-wants-the-cards-now',
      text:
        'At school, Amir had shown everyone a rare goalkeeper card. Leo could almost hear his friends crowding around if he found one too. “Just imagine,” he whispered. The packet cost 50 kr. Today, for once, Leo had enough.',
      narrationText:
        'At school, Amir had shown everyone a rare goalkeeper card. Leo could almost hear his friends crowding around if he found one too. “Just imagine,” he whispered. The packet cost 50 kr. Today, for once, Leo had enough.',
    },
    {
      id: 'money-he-had-earned',
      visualId: 'leo-wants-the-cards-now',
      text:
        'The 90 kr in his pocket felt warm from his hand. He had earned some by helping wash the car and saved the rest from two Saturday treats. Spending part of it now did not feel silly. It felt exciting—and very possible.',
      narrationText:
        'The 90 kr in his pocket felt warm from his hand. He had earned some by helping wash the car and saved the rest from two Saturday treats. Spending part of it now did not feel silly. It felt exciting—and very possible.',
    },
    {
      id: 'the-crackling-headphones',
      visualId: 'leo-remembers-the-headphones',
      text:
        'Then music crackled through the old headphones around his neck. One side had stopped working again. For four weeks, Leo had been dropping coins into a tin at home for a sturdy new pair. He had even drawn them on a note beside the tin.',
      narrationText:
        'Then music crackled through the old headphones around his neck. One side had stopped working again. For four weeks, Leo had been dropping coins into a tin at home for a sturdy new pair. He had even drawn them on a note beside the tin.',
    },
    {
      id: 'closer-than-ever',
      visualId: 'leo-remembers-the-headphones',
      text:
        'He pictured listening to his football podcast without twisting the cable until the sound returned. If he put all 90 kr into the tin, he would be only 30 kr away. That was closer than he had ever been.',
      narrationText:
        'He pictured listening to his football podcast without twisting the cable until the sound returned. If he put all 90 kr into the tin, he would be only 30 kr away. That was closer than he had ever been.',
    },
    {
      id: 'two-sleeps-left',
      visualId: 'leo-remembers-mias-birthday',
      text:
        'His phone buzzed. Mia had sent a picture of the lopsided paper crown she was making for her birthday on Saturday. His little sister had counted down every morning that week: “Two sleeps left!”',
      narrationText:
        'His phone buzzed. Mia had sent a picture of the lopsided paper crown she was making for her birthday on Saturday. His little sister had counted down every morning that week: “Two sleeps left!”',
    },
    {
      id: 'the-drawings-under-the-door',
      visualId: 'leo-remembers-mias-birthday',
      text:
        'Last month, when Leo was sick, Mia had sat outside his room and slid funny drawings under the door. He still kept the best one. He wanted her birthday to hold a surprise chosen just for her, not only a quick “happy birthday.”',
      narrationText:
        'Last month, when Leo was sick, Mia had sat outside his room and slid funny drawings under the door. He still kept the best one. He wanted her birthday to hold a surprise chosen just for her, not only a quick “happy birthday.”',
    },
    {
      id: 'a-gift-mia-would-use',
      visualId: 'leo-remembers-mias-birthday',
      text:
        'On the shelf beside the cards was a small craft set with bright beads—the kind Mia used to make bracelets for everyone. It cost 30 kr. Leo imagined her grin, then looked back at the shining packet.',
      narrationText:
        'On the shelf beside the cards was a small craft set with bright beads—the kind Mia used to make bracelets for everyone. It cost 30 kr. Leo imagined her grin, then looked back at the shining packet.',
    },
    {
      id: 'three-real-reasons',
      visualId: 'leo-sees-three-choices',
      text:
        'Now the 90 kr seemed to pull in three directions. Cards meant a thrilling afternoon with his friends. The headphones meant finishing something he had worked toward. The gift meant showing Mia he remembered what made her happy.',
      narrationText:
        'Now the 90 kr seemed to pull in three directions. Cards meant a thrilling afternoon with his friends. The headphones meant finishing something he had worked toward. The gift meant showing Mia he remembered what made her happy.',
    },
    {
      id: 'only-a-few-packets-left',
      visualId: 'leo-pauses',
      text:
        'Amir waved from inside the shop. “Leo! There are only a few packets left!” Leo stepped toward the door. If he waited, the cards might be gone. If he bought them, the headphones would wait longer. If he skipped the gift, Mia would never know what he had imagined.',
      narrationText:
        'Amir waved from inside the shop. “Leo! There are only a few packets left!” Leo stepped toward the door. If he waited, the cards might be gone. If he bought them, the headphones would wait longer. If he skipped the gift, Mia would never know what he had imagined.',
    },
    {
      id: 'trying-different-groups',
      visualId: 'leo-makes-a-plan',
      text:
        'Could he choose more than one? Leo placed three coins across his palm and tried different groups in his head. More for one choice meant less for another. A small amount for everything might work—but would any choice then feel like enough?',
      narrationText:
        'Could he choose more than one? Leo placed three coins across his palm and tried different groups in his head. More for one choice meant less for another. A small amount for everything might work—but would any choice then feel like enough?',
    },
    {
      id: 'the-pause-before-the-choice',
      visualId: 'leo-pauses',
      text:
        'The shop door opened, spilling warm air and the crinkle of wrappers onto the pavement. Leo held the 90 kr tightly. He had not decided yet. He took one slow breath and looked at the cards, the headphones in his mind, and Mia’s paper crown. What would you do?',
      narrationText:
        'The shop door opened, spilling warm air and the crinkle of wrappers onto the pavement. Leo held the 90 kr tightly. He had not decided yet. He took one slow breath and looked at the cards, the headphones in his mind, and Mia’s paper crown. What would you do?',
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
