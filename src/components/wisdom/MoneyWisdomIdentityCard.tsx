import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import type { WisdomContent } from '../../content/wisdoms';
import type { CanvasAssetId } from '../../features/wisdomCanvas/assetIds';
import { hasFinalCanvasArtwork } from '../../features/wisdomCanvas/manifest';
import { appColors, radii, shadows, space, spacing, typography } from '../../theme';
import { CanvasArtworkLayer } from './CanvasArtworkLayer';
import { AppText } from '../ui';

/**
 * Object-led identity for "Three Ways to Use Money".
 *
 * The Wisdom's story belongs to Leo, who has no artwork yet, and Cloud's
 * artwork must not stand in for him (see src/content/characterAssets.ts). The
 * card is therefore carried by the money and the three things it could go to.
 */
const identityProps = [
  'football-outline',
  'headset-outline',
  'gift-outline',
] as const;

export function MoneyWisdomIdentityCard({
  assetId,
  completionLabel = 'Learned',
  focused = false,
  mode = 'feature',
  wisdom,
}: {
  /**
   * Which canvas this card's artwork region corresponds to. The feature and
   * compact Home cards and the Library card are three separate assets, so the
   * id has to come from the surface rendering the card. Each resolves its own
   * artwork; none of them borrows another's.
   */
  assetId?: CanvasAssetId;
  completionLabel?: string;
  focused?: boolean;
  mode?: 'feature' | 'compact';
  wisdom: WisdomContent;
}) {
  const compact = mode === 'compact';
  // The coin and the three object orbs are the object-led placeholder for this
  // card's canvas. They give way to the card's own illustration, and only to
  // that one — an id with no delivered artwork keeps the placeholder.
  const hasArtwork = Boolean(assetId) && hasFinalCanvasArtwork(assetId as string);

  return (
    <View
      accessible={false}
      style={[
        styles.card,
        compact && styles.compactCard,
        focused && styles.focusedCard,
      ]}
      testID={assetId ? `canvas-band-${assetId}` : undefined}
    >
      <LinearGradient
        colors={[appColors.wisdomNightSoft, appColors.wisdomNight, appColors.wisdomNightDeep]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={StyleSheet.absoluteFillObject}
      />
      {assetId ? <CanvasArtworkLayer assetId={assetId} /> : null}
      {hasArtwork ? null : (
        <>
          <View accessible={false} pointerEvents="none" style={styles.identityGlow} />
          <View
            accessible={false}
            pointerEvents="none"
            style={[styles.identityCoin, compact && styles.compactCoin]}
          >
            <AppText style={[styles.identityCoinValue, compact && styles.compactCoinValue]} tone="inverse" variant="screenTitle">
              90 kr
            </AppText>
          </View>
        </>
      )}
      <View style={styles.topRow}>
        <View accessible={false} style={styles.objectCluster}>
          {hasArtwork
            ? null
            : identityProps.map((icon) => (
            <View key={icon} style={[styles.objectOrb, compact && styles.compactObjectOrb]}>
              <Ionicons
                color={appColors.primary}
                name={icon}
                size={compact ? spacing.s15 : spacing.s18}
              />
            </View>
          ))}
        </View>
        <View style={styles.learnedBadge}>
          <Ionicons
            accessible={false}
            color={appColors.onPrimary}
            name="checkmark-circle"
            size={compact ? spacing.s15 : spacing.s18}
          />
          <AppText style={styles.learnedLabel} tone="inverse" variant="caption">
            {completionLabel}
          </AppText>
        </View>
      </View>

      <View style={[styles.copy, compact && styles.compactCopy]}>
        <AppText
          numberOfLines={compact ? 1 : 2}
          style={[styles.title, compact && styles.compactTitle]}
          tone="inverse"
          variant={compact ? 'body' : 'cardTitle'}
        >
          {wisdom.title}
        </AppText>
        {!compact ? (
          <AppText numberOfLines={2} style={styles.summary} tone="inverse" variant="supporting">
            {wisdom.summary}
          </AppText>
        ) : null}
        <View style={[styles.reviewRow, compact && styles.compactReviewRow]}>
          <View accessible={false} style={styles.progressDots}>
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <View style={styles.progressDot} />
            <View style={styles.progressDot} />
          </View>
          <View style={styles.reviewAction}>
            <AppText tone="inverse" variant="caption">
              Review
            </AppText>
            <Ionicons
              accessible={false}
              color={appColors.wisdomGoldBright}
              name="arrow-forward"
              size={spacing.s15}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...shadows.card,
    backgroundColor: appColors.wisdomNight,
    borderColor: appColors.wisdomLine,
    borderRadius: radii.card,
    borderWidth: 2,
    height: 238,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  compactCard: {
    height: 154,
  },
  focusedCard: {
    borderColor: appColors.focus,
    ...shadows.focus,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: space.md,
    position: 'absolute',
    right: space.md,
    top: space.md,
  },
  objectCluster: {
    flexDirection: 'row',
    gap: space.xs,
  },
  objectOrb: {
    alignItems: 'center',
    backgroundColor: appColors.surfaceOverlay,
    borderColor: appColors.wisdomLine,
    borderRadius: radii.round,
    borderWidth: 1,
    height: spacing.s38,
    justifyContent: 'center',
    width: spacing.s38,
  },
  compactObjectOrb: {
    height: spacing.s30,
    width: spacing.s30,
  },
  learnedBadge: {
    alignItems: 'center',
    backgroundColor: appColors.primary,
    borderColor: appColors.wisdomLine,
    borderRadius: radii.round,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
  },
  learnedLabel: {
    fontWeight: typography.weight.bold,
    marginLeft: space.xxs,
  },
  copy: {
    bottom: space.md,
    left: space.md,
    position: 'absolute',
    right: space.md,
  },
  compactCopy: {
    bottom: space.sm,
  },
  title: {
    maxWidth: '82%',
  },
  compactTitle: {
    fontWeight: typography.weight.heavy,
    maxWidth: '100%',
  },
  summary: {
    marginTop: space.xxs,
    maxWidth: '72%',
    opacity: 0.9,
  },
  reviewRow: {
    alignItems: 'center',
    borderTopColor: appColors.wisdomLine,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: space.sm,
    paddingTop: space.xs,
  },
  compactReviewRow: {
    marginTop: space.xs,
  },
  progressDots: {
    flexDirection: 'row',
    gap: space.xxs,
  },
  progressDot: {
    backgroundColor: appColors.wisdomLine,
    borderRadius: radii.round,
    height: spacing.sm,
    width: spacing.s12,
  },
  progressDotActive: {
    backgroundColor: appColors.wisdomGoldBright,
    width: spacing.s24,
  },
  reviewAction: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: space.xs,
  },
  identityGlow: {
    backgroundColor: appColors.wisdomGoldGlow,
    borderRadius: radii.round,
    height: 220,
    opacity: 0.5,
    position: 'absolute',
    right: -60,
    top: -70,
    width: 220,
  },
  identityCoin: {
    alignItems: 'center',
    backgroundColor: appColors.wisdomGlassStrong,
    borderColor: appColors.wisdomLine,
    borderRadius: radii.round,
    borderWidth: 1,
    height: spacing.s92,
    justifyContent: 'center',
    position: 'absolute',
    right: space.md,
    top: space.xxl,
    width: spacing.s92,
  },
  identityCoinValue: {
    color: appColors.wisdomGoldBright,
    fontSize: 22,
    lineHeight: 26,
  },
  compactCoin: {
    height: spacing.s62,
    top: spacing.s48,
    width: spacing.s62,
  },
  compactCoinValue: {
    fontSize: 17,
    lineHeight: 21,
  },
});
