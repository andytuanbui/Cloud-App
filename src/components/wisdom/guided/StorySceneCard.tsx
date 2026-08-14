import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import type { CanvasAssetId } from '../../../features/wisdomCanvas/assetIds';
import { appColors, radii, space, spacing } from '../../../theme';
import { AppText, SurfaceCard } from '../../ui';

export function StorySceneCard({
  assetId,
  illustration,
  illustrationAccessibilityLabel,
  illustrationContainerStyle,
  sceneCount,
  sceneNumber,
  text,
  title,
}: {
  /**
   * The canvas asset for this scene. Each of the six scenes has its own id, so
   * the container is identified per scene rather than by a shared story id.
   */
  assetId?: CanvasAssetId;
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
        accessibilityElementsHidden={!hasDistinctIllustrationLabel}
        accessible={hasDistinctIllustrationLabel}
        importantForAccessibility={hasDistinctIllustrationLabel ? 'auto' : 'no-hide-descendants'}
        style={[styles.illustration, illustrationContainerStyle]}
        testID={assetId ? `canvas-band-${assetId}` : 'canvas-band-WIS-MONEY-001-STORY-SCENE'}
      >
        {illustration}
      </View>
      <View style={styles.body}>
        <View style={styles.sceneMeta}>
          <View style={styles.sceneBadge}>
            <AppText tone="inverse" variant="label">
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
    borderWidth: 1,
    overflow: 'hidden',
  },
  illustration: {
    alignItems: 'center',
    backgroundColor: appColors.surfaceSoft,
    borderBottomColor: appColors.border,
    borderBottomWidth: 1,
    justifyContent: 'center',
    minHeight: spacing.s116 + spacing.s116 + spacing.s42,
    overflow: 'hidden',
    width: '100%',
  },
  body: {
    backgroundColor: appColors.wisdomCream,
    borderColor: appColors.border,
    borderRadius: radii.large,
    borderWidth: 1,
    marginHorizontal: space.sm,
    marginTop: -space.xl,
    padding: space.lg,
    position: 'relative',
  },
  sceneMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sceneBadge: {
    backgroundColor: appColors.primary,
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
    backgroundColor: appColors.wisdomGoldBright,
    width: spacing.s14,
  },
  sceneText: {
    marginTop: space.xs,
  },
  sceneTitle: {
    marginTop: space.md,
  },
});
