import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { appColors, radii, space, spacing } from '../../../theme';
import { AppText, SurfaceCard } from '../../ui';

export function StorySceneCard({
  illustration,
  illustrationAccessibilityLabel,
  illustrationContainerStyle,
  sceneCount,
  sceneNumber,
  text,
  title,
}: {
  illustration: ReactNode;
  illustrationAccessibilityLabel?: string;
  illustrationContainerStyle?: StyleProp<ViewStyle>;
  sceneCount: number;
  sceneNumber: number;
  text: string;
  title?: string;
}) {
  const hasDistinctIllustrationLabel = Boolean(illustrationAccessibilityLabel && illustrationAccessibilityLabel !== title);

  return (
    <SurfaceCard elevated style={styles.card}>
      <View
        accessibilityLabel={hasDistinctIllustrationLabel ? illustrationAccessibilityLabel : undefined}
        accessible={hasDistinctIllustrationLabel}
        style={[styles.illustration, illustrationContainerStyle]}
      >
        {illustration}
      </View>
      <View style={styles.body}>
        <View style={styles.sceneMeta}>
          <View style={styles.sceneBadge}>
            <AppText tone="brand" variant="label">
              Scene {sceneNumber} of {sceneCount}
            </AppText>
          </View>
          <View accessible={false} style={styles.sceneDots}>
            {Array.from({ length: Math.max(0, sceneCount) }, (_, index) => (
              <View
                key={index}
                style={[
                  styles.sceneDot,
                  index < sceneNumber && styles.sceneDotActive,
                ]}
              />
            ))}
          </View>
        </View>
        {title ? (
          <AppText accessibilityRole="header" style={styles.sceneTitle} variant="cardTitle">
            {title}
          </AppText>
        ) : null}
        <AppText
          accessibilityRole={title ? undefined : 'header'}
          style={styles.sceneText}
          variant={title ? 'body' : 'sectionTitle'}
        >
          {text}
        </AppText>
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    borderColor: appColors.borderStrong,
    overflow: 'hidden',
  },
  illustration: {
    alignItems: 'center',
    backgroundColor: appColors.surfaceSoft,
    borderBottomColor: appColors.border,
    borderBottomWidth: 1,
    justifyContent: 'center',
    minHeight: spacing.s116 + spacing.s58,
    overflow: 'hidden',
    width: '100%',
  },
  body: {
    backgroundColor: appColors.surface,
    padding: space.lg,
  },
  sceneMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sceneBadge: {
    backgroundColor: appColors.primarySoft,
    borderRadius: radii.round,
    paddingHorizontal: space.sm,
    paddingVertical: space.xxs,
  },
  sceneDots: {
    flexDirection: 'row',
    flexShrink: 1,
    gap: space.xxs,
    marginLeft: space.sm,
  },
  sceneDot: {
    backgroundColor: appColors.border,
    borderRadius: radii.round,
    height: spacing.md,
    width: spacing.md,
  },
  sceneDotActive: {
    backgroundColor: appColors.primary,
    width: spacing.s14,
  },
  sceneText: {
    marginTop: space.xs,
  },
  sceneTitle: {
    marginTop: space.md,
  },
});
