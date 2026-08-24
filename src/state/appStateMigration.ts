import { getLocalDateKey, isValidLocalDateKey } from '../services/date/dateService';
import { isValidProfileAge, normalizeProfileName } from './profileValidation';
import {
  CURRENT_GUIDED_WISDOM_SESSION_VERSION,
  CURRENT_SCHEMA_VERSION,
  GuidedWisdomSession,
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

function nonNegativeInteger(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
    ? value
    : null;
}

/** First new narrative beat associated with each legacy WIS-MONEY-001 scene. */
const moneyStoryBeatByLegacyScene = [0, 3, 5, 8, 9, 10] as const;

/** Preserves the child's narrative position across the scene-to-beat model. */
function migrateGuidedSession(
  value: unknown,
  wisdomId: string,
): GuidedWisdomSession | undefined {
  const session = asRecord(value);
  if (Object.keys(session).length === 0) return undefined;

  const savedBeat = nonNegativeInteger(session.currentStoryBeat);
  const savedScene = nonNegativeInteger(session.currentStoryScene);
  const currentStoryBeat = savedBeat ??
    (wisdomId === 'three-ways-to-use-money' && savedScene !== null
      ? moneyStoryBeatByLegacyScene[savedScene] ?? savedScene
      : savedScene) ??
    0;

  return {
    ...session,
    version: CURRENT_GUIDED_WISDOM_SESSION_VERSION,
    currentStoryBeat,
  } as GuidedWisdomSession;
}

function migrateWisdomProgress(
  savedProgress: Record<string, unknown>,
): Record<string, WisdomProgress> {
  return Object.fromEntries(
    Object.entries(savedProgress).map(([wisdomId, savedValue]) => {
      const progress = asRecord(savedValue);

      const savedCompletionCount = nonNegativeInteger(progress.completionCount) ?? 0;
      const isCompleted =
        progress.isCompleted === true ||
        progress.completed === true ||
        savedCompletionCount > 0;
      const completionCount = isCompleted
        ? Math.max(1, savedCompletionCount)
        : 0;
      const guidedSession = migrateGuidedSession(progress.guidedSession, wisdomId);
      const lastCompletedGuidedSession = migrateGuidedSession(
        progress.lastCompletedGuidedSession,
        wisdomId,
      );
      const completedGuidedSession =
        lastCompletedGuidedSession
          ? lastCompletedGuidedSession
          : guidedSession?.completed === true
            ? guidedSession
            : undefined;

      return [
        wisdomId,
        {
          ...progress,
          wisdomId: optionalString(progress.wisdomId) ?? wisdomId,
          isCompleted,
          completed: isCompleted,
          completionCount,
          completedAt: optionalString(progress.completedAt) ?? undefined,
          lastReviewedAt: optionalString(progress.lastReviewedAt) ?? undefined,
          guidedSession,
          lastCompletedGuidedSession: completedGuidedSession,
        } as WisdomProgress,
      ];
    }),
  );
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
 * Migrates both unversioned app state and earlier versioned state to schema v6.
 *
 * Wisdom progress keeps all existing fields while permanent completion metadata is
 * normalized, so partial steps, responses, quiz state, and timestamps survive.
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
  const savedProgress = asRecord(savedState.wisdomProgress);
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
    wisdomProgress: migrateWisdomProgress(savedProgress),
  };
}
