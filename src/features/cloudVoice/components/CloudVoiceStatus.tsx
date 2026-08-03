import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../../../components/ui';
import { appColors, radii, space } from '../../../theme';
import type { CloudVoiceSessionStatus } from '../core/types';

const statusCopy: Record<CloudVoiceSessionStatus, string> = {
  idle: 'Ready when you are',
  requestingPermission: 'Waiting for microphone permission',
  connecting: 'Connecting to Cloud',
  listening: 'Cloud is listening',
  childSpeaking: 'Cloud can hear you',
  thinking: 'Cloud is thinking',
  cloudSpeaking: 'Cloud is speaking',
  muted: 'Microphone paused',
  ending: 'Finishing the conversation',
  ended: 'Conversation finished',
  error: 'Could not connect',
  unavailable: 'Voice is unavailable',
};

export function CloudVoiceStatus({ status }: { status: CloudVoiceSessionStatus }) {
  const active = ['listening', 'childSpeaking', 'thinking', 'cloudSpeaking'].includes(status);
  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.status, active && styles.active]}
    >
      <Ionicons
        color={active ? appColors.primary : appColors.textMuted}
        name={status === 'cloudSpeaking' ? 'volume-medium' : status === 'thinking' ? 'sparkles' : 'radio-button-on'}
        size={18}
      />
      <AppText style={styles.copy} tone={active ? 'brand' : 'secondary'} variant="label">
        {statusCopy[status]}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  status: {
    alignItems: 'center',
    backgroundColor: appColors.surfaceSoft,
    borderRadius: radii.round,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: space.md,
  },
  active: {
    backgroundColor: appColors.primarySoft,
  },
  copy: {
    marginLeft: space.xs,
  },
});
