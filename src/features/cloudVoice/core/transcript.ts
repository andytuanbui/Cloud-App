import { assessCloudVoiceSafety, minimizeTextForSafety } from './safety';
import type {
  CloudVoiceSafetyCategory,
  CloudVoiceTranscriptEntry,
  CloudVoiceTranscriptRole,
  EphemeralCloudVoiceTranscript,
} from './types';

export const DEFAULT_TRANSCRIPT_MAX_ENTRIES = 12;
export const DEFAULT_TRANSCRIPT_MAX_CHARACTERS = 1_200;
export const DEFAULT_TRANSCRIPT_MAX_ENTRY_CHARACTERS = 320;

export type EphemeralTranscriptOptions = {
  maxEntries?: number;
  maxCharacters?: number;
  maxEntryCharacters?: number;
};

export type AppendTranscriptInput = {
  role: CloudVoiceTranscriptRole;
  text: string;
  createdAtMs: number;
  final?: boolean;
  safetyStatus?: CloudVoiceSafetyCategory;
};

export function createEphemeralCloudVoiceTranscript(
  options: EphemeralTranscriptOptions = {},
): EphemeralCloudVoiceTranscript {
  return {
    entries: [],
    nextSequence: 1,
    maxEntries: positiveWholeNumber(
      options.maxEntries,
      DEFAULT_TRANSCRIPT_MAX_ENTRIES,
    ),
    maxCharacters: positiveWholeNumber(
      options.maxCharacters,
      DEFAULT_TRANSCRIPT_MAX_CHARACTERS,
    ),
    maxEntryCharacters: positiveWholeNumber(
      options.maxEntryCharacters,
      DEFAULT_TRANSCRIPT_MAX_ENTRY_CHARACTERS,
    ),
  };
}

export function appendEphemeralTranscript(
  transcript: EphemeralCloudVoiceTranscript,
  input: AppendTranscriptInput,
): EphemeralCloudVoiceTranscript {
  const safetyStatus =
    input.safetyStatus ?? assessCloudVoiceSafety(input.text).category;
  const maximumEntryLength = Math.min(
    transcript.maxEntryCharacters,
    transcript.maxCharacters,
  );
  const privacySafeText = truncateByCodePoint(
    minimizeTextForSafety(input.text, safetyStatus),
    maximumEntryLength,
  );
  if (!privacySafeText) return transcript;

  const entry: CloudVoiceTranscriptEntry = {
    id: `voice-transcript-${transcript.nextSequence}`,
    role: input.role,
    text: privacySafeText,
    createdAtMs: input.createdAtMs,
    final: input.final ?? true,
    safetyStatus,
  };
  const entries = [...transcript.entries, entry];

  while (
    entries.length > transcript.maxEntries ||
    transcriptCharacterCount(entries) > transcript.maxCharacters
  ) {
    entries.shift();
  }

  return {
    ...transcript,
    entries,
    nextSequence: transcript.nextSequence + 1,
  };
}

export function clearEphemeralCloudVoiceTranscript(
  transcript: EphemeralCloudVoiceTranscript,
): EphemeralCloudVoiceTranscript {
  return {
    ...transcript,
    entries: [],
    nextSequence: 1,
  };
}

export function transcriptCharacterCount(
  entries: CloudVoiceTranscriptEntry[],
): number {
  return entries.reduce((total, entry) => total + Array.from(entry.text).length, 0);
}

function truncateByCodePoint(value: string, maximumLength: number): string {
  const codePoints = Array.from(value);
  if (codePoints.length <= maximumLength) return value;
  if (maximumLength <= 1) return codePoints.slice(0, maximumLength).join('');
  return `${codePoints.slice(0, maximumLength - 1).join('').trimEnd()}…`;
}

function positiveWholeNumber(
  value: number | undefined,
  fallback: number,
): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? Math.max(1, Math.floor(value))
    : fallback;
}
