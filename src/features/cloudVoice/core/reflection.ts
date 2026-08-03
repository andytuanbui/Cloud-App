import { minimizeTextForSafety, redactSensitiveText } from './safety';
import {
  CLOUD_VOICE_SAFETY_CATEGORIES,
  type CloudVoiceReflection,
  type CloudVoiceReflectionParseResult,
  type CloudVoiceSafetyCategory,
} from './types';

export const CLOUD_VOICE_REFLECTION_LIMITS = {
  summary: 240,
  childExample: 180,
  cloudInsight: 180,
  authoredChoiceId: 80,
} as const;

export function parseCloudVoiceReflection(
  input: unknown,
): CloudVoiceReflectionParseResult {
  if (!isRecord(input)) {
    return { ok: false, issues: ['Reflection must be an object.'] };
  }

  const issues: string[] = [];
  const safetyStatus = readSafetyStatus(input.safetyStatus, issues);
  const summary = readRequiredText(
    input.summary,
    'summary',
    CLOUD_VOICE_REFLECTION_LIMITS.summary,
    issues,
  );
  const rawChildExample = readRequiredText(
    input.childExample,
    'childExample',
    CLOUD_VOICE_REFLECTION_LIMITS.childExample,
    issues,
  );
  const cloudInsight = readRequiredText(
    input.cloudInsight,
    'cloudInsight',
    CLOUD_VOICE_REFLECTION_LIMITS.cloudInsight,
    issues,
  );
  const confidence = readConfidence(input.confidence, issues);
  const authoredChoiceId = readAuthoredChoiceId(
    input.authoredChoiceId,
    issues,
  );

  if (
    issues.length > 0 ||
    safetyStatus === undefined ||
    summary === undefined ||
    rawChildExample === undefined ||
    cloudInsight === undefined ||
    confidence === undefined
  ) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    value: {
      summary: minimizeTextForSafety(summary, safetyStatus),
      childExample: minimizeTextForSafety(rawChildExample, safetyStatus),
      cloudInsight: minimizeTextForSafety(cloudInsight, safetyStatus),
      confidence: Math.round(confidence * 100) / 100,
      safetyStatus,
      ...(authoredChoiceId ? { authoredChoiceId } : {}),
    },
  };
}

export function normalizeCloudVoiceReflection(
  input: CloudVoiceReflection,
): CloudVoiceReflection {
  const result = parseCloudVoiceReflection(input);
  if (!result.ok) {
    throw new Error(`Invalid Cloud voice reflection: ${result.issues.join(' ')}`);
  }
  return result.value;
}

export function isCloudVoiceReflection(
  input: unknown,
): input is CloudVoiceReflection {
  return parseCloudVoiceReflection(input).ok;
}

export function isCompleteCloudVoiceReflection(
  reflection: CloudVoiceReflection,
): boolean {
  if (reflection.safetyStatus !== 'safe') return true;
  const normalizedExample = reflection.childExample.trim().toLowerCase();
  return (
    reflection.confidence >= 0.4 &&
    normalizedExample.length > 0 &&
    normalizedExample !== 'no personal example was shared.' &&
    !normalizedExample.startsWith('no personal example')
  );
}

function readRequiredText(
  value: unknown,
  field: string,
  maximumLength: number,
  issues: string[],
): string | undefined {
  if (typeof value !== 'string') {
    issues.push(`${field} must be a string.`);
    return undefined;
  }
  const normalized = truncate(value.replace(/\s+/g, ' ').trim(), maximumLength);
  if (!normalized) {
    issues.push(`${field} cannot be empty.`);
    return undefined;
  }
  return normalized;
}

function readConfidence(value: unknown, issues: string[]): number | undefined {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > 1
  ) {
    issues.push('confidence must be a finite number from 0 through 1.');
    return undefined;
  }
  return value;
}

function readSafetyStatus(
  value: unknown,
  issues: string[],
): CloudVoiceSafetyCategory | undefined {
  if (
    typeof value !== 'string' ||
    !CLOUD_VOICE_SAFETY_CATEGORIES.some((category) => category === value)
  ) {
    issues.push('safetyStatus must be a supported non-diagnostic category.');
    return undefined;
  }
  return value as CloudVoiceSafetyCategory;
}

function readAuthoredChoiceId(
  value: unknown,
  issues: string[],
): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') {
    issues.push('authoredChoiceId must be a string when provided.');
    return undefined;
  }
  const normalized = value.trim();
  if (
    !normalized ||
    normalized.length > CLOUD_VOICE_REFLECTION_LIMITS.authoredChoiceId ||
    !/^[A-Za-z0-9_-]+$/.test(normalized)
  ) {
    issues.push(
      'authoredChoiceId must use 1-80 letters, numbers, underscores, or hyphens.',
    );
    return undefined;
  }
  return normalized;
}

function truncate(value: string, maximumLength: number): string {
  const characters = Array.from(value);
  return characters.length <= maximumLength
    ? value
    : characters.slice(0, maximumLength).join('').trimEnd();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
