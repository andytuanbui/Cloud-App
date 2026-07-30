import { getLocalDateKey } from '../services/date/dateService';
import { PersistedAppState } from './types';

export function createDefaultAppState(dateKey = getLocalDateKey()): PersistedAppState {
  return {
    profile: {
      id: 'alex',
      name: 'Alex',
      age: 10,
      avatar: 'cloud',
      currentIdentity: 'Thoughtful Thinker',
      programStartedAt: new Date().toISOString(),
      programStartDateKey: dateKey,
      lastOpenedDateKey: dateKey,
    },
    wisdomProgress: {},
  };
}

// v1 installs predate program metadata. Their Wisdom progress is copied intact,
// while the current local day becomes Day 0 so Needs vs Wants stays first.
export function migrateAppState(
  saved: Partial<PersistedAppState> | null,
  currentDateKey: string,
): PersistedAppState {
  const defaults = createDefaultAppState(currentDateKey);
  if (!saved) return defaults;

  return {
    profile: {
      ...defaults.profile,
      ...saved.profile,
      programStartedAt: saved.profile?.programStartedAt ?? defaults.profile.programStartedAt,
      programStartDateKey: saved.profile?.programStartDateKey ?? currentDateKey,
      lastOpenedDateKey: currentDateKey,
    },
    wisdomProgress: saved.wisdomProgress ?? {},
  };
}
