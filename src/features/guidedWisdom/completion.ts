import { evaluateMoneyPlan } from '../../services/guidedWisdomResponseService';
import type { GuidedWisdomDefinition, GuidedWisdomProgressRecord } from './types';

/**
 * Completion copy generated from the Wisdom definition and the child's saved
 * progress.
 *
 * No object name, amount or remembered thought is written here — every phrase
 * is assembled from the definition's destinations and takeaway options, so a
 * new Wisdom produces its own recognition without touching this file.
 */

export type CompletionPlanEntry = {
  destinationId: string;
  objectLabel: string;
  units: number;
};

export type CompletionSummary = {
  /** Amounts to show in the plan recap, in definition order. */
  plan: readonly CompletionPlanEntry[];
  /** The thought the child chose to keep, if any. */
  takeaway?: string;
  /** Two short sentences of recognition. */
  message: string;
};

/**
 * Turns a takeaway label into something Cloud can say back.
 *
 * Options are authored in the child's voice ("I do not need to spend
 * everything"), so first person is shifted to second before it is echoed.
 */
function echoTakeaway(label: string): string {
  const trimmed = label.trim();
  if (!trimmed) return '';
  if (/^I\s/.test(trimmed)) {
    return `you ${trimmed.slice(2)}`;
  }
  return trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
}

function resolveTakeawayLabel(
  definition: GuidedWisdomDefinition,
  progress: Pick<
    GuidedWisdomProgressRecord,
    'selectedTakeawayId' | 'writtenTakeaway'
  >,
): string | undefined {
  if (progress.writtenTakeaway?.trim()) return progress.writtenTakeaway.trim();
  if (!progress.selectedTakeawayId) return undefined;
  return definition.content.takeaway.choices.find(
    (choice) => choice.id === progress.selectedTakeawayId,
  )?.label;
}

/**
 * Proper nouns keep their capital ("Mia's birthday"); common nouns are
 * lowercased so they read correctly inside a sentence.
 */
function inSentence(objectLabel: string): string {
  const [firstWord] = objectLabel.split(' ');
  if (firstWord.includes('’') || firstWord.includes("'")) return objectLabel;
  return objectLabel.charAt(0).toLowerCase() + objectLabel.slice(1);
}

export function buildCompletionSummary(
  definition: GuidedWisdomDefinition,
  progress: Pick<
    GuidedWisdomProgressRecord,
    'allocation' | 'selectedTakeawayId' | 'writtenTakeaway'
  >,
): CompletionSummary {
  const { allocation, content } = definition;

  const plan: CompletionPlanEntry[] = allocation.destinations.map(
    (destination) => ({
      destinationId: destination.id,
      objectLabel: destination.objectLabel,
      units: progress.allocation[destination.id] ?? 0,
    }),
  );

  // Emphasis reuses the approved plan evaluation so recognition and Cloud's
  // in-flow response can never drift apart.
  const { kind } = evaluateMoneyPlan(
    {
      spend: progress.allocation.spend ?? 0,
      save: progress.allocation.save ?? 0,
      give: progress.allocation.give ?? 0,
    },
    content.decision,
  );

  const labels = plan.map((entry) => inSentence(entry.objectLabel));
  const planSentence =
    kind === 'balanced' || labels.length < 2
      ? `You gave ${formatList(labels)} a place in your plan.`
      : `You gave ${inSentence(
          allocation.destinations.find((item) => item.id === kind)
            ?.objectLabel ?? labels[0],
        )} the biggest place in your plan.`;

  const takeaway = resolveTakeawayLabel(definition, progress);
  const takeawaySentence = takeaway
    ? `You remembered that ${echoTakeaway(takeaway)}.`
    : '';

  return {
    plan,
    takeaway,
    message: takeawaySentence ? `${planSentence} ${takeawaySentence}` : planSentence,
  };
}

function formatList(items: readonly string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}
