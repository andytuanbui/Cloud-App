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
  // Delivered Canvas Pack artwork. These keys point at the pack folder itself,
  // not at a borrowed image from assets/cloud.
  'wis-money-001-talk-with-cloud',
  'wis-money-001-story-scene-04',
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
  // Approved Canvas Pack artwork. TALK-WITH-CLOUD is the pack's anchor and the
  // Character Master for Cloud: every other Cloud-bearing canvas takes his
  // face, hair silhouette, proportions, expression language, hoodie, emblem and
  // rendering from this file. Approved 2026-08-17 and `final` in the manifest,
  // so it is the one canvas the app actually draws today.
  'WIS-MONEY-001-TALK-WITH-CLOUD': 'wis-money-001-talk-with-cloud',
  // STORY-SCENE-04 is the pack's second approved canvas and the **object
  // master**: the football cards, Mia's gift and the headphones take their
  // shape, colourway, detailing and relative scale from this file wherever
  // they reappear. Approved 2026-08-17 and `final` in the manifest, so it is
  // bound to its own PNG in the pack folder rather than to a borrowed image.
  'WIS-MONEY-001-STORY-SCENE-04': 'wis-money-001-story-scene-04',
  // The other five story scenes keep their existing bindings exactly as
  // shipped, and stay `awaiting-final-art` until their own art is approved.
  'WIS-MONEY-001-STORY-SCENE-01': 'cat-money',
  'WIS-MONEY-001-STORY-SCENE-02': 'cloud-thinking',
  'WIS-MONEY-001-STORY-SCENE-03': 'cloud-helps-friend',
  'WIS-MONEY-001-STORY-SCENE-05': 'cat-thinking',
  'WIS-MONEY-001-STORY-SCENE-06': 'cloud-hero-wave',
  // No dedicated artwork exists for these yet. They share a nearby approved
  // image so nothing resolves to nothing; the screens still compose their own
  // visuals, so the app looks unchanged.
  'WIS-MONEY-001-WELCOME-HERO': 'cat-money',
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

/**
 * Asset ids that must keep showing the approved placeholder treatment.
 *
 * An id belongs here whenever its own illustration is not approved `final`.
 * That covers two of the three states an asset moves through:
 *
 * 1. **Not delivered** — nothing drawn yet; the id borrows a nearby approved
 *    image so the registry always resolves. Listed here.
 * 2. **Delivered, under review** — the asset's own PNG is on disk and bound in
 *    the registry, but the manifest still says `awaiting-final-art`. The app
 *    must go on drawing the placeholder. Listed here. No asset is in this state
 *    right now; `TALK-WITH-CLOUD` passed through it and has since been approved.
 * 3. **Approved final** — `status: 'final'`. Not listed here, and the only
 *    state in which the delivered artwork reaches a child. `TALK-WITH-CLOUD`
 *    (the Character Master) and `STORY-SCENE-04` (the object master) are the
 *    two assets in this state.
 *
 * Delivering a file does not remove an id from this list; only approval does.
 *
 * This is a record, not a runtime switch. What actually decides whether artwork
 * is drawn is the manifest status, read through `hasFinalCanvasArtwork`. The
 * list exists so the two can be checked against each other — `canvas.test.ts`
 * asserts that nothing approved is listed and nothing delivered-but-unapproved
 * is missing. The six story scenes are absent: `STORY-SCENE-04` because it is
 * approved `final` and draws its own PNG, the other five because they keep
 * their existing per-scene bindings rather than the shared placeholder.
 */
export const assetIdsSharingFallbackArtwork: readonly CanvasAssetId[] = [
  // `TALK-WITH-CLOUD` and `STORY-SCENE-04` are deliberately absent: both are
  // approved `final` and draw their own artwork. Everything below is still
  // waiting on art of its own.
  'WIS-MONEY-001-WELCOME-HERO',
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
