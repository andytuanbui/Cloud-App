import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { threeWaysToUseMoneyData } from '../../content/wisdoms/threeWaysToUseMoney.data';
import { storySceneCanvasAssetIds, wisdomCanvasAssetIds } from './assetIds';
import type { CanvasManifest } from './types';

/**
 * Canvas Template Kit coverage.
 *
 * The kit is documentation: one SVG guide and PNG preview per distinct
 * production container, measured from the real application. These tests keep
 * the kit and the production manifest from drifting apart.
 */

const templateDir = path.join(process.cwd(), 'docs/canvas-templates/wis-money-001');
const packDir = path.join(
  process.cwd(),
  'assets/wisdoms/three-ways-to-use-money/canvases',
);
const manifest = JSON.parse(
  readFileSync(path.join(packDir, 'manifest.json'), 'utf8'),
) as CanvasManifest;
const templateFiles = readdirSync(templateDir);

/** Every distinct container shape, and which asset ids map onto it. */
const templateTypes: Record<string, string[]> = {
  'welcome-hero': ['WIS-MONEY-001-WELCOME-HERO'],
  'story-scene': Object.values(storySceneCanvasAssetIds),
  'talk-with-cloud': ['WIS-MONEY-001-TALK-WITH-CLOUD'],
  'choice-background': ['WIS-MONEY-001-CHOICE-BACKGROUND'],
  'takeaway-background': ['WIS-MONEY-001-TAKEAWAY-BACKGROUND'],
  'practice-hero': ['WIS-MONEY-001-PRACTICE-HERO'],
  'completion-hero': ['WIS-MONEY-001-COMPLETION-HERO'],
  'home-card': ['WIS-MONEY-001-HOME-CARD'],
  'home-card-compact': ['WIS-MONEY-001-HOME-CARD-COMPACT'],
  'library-card': ['WIS-MONEY-001-LIBRARY-CARD'],
};

describe('template files', () => {
  it('has an SVG for every template type', () => {
    for (const key of Object.keys(templateTypes)) {
      assert.ok(
        templateFiles.includes(`WIS-MONEY-001-${key}-template.svg`),
        `missing SVG for ${key}`,
      );
    }
    assert.equal(templateFiles.filter((f) => f.endsWith('.svg')).length, 10);
  });

  it('has a PNG preview for every SVG', () => {
    for (const svg of templateFiles.filter((f) => f.endsWith('.svg'))) {
      assert.ok(
        templateFiles.includes(svg.replace('.svg', '.png')),
        `missing PNG preview for ${svg}`,
      );
    }
  });

  it('ships a contact sheet and both documents', () => {
    assert.ok(templateFiles.includes('contact-sheet.png'));
    assert.ok(templateFiles.includes('MEASUREMENTS.md'));
    assert.ok(templateFiles.includes('ART-DIRECTION.md'));
  });

  it('states the text-free rule on every template guide', () => {
    for (const svg of templateFiles.filter((f) => f.endsWith('.svg'))) {
      const body = readFileSync(path.join(templateDir, svg), 'utf8');
      assert.ok(/TEXT-FREE/.test(body), `${svg} omits the text-free rule`);
      assert.ok(/focal point/.test(body), `${svg} omits the focal point`);
      assert.ok(/safe area/.test(body), `${svg} omits safe areas`);
    }
  });
});

