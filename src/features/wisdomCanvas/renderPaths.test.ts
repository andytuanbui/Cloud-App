import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { storySceneCanvasAssetIds, wisdomCanvasAssetIds } from './assetIds';
import {
  canvasRenderComponents,
  canvasRenderPaths,
  storySceneRenderedAssetIds,
} from './renderPaths';
import type { CanvasManifest } from './types';

/**
 * Render-path coverage.
 *
 * A canvas that is specified, bound and measured but never rendered is
 * invisible work: the artwork lands and nothing on screen changes. Nine of the
 * fifteen assets were in exactly that state — Welcome, all six Story scenes,
 * Practice, both Home cards and the Library card had ids with no surface
 * asking for them.
 *
 * These are source-level assertions, like the rest of the canvas suite. The
 * app is React Native, so there is no renderer in Node; what can be proved
 * here is the chain that matters — every manifest id is claimed by a named
 * surface, that surface's file really references the id, and it gets its
 * artwork from the one shared resolver rather than a private `require`.
 */

const repoRoot = process.cwd();

const manifest = JSON.parse(
  readFileSync(
    path.join(
      repoRoot,
      'assets/wisdoms/three-ways-to-use-money/canvases/manifest.json',
    ),
    'utf8',
  ),
) as CanvasManifest;

