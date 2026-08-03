import type { GuidedWisdomSessionUpdate } from '../../../state/types';
import type { CloudVoiceReflection } from '../core/types';

export function buildGuidedUpdateFromVoiceReflection(
  reflection: CloudVoiceReflection,
  authoredChoiceIds: readonly string[],
): GuidedWisdomSessionUpdate {
  const selectedReflectionAnswer = authoredChoiceIds.includes(
    reflection.authoredChoiceId ?? '',
  )
    ? reflection.authoredChoiceId
    : authoredChoiceIds.includes('not-sure')
      ? 'not-sure'
      : authoredChoiceIds[0];
  const childExample = reflection.childExample.trim() || reflection.summary.trim();
  const cloudInsight = reflection.cloudInsight.trim() || reflection.summary.trim();

  return {
    selectedReflectionAnswer,
    personalResponse: {
      source: 'voice',
      text: childExample.slice(0, 160),
    },
    adaptiveResponse: cloudInsight.slice(0, 240),
    voiceReflection: {
      summary: reflection.summary.trim().slice(0, 240),
      childExample: childExample.slice(0, 160),
      cloudInsight: cloudInsight.slice(0, 240),
      confidence: confidenceLabel(reflection.confidence),
      safetyStatus: reflection.safetyStatus,
    },
    personalizedSummary: '',
  };
}
function confidenceLabel(value: number): 'low' | 'medium' | 'high' {
  if (value >= 0.75) return 'high';
  if (value >= 0.4) return 'medium';
  return 'low';
}
