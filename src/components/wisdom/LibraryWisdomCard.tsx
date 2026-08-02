import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  isWisdomLearned,
  type ScheduledWisdom,
} from '../../state/useDailyWisdoms';
import { appColors, layout, space } from '../../theme';
import {
  AppText,
  PrimaryButton,
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
  const learned = isWisdomLearned(item.progress);
  const started = Boolean(item.progress);

  const card = (
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
        {learned ? (
          <View style={styles.completionRow}>
            <Ionicons
              color={appColors.success}
              name="checkmark-circle"
              size={17}
            />
            <AppText tone="brand" variant="caption">
              {completionLabel ?? 'Learned'}
            </AppText>
          </View>
        ) : (
          <View />
        )}

        {learned ? (
          <View style={styles.learnedAction}>
            <AppText tone="brand" variant="label">Review Wisdom</AppText>
            <Ionicons
              accessible={false}
              color={appColors.primary}
              name="arrow-forward"
              size={18}
            />
          </View>
        ) : (
          <PrimaryButton
            label={started ? 'Continue Wisdom' : 'Start Wisdom'}
            onPress={onOpen}
            style={styles.action}
          />
        )}
      </View>
    </SurfaceCard>
  );

  if (!learned) return card;

  return (
    <Pressable
      accessibilityHint="Opens a fresh review at the Welcome screen"
      accessibilityLabel={`Review ${item.wisdom.title}`}
      accessibilityRole="button"
      onPress={onOpen}
      style={({ pressed }) => pressed && styles.cardPressed}
    >
      {card}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: space.sm,
  },
  cardPressed: {
    opacity: 0.86,
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
  learnedAction: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: space.xs,
    minHeight: layout.minimumTouchTarget,
    paddingHorizontal: space.sm,
  },
});
