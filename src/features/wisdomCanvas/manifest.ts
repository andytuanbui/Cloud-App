import manifestJson from '../../../assets/wisdoms/three-ways-to-use-money/canvases/manifest.json';
import type { CanvasAssetId } from './assetIds';
import type { CanvasAssetMetadata, CanvasManifest } from './types';

/**
 * The Three Ways to Use Money Canvas Pack manifest.
 *
 * The JSON file is the source of truth so designers can edit it without
 * touching TypeScript; this module gives the app a typed view of it.
 */
export const threeWaysCanvasManifest = manifestJson as unknown as CanvasManifest;

export const canvasManifestByAssetId = Object.fromEntries(
  threeWaysCanvasManifest.assets.map((asset) => [asset.assetId, asset]),
) as Record<CanvasAssetId, CanvasAssetMetadata>;

export function getCanvasMetadata(
  assetId: string,
): CanvasAssetMetadata | undefined {
  return canvasManifestByAssetId[assetId as CanvasAssetId];
}

/**
 * Whether this asset's own final illustration has been delivered.
 *
 * This is the single switch every Wisdom surface asks before drawing artwork.
 * While an asset is `awaiting-final-art` the surface keeps its approved
 * placeholder treatment — the wisdom-night gradient and its object-led props —
 * because the registry's temporary binding for that id is a nearby existing
 * image, not the artwork the canvas was specified for. Drawing that stand-in
 * would misrepresent the design and, worse, put an unrelated character in
 * front of a child.
 *
 * When the real PNG lands, the manifest entry flips to `final` and every
 * surface bound to that id starts rendering it with no further code change.
 */
export function hasFinalCanvasArtwork(assetId: string): boolean {
  return getCanvasMetadata(assetId)?.status === 'final';
}
