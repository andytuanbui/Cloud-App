import type { GuidedStoryWisdomContent } from '../../../content/wisdoms';
import type { GuidedWisdomDefinition } from '../types';

/**
 * Test-only Guided Wisdom.
 *
 * It exists to prove the engine is content-driven rather than shaped around
 * "Three Ways to Use Money". It is never registered, so it cannot reach Home
 * or Library, and it allocates minutes rather than money to show the
 * allocation engine is not currency-specific.
 *
 * Do not present this to a child. It is not designed content.
 */

/** Stand-in for an image module; the fixture never renders. */
const fixtureArtwork = { testUri: 'guided-wisdom-fixture' } as unknown as GuidedStoryWisdomContent['artwork'];

const content: GuidedStoryWisdomContent = {
  id: 'engine-fixture-quiet-time',
  format: 'guided-story-v1',
  title: 'Quiet Time Fixture',
  summary: 'A test-only Wisdom used to validate the Guided Wisdom Engine.',
  category: 'Engine Fixture',
  estimatedMinutes: 4,
  skillOutcome: 'Proves the engine is reusable',
  artwork: fixtureArtwork,
  introduction: 'A fixture child has 60 minutes.\n\nWhat should they do?',
  learningOutcomes: ['Rest a little', 'Practise a little', 'Help a little'],
  startButtonLabel: 'Start the Story',
  storyVisuals: [
    {
      id: 'fixture-clock',
      artwork: fixtureArtwork,
      visualLabel: 'A clock',
    },
  ],
  storyBeats: [
    {
      id: 'fixture-beat-one',
      visualId: 'fixture-clock',
      text: 'The fixture child looked at the clock.',
      narrationText: 'The fixture child looked at the clock.',
    },
    {
      id: 'fixture-beat-two',
      visualId: 'fixture-clock',
      text: 'There was more than one good way to spend the time.',
      narrationText: 'There was more than one good way to spend the time.',
    },
  ],
  reflection: {
    question: 'Have you ever had spare time and not known what to do?',
    allowTypedResponse: true,
    maxResponseLength: 120,
    choices: [
      {
        id: 'fixture-yes',
        label: 'Yes',
        cloudResponse: 'That happens often.',
        followUpQuestion: 'What did you choose last time?',
        suggestedResponses: [
          {
            id: 'fixture-rested',
            label: 'I rested',
            adaptiveResponse: 'Resting can be a good choice.',
          },
        ],
        adaptivePrompt: 'What might you try next time?',
        summaryLead: 'You thought about spare time.',
      },
    ],
  },
  decision: {
    scenario: 'How would you divide 60 minutes?',
    totalAmount: 60,
    increment: 10,
    initialPlan: { spend: 20, save: 20, give: 20 },
    categories: [
      { id: 'spend', label: 'Rest now', objectLabel: 'Quiet rest' },
      { id: 'save', label: 'Practise for later', objectLabel: 'Practice time' },
      { id: 'give', label: 'Help someone', objectLabel: "A friend’s project" },
    ],
    rules: {
      balancedMinimumPerCategory: 10,
      balancedMaximumSpread: 20,
      significantGiveMinimum: 30,
    },
    consequenceResponses: {
      spend: 'You kept more time for rest.',
      save: 'You kept more time for practice.',
      give: 'You gave more time to someone else.',
      balanced: 'You made room for rest, practice, and helping.',
    },
    equalPlanResponse: 'You made room for every part of the day.',
    reviewQuestion: 'Would you keep this plan or change one amount?',
    keepLabel: 'Keep My Plan',
    changeLabel: 'Change My Plan',
  },
  takeaway: {
    question: 'What do you want to remember?',
    allowTypedResponse: true,
    maxResponseLength: 160,
    choices: [
      { id: 'fixture-rest-matters', label: 'Rest matters too' },
      { id: 'fixture-help-others', label: 'Time can help other people' },
    ],
  },
  practice: {
    title: 'Try This Next Time',
    text: 'One small action can make the next choice easier.',
    cardText: 'Next time you have spare time, decide before it disappears.',
    actions: {
      spend: 'Take a short rest on purpose.',
      save: 'Practise one thing first.',
      give: 'Offer ten minutes to someone.',
      balanced: 'Divide your time before it disappears.',
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

export const testGuidedWisdomDefinition: GuidedWisdomDefinition = {
  id: content.id,
  content,
  testOnly: true,
  allocation: {
    totalUnits: content.decision.totalAmount,
    increment: content.decision.increment,
    unitSuffix: 'minutes',
    destinations: content.decision.categories.map((category) => ({
      id: category.id,
      label: category.label,
      objectLabel: category.objectLabel,
    })),
  },
};
