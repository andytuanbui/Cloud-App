import { validateProfileDetails } from './profileValidation';
import type { PersistedAppState, ProfileDetails } from './types';

export function applyProfileDraft(
  state: PersistedAppState,
  update: Partial<ProfileDetails>,
): PersistedAppState {
  return { ...state, profile: { ...state.profile, ...update } };
}

export function completeProfileSetupState(
  state: PersistedAppState,
  details: ProfileDetails,
  currentDateKey: string,
  completedAt = new Date().toISOString(),
): PersistedAppState | null {
  const validation = validateProfileDetails(details.name, details.age);
  if (!validation.valid) return null;

  return {
    ...state,
    profile: {
      ...state.profile,
      ...validation.value,
      setupCompleted: true,
      setupCompletedAt: state.profile.setupCompletedAt ?? completedAt,
      programStartedAt: state.profile.programStartedAt ?? completedAt,
      programStartDateKey: state.profile.programStartDateKey ?? currentDateKey,
      lastOpenedDateKey: currentDateKey,
    },
  };
}

export function updateProfileState(
  state: PersistedAppState,
  details: ProfileDetails,
): PersistedAppState | null {
  const validation = validateProfileDetails(details.name, details.age);
  if (!validation.valid) return null;
  return {
    ...state,
    profile: { ...state.profile, ...validation.value },
  };
}
