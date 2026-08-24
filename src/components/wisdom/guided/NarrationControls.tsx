import { StyleSheet, View } from 'react-native';
import { appColors, radii, shadows, space } from '../../../theme';
import { AppText, SecondaryButton, TextButton } from '../../ui';

export type NarrationStatus = 'unavailable' | 'idle' | 'speaking' | 'paused';

export function NarrationControls({
  hasPlayed = false,
  onPause,
  onRead,
  onReplay,
  onResume,
  status,
  unavailableMessage = 'Read-aloud is not available on this device yet.',
}: {
  hasPlayed?: boolean;
  onPause?: () => void;
  onRead?: () => void;
  onReplay?: () => void;
  onResume?: () => void;
  status: NarrationStatus;
  unavailableMessage?: string;
}) {
  const unavailable = status === 'unavailable';
  const hasNarrated = hasPlayed || status === 'speaking' || status === 'paused';
  const replayDisabled = unavailable || !hasNarrated || !onReplay;

  return (
    <View accessibilityLabel="Story narration controls" style={styles.wrap}>
      <View style={styles.controls}>
        {status === 'speaking' ? (
          <SecondaryButton
            accessibilityLabel="Pause story narration"
            disabled={!onPause}
            icon="pause"
            label="Pause"
            onPress={onPause ?? noOp}
            style={styles.control}
          />
        ) : status === 'paused' ? (
          <SecondaryButton
            accessibilityLabel="Resume story narration"
            disabled={!onResume}
            icon="play"
            label="Resume"
            onPress={onResume ?? noOp}
            style={styles.control}
          />
        ) : (
          <SecondaryButton
            accessibilityLabel="Read this story part aloud"
            disabled={unavailable || !onRead}
            icon="volume-medium-outline"
            label="Read to Me"
            onPress={onRead ?? noOp}
            style={styles.control}
          />
        )}
        <TextButton
          accessibilityLabel="Replay this story part"
          disabled={replayDisabled}
          icon="refresh"
          label="Replay"
          onPress={onReplay ?? noOp}
          style={styles.control}
        />
      </View>

      {unavailable ? (
        <AppText style={styles.status} tone="muted" variant="caption">
          {unavailableMessage}
        </AppText>
      ) : status === 'speaking' ? (
        <AppText
          accessibilityLiveRegion="polite"
          style={styles.status}
          tone="secondary"
          variant="caption"
        >
          Reading this story part aloud.
        </AppText>
      ) : status === 'paused' ? (
        <AppText
          accessibilityLiveRegion="polite"
          style={styles.status}
          tone="secondary"
          variant="caption"
        >
          Narration paused.
        </AppText>
      ) : null}
    </View>
  );
}

function noOp() {}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: appColors.surfaceOverlaySoft,
    borderColor: appColors.border,
    borderRadius: radii.large,
    borderWidth: 1,
    marginTop: space.md,
    padding: space.xs,
    ...shadows.subtle,
  },
  controls: {
    alignItems: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.xs,
  },
  control: {
    flexBasis: 128,
    flexGrow: 1,
  },
  status: {
    marginTop: space.xs,
    paddingHorizontal: space.xs,
    textAlign: 'center',
  },
});
