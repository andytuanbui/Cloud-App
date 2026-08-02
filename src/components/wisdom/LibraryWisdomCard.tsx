import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  isWisdomLearned,
  type ScheduledWisdom,
} from '../../state/useDailyWisdoms';
import {
  appColors,
  layout,
  radii,
  shadows,
  space,
  spacing,
} from '../../theme';
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
  const [focused, setFocused] = useState(false);

  const card = (
    <SurfaceCard
      elevated={learned}
      style={[
        styles.card,
        learned && styles.learnedCard,
        learned && focused && styles.learnedCardFocused,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.artworkWrap}>
          <WisdomArtworkStage mode="compact" wisdom={item.wisdom} />
          {learned ? (
            <View accessible={false} style={styles.artworkCheck}>
              <Ionicons
                accessible={false}
                color={appColors.onPrimary}
                name="checkmark"
                size={spacing.s15}
              />
            </View>
          ) : null}
        </View>
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

      <View style={[styles.footer, learned && styles.learnedFooter]}>
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
            <View accessible={false} style={styles.reviewIcon}>
              <Ionicons
                accessible={false}
                color={appColors.onPrimary}
                name="arrow-forward"
                size={17}
              />
            </View>
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
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onPress={onOpen}
      style={({ pressed }) => [
        styles.learnedPressable,
        pressed && styles.cardPressed,
      ]}
    >
      {card}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: space.sm,
  },
  learnedCard: {
    borderColor: appColors.borderStrong,
    borderWidth: 2,
  },
  learnedCardFocused: {
    borderColor: appColors.focus,
    ...shadows.focus,
  },
  learnedPressable: {
    borderRadius: radii.card,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.992 }],
  },
  topRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: space.sm,
  },
  artworkWrap: {
    flexShrink: 0,
    position: 'relative',
  },
  artworkCheck: {
    alignItems: 'center',
    backgroundColor: appColors.success,
    borderColor: appColors.surfaceElevated,
    borderRadius: radii.round,
    borderWidth: 2,
    bottom: -space.xxs,
    height: spacing.s28,
    justifyContent: 'center',
    position: 'absolute',
    right: -space.xxs,
    width: spacing.s28,
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
  learnedFooter: {
    backgroundColor: appColors.successSoft,
    borderColor: appColors.border,
    borderRadius: radii.medium,
    borderWidth: 1,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
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
    paddingLeft: space.sm,
  },
  reviewIcon: {
    alignItems: 'center',
    backgroundColor: appColors.primary,
    borderRadius: radii.round,
    height: spacing.s34,
    justifyContent: 'center',
    width: spacing.s34,
  },
});
