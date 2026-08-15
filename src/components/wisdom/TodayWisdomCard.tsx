import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { WisdomContent } from '../../content/wisdoms';
import type { CanvasAssetId } from '../../features/wisdomCanvas/assetIds';
import type { WisdomProgress } from '../../state/types';
import { isWisdomLearned } from '../../state/useDailyWisdoms';
import { appColors, radii, shadows, space, spacing } from '../../theme';
import {
  AppText,
  PrimaryButton,
  SurfaceCard,
} from '../ui';
import { WisdomArtworkStage } from './WisdomArtworkStage';
import { MoneyWisdomIdentityCard } from './MoneyWisdomIdentityCard';

export function TodayWisdomCard({
  onOpen,
  onReview,
  progress,
  wisdom,
}: {
  onOpen: () => void;
  onReview: () => void;
  progress?: WisdomProgress;
  wisdom: WisdomContent;
}) {
  const learned = isWisdomLearned(progress);
  const started = Boolean(progress);
  const [focused, setFocused] = useState(false);
  // Only Wisdoms in the Canvas system have a card asset. The feature card is
  // its own canvas — it never shares the compact one's artwork.
  const homeCardAssetId: CanvasAssetId | undefined =
    wisdom.id === 'three-ways-to-use-money' ? 'WIS-MONEY-001-HOME-CARD' : undefined;

  if (learned && wisdom.id === 'three-ways-to-use-money') {
    return (
      <Pressable
        accessibilityHint="Opens a fresh review at the Welcome screen"
        accessibilityLabel={`Review ${wisdom.title}`}
        accessibilityRole="button"
        onBlur={() => setFocused(false)}
        onFocus={() => setFocused(true)}
        onPress={onReview}
        style={({ pressed }) => [
          styles.moneyIdentityWrap,
          pressed && styles.cardPressed,
        ]}
        testID={`wisdom-card-today-${wisdom.id}`}
      >
        <MoneyWisdomIdentityCard
          assetId="WIS-MONEY-001-HOME-CARD"
          focused={focused}
          wisdom={wisdom}
        />
      </Pressable>
    );
  }

  const card = (
    <SurfaceCard
      elevated
      style={[
        styles.card,
        learned && styles.learnedCard,
        learned && focused && styles.learnedCardFocused,
      ]}
    >
      <View style={styles.clip}>
        <View style={styles.artworkWrap}>
          <WisdomArtworkStage assetId={homeCardAssetId} wisdom={wisdom} />
          {learned ? (
            <View accessible={false} style={styles.artworkCheck}>
              <Ionicons
                accessible={false}
                color={appColors.onPrimary}
                name="checkmark"
                size={spacing.s20}
              />
            </View>
          ) : null}
        </View>
        <View style={styles.body}>
          <View style={styles.metaRow}>
            <AppText tone="brand" variant="label">
              {wisdom.category}
            </AppText>
            <View style={styles.minutes}>
              <Ionicons
                color={appColors.textMuted}
                name="time-outline"
                size={16}
              />
              <AppText tone="muted" variant="caption">
                {wisdom.estimatedMinutes} min
              </AppText>
            </View>
          </View>

          <AppText style={styles.title} variant="cardTitle">
            {wisdom.title}
          </AppText>
          <AppText style={styles.summary} tone="secondary" variant="supporting">
            {wisdom.summary}
          </AppText>

          {learned ? (
            <View style={styles.completedPanel}>
              <View style={styles.completedHeader}>
                <Ionicons
                  color={appColors.success}
                  name="checkmark-circle"
                  size={22}
                />
                <AppText tone="brand" variant="label">
                  Learned
                </AppText>
              </View>
              <AppText
                style={styles.completedBody}
                tone="secondary"
                variant="supporting"
              >
                {wisdom.skillOutcome}.
              </AppText>
              <View style={styles.reviewButton}>
                <AppText tone="brand" variant="label">Review Wisdom</AppText>
                <View accessible={false} style={styles.reviewIcon}>
                  <Ionicons
                    accessible={false}
                    color={appColors.onPrimary}
                    name="arrow-forward"
                    size={18}
                  />
                </View>
              </View>
            </View>
          ) : (
            <PrimaryButton
              label={started ? 'Continue Wisdom' : 'Start Wisdom'}
              onPress={onOpen}
              style={styles.action}
              testID={`wisdom-card-today-open-${wisdom.id}`}
            />
          )}
        </View>
      </View>
    </SurfaceCard>
  );

  if (!learned) return card;

  return (
    <Pressable
      accessibilityHint="Opens a fresh review at the Welcome screen"
      accessibilityLabel={`Review ${wisdom.title}`}
      accessibilityRole="button"
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onPress={onReview}
      style={({ pressed }) => [
        styles.learnedPressable,
        pressed && styles.cardPressed,
      ]}
      testID={`wisdom-card-today-${wisdom.id}`}
    >
      {card}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: space.lg,
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
  moneyIdentityWrap: {
    borderRadius: radii.card,
    marginBottom: space.lg,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.992 }],
  },
  clip: {
    borderRadius: radii.card,
    overflow: 'hidden',
  },
  artworkWrap: {
    position: 'relative',
  },
  artworkCheck: {
    alignItems: 'center',
    backgroundColor: appColors.success,
    borderColor: appColors.surfaceElevated,
    borderRadius: radii.round,
    borderWidth: 3,
    height: spacing.s38,
    justifyContent: 'center',
    position: 'absolute',
    right: space.md,
    top: space.md,
    width: spacing.s38,
  },
  body: {
    padding: space.md,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  minutes: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: space.xxs,
  },
  title: {
    marginTop: space.xs,
  },
  summary: {
    marginTop: space.xxs,
  },
  action: {
    marginTop: space.sm,
  },
  completedPanel: {
    backgroundColor: appColors.successSoft,
    borderColor: appColors.border,
    borderRadius: radii.medium,
    borderWidth: 1,
    marginTop: space.sm,
    padding: space.md,
  },
  completedHeader: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: appColors.surfaceElevated,
    borderColor: appColors.border,
    borderRadius: radii.round,
    borderWidth: 1,
    flexDirection: 'row',
    gap: space.xs,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
  },
  completedBody: {
    marginTop: space.sm,
  },
  reviewButton: {
    alignItems: 'center',
    borderTopColor: appColors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: space.sm,
    minHeight: 48,
    paddingTop: space.sm,
    width: '100%',
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
