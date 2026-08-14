/**
 * Wisdom Canvas System.
 *
 * Text-free artwork resolved through stable asset ids, with a manifest that
 * records dimensions, focal points and the safe areas the application draws
 * over.
 */
export * from './types';
export * from './assetIds';
export * from './validation';
export {
  canvasManifestByAssetId,
  getCanvasMetadata,
  hasFinalCanvasArtwork,
  threeWaysCanvasManifest,
} from './manifest';
export {
  resolveCanvasImage,
  resolveFinalCanvasImage,
  tryResolveCanvasImage,
} from './registry';
export * from './renderPaths';
