import { Image, StyleSheet, View } from 'react-native';
import type { WisdomContent } from '../../content/wisdoms';
import type { CanvasAssetId } from '../../features/wisdomCanvas/assetIds';
import { hasFinalCanvasArtwork } from '../../features/wisdomCanvas/manifest';
import { appColors, radii } from '../../theme';
import { CanvasArtworkLayer } from './CanvasArtworkLayer';

const artworkBackgrounds: Record<string, string> = {
  'needs-vs-wants': appColors.warmGoldSoft,
  'pause-before-you-answer': appColors.primarySoft,
  'three-ways-to-use-money': appColors.canvasSoft,
};

const moneyScene = require('../../../assets/cloud/cloud-neighborhood-home.png');

export function WisdomArtworkStage({
  assetId,
  mode = 'feature',
  wisdom,
}: {
  /**
   * The card canvas this artwork region belongs to, for Wisdoms that are in
   * the Canvas system. When that asset's illustration is delivered it takes
   * the region over; until then the region keeps the existing approved image
   * for the Wisdom, so the card looks unchanged.
   */
  assetId?: CanvasAssetId;
  mode?: 'feature' | 'compact';
  wisdom: WisdomContent;
}) {
  const compact = mode === 'compact';
  const needsLabelFreeCrop = wisdom.id === 'needs-vs-wants';
  const pauseCaptionFreeCrop = wisdom.id === 'pause-before-you-answer';
  const source =
    wisdom.id === 'three-ways-to-use-money' ? moneyScene : wisdom.artwork;
  const hasArtwork = Boolean(assetId) && hasFinalCanvasArtwork(assetId as string);

  return (
    <View
      accessible={false}
      style={[
        styles.stage,
        compact && styles.compactStage,
        { backgroundColor: artworkBackgrounds[wisdom.id] ?? appColors.surfaceSoft },
      ]}
      testID={assetId ? `canvas-band-${assetId}` : undefined}
    >
      {hasArtwork ? null : (
        <Image
          accessible={false}
          resizeMode="cover"
          source={source}
          style={[
            styles.coverImage,
            needsLabelFreeCrop && styles.needsFeatureCrop,
            needsLabelFreeCrop && compact && styles.needsCompactCrop,
            pauseCaptionFreeCrop && styles.pauseFeatureCrop,
            pauseCaptionFreeCrop && compact && styles.pauseCompactCrop,
          ]}
        />
      )}
      {assetId ? <CanvasArtworkLayer assetId={assetId} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    alignItems: 'center',
    height: 132,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  compactStage: {
    borderRadius: radii.medium,
    flexShrink: 0,
    height: 84,
    width: 80,
  },
  coverImage: {
    left: 0,
    height: '100%',
    position: 'absolute',
    top: 0,
    width: '100%',
  },
  needsFeatureCrop: {
    height: '178%',
    width: '100%',
  },
  needsCompactCrop: {
    left: -25,
    width: '279%',
  },
  pauseFeatureCrop: {
    height: '232%',
    width: '100%',
  },
  pauseCompactCrop: {
    height: '105%',
    left: 0,
    width: '100%',
  },
});
