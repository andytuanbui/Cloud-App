import {
  type GuidedScreenId,
  type GuidedStageId,
  type GuidedWisdomProgressRecord,
  type GuidedWisdomStatus,
  guidedStageOrder,
} from './types';

/**
 * Stage sequencing for every Guided Wisdom.
 *
 * The flow asks the engine where it is and where it can go, so a new Wisdom
 * never needs its own navigation code or route.
 */

const stageLabels: Record<GuidedScreenId, string> = {
  welcome: 'Welcome',
  story: 'Story',
  talk: 'Talk with Cloud',
  choice: 'Your Choice',
  takeaway: 'Takeaway',
  practice: 'Practice',
  completion: 'Completion',
};

export const totalGuidedStages = guidedStageOrder.length;

export function isGuidedStage(screen: GuidedScreenId): screen is GuidedStageId {
  return (guidedStageOrder as readonly string[]).includes(screen);
}

export function getStageLabel(screen: GuidedScreenId): string {
  return stageLabels[screen];
}

/** 1-based position, or `totalGuidedStages` once the child has completed. */
export function getStageNumber(screen: GuidedScreenId): number {
  if (!isGuidedStage(screen)) return totalGuidedStages;
  return guidedStageOrder.indexOf(screen) + 1;
}

export function getNextScreen(screen: GuidedScreenId): GuidedScreenId | undefined {
  if (!isGuidedStage(screen)) return undefined;
  const next = guidedStageOrder[guidedStageOrder.indexOf(screen) + 1];
  return next ?? 'completion';
}

export function getPreviousScreen(
  screen: GuidedScreenId,
): GuidedScreenId | undefined {
  if (screen === 'completion') return 'practice';
  const index = guidedStageOrder.indexOf(screen as GuidedStageId);
  if (index <= 0) return undefined;
  return guidedStageOrder[index - 1];
}

/**
 * Story scenes step within the story stage before the stage itself advances,
 * so scene position is resolved separately from stage position.
 */
export function getNextStoryScene(
  sceneIndex: number,
  sceneCount: number,
): { sceneIndex: number; advanceStage: boolean } {
  if (sceneIndex + 1 < sceneCount) {
    return { sceneIndex: sceneIndex + 1, advanceStage: false };
  }
  return { sceneIndex, advanceStage: true };
}

export function getPreviousStoryScene(
  sceneIndex: number,
): { sceneIndex: number; returnToWelcome: boolean } {
  if (sceneIndex > 0) return { sceneIndex: sceneIndex - 1, returnToWelcome: false };
  return { sceneIndex: 0, returnToWelcome: true };
}

/**
 * A learned Wisdom that is open again is `reviewing`, not `in-progress`: the
 * distinction is what keeps the permanent learned state visible on the cards
 * while a fresh review runs.
 */
export function getWisdomStatus(
  progress?: Pick<GuidedWisdomProgressRecord, 'started' | 'learned' | 'reviewing'>,
): GuidedWisdomStatus {
  if (!progress || (!progress.started && !progress.learned)) return 'new';
  if (progress.learned) return progress.reviewing ? 'reviewing' : 'learned';
  return 'in-progress';
}
