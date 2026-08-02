import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import type { WisdomContent } from '../../content/wisdoms';
import type { WisdomProgress } from '../../state/types';
import { isWisdomLearned } from '../../state/useDailyWisdoms';
import { appColors, radii, space } from '../../theme';
import {
  AppText,
  PrimaryButton,
  SurfaceCard,
} from '../ui';
import { WisdomArtworkStage } from './WisdomArtworkStage';

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

  const card = (
    <SurfaceCard elevated style={styles.card}>
      <View style={styles.clip}>
        <WisdomArtworkStage wisdom={wisdom} />
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
                <Ionicons
                  accessible={false}
                  color={appColors.primary}
                  name="arrow-forward"
                  size={18}
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
      </View>
    </SurfaceCard>
  );

  if (!learned) return card;

  return (
    <Pressable
      accessibilityHint="Opens a fresh review at the Welcome screen"
      accessibilityLabel={`Review ${wisdom.title}`}
      accessibilityRole="button"
      onPress={onReview}
      style={({ pressed }) => pressed && styles.cardPressed}
    >
      {card}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: space.lg,
  },
  cardPressed: {
    opacity: 0.86,
  },
  clip: {
    borderRadius: radii.card,
    overflow: 'hidden',
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
    borderRadius: radii.medium,
    marginTop: space.sm,
    paddingHorizontal: space.md,
    paddingTop: space.md,
  },
  completedHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: space.xs,
  },
  completedBody: {
    marginLeft: 30,
    marginTop: space.xxs,
  },
  reviewButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: space.xs,
    marginLeft: 10,
    marginTop: space.sm,
    minHeight: 44,
  },
});
