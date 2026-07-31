import { StyleSheet, View } from 'react-native';
import { appColors, radii, space } from '../../theme';
import { AppText } from './AppText';

export function ProgressSteps({
  current,
  total,
  label,
}: {
  current: number;
  total: number;
  label?: string;
}) {
  return (
    <View
      accessibilityLabel={label ?? `Step ${current} of ${total}`}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 1, max: total, now: current }}
      style={styles.wrap}
    >
      <AppText tone="muted" variant="caption">
        {label ?? `Step ${current} of ${total}`}
      </AppText>
      <View style={styles.track}>
        {Array.from({ length: total }, (_, index) => (
          <View
            key={index}
            style={[styles.segment, index < current && styles.segmentActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  track: {
    flexDirection: 'row',
    gap: space.xs,
    marginTop: space.xs,
    width: '100%',
  },
  segment: {
    backgroundColor: appColors.border,
    borderRadius: radii.round,
    flex: 1,
    height: 4,
  },
  segmentActive: {
    backgroundColor: appColors.primary,
  },
});
