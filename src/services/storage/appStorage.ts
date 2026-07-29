import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PersistedAppState } from '../../state/types';

const STORAGE_KEY = '@cloudwise/app-state/v1';

export async function loadAppState(): Promise<PersistedAppState | null> {
  const value = await AsyncStorage.getItem(STORAGE_KEY);
  if (!value) return null;
  try {
    return JSON.parse(value) as PersistedAppState;
  } catch {
    return null;
  }
}

export async function saveAppState(state: PersistedAppState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function clearAppState(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
