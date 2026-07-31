import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import type { WisdomContent } from '../../content/wisdoms';
import type { WisdomProgress } from '../../state/types';
import { appColors, radii, space } from '../../theme';
import {
  AppText,
  PrimaryButton,
  SurfaceCard,
  TextButton,
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
  const completed = Boolean(progress?.completed);
  const started = Boolean(progress);

  return (
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

          <AppText style={styles.title} variant="screenTitle">
            {wisdom.title}
          </AppText>
          <AppText style={styles.summary} tone="secondary">
            {wisdom.summary}
          </AppText>

          {completed ? (
            <View style={styles.completedPanel}>
              <View style={styles.completedHeader}>
                <Ionicons
                  color={appColors.success}
                  name="checkmark-circle"
                  size={22}
                />
                <AppText tone="brand" variant="label">
                  Completed today
                </AppText>
              </View>
              <AppText
                style={styles.completedBody}
                tone="secondary"
                variant="supporting"
              >
                {wisdom.skillOutcome}.
              </AppText>
              <TextButton
                icon="arrow-forward"
                label="Review Wisdom"
                onPress={onReview}
                style={styles.reviewButton}
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
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: space.xl,
  },
  clip: {
    borderRadius: radii.card,
    overflow: 'hidden',
  },
  body: {
    padding: space.lg,
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
    marginTop: space.sm,
  },
  summary: {
    marginTop: space.xs,
  },
  action: {
    marginTop: space.lg,
  },
  completedPanel: {
    backgroundColor: appColors.successSoft,
    borderRadius: radii.medium,
    marginTop: space.lg,
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
    alignSelf: 'flex-start',
    marginLeft: 10,
    marginTop: space.xxs,
  },
});
