import type { GuidedStoryBeat } from '../../content/wisdoms';

/** Deliberate read-aloud pace for clear narration to children aged 8–11. */
export const STORY_NARRATION_WORDS_PER_MINUTE = 110;

export type StoryDurationEstimate = {
  wordCount: number;
  wordsPerMinute: number;
  seconds: number;
  minutes: number;
};

/** Counts spoken words consistently across punctuation and curly apostrophes. */
export function countNarrationWords(text: string): number {
  return text.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu)?.length ?? 0;
}

/**
 * Estimates authored Story narration only. UI copy and time spent choosing are
 * excluded so the same production content always produces the same result.
 */
export function estimateStoryDuration(
  beats: readonly Pick<GuidedStoryBeat, 'narrationText'>[],
  wordsPerMinute = STORY_NARRATION_WORDS_PER_MINUTE,
): StoryDurationEstimate {
  if (!Number.isFinite(wordsPerMinute) || wordsPerMinute <= 0) {
    throw new Error('Story narration rate must be above zero.');
  }

  const wordCount = beats.reduce(
    (total, beat) => total + countNarrationWords(beat.narrationText),
    0,
  );
  const seconds = Math.round((wordCount / wordsPerMinute) * 60);

  return {
    wordCount,
    wordsPerMinute,
    seconds,
    minutes: seconds / 60,
  };
}