describe('templates and manifest agree', () => {
  it('maps every production asset to exactly one documented template type', () => {
    const mapped = Object.values(templateTypes).flat();
    for (const assetId of wisdomCanvasAssetIds) {
      assert.equal(
        mapped.filter((id) => id === assetId).length,
        1,
        `${assetId} is not mapped to exactly one template`,
      );
    }
    assert.equal(mapped.length, wisdomCanvasAssetIds.length);
  });

  it('gives all six story scenes the shared story template', () => {
    const sceneIds = threeWaysToUseMoneyData.storyVisuals.map((visual) => visual.id);
    assert.equal(sceneIds.length, 6);
    assert.equal(templateTypes['story-scene'].length, 6);
    const byId = Object.fromEntries(manifest.assets.map((a) => [a.assetId, a]));
    const ratios = new Set(
      templateTypes['story-scene'].map((id) => byId[id].aspectRatio),
    );
    assert.equal(ratios.size, 1, 'story scenes must share one container ratio');
  });

  it('uses normalized safe areas everywhere', () => {
    for (const asset of manifest.assets) {
      for (const area of asset.safeAreas) {
        for (const v of [area.x, area.y, area.width, area.height]) {
          assert.ok(v >= 0 && v <= 1, `${asset.assetId} ${area.purpose} not normalized`);
        }
        assert.ok(area.x + area.width <= 1.0001, asset.assetId);
        assert.ok(area.y + area.height <= 1.0001, asset.assetId);
      }
      assert.ok(asset.focalPoint.x >= 0 && asset.focalPoint.x <= 1, asset.assetId);
      assert.ok(asset.focalPoint.y >= 0 && asset.focalPoint.y <= 1, asset.assetId);
    }
  });

  it('does not force one ratio across the pack', () => {
    const ratios = new Set(manifest.assets.map((a) => a.aspectRatio));
    assert.ok(ratios.size >= 6, 'containers must keep stage-specific shapes');
    const byId = Object.fromEntries(manifest.assets.map((a) => [a.assetId, a]));
    assert.ok(
      byId['WIS-MONEY-001-CHOICE-BACKGROUND'].aspectRatio > 1,
      'Your Choice is a fixed landscape band, not a portrait full-stage background',
    );
    assert.ok(byId['WIS-MONEY-001-LIBRARY-CARD'].aspectRatio > 2, 'Library card is wide');
  });
});

describe('character roles', () => {
  const byId = Object.fromEntries(manifest.assets.map((a) => [a.assetId, a]));

  it('keeps the Home card guide-led and the Library card object-led', () => {
    assert.equal(byId['WIS-MONEY-001-HOME-CARD'].character, 'Cloud');
    assert.equal(byId['WIS-MONEY-001-LIBRARY-CARD'].character, 'none');
  });

  it('prohibits Cloud from every Leo Story asset', () => {
    for (const assetId of Object.values(storySceneCanvasAssetIds)) {
      assert.notEqual(
        byId[assetId].character,
        'Cloud',
        `${assetId} must never be drawn as Cloud`,
      );
    }
  });

  it('keeps Welcome free of both characters', () => {
    assert.equal(byId['WIS-MONEY-001-WELCOME-HERO'].character, 'none');
  });

  it('allows Cloud only on guide-led surfaces', () => {
    const cloudAssets = manifest.assets
      .filter((a) => a.character === 'Cloud')
      .map((a) => a.assetId)
      .sort();
    assert.deepEqual(cloudAssets, [
      'WIS-MONEY-001-COMPLETION-HERO',
      'WIS-MONEY-001-HOME-CARD',
      'WIS-MONEY-001-HOME-CARD-COMPACT',
      'WIS-MONEY-001-PRACTICE-HERO',
      'WIS-MONEY-001-TALK-WITH-CLOUD',
    ]);
  });
});

describe('production artwork is landing one asset at a time', () => {
  const manifestFilenames = manifest.assets.map((a) => a.filename);
  /** Pack artwork on disk, whether or not its status has been approved. */
  const delivered = readdirSync(packDir).filter((name) =>
    manifestFilenames.includes(name),
  );

  it('keeps every asset text-free and everything undelivered awaiting art', () => {
    for (const asset of manifest.assets) {
      assert.equal(asset.textFree, true, asset.assetId);
      if (asset.status === 'final') continue;
      assert.equal(asset.status, 'awaiting-final-art', asset.assetId);
    }
  });

  it('holds only manifest-named artwork in the production canvas folder', () => {
    const pack = readdirSync(packDir);
    assert.deepEqual(pack.sort(), ['README.md', 'manifest.json', ...delivered].sort());
  });

  it('has approved exactly the two masters', () => {
    // The anchor (Cloud's Character Master) and the object master were both
    // visually approved, so they are the only assets in the pack that render.
    // The other thirteen keep their placeholder treatment.
    assert.deepEqual(
      manifest.assets.filter((a) => a.status === 'final').map((a) => a.assetId).sort(),
      ['WIS-MONEY-001-STORY-SCENE-04', 'WIS-MONEY-001-TALK-WITH-CLOUD'],
    );
    assert.ok(
      delivered.includes('WIS-MONEY-001-talk-with-cloud-v1.png'),
      'the approved anchor artwork must be in the pack folder',
    );
    assert.ok(
      delivered.includes('WIS-MONEY-001-story-scene-04-v1.png'),
      'the approved object master artwork must be in the pack folder',
    );
  });
});
