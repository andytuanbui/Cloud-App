import type { ProfileDetails } from './types';

export const MIN_PROFILE_AGE = 5;
export const MAX_PROFILE_AGE = 18;
export const MAX_PROFILE_NAME_LENGTH = 24;

export type ProfileValidationResult =
  | { valid: true; value: ProfileDetails }
  | { valid: false; nameError?: string; ageError?: string };

export function normalizeProfileName(name: string): string {
  return name.trim();
}

export function getProfileNameError(name: string): string | undefined {
  const normalized = normalizeProfileName(name);
  if (!normalized) return 'Enter a first name or nickname.';
  if (normalized.length > MAX_PROFILE_NAME_LENGTH) {
    return `Use ${MAX_PROFILE_NAME_LENGTH} characters or fewer.`;
  }
  return undefined;
}

export function isValidProfileAge(age: number | null): age is number {
  return (
    age !== null &&
    Number.isInteger(age) &&
    age >= MIN_PROFILE_AGE &&
    age <= MAX_PROFILE_AGE
  );
}

export function validateProfileDetails(
  name: string,
  age: number | null,
): ProfileValidationResult {
  const nameError = getProfileNameError(name);
  if (nameError) return { valid: false, nameError };
  if (!isValidProfileAge(age)) {
    return { valid: false, ageError: 'Choose an age from 5 through 18.' };
  }
  return { valid: true, value: { name: normalizeProfileName(name), age } };
}

export function getProfileGreeting(name: string, date: Date = new Date()): string {
  const normalized = normalizeProfileName(name);
  if (getProfileNameError(normalized)) return 'Good to see you.';
  const hour = date.getHours();
  const period = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  return `Good ${period}, ${normalized}.`;
}
