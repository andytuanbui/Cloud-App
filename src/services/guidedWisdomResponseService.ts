import type {
  GuidedMoneyDecision,
  GuidedStoryWisdomContent,
  MoneyDecisionCategoryId,
  MoneyPlan,
  MoneyPlanResponseKind,
} from '../content/wisdoms';

export const DEFAULT_PERSONAL_RESPONSE_MAX_LENGTH = 120;
const PERSONAL_REFERENCE_MAX_WORDS = 16;

export type AdaptiveReflectionResponseInput = {
  selectedReflectionAnswerId: string;
  personalResponse: string;
  context: Pick<GuidedStoryWisdomContent, 'reflection'>;
};

export type MoneyPlanValidation = {
  isValid: boolean;
  total: number;
  reason?:
    | 'not-finite'
    | 'not-whole'
    | 'negative'
    | 'above-total'
    | 'wrong-increment'
    | 'wrong-total';
};

export type MoneyPlanEvaluation = {
  kind: MoneyPlanResponseKind;
  message: string;
};

export type PersonalizedSummaryInput = {
  selectedReflectionAnswerId: string;
  personalResponse: string;
  moneyPlan: MoneyPlan;
  takeaway: string;
  context: Pick<GuidedStoryWisdomContent, 'reflection' | 'decision' | 'takeaway'>;
};

export type PracticeActionInput = {
  moneyPlan: MoneyPlan;
  context: Pick<GuidedStoryWisdomContent, 'decision' | 'practice'>;
};

export type CompletionRecognitionInput = {
  selectedReflectionAnswerId: string;
  moneyPlan: MoneyPlan;
  personalResponse?: string;
  takeaway?: string;
  context: Pick<GuidedStoryWisdomContent, 'reflection' | 'decision'>;
};

/**
 * Normalizes child-entered copy without changing its meaning. Capping by Unicode
 * code point avoids leaving a split emoji or other surrogate pair at the end.
 */
export function normalizePersonalResponse(
  value: string,
  maximumLength = DEFAULT_PERSONAL_RESPONSE_MAX_LENGTH,
): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  const safeMaximum = Math.max(0, Math.floor(maximumLength));
  return Array.from(normalized).slice(0, safeMaximum).join('').trim();
}

/**
 * Produces a short local response. Known suggestions use their authored reply;
 * typed copy is shortened before being reflected back to the child.
 */
export function buildAdaptiveReflectionResponse({
  selectedReflectionAnswerId,
  personalResponse,
  context,
}: AdaptiveReflectionResponseInput): string {
  const choice = context.reflection.choices.find(
    (item) => item.id === selectedReflectionAnswerId,
  );
  if (!choice) {
    throw new Error(
      `Unknown guided reflection choice: ${selectedReflectionAnswerId}`,
    );
  }

  const normalized = normalizePersonalResponse(
    personalResponse,
    context.reflection.maxResponseLength,
  );
  if (!normalized) return choice.adaptivePrompt;

  const suggestion = choice.suggestedResponses.find(
    (item) => normalizePersonalResponse(item.label) === normalized,
  );
  if (suggestion) return suggestion.adaptiveResponse;

  return `${buildTypedPersonalReference(normalized)} ${choice.adaptivePrompt}`;
}

/**
 * Valid plans use whole, non-negative amounts in the configured increment and
 * add up to the decision's exact total. No invalid plan reaches evaluation.
 */
export function validateMoneyPlan(
  plan: MoneyPlan,
  decision: Pick<GuidedMoneyDecision, 'increment' | 'totalAmount'>,
): MoneyPlanValidation {
  const amounts = [plan.spend, plan.save, plan.give];
  const total = amounts.reduce((sum, amount) => sum + amount, 0);

  if (!amounts.every(Number.isFinite)) {
    return { isValid: false, total, reason: 'not-finite' };
  }
  if (!amounts.every(Number.isInteger)) {
    return { isValid: false, total, reason: 'not-whole' };
  }
  if (amounts.some((amount) => amount < 0)) {
    return { isValid: false, total, reason: 'negative' };
  }
  if (amounts.some((amount) => amount > decision.totalAmount)) {
    return { isValid: false, total, reason: 'above-total' };
  }
  if (
    !Number.isInteger(decision.increment) ||
    decision.increment <= 0 ||
    amounts.some((amount) => amount % decision.increment !== 0)
  ) {
    return { isValid: false, total, reason: 'wrong-increment' };
  }
  if (total !== decision.totalAmount) {
    return { isValid: false, total, reason: 'wrong-total' };
  }

  return { isValid: true, total };
}

/**
 * Rule order is intentional: a meaningful three-part distribution wins first,
 * even when its amounts are not near-equal. Strong single-category plans then
 * receive their concrete consequence. Every valid plan remains deterministic.
 */
