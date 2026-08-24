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
  partCount,
  partNumber,
  text,
  title,
}: {
  /**
   * The canvas asset for this visual scene. Narrative parts may reuse it.
   */
  assetId?: CanvasAssetId;
  illustration: ReactNode;
  illustrationAccessibilityLabel?: string;
  illustrationContainerStyle?: StyleProp<ViewStyle>;
  partCount: number;
  partNumber: number;
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
        <View style={styles.partMeta}>
          <View style={styles.partBadge}>
            <AppText tone="inverse" variant="label">
              Part {partNumber} of {partCount}
            </AppText>
          </View>
          <View
            accessibilityLabel={`Story progress, part ${partNumber} of ${partCount}`}
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 1, max: partCount, now: partNumber }}
            style={styles.partProgress}
          >
            <View
              style={[
                styles.partProgressFill,
                { width: `${Math.min(100, Math.max(0, (partNumber / partCount) * 100))}%` },
              ]}
            />
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
    // Must never be negative. This card used to sit at `marginTop: -space.xl`,
    // which pulled it over the bottom 24 px of the illustration region: the
    // container measured 287 but an illustrator could only ever see 263 of it.
    // The card now starts below the artwork, so the declared 287 and the
    // visible 287 are the same number.
    marginTop: 0,
    padding: space.lg,
    position: 'relative',
  },
  partMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  partBadge: {
    backgroundColor: appColors.primary,
    borderRadius: radii.round,
    paddingHorizontal: space.sm,
    paddingVertical: space.xxs,
  },
  partProgress: {
    backgroundColor: appColors.border,
    borderRadius: radii.round,
    flex: 1,
    height: spacing.sm,
    marginLeft: space.sm,
    maxWidth: 124,
    overflow: 'hidden',
  },
  partProgressFill: {
    backgroundColor: appColors.wisdomGoldBright,
    borderRadius: radii.round,
    height: '100%',
  },
  sceneText: {
    marginTop: space.xs,
  },
  sceneTitle: {
    marginTop: space.md,
  },
});
