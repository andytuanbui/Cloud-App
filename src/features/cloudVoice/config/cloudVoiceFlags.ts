import { Platform } from 'react-native';

function readBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === '') return fallback;
  return value.toLowerCase() === 'true' || value === '1';
}

function trimServerUrl(value: string | undefined): string {
  const candidate = value?.trim() || 'http://localhost:8787';
  return candidate.replace(/\/$/, '');
}

/**
 * Only EXPO_PUBLIC values belong here. Model names, voices, and the API key are
 * intentionally server-owned so they never enter the Metro bundle.
 */
export const cloudVoiceFlags = Object.freeze({
  cloudVoiceEnabled: readBoolean(
    process.env.EXPO_PUBLIC_CLOUD_VOICE_ENABLED,
    true,
  ),
  cloudRealtimeConversationEnabled: readBoolean(
    process.env.EXPO_PUBLIC_CLOUD_REALTIME_CONVERSATION_ENABLED,
    true,
  ),
  cloudAiNarrationEnabled: readBoolean(
    process.env.EXPO_PUBLIC_CLOUD_AI_NARRATION_ENABLED,
    true,
  ),
  cloudVoiceMockMode: readBoolean(
    process.env.EXPO_PUBLIC_CLOUD_VOICE_MOCK_MODE,
    __DEV__,
  ),
  serverUrl: trimServerUrl(process.env.EXPO_PUBLIC_CLOUD_VOICE_SERVER_URL),
  isWeb: Platform.OS === 'web',
  maxTurns: 6,
  maxDurationMs: 3 * 60 * 1000,
});

export type CloudVoiceFlags = typeof cloudVoiceFlags;
