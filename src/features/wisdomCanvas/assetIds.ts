/**
 * Canvas asset ids and their current image bindings.
 *
 * This module imports no images, so Node tests and validation can read it
 * directly. `registry.ts` maps each source key to a static `require` for
 * React Native.
 *
 * Asset ids are stable. When artwork is replaced the filename and version in
 * the manifest change; the id used by the Wisdom definition does not.
 */

export const wisdomCanvasAssetIds = [
  'WIS-MONEY-001-WELCOME-HERO',
  'WIS-MONEY-001-STORY-SCENE-01',
  'WIS-MONEY-001-STORY-SCENE-02',
  'WIS-MONEY-001-STORY-SCENE-03',
  'WIS-MONEY-001-STORY-SCENE-04',
  'WIS-MONEY-001-STORY-SCENE-05',
  'WIS-MONEY-001-STORY-SCENE-06',
  'WIS-MONEY-001-TALK-WITH-CLOUD',
  'WIS-MONEY-001-CHOICE-BACKGROUND',
  'WIS-MONEY-001-TAKEAWAY-BACKGROUND',
  'WIS-MONEY-001-PRACTICE-HERO',
  'WIS-MONEY-001-COMPLETION-HERO',
  'WIS-MONEY-001-HOME-CARD',
  'WIS-MONEY-001-HOME-CARD-COMPACT',
  'WIS-MONEY-001-LIBRARY-CARD',
] as const;

export type CanvasAssetId = (typeof wisdomCanvasAssetIds)[number];

/**
 * Existing approved images the canvases currently fall back to.
 *
 * Keys are indirection on purpose: no `require` path is ever built from a
 * string, and the asset-free layer stays importable from Node.
 */
export const canvasSourceKeys = [
  'cat-money',
  'cloud-thinking',
  'cloud-helps-friend',
  'cloud-neighborhood-home',
  'cat-thinking',
  'cloud-hero-wave',
  'cloud-avatar',
  'cloud-home-garden',
] as const;

export type CanvasSourceKey = (typeof canvasSourceKeys)[number];

/**
 * Current binding per asset id.
 *
 * Until the fourteen final PNGs are delivered, several ids intentionally share
 * an existing approved image. `registry.ts` is typed as an exhaustive record,
 * so a missing binding is a compile error rather than a runtime blank.
 */
export const canvasSourceKeyByAssetId: Record<CanvasAssetId, CanvasSourceKey> = {
  // Story scenes keep their approved per-scene artwork exactly as shipped.
  'WIS-MONEY-001-STORY-SCENE-01': 'cat-money',
  'WIS-MONEY-001-STORY-SCENE-02': 'cloud-thinking',
  'WIS-MONEY-001-STORY-SCENE-03': 'cloud-helps-friend',
  'WIS-MONEY-001-STORY-SCENE-04': 'cloud-neighborhood-home',
  'WIS-MONEY-001-STORY-SCENE-05': 'cat-thinking',
  'WIS-MONEY-001-STORY-SCENE-06': 'cloud-hero-wave',
  // No dedicated artwork exists for these yet. They share a nearby approved
  // image so nothing resolves to nothing; the screens still compose their own
  // visuals, so the app looks unchanged.
  'WIS-MONEY-001-WELCOME-HERO': 'cat-money',
  'WIS-MONEY-001-TALK-WITH-CLOUD': 'cloud-avatar',
  'WIS-MONEY-001-CHOICE-BACKGROUND': 'cat-money',
  'WIS-MONEY-001-TAKEAWAY-BACKGROUND': 'cloud-avatar',
  'WIS-MONEY-001-PRACTICE-HERO': 'cloud-hero-wave',
  'WIS-MONEY-001-COMPLETION-HERO': 'cloud-hero-wave',
  // The Home card renders at two heights: 238 as Today's Wisdom and 154 once
  // learned. One image cannot serve both crops, so each has its own id.
  'WIS-MONEY-001-HOME-CARD': 'cloud-home-garden',
  'WIS-MONEY-001-HOME-CARD-COMPACT': 'cloud-neighborhood-home',
  'WIS-MONEY-001-LIBRARY-CARD': 'cloud-home-garden',
};

/** Asset ids that do not yet have their own artwork. */
export const assetIdsSharingFallbackArtwork: readonly CanvasAssetId[] = [
  'WIS-MONEY-001-WELCOME-HERO',
  'WIS-MONEY-001-TALK-WITH-CLOUD',
  'WIS-MONEY-001-CHOICE-BACKGROUND',
  'WIS-MONEY-001-TAKEAWAY-BACKGROUND',
  'WIS-MONEY-001-PRACTICE-HERO',
  'WIS-MONEY-001-COMPLETION-HERO',
  'WIS-MONEY-001-HOME-CARD',
  'WIS-MONEY-001-HOME-CARD-COMPACT',
  'WIS-MONEY-001-LIBRARY-CARD',
];

/** Story scene id → canvas asset id, so each of the six resolves separately. */
export const storySceneCanvasAssetIds: Record<string, CanvasAssetId> = {
  'leo-wants-the-cards-now': 'WIS-MONEY-001-STORY-SCENE-01',
  'leo-remembers-the-headphones': 'WIS-MONEY-001-STORY-SCENE-02',
  'leo-remembers-mias-birthday': 'WIS-MONEY-001-STORY-SCENE-03',
  'leo-sees-three-choices': 'WIS-MONEY-001-STORY-SCENE-04',
  'leo-pauses': 'WIS-MONEY-001-STORY-SCENE-05',
  'leo-makes-a-plan': 'WIS-MONEY-001-STORY-SCENE-06',
};

export function isCanvasAssetId(value: string): value is CanvasAssetId {
  return (wisdomCanvasAssetIds as readonly string[]).includes(value);
}
