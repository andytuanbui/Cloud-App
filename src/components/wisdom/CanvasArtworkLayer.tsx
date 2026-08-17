import { Image, ImageStyle, StyleProp, StyleSheet } from 'react-native';
import type { CanvasAssetId } from '../../features/wisdomCanvas/assetIds';
import { focalCoverInset } from '../../features/wisdomCanvas/focalPoint';
import { getCanvasMetadata } from '../../features/wisdomCanvas/manifest';
import { resolveFinalCanvasImage } from '../../features/wisdomCanvas/registry';
import type { CanvasFitMode } from '../../features/wisdomCanvas/types';

/**
 * The artwork layer for a Wisdom surface that composes its own container.
 *
 * `WisdomCanvas` owns the artwork for stages that hand their whole container
 * to the canvas system. The Welcome hero, the six Story scenes, Practice and
 * the three Wisdom cards each build their own fixed-size container instead, so
 * they need the artwork as a layer they can drop inside it rather than a
 * wrapper around it. Both go through the same resolver, the same manifest
 * status and the same focal point — this is not a second resolution system.
 *
 * Renders nothing until the asset's own illustration is delivered, which is
 * what lets each surface keep its approved placeholder treatment today and
 * show real artwork the moment the manifest says `final`.
 */
export function CanvasArtworkLayer({
  assetId,
  fitMode,
  style,
}: {
  assetId: CanvasAssetId;
  /** Overrides the manifest's fit mode when a container needs a tighter crop. */
  fitMode?: CanvasFitMode;
  style?: StyleProp<ImageStyle>;
}) {
  const source = resolveFinalCanvasImage(assetId);
  if (!source) return null;

  const metadata = getCanvasMetadata(assetId);
  const resolvedFit = fitMode ?? metadata?.fitMode ?? 'cover';
  // The focal point keeps the important part of the artwork visible when a
  // fixed-height container forces a crop. Shared with `WisdomCanvas` so both
  // pan identically and neither can expose an uncovered edge.
  const focal = metadata?.focalPoint ?? { x: 0.5, y: 0.5 };

  return (
    <Image
      accessible={false}
      resizeMode={resolvedFit}
      source={source}
      style={[
        StyleSheet.absoluteFillObject,
        resolvedFit === 'cover' ? focalCoverInset(focal) : null,
        style,
      ]}
    />
  );
}