export function evaluateMoneyPlan(
  plan: MoneyPlan,
  decision: GuidedMoneyDecision,
): MoneyPlanEvaluation {
  const validation = validateMoneyPlan(plan, decision);
  if (!validation.isValid) {
    throw new Error(`Invalid money plan: ${validation.reason}`);
  }

  const amounts = [plan.spend, plan.save, plan.give];
  const includesEveryPart = amounts.every(
    (amount) => amount >= decision.rules.balancedMinimumPerCategory,
  );
  // A plan only reads as balanced when every part is present *and* no single
  // part dominates. Without the spread check, 50/20/20 would be described the
  // same way as 30/30/30 and the child would get no signal about the choice
  // they actually made.
  const spread = Math.max(...amounts) - Math.min(...amounts);
  const withinBalancedSpread = spread <= decision.rules.balancedMaximumSpread;

  let kind: MoneyPlanResponseKind;
  if (includesEveryPart && withinBalancedSpread) {
    kind = 'balanced';
  } else if (
    plan.give >= decision.rules.significantGiveMinimum &&
    plan.give >= plan.spend &&
    plan.give >= plan.save
  ) {
    kind = 'give';
  } else if (plan.spend > plan.save && plan.spend > plan.give) {
    kind = 'spend';
  } else if (plan.save > plan.spend && plan.save > plan.give) {
    kind = 'save';
  } else if (plan.give > plan.spend && plan.give > plan.save) {
    kind = 'give';
  } else {
    kind = 'balanced';
  }

  const allAmountsEqual = amounts.every((amount) => amount === amounts[0]);
  return {
    kind,
    message:
      kind === 'balanced' && allAmountsEqual
        ? decision.equalPlanResponse
        : decision.consequenceResponses[kind],
  };
}

/** Builds exactly two short sentences: one remembered personal detail and one
 * observation shaped by the plan and takeaway. */
export function buildPersonalizedSummary({
  selectedReflectionAnswerId,
  personalResponse,
  moneyPlan,
  takeaway,
  context,
}: PersonalizedSummaryInput): string {
  const choice = context.reflection.choices.find(
    (item) => item.id === selectedReflectionAnswerId,
  );
  if (!choice) {
    throw new Error(
      `Unknown guided reflection choice: ${selectedReflectionAnswerId}`,
    );
  }

  const evaluation = evaluateMoneyPlan(moneyPlan, context.decision);
  const normalizedResponse = normalizePersonalResponse(
    personalResponse,
    context.reflection.maxResponseLength,
  );
  const normalizedTakeaway = normalizePersonalResponse(
    takeaway,
    context.takeaway.maxResponseLength,
  );
  const suggestionId = choice.suggestedResponses.find(
    (item) => normalizePersonalResponse(item.label) === normalizedResponse,
  )?.id;
  const takeawayId = context.takeaway.choices.find(
    (item) => normalizePersonalResponse(item.label) === normalizedTakeaway,
  )?.id;

  return [
    buildPersonalDetailSentence(choice.summaryLead, normalizedResponse, suggestionId),
    buildPlanTakeawaySentence(evaluation.kind, takeawayId),
  ].join(' ');
}

export function getPracticeAction({
  moneyPlan,
  context,
}: PracticeActionInput): string {
  const { kind } = evaluateMoneyPlan(moneyPlan, context.decision);
  return context.practice.actions[kind];
}

/** Returns a personal, plan-specific completion response under 35 words. */
/**
 * Two short sentences recognising what the child actually did: how their saved
 * plan divided the money, and the thought they chose to keep.
 *
 * It deliberately describes the plan's own objects rather than the example they
 * mentioned earlier — the completion screen already shows the amounts, so
 * naming something unrelated (a toy) read as if Cloud had not been listening.
 */
export function buildCompletionRecognition({
  moneyPlan,
  takeaway,
  context,
}: CompletionRecognitionInput): string {
  const { kind } = evaluateMoneyPlan(moneyPlan, context.decision);
  const label = (id: MoneyDecisionCategoryId): string => {
    const raw =
      context.decision.categories.find((category) => category.id === id)
        ?.objectLabel ?? '';
    // Keep proper nouns capitalised ("Mia's birthday") but lowercase common
    // nouns so they sit correctly inside a sentence.
    const [firstWord] = raw.split(' ');
    if (firstWord.includes('\u2019') || firstWord.includes("'")) return raw;
    return raw.charAt(0).toLowerCase() + raw.slice(1);
  };

  const planSentence =
    kind === 'balanced'
      ? `You gave ${label('spend')}, ${label('save')}, and ${label('give')} a place in your plan.`
      : `You gave ${label(kind)} the biggest place in your plan.`;

  const normalizedTakeaway = normalizePersonalResponse(takeaway ?? '');
  const takeawaySentenceByLabel: Record<string, string> = {
    'I do not need to spend everything':
      'You remembered that you do not need to spend everything.',
    'Saving helps future goals':
      'You remembered that saving helps future goals.',
    'Money can help other people':
      'You remembered that money can help other people.',
    'Balance depends on what matters':
      'You remembered that balance depends on what matters.',
  };

  if (!normalizedTakeaway) return planSentence;
  const takeawaySentence =
    takeawaySentenceByLabel[normalizedTakeaway] ??
    ensureSentence(`You remembered that ${normalizedTakeaway.charAt(0).toLowerCase()}${normalizedTakeaway.slice(1)}`);

  return `${planSentence} ${takeawaySentence}`;
}

