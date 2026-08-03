import { StyleSheet, View } from 'react-native';
import { AppText, SurfaceCard } from '../../../components/ui';
import { space } from '../../../theme';
import type { CloudVoiceTranscriptEntry } from '../core/types';

export function CloudVoiceTranscriptView({
  entries,
}: {
  entries: CloudVoiceTranscriptEntry[];
}) {
  const visibleEntries = entries.slice(-4);
  return (
    <SurfaceCard style={styles.card}>
      <AppText tone="muted" variant="caption">
        Current conversation only
      </AppText>
      <View accessibilityLiveRegion="polite" style={styles.entries}>
        {visibleEntries.length > 0 ? (
          visibleEntries.map((entry) => (
            <AppText key={entry.id} tone="secondary" variant="supporting">
              {entry.role === 'cloud' ? 'Cloud' : 'You'}: {entry.text}
            </AppText>
          ))
        ) : (
          <AppText tone="muted" variant="supporting">
            Your short conversation will appear here while you talk.
          </AppText>
        )}
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: space.sm,
  },
  entries: {
    gap: space.xs,
    marginTop: space.xs,
  },
});
