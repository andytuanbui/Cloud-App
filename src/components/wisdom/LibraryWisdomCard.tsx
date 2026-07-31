import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import type { ScheduledWisdom } from '../../state/useDailyWisdoms';
import { appColors, radii, space } from '../../theme';
import {
  AppText,
  PrimaryButton,
  SecondaryButton,
  SurfaceCard,
} from '../ui';
import { WisdomArtworkStage } from './WisdomArtworkStage';

export function LibraryWisdomCard({
  completionLabel,
  item,
  onOpen,
}: {
  completionLabel?: string;
  item: ScheduledWisdom;
  onOpen: () => void;
}) {
  const completed = Boolean(item.progress?.completed);
  const started = Boolean(item.progress);
  const ActionButton = completed ? SecondaryButton : PrimaryButton;

  return (
    <SurfaceCard elevated style={styles.card}>
      <View style={styles.topRow}>
        <WisdomArtworkStage mode="compact" wisdom={item.wisdom} />
        <View style={styles.copy}>
          <AppText tone="brand" variant="label">
            {item.wisdom.category}
          </AppText>
          <AppText style={styles.title} variant="cardTitle">
            {item.wisdom.title}
          </AppText>
          <View style={styles.minutes}>
            <Ionicons
              color={appColors.textMuted}
              name="time-outline"
              size={15}
            />
            <AppText tone="muted" variant="caption">
              {item.wisdom.estimatedMinutes} min
            </AppText>
          </View>
        </View>
      </View>

      <AppText style={styles.summary} tone="secondary" variant="supporting">
        {item.wisdom.summary}
      </AppText>

      {completed ? (
        <View style={styles.completionRow}>
          <Ionicons
            color={appColors.success}
            name="checkmark-circle"
            size={17}
          />
          <AppText tone="brand" variant="caption">
            {completionLabel ?? 'Completed'}
          </AppText>
        </View>
      ) : null}

      <ActionButton
        label={completed ? 'Review Wisdom' : started ? 'Continue Wisdom' : 'Start Wisdom'}
        onPress={onOpen}
        style={styles.action}
      />
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: space.md,
  },
  topRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: space.md,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    paddingTop: space.xxs,
  },
  title: {
    marginTop: space.xs,
  },
  minutes: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: space.xxs,
    marginTop: space.xs,
  },
  summary: {
    marginTop: space.md,
  },
  completionRow: {
    alignItems: 'center',
    backgroundColor: appColors.successSoft,
    borderRadius: radii.small,
    flexDirection: 'row',
    gap: space.xs,
    marginTop: space.sm,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
  },
  action: {
    marginTop: space.md,
  },
});
