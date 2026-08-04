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
