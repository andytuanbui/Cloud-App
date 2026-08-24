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
 * Story beats step within the story stage before the stage itself advances,
 * so narrative position is resolved separately from visual-scene position.
 */
export function getNextStoryBeat(
  beatIndex: number,
  beatCount: number,
): { beatIndex: number; advanceStage: boolean } {
  if (beatIndex + 1 < beatCount) {
    return { beatIndex: beatIndex + 1, advanceStage: false };
  }
  return { beatIndex, advanceStage: true };
}

export function getPreviousStoryBeat(
  beatIndex: number,
): { beatIndex: number; returnToWelcome: boolean } {
  if (beatIndex > 0) return { beatIndex: beatIndex - 1, returnToWelcome: false };
  return { beatIndex: 0, returnToWelcome: true };
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
