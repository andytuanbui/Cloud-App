import { getLocalDateKey, isValidLocalDateKey } from '../services/date/dateService';
import { isValidProfileAge, normalizeProfileName } from './profileValidation';
import {
  CURRENT_SCHEMA_VERSION,
  PersistedAppState,
  WisdomProgress,
} from './types';

const LOCAL_PROFILE_ID = 'local-child-profile';

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function optionalString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

export function createDefaultAppState(dateKey = getLocalDateKey()): PersistedAppState {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    profile: {
      id: LOCAL_PROFILE_ID,
      name: '',
      age: null,
      avatar: 'cloud',
      currentIdentity: 'Thoughtful Thinker',
      setupCompleted: false,
      setupCompletedAt: null,
      programStartedAt: null,
      programStartDateKey: null,
      lastOpenedDateKey: dateKey,
    },
    wisdomProgress: {},
  };
}

/**
 * Migrates both unversioned app state and earlier versioned state to schema v3.
 *
 * Wisdom progress is deliberately retained as an opaque record so partial steps,
 * responses, quiz state, and completion timestamps survive without normalization.
 * Pre-v3 profiles require one confirmation pass through setup. Existing program
 * metadata is retained; only installs that never had it receive a safe fallback.
 */
export function migrateAppState(
  saved: unknown,
  currentDateKey: string,
  now: Date = new Date(),
): PersistedAppState {
  const defaults = createDefaultAppState(currentDateKey);
  const savedState = asRecord(saved);
  if (Object.keys(savedState).length === 0) return defaults;
  const savedVersion = savedState.schemaVersion;
  if (
    typeof savedVersion === 'number' &&
    Number.isInteger(savedVersion) &&
    savedVersion > CURRENT_SCHEMA_VERSION
  ) {
    throw new Error(`Unsupported CloudWise state schema version: ${savedVersion}`);
  }

  const savedProfile = asRecord(savedState.profile);
  const savedProgress = asRecord(savedState.wisdomProgress) as Record<string, WisdomProgress>;
  const hasWisdomProgress = Object.keys(savedProgress).length > 0;
  const hadSetupFlag = typeof savedProfile.setupCompleted === 'boolean';
  const savedName = typeof savedProfile.name === 'string' ? savedProfile.name : '';
  const savedAge =
    typeof savedProfile.age === 'number' && Number.isFinite(savedProfile.age)
      ? savedProfile.age
      : null;
  const profileDetailsAreValid =
    normalizeProfileName(savedName).length > 0 &&
    normalizeProfileName(savedName).length <= 24 &&
    isValidProfileAge(savedAge);
  const setupCompleted = savedProfile.setupCompleted === true && profileDetailsAreValid;
  const candidateProgramStartDateKey = optionalString(savedProfile.programStartDateKey);
  const savedProgramStartDateKey =
    candidateProgramStartDateKey && isValidLocalDateKey(candidateProgramStartDateKey)
      ? candidateProgramStartDateKey
      : null;
  const needsProgramFallback =
    savedProgramStartDateKey === null && (hasWisdomProgress || setupCompleted);
  const programStartDateKey = savedProgramStartDateKey ??
    (needsProgramFallback ? currentDateKey : null);
  const savedProgramStartedAt = optionalString(savedProfile.programStartedAt);
  const programStartedAt = savedProgramStartedAt ??
    (programStartDateKey ? now.toISOString() : null);

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    profile: {
      id: optionalString(savedProfile.id) ?? LOCAL_PROFILE_ID,
      name: savedName,
      age: savedAge,
      avatar: optionalString(savedProfile.avatar) ?? defaults.profile.avatar,
      currentIdentity:
        optionalString(savedProfile.currentIdentity) ?? defaults.profile.currentIdentity,
      setupCompleted: hadSetupFlag ? setupCompleted : false,
      setupCompletedAt: setupCompleted
        ? optionalString(savedProfile.setupCompletedAt) ?? now.toISOString()
        : null,
      programStartedAt,
      programStartDateKey,
      lastOpenedDateKey: currentDateKey,
    },
    wisdomProgress: savedProgress,
  };
}