function read(relativePath: string): string {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const sourceCache = new Map<string, string>();
function source(relativePath: string): string {
  const cached = sourceCache.get(relativePath);
  if (cached !== undefined) return cached;
  const text = read(relativePath);
  sourceCache.set(relativePath, text);
  return text;
}

/**
 * Wisdom components that resolve artwork through the shared layer. A screen or
 * card may delegate to one of these instead of importing the layer directly.
 */
const wisdomComponentsDir = 'src/components/wisdom';
const canvasAwareComponents = readdirSync(path.join(repoRoot, wisdomComponentsDir))
  .filter((name) => name.endsWith('.tsx'))
  .filter((name) => source(`${wisdomComponentsDir}/${name}`).includes('CanvasArtworkLayer'))
  .map((name) => name.replace(/\.tsx$/, ''));

/** True when this file reaches the shared resolver, directly or by delegation. */
function resolvesThroughSharedLayer(relativePath: string): boolean {
  const text = source(relativePath);
  if (text.includes('CanvasArtworkLayer')) return true;
  return canvasAwareComponents.some((component) => text.includes(`<${component}`));
}

describe('every canvas asset has a render path', () => {
  it('claims every manifest asset id, with no extras', () => {
    const manifestIds = manifest.assets.map((asset) => asset.assetId).sort();
    const claimedIds = Object.keys(canvasRenderPaths).sort();
    assert.deepEqual(
      claimedIds,
      manifestIds,
      'an asset in the manifest has no surface that can render it, or a render path names an asset the manifest does not define',
    );
  });

  it('covers all fifteen registered asset ids', () => {
    assert.equal(wisdomCanvasAssetIds.length, 15);
    for (const assetId of wisdomCanvasAssetIds) {
      const renderPath = canvasRenderPaths[assetId];
      assert.ok(renderPath, `${assetId} has no render path`);
      assert.ok(renderPath.surface.trim(), `${assetId} has no named surface`);
    }
  });

  it('points every render path at a file that exists', () => {
    for (const [assetId, renderPath] of Object.entries(canvasRenderPaths)) {
      assert.ok(
        existsSync(path.join(repoRoot, renderPath.sourcePath)),
        `${assetId} names a missing file: ${renderPath.sourcePath}`,
      );
    }
  });

  it('references each asset id in the source that renders it', () => {
    for (const [assetId, renderPath] of Object.entries(canvasRenderPaths)) {
      if (!renderPath.literalInSource) continue;
      assert.ok(
        source(renderPath.sourcePath).includes(assetId),
        `${renderPath.surface} does not mention ${assetId}; the artwork would never appear`,
      );
    }
  });

  it('resolves every render path through the shared canvas system', () => {
    for (const [assetId, renderPath] of Object.entries(canvasRenderPaths)) {
      const expected = canvasRenderComponents[renderPath.mechanism];
      const text = source(renderPath.sourcePath);
      if (renderPath.mechanism === 'canvas-band') {
        assert.ok(
          text.includes(`<${expected}`),
          `${assetId} claims a ${expected} it does not render`,
        );
      } else {
        assert.ok(
          resolvesThroughSharedLayer(renderPath.sourcePath),
          `${renderPath.surface} does not reach ${expected}, so ${assetId} has no artwork path`,
        );
      }
    }
  });
});

describe('story scenes each render their own canvas', () => {
  const screen = source('src/screens/guided/GuidedWisdomScreen.tsx');

  it('keeps six scenes mapped to six distinct assets', () => {
    assert.equal(storySceneRenderedAssetIds.length, 6);
    assert.equal(new Set(storySceneRenderedAssetIds).size, 6);
    for (const assetId of storySceneRenderedAssetIds) {
      assert.ok(
        (wisdomCanvasAssetIds as readonly string[]).includes(assetId),
        `${assetId} is mapped from a story scene but is not a registered asset`,
      );
    }
  });

  it('looks the scene asset up by scene id rather than collapsing the six', () => {
    assert.ok(
      screen.includes('storySceneCanvasAssetIds[scene.id]'),
      'the Story stage must resolve the current scene’s own asset id',
    );
    // A single literal scene id in the render call would mean all six scenes
    // share one canvas.
    for (const assetId of storySceneRenderedAssetIds) {
      assert.ok(
        !screen.includes(`assetId="${assetId}"`),
        `${assetId} is hard-coded into the Story stage`,
      );
    }
  });

  it('passes the scene asset to both the container and the artwork', () => {
    const sceneCard = screen.match(/<StorySceneCard[\s\S]*?\/>/)?.[0];
    assert.ok(sceneCard, 'the Story stage no longer renders a StorySceneCard');
    assert.ok(
      sceneCard.includes('assetId={storySceneCanvasAssetIds[scene.id]}'),
      'the scene container is not identified by its own asset id',
    );
    assert.ok(
      sceneCard.includes('<StoryMomentArtwork'),
      'the scene artwork is not rendered inside the scene container',
    );
    assert.ok(
      /StoryMomentArtwork[\s\S]{0,160}assetId=\{storySceneCanvasAssetIds\[scene\.id\]\}/.test(
        sceneCard,
      ),
      'the scene artwork does not receive its own asset id',
    );
  });

  it('draws the delivered scene artwork instead of the placeholder composition', () => {
    assert.match(
      screen,
      /if \(assetId && hasFinalCanvasArtwork\(assetId\)\) \{[\s\S]{0,240}<CanvasArtworkLayer assetId=\{assetId\} \/>/,
      'a delivered story scene must render through the shared artwork layer',
    );
  });

  it('gives every story scene in the content a canvas asset', () => {
    const sceneIds = Object.keys(storySceneCanvasAssetIds);
    assert.equal(sceneIds.length, 6);
    assert.equal(new Set(Object.values(storySceneCanvasAssetIds)).size, 6);
  });
});

describe('Home and Library cards resolve their own canvases', () => {
  const todayCard = source('src/components/wisdom/TodayWisdomCard.tsx');
  const compactCard = source('src/components/wisdom/LibraryWisdomCard.tsx');

  it('gives the Home feature card its own asset and not the compact one', () => {
    assert.ok(todayCard.includes('WIS-MONEY-001-HOME-CARD'));
    assert.ok(
      !todayCard.includes('WIS-MONEY-001-HOME-CARD-COMPACT'),
      'the feature card must not borrow the compact card’s artwork',
    );
    assert.ok(
      !todayCard.includes('WIS-MONEY-001-LIBRARY-CARD'),
      'the feature card must not borrow Library artwork',
    );
  });

  it('separates the Home compact card from the Library card by surface', () => {
    assert.ok(compactCard.includes('WIS-MONEY-001-HOME-CARD-COMPACT'));
    assert.ok(compactCard.includes('WIS-MONEY-001-LIBRARY-CARD'));
    assert.match(
      compactCard,
      /surface === 'home'[\s\S]{0,120}WIS-MONEY-001-HOME-CARD-COMPACT[\s\S]{0,120}WIS-MONEY-001-LIBRARY-CARD/,
      'the compact card must pick its asset from the surface it is rendered on',
    );
  });

  it('renders artwork in both the learned and the unlearned card states', () => {
    for (const [name, text] of [
      ['Home feature card', todayCard],
      ['compact card', compactCard],
    ] as const) {
      assert.ok(
        text.includes('<MoneyWisdomIdentityCard'),
        `${name} lost its learned state`,
      );
      assert.ok(
        text.includes('<WisdomArtworkStage'),
        `${name} lost its unlearned state`,
      );
      assert.match(
        text,
        /<MoneyWisdomIdentityCard[\s\S]{0,200}assetId=/,
        `${name} does not pass an asset id to its learned state`,
      );
      assert.match(
        text,
        /<WisdomArtworkStage[\s\S]{0,200}assetId=/,
        `${name} does not pass an asset id to its unlearned state`,
      );
    }
  });

  it('keeps both card components on the shared artwork layer', () => {
    for (const relativePath of [
      'src/components/wisdom/MoneyWisdomIdentityCard.tsx',
      'src/components/wisdom/WisdomArtworkStage.tsx',
    ]) {
      assert.ok(
        source(relativePath).includes('<CanvasArtworkLayer'),
        `${relativePath} does not render the shared artwork layer`,
      );
    }
  });
});

describe('Welcome and Practice hand their regions to the canvas system', () => {
  const screen = source('src/screens/guided/GuidedWisdomScreen.tsx');

  it('gives the Welcome hero its asset id', () => {
    const hero = screen.match(/<WisdomHeroCanvas[\s\S]*?>/)?.[0];
    assert.ok(hero, 'the Welcome hero is missing');
    assert.ok(
      hero.includes('assetId="WIS-MONEY-001-WELCOME-HERO"'),
      'the Welcome hero does not resolve its canvas asset',
    );
    // The hero owns a fixed 296 region; this task must not move it.
    assert.ok(hero.includes('height={296}'), 'the Welcome hero height changed');
  });

  it('draws Welcome artwork through the hero canvas, not a private require', () => {
    const heroComponent = source('src/components/wisdom/guided/WisdomCanvas.tsx');
    assert.ok(heroComponent.includes('<CanvasArtworkLayer assetId={assetId}'));
    assert.ok(
      !/require\('\.\.\/\.\.\/\.\.\/\.\.\/assets/.test(heroComponent),
      'the hero canvas must not require artwork of its own',
    );
  });

  it('lets Practice show its own canvas instead of a hardcoded Cloud image', () => {
    assert.ok(
      screen.includes('<CanvasArtworkLayer assetId="WIS-MONEY-001-PRACTICE-HERO" />'),
      'Practice does not render its canvas asset',
    );
    // cloudHero may remain as the placeholder, but only behind the check — an
    // unconditional portrait is what blocked the canvas before.
    const practiceRegion = screen.match(
      /testID="canvas-band-WIS-MONEY-001-PRACTICE-HERO"[\s\S]*?\n      <\/View>/,
    )?.[0];
    assert.ok(practiceRegion, 'the Practice artwork region is missing');
    assert.ok(
      practiceRegion.includes('hasPracticeArtwork ? null :'),
      'the Practice placeholder must step aside for delivered artwork',
    );
    const cloudHeroIndex = practiceRegion.indexOf('source={cloudHero}');
    assert.ok(cloudHeroIndex > practiceRegion.indexOf('hasPracticeArtwork ? null :'));
  });
});

describe('there is one artwork-resolution system', () => {
  it('resolves final artwork only through the registry', () => {
    const registry = read('src/features/wisdomCanvas/registry.ts');
    assert.ok(registry.includes('export function resolveFinalCanvasImage'));
    assert.ok(
      registry.includes('hasFinalCanvasArtwork(assetId)'),
      'the resolver must gate on the manifest status',
    );

    const layer = read('src/components/wisdom/CanvasArtworkLayer.tsx');
    assert.ok(layer.includes('resolveFinalCanvasImage'));

    const canvas = read('src/components/wisdom/WisdomCanvas.tsx');
    assert.ok(
      canvas.includes('hasFinalCanvasArtwork(assetId)'),
      'WisdomCanvas must read the same manifest status as every other surface',
    );
  });

  it('never requires a canvas image outside the registry', () => {
    for (const [assetId, renderPath] of Object.entries(canvasRenderPaths)) {
      assert.ok(
        !/require\([^)]*assets\/wisdoms/.test(source(renderPath.sourcePath)),
        `${assetId}'s surface requires Canvas Pack artwork directly, bypassing the registry`,
      );
    }
  });

  it('keeps the manifest status as the only switch that reveals artwork', () => {
    // Every asset is still awaiting art, so nothing renders yet and the
    // placeholder treatment is what ships. When a status flips to 'final' the
    // matching surface turns on with no further code change.
    for (const asset of manifest.assets) {
      assert.equal(
        asset.status,
        'awaiting-final-art',
        `${asset.assetId} changed status; confirm its surface renders the delivered file`,
      );
    }
  });
});
