import type { ImageSourcePropType } from 'react-native';
import {
  type CanvasAssetId,
  type CanvasSourceKey,
  canvasSourceKeyByAssetId,
  isCanvasAssetId,
} from './assetIds';

/**
 * React Native canvas image registry.
 *
 * Metro needs static `require` calls, so every image is listed explicitly.
 * Nothing here is built from a string at runtime, and the record is typed
 * exhaustively — a missing binding fails the typecheck instead of rendering
 * an empty canvas in front of a child.
 */

const canvasImageBySourceKey: Record<CanvasSourceKey, ImageSourcePropType> = {
  'cat-money': require('../../../assets/cloud/cat-money.png'),
  'cloud-thinking': require('../../../assets/cloud/cloud-thinking.png'),
  'cloud-helps-friend': require('../../../assets/cloud/cloud-helps-friend.png'),
  'cloud-neighborhood-home': require('../../../assets/cloud/cloud-neighborhood-home.png'),
  'cat-thinking': require('../../../assets/cloud/cat-thinking.png'),
  'cloud-hero-wave': require('../../../assets/cloud/cloud-hero-wave.png'),
  'cloud-avatar': require('../../../assets/cloud/cloud-avatar.png'),
  'cloud-home-garden': require('../../../assets/cloud/cloud-home-garden.png'),
};

/** Resolves a canvas image by its stable asset id. */
export function resolveCanvasImage(
  assetId: CanvasAssetId,
): ImageSourcePropType {
  return canvasImageBySourceKey[canvasSourceKeyByAssetId[assetId]];
}

/**
 * Safe lookup for values that have not been narrowed yet, e.g. a story scene
 * id coming from content. Returns `undefined` rather than throwing so the
 * canvas component can show its development fallback.
 */
export function tryResolveCanvasImage(
  assetId: string,
): ImageSourcePropType | undefined {
  if (!isCanvasAssetId(assetId)) return undefined;
  return resolveCanvasImage(assetId);
}

export { canvasImageBySourceKey };
