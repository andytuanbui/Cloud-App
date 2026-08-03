import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  AppText,
  PrimaryButton,
  SecondaryButton,
  SurfaceCard,
  TextButton,
} from '../../../components/ui';
import { appColors, radii, shadows, space } from '../../../theme';
import { isCloudVoiceSessionActive } from '../core/stateMachine';
import type {
  CloudVoiceError,
  CloudVoiceSessionStatus,
  CloudVoiceTranscriptEntry,
} from '../core/types';
import { CloudVoicePermissionCard } from './CloudVoicePermissionCard';
import { CloudVoiceStatus } from './CloudVoiceStatus';
import { CloudVoiceTranscriptView } from './CloudVoiceTranscriptView';

type Props = {
  status: CloudVoiceSessionStatus;
  transcript: CloudVoiceTranscriptEntry[];
  parentApproved: boolean;
  enabled: boolean;
  mode: 'realtime' | 'mock' | 'unavailable';
  cloudTurns: number;
  durationSeconds: number;
  error?: CloudVoiceError;
  hasCompleteReflection: boolean;
  safetyEnded: boolean;
  onStart: () => void;
  onToggleMute: () => void;
  onFinish: () => void;
  onTypeInstead: () => void;
};

export function CloudVoiceConversationSurface({
  status,
  transcript,
  parentApproved,
  enabled,
  mode,
  cloudTurns,
  durationSeconds,
  error,
  hasCompleteReflection,
  safetyEnded,
  onStart,
  onToggleMute,
  onFinish,
  onTypeInstead,
}: Props) {
  const active = isCloudVoiceSessionActive(status);
  const canStart = enabled && parentApproved && mode !== 'unavailable' && !active;
  const unavailable =
    !enabled || mode === 'unavailable' || status === 'error' || status === 'unavailable';

  return (
    <SurfaceCard elevated style={styles.surface}>
      <CloudVoicePermissionCard parentApproved={parentApproved} />

      {active || status === 'ended' ? (
        <View style={styles.conversation}>
          <CloudVoiceStatus status={status} />
          <Pressable
            accessibilityLabel={status === 'muted' ? 'Resume microphone' : 'Pause microphone'}
            accessibilityRole="button"
            disabled={!active || status === 'connecting' || status === 'requestingPermission' || status === 'ending'}
            onPress={onToggleMute}
            style={({ pressed }) => [
              styles.microphone,
              status === 'muted' && styles.microphoneMuted,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              color={appColors.onPrimary}
              name={status === 'muted' ? 'mic-off' : 'mic'}
              size={30}
            />
          </Pressable>
          <CloudVoiceTranscriptView entries={transcript} />
          {__DEV__ ? (
            <AppText style={styles.usage} tone="muted" variant="caption">
              {mode} | {Math.floor(durationSeconds / 60)}:{String(durationSeconds % 60).padStart(2, '0')} | {cloudTurns}/6 Cloud turns | {status}
            </AppText>
          ) : null}
          {active ? (
            <SecondaryButton
              disabled={status === 'requestingPermission' || status === 'connecting'}
              icon="stop-circle-outline"
              label="Finish Talking"
              onPress={onFinish}
            />
          ) : status === 'ended' && !safetyEnded ? (
            <PrimaryButton
              icon="mic-outline"
              label={hasCompleteReflection ? 'Talk Again' : 'Try Talking Again'}
              onPress={onStart}
            />
          ) : null}
          {status === 'ended' && safetyEnded ? (
            <AppText style={styles.error} tone="error" variant="supporting">
              Cloud ended this conversation. Please talk to a trusted adult nearby.
            </AppText>
          ) : null}
        </View>
      ) : (
        <View style={styles.start}>
          <PrimaryButton
            disabled={!canStart}
            icon="mic-outline"
            label="Talk to Cloud"
            loading={status === 'requestingPermission' || status === 'connecting'}
            onPress={onStart}
          />
          {unavailable || !parentApproved ? (
            <AppText
              accessibilityLiveRegion="polite"
              style={styles.error}
              tone={error ? 'error' : 'muted'}
              variant="supporting"
            >
              {error?.message ?? (enabled ? 'Continue with a suggested or typed answer.' : 'Voice is turned off. Continue with a suggested or typed answer.')}
            </AppText>
          ) : null}
        </View>
      )}

      <TextButton
        icon="keypad-outline"
        label="Continue by Typing"
        onPress={onTypeInstead}
        style={styles.fallback}
      />
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  surface: {
    marginTop: space.md,
    padding: space.sm,
  },
  start: {
    marginTop: space.sm,
  },
  conversation: {
    gap: space.sm,
    marginTop: space.sm,
  },
  microphone: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: appColors.primary,
    borderRadius: radii.round,
    height: 68,
    justifyContent: 'center',
    width: 68,
    ...shadows.card,
  },
  microphoneMuted: {
    backgroundColor: appColors.error,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }],
  },
  error: {
    marginTop: space.xs,
    textAlign: 'center',
  },
  usage: {
    textAlign: 'center',
  },
  fallback: {
    marginTop: space.xs,
  },
});
