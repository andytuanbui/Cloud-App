import { type CanvasAssetId, storySceneCanvasAssetIds } from './assetIds';

/**
 * Where each canvas is actually drawn.
 *
 * A canvas can be specified in the manifest, bound in the registry, given a
 * fixed band height — and still never reach a child, because no screen or card
 * renders it. That was true of nine of the fifteen assets: they had ids and
 * metadata but no surface asking for them, so delivering their artwork would
 * have changed nothing on screen.
 *
 * This record closes that gap. It is exhaustive over `CanvasAssetId`, so a new
 * id cannot be added to the system without naming the surface that will show
 * it; the typecheck fails first. `renderPaths.test.ts` then proves each named
 * surface really does resolve that id through the shared canvas resolver.
 */

/** How a surface gets its artwork. All four go through the same resolver. */
export type CanvasRenderMechanism =
  /** The canvas owns the whole container: `WisdomCanvas` / `WisdomCanvasBand`. */
  | 'canvas-band'
  /** The surface builds its container and drops `CanvasArtworkLayer` inside. */
  | 'artwork-layer';

export type CanvasRenderPath = {
  /** Human name of the surface, as it appears in the product. */
  surface: string;
  /** Repo-relative file that renders this asset. */
  sourcePath: string;
  mechanism: CanvasRenderMechanism;
  /**
   * False when the id reaches the surface through a lookup rather than as a
   * literal — the six story scenes are indexed by scene id.
   */
  literalInSource: boolean;
};

const guidedScreen = 'src/screens/guided/GuidedWisdomScreen.tsx';

function storyScenePath(): CanvasRenderPath {
  return {
    surface: 'Story scene',
    sourcePath: guidedScreen,
    mechanism: 'artwork-layer',
    literalInSource: false,
  };
}

export const canvasRenderPaths: Record<CanvasAssetId, CanvasRenderPath> = {
  'WIS-MONEY-001-WELCOME-HERO': {
    surface: 'Welcome hero',
    sourcePath: guidedScreen,
    mechanism: 'artwork-layer',
    literalInSource: true,
  },
  // Six scenes, six canvases. They are looked up by scene id so the screen
  // cannot accidentally point two scenes at one image.
  'WIS-MONEY-001-STORY-SCENE-01': storyScenePath(),
  'WIS-MONEY-001-STORY-SCENE-02': storyScenePath(),
  'WIS-MONEY-001-STORY-SCENE-03': storyScenePath(),
  'WIS-MONEY-001-STORY-SCENE-04': storyScenePath(),
  'WIS-MONEY-001-STORY-SCENE-05': storyScenePath(),
  'WIS-MONEY-001-STORY-SCENE-06': storyScenePath(),
  'WIS-MONEY-001-TALK-WITH-CLOUD': {
    surface: 'Talk with Cloud band',
    sourcePath: guidedScreen,
    mechanism: 'canvas-band',
    literalInSource: true,
  },
  'WIS-MONEY-001-CHOICE-BACKGROUND': {
    surface: 'Your Choice band',
    sourcePath: guidedScreen,
    mechanism: 'canvas-band',
    literalInSource: true,
  },
  'WIS-MONEY-001-TAKEAWAY-BACKGROUND': {
    surface: 'Takeaway band',
    sourcePath: guidedScreen,
    mechanism: 'canvas-band',
    literalInSource: true,
  },
  'WIS-MONEY-001-PRACTICE-HERO': {
    surface: 'Practice hero',
    sourcePath: guidedScreen,
    mechanism: 'artwork-layer',
    literalInSource: true,
  },
  'WIS-MONEY-001-COMPLETION-HERO': {
    surface: 'Completion band',
    sourcePath: guidedScreen,
    mechanism: 'canvas-band',
    literalInSource: true,
  },
  'WIS-MONEY-001-HOME-CARD': {
    surface: "Home feature Wisdom card (Today's Wisdom)",
    sourcePath: 'src/components/wisdom/TodayWisdomCard.tsx',
    mechanism: 'artwork-layer',
    literalInSource: true,
  },
  'WIS-MONEY-001-HOME-CARD-COMPACT': {
    surface: 'Home compact learned Wisdom card',
    sourcePath: 'src/components/wisdom/LibraryWisdomCard.tsx',
    mechanism: 'artwork-layer',
    literalInSource: true,
  },
  'WIS-MONEY-001-LIBRARY-CARD': {
    surface: 'Library Wisdom card',
    sourcePath: 'src/components/wisdom/LibraryWisdomCard.tsx',
    mechanism: 'artwork-layer',
    literalInSource: true,
  },
};

/**
 * The shared components any render path is allowed to use.
 *
 * There is one artwork-resolution system. A surface that wants a canvas either
 * hands its container to `WisdomCanvas`/`WisdomCanvasBand` or drops
 * `CanvasArtworkLayer` into a container it owns — both call
 * `resolveFinalCanvasImage` and read the same manifest status.
 */
export const canvasRenderComponents: Record<CanvasRenderMechanism, string> = {
  'canvas-band': 'WisdomCanvasBand',
  'artwork-layer': 'CanvasArtworkLayer',
};

/** Asset ids reachable only through the story scene lookup. */
export const storySceneRenderedAssetIds: readonly CanvasAssetId[] = Object.values(
  storySceneCanvasAssetIds,
);
