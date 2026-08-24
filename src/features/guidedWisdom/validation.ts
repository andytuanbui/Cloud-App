import type { GuidedWisdomDefinition, WisdomDefinitionIssue } from './types';
import { guidedStageOrder } from './types';

/**
 * Definition validation.
 *
 * Runs over the registry in development so a malformed Wisdom is caught at
 * startup with the Wisdom id and field named, rather than surfacing as a blank
 * stage in front of a child.
 */

function issue(
  wisdomId: string,
  field: string,
  message: string,
): WisdomDefinitionIssue {
  return { wisdomId, field, message };
}

export function validateWisdomDefinition(
  definition: GuidedWisdomDefinition,
): WisdomDefinitionIssue[] {
  const issues: WisdomDefinitionIssue[] = [];
  const { id, content, allocation } = definition;

  if (!id) issues.push(issue('(unknown)', 'id', 'Wisdom id is required.'));
  if (content.id !== id) {
    issues.push(
      issue(id, 'content.id', `Content id "${content.id}" does not match "${id}".`),
    );
  }
  if (!content.title?.trim()) {
    issues.push(issue(id, 'content.title', 'Title is required.'));
  }
  if (!content.category?.trim()) {
    issues.push(issue(id, 'content.category', 'Category is required.'));
  }
  if (!(content.estimatedMinutes > 0)) {
    issues.push(
      issue(id, 'content.estimatedMinutes', 'Estimated minutes must be above zero.'),
    );
  }
  if (!content.artwork) {
    issues.push(issue(id, 'content.artwork', 'Artwork asset is missing.'));
  }

  // Stages
  if (!content.introduction?.trim()) {
    issues.push(issue(id, 'content.introduction', 'Welcome content is required.'));
  }
  if (!content.storyVisuals?.length) {
    issues.push(issue(id, 'content.storyVisuals', 'At least one story visual is required.'));
  }
  const storyVisualIds = new Set<string>();
  content.storyVisuals?.forEach((visual, index) => {
    if (!visual.id?.trim()) {
      issues.push(issue(id, `content.storyVisuals[${index}].id`, 'Visual id is required.'));
    } else if (storyVisualIds.has(visual.id)) {
      issues.push(
        issue(id, `content.storyVisuals[${index}].id`, `Duplicate visual id "${visual.id}".`),
      );
    }
    storyVisualIds.add(visual.id);
    if (!visual.visualLabel?.trim()) {
      issues.push(
        issue(id, `content.storyVisuals[${index}].visualLabel`, 'Visual label is required.'),
      );
    }
    if (!visual.artwork) {
      issues.push(
        issue(id, `content.storyVisuals[${index}].artwork`, 'Visual artwork asset is missing.'),
      );
    }
  });
  if (!content.storyBeats?.length) {
    issues.push(issue(id, 'content.storyBeats', 'At least one story beat is required.'));
  }
  const storyBeatIds = new Set<string>();
  content.storyBeats?.forEach((beat, index) => {
    if (!beat.id?.trim()) {
      issues.push(issue(id, `content.storyBeats[${index}].id`, 'Beat id is required.'));
    } else if (storyBeatIds.has(beat.id)) {
      issues.push(
        issue(id, `content.storyBeats[${index}].id`, `Duplicate beat id "${beat.id}".`),
      );
    }
    storyBeatIds.add(beat.id);
    if (!beat.text?.trim()) {
      issues.push(issue(id, `content.storyBeats[${index}].text`, 'Beat text is required.'));
    }
    if (!beat.narrationText?.trim()) {
      issues.push(
        issue(id, `content.storyBeats[${index}].narrationText`, 'Beat narration is required.'),
      );
    }
    if (!storyVisualIds.has(beat.visualId)) {
      issues.push(
        issue(
          id,
          `content.storyBeats[${index}].visualId`,
          `Unknown story visual "${beat.visualId}".`,
        ),
      );
    }
  });
  if (!content.reflection?.question?.trim()) {
    issues.push(issue(id, 'content.reflection.question', 'Talk with Cloud question is required.'));
  }
  if (!content.reflection?.choices?.length) {
    issues.push(issue(id, 'content.reflection.choices', 'At least one response choice is required.'));
  }
  if (!content.takeaway?.choices?.length) {
    issues.push(issue(id, 'content.takeaway.choices', 'At least one takeaway option is required.'));
  }
  if (!content.practice?.cardText?.trim()) {
    issues.push(issue(id, 'content.practice.cardText', 'Practice instruction is required.'));
  }
  if (!content.completion?.title?.trim()) {
    issues.push(issue(id, 'content.completion.title', 'Completion configuration is required.'));
  }

  // Allocation rules
  if (!(allocation.increment > 0)) {
    issues.push(issue(id, 'allocation.increment', 'Increment must be above zero.'));
  }
  if (!(allocation.totalUnits > 0)) {
    issues.push(issue(id, 'allocation.totalUnits', 'Total units must be above zero.'));
  }
  if (
    allocation.increment > 0 &&
    allocation.totalUnits % allocation.increment !== 0
  ) {
    issues.push(
      issue(
        id,
        'allocation.totalUnits',
        `Total ${allocation.totalUnits} is not divisible by increment ${allocation.increment}.`,
      ),
    );
  }
  if (!allocation.destinations?.length) {
    issues.push(issue(id, 'allocation.destinations', 'At least one destination is required.'));
  }
  if (!allocation.unitSuffix?.trim()) {
    issues.push(issue(id, 'allocation.unitSuffix', 'Unit suffix is required.'));
  }

  const destinationIds = new Set<string>();
  allocation.destinations?.forEach((destination, index) => {
    if (destinationIds.has(destination.id)) {
      issues.push(
        issue(id, `allocation.destinations[${index}].id`, `Duplicate destination id "${destination.id}".`),
      );
    }
    destinationIds.add(destination.id);
    if (!destination.objectLabel?.trim()) {
      issues.push(
        issue(id, `allocation.destinations[${index}].objectLabel`, 'Object label is required.'),
      );
    }
  });

  const minimumTotal = (allocation.destinations ?? []).reduce(
    (sum, destination) => sum + (destination.minimumUnits ?? 0),
    0,
  );
  if (minimumTotal > allocation.totalUnits) {
    issues.push(
      issue(
        id,
        'allocation.destinations',
        `Minimums add up to ${minimumTotal}, above the total of ${allocation.totalUnits}.`,
      ),
    );
  }

  // Stage ordering is fixed by the engine; guard against content drift.
  if (guidedStageOrder.length !== 6) {
    issues.push(issue(id, 'stages', 'Guided stage order must contain six stages.'));
  }

  return issues;
}

/** Validates a whole registry, including duplicate ids across definitions. */
export function validateWisdomRegistry(
  definitions: readonly GuidedWisdomDefinition[],
): WisdomDefinitionIssue[] {
  const issues: WisdomDefinitionIssue[] = [];
  const seen = new Set<string>();

  for (const definition of definitions) {
    if (seen.has(definition.id)) {
      issues.push(issue(definition.id, 'id', `Duplicate Wisdom id "${definition.id}".`));
    }
    seen.add(definition.id);
    issues.push(...validateWisdomDefinition(definition));
  }

  return issues;
}

export function formatIssues(issues: readonly WisdomDefinitionIssue[]): string {
  return issues
    .map((item) => `[${item.wisdomId}] ${item.field}: ${item.message}`)
    .join('\n');
}