function buildPersonalDetailSentence(
  summaryLead: string,
  response: string,
  suggestionId?: string,
): string {
  const lead = stripTerminalPunctuation(summaryLead);

  if (!response) return ensureSentence(lead);
  if (suggestionId === 'cannot-remember') {
    return 'You could not remember an example, and that is okay.';
  }

  const suggestionDetails: Record<string, string> = {
    'game-item': 'a game item was the example you shared',
    toy: 'a toy was the example you shared',
    sweets: 'some sweets were the example you shared',
    'something-bigger': 'you were already thinking about something bigger',
  };
  const suggestionDetail = suggestionId
    ? suggestionDetails[suggestionId]
    : undefined;
  if (suggestionDetail) return `${lead}, and ${suggestionDetail}.`;

  return buildTypedSummarySentence(response);
}

function buildPlanTakeawaySentence(
  planKind: MoneyPlanResponseKind,
  takeawayId?: string,
): string {
  if (takeawayId === 'not-spend-everything') {
    return planKind === 'spend'
      ? 'You kept more for football cards today without spending everything.'
      : 'Your plan showed that you did not need to spend everything.';
  }
  if (takeawayId === 'future-goals') {
    return planKind === 'save'
      ? 'You chose more for the headphones, showing that your future goal mattered.'
      : 'You still kept a place for the headphones because future goals matter to you.';
  }
  if (takeawayId === 'help-others') {
    return planKind === 'give'
      ? 'Your plan gave Mia an important place.'
      : 'Your plan kept a place for Mia because helping someone mattered to you.';
  }
  if (takeawayId === 'what-matters') {
    const observation: Record<MoneyPlanResponseKind, string> = {
      spend: 'Your plan gave football cards more room because today mattered to you.',
      save: 'Your plan gave the headphones more room because later mattered to you.',
      give: 'Your plan gave Mia more room because helping mattered to you.',
      balanced: 'Your plan made room for today, later, and Mia because each mattered.',
    };
    return observation[planKind];
  }

  const planObservation: Record<MoneyPlanResponseKind, string> = {
    spend: 'Your plan kept more room for football cards today.',
    save: 'Your plan kept more room for the headphones goal.',
    give: 'Your plan gave Mia’s birthday the most room.',
    balanced: 'Your plan made room for football cards, headphones, and Mia.',
  };
  return planObservation[planKind];
}

function buildTypedPersonalReference(value: string): string {
  const phrase = shortenPersonalPhrase(value);
  const converted = toSecondPersonPhrase(phrase);
  return converted
    ? ensureSentence(converted)
    : 'You shared something that mattered to you.';
}

function buildTypedSummarySentence(value: string): string {
  const phrase = shortenPersonalPhrase(value);
  const converted = toSecondPersonPhrase(phrase);
  return converted
    ? ensureSentence(converted)
    : 'You shared something that mattered to you.';
}

function shortenPersonalPhrase(value: string): string {
  const firstSentence = normalizePersonalResponse(value).split(/[.!?]/, 1)[0];
  const words = firstSentence
    .split(' ')
    .filter(Boolean)
    .slice(0, PERSONAL_REFERENCE_MAX_WORDS);
  return stripTerminalPunctuation(words.join(' '));
}

function toSecondPersonPhrase(value: string): string {
  const beginsInFirstPerson = /^(?:I\b|My\b)/i.test(value);
  let reference = value.replace(/^I am\b/i, 'You are');
  reference = reference.replace(/^I['’]m\b/i, "You're");
  reference = reference.replace(/^I was\b/i, 'You were');
  reference = reference.replace(/^I\b/i, 'You');
  reference = reference.replace(/^My\b/i, 'Your');
  reference = reference.replace(/\bI am\b/gi, 'you are');
  reference = reference.replace(/\bI['’]m\b/gi, "you're");
  reference = reference.replace(/\bI was\b/gi, 'you were');
  reference = reference.replace(/\bI\b/gi, 'you');
  reference = reference.replace(/\bmy\b/gi, 'your');

  if (beginsInFirstPerson) return reference;
  return reference ? `You mentioned ${lowercaseFirst(reference)}` : '';
}

function lowercaseFirst(value: string): string {
  return value.charAt(0).toLocaleLowerCase() + value.slice(1);
}

function stripTerminalPunctuation(value: string): string {
  return value.trim().replace(/[.!?]+$/, '');
}

function ensureSentence(value: string): string {
  return /[.!?]$/.test(value) ? value : `${value}.`;
}
