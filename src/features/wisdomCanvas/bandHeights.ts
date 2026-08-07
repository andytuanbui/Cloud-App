import type { CanvasAssetId } from './assetIds';

/**
 * Stable rendered heights for every artwork region, in device-independent px.
 *
 * These are deliberately constants. Measurement of the previous full-stage
 * canvases showed heights driven by content — Talk swung 576.7 → 1532.3 as a
 * child answered — which made the artwork impossible to specify. Fixing the
 * height here is what lets a canvas be commissioned at one size.
 *
 * Width still scales with the viewport; only height is pinned. Dynamic content
 * grows in a sibling region below the band, never inside it.
 */
export const canvasBandHeights: Record<CanvasAssetId, number> = {
  // Unchanged — these regions were already stable, and were re-measured
  // directly at 375, 390 and 430 after the change. Story scenes measure 286.7
  // in the browser; 287 is the declared nominal.
  'WIS-MONEY-001-WELCOME-HERO': 296,
  'WIS-MONEY-001-STORY-SCENE-01': 287,
  'WIS-MONEY-001-STORY-SCENE-02': 287,
  'WIS-MONEY-001-STORY-SCENE-03': 287,
  'WIS-MONEY-001-STORY-SCENE-04': 287,
  'WIS-MONEY-001-STORY-SCENE-05': 287,
  'WIS-MONEY-001-STORY-SCENE-06': 287,
  'WIS-MONEY-001-PRACTICE-HERO': 196,

  // Stabilised in this task. Previously these grew with stage content.
  'WIS-MONEY-001-TALK-WITH-CLOUD': 240,
  'WIS-MONEY-001-CHOICE-BACKGROUND': 210,
  'WIS-MONEY-001-TAKEAWAY-BACKGROUND': 180,
  'WIS-MONEY-001-COMPLETION-HERO': 220,

  // Cards are already fixed by their own card styles.
  'WIS-MONEY-001-HOME-CARD': 238,
  'WIS-MONEY-001-HOME-CARD-COMPACT': 154,
  'WIS-MONEY-001-LIBRARY-CARD': 154,
};

/**
 * Approved ranges from the layout-stabilisation brief. A band height outside
 * its range is a specification error, not a styling preference.
 */
export const canvasBandHeightRanges: Partial<
  Record<CanvasAssetId, { min: number; max: number }>
> = {
  'WIS-MONEY-001-TALK-WITH-CLOUD': { min: 220, max: 260 },
  'WIS-MONEY-001-CHOICE-BACKGROUND': { min: 190, max: 230 },
  'WIS-MONEY-001-TAKEAWAY-BACKGROUND': { min: 170, max: 210 },
  'WIS-MONEY-001-COMPLETION-HERO': { min: 210, max: 240 },
};

/** Artwork regions that must never change height with stage state. */
export const stabilisedBandAssetIds: readonly CanvasAssetId[] = [
  'WIS-MONEY-001-TALK-WITH-CLOUD',
  'WIS-MONEY-001-CHOICE-BACKGROUND',
  'WIS-MONEY-001-TAKEAWAY-BACKGROUND',
  'WIS-MONEY-001-COMPLETION-HERO',
];
