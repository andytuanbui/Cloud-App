import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import type { ScheduledWisdom } from '../../state/useDailyWisdoms';
import { appColors, layout, space } from '../../theme';
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
    <SurfaceCard style={styles.card}>
      <View style={styles.topRow}>
        <WisdomArtworkStage mode="compact" wisdom={item.wisdom} />
        <View style={styles.copy}>
          <View style={styles.metaRow}>
            <AppText tone="brand" variant="label">
              {item.wisdom.category}
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
          <AppText style={styles.title} variant="cardTitle">
            {item.wisdom.title}
          </AppText>
        </View>
      </View>

      <AppText style={styles.summary} tone="secondary" variant="supporting">
        {item.wisdom.summary}
      </AppText>

      <View style={styles.footer}>
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
        ) : (
          <View />
        )}

        <ActionButton
          label={
            completed
              ? 'Review Wisdom'
              : started
                ? 'Continue Wisdom'
                : 'Start Wisdom'
          }
          onPress={onOpen}
          style={styles.action}
        />
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: space.sm,
  },
  topRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: space.sm,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.xs,
    justifyContent: 'space-between',
  },
  title: {
    marginTop: space.xxs,
  },
  minutes: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: space.xxs,
  },
  summary: {
    marginTop: space.xs,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.xs,
    justifyContent: 'space-between',
    marginTop: space.sm,
  },
  completionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: space.xs,
    minHeight: layout.minimumTouchTarget,
  },
  action: {
    minHeight: layout.minimumTouchTarget,
    paddingHorizontal: space.md,
  },
});
