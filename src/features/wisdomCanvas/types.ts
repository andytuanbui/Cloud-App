/**
 * Wisdom Canvas types.
 *
 * A canvas is text-free artwork. Titles, body copy, progress, buttons, child
 * choices, amounts, currency, allocation controls, takeaway options, written
 * responses, learned status and accessibility labels are always rendered by
 * the application on top — never baked into the image.
 */

/** Where a canvas is used inside a Wisdom. */
export type CanvasStageId =
  | 'welcome'
  | 'story'
  | 'talk'
  | 'choice'
  | 'takeaway'
  | 'practice'
  | 'completion'
  | 'home-card'
  | 'library-card';

export type CanvasPurpose = 'hero' | 'scene' | 'background' | 'card';

/** How the artwork fills its container. */
export type CanvasFitMode = 'cover' | 'contain';

/**
 * Regions the application will draw over. Artwork must keep faces and key
 * objects out of them. All values are normalized 0–1 of the source image.
 */
export type CanvasSafeAreaPurpose =
  | 'title'
  | 'body'
  | 'controls'
  | 'amount'
  | 'progress'
  | 'character'
  | 'unrestricted';

export type CanvasSafeArea = {
  x: number;
  y: number;
  width: number;
  height: number;
  purpose: CanvasSafeAreaPurpose;
};

/** Normalized point kept visible when the container forces a crop. */
export type CanvasFocalPoint = { x: number; y: number };

/**
 * `awaiting-final-art` means the entry is specified but the PNG has not been
 * delivered; the app falls back to existing approved artwork.
 */
export type CanvasAssetStatus = 'awaiting-final-art' | 'final' | 'deprecated';

export type CanvasReplacement = {
  version: number;
  filename: string;
  replacedOn: string;
  note?: string;
};

/**
 * One canvas entry.
 *
 * `assetId` is stable for the life of the Wisdom. `filename` and `version`
 * change when artwork is replaced; the id never does.
 */
export type CanvasAssetMetadata = {
  assetId: string;
  wisdomId: string;
  stageId: CanvasStageId;
  /** Set only for story scenes, matching the scene id in the Wisdom content. */
  storySceneId?: string;
  purpose: CanvasPurpose;
  filename: string;
  version: number;
  sourceWidth: number;
  sourceHeight: number;
  aspectRatio: number;
  fitMode: CanvasFitMode;
  focalPoint: CanvasFocalPoint;
  safeAreas: CanvasSafeArea[];
  /** `'none'` for object-led artwork, otherwise the character's name. */
  character: string;
  visualSubject: string;
  /** Always true. Interface text must never be inside the image. */
  textFree: boolean;
  accessibilityDescription: string;
  status: CanvasAssetStatus;
  replacementHistory: CanvasReplacement[];
};

export type CanvasManifest = {
  schemaVersion: number;
  wisdomId: string;
  wisdomCode: string;
  note: string;
  assets: CanvasAssetMetadata[];
};

/** A validation problem, always naming the asset and the field at fault. */
export type CanvasValidationIssue = {
  assetId: string;
  field: string;
  message: string;
};
