import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { threeWaysToUseMoneyData } from '../../content/wisdoms/threeWaysToUseMoney.data';
import {
  assetIdsSharingFallbackArtwork,
  canvasSourceKeyByAssetId,
  canvasSourceKeys,
  isCanvasAssetId,
  storySceneCanvasAssetIds,
  wisdomCanvasAssetIds,
} from './assetIds';
import type { CanvasManifest } from './types';
import { formatCanvasIssues, validateCanvasManifest } from './validation';

/**
 * Canvas Pack coverage.
 *
 * Reads the shipped manifest.json from disk so the test validates the same
 * file the application loads, and never imports a PNG.
 */

const packDir = path.join(
  process.cwd(),
  'assets/wisdoms/three-ways-to-use-money/canvases',
);
const manifest = JSON.parse(
  readFileSync(path.join(packDir, 'manifest.json'), 'utf8'),
) as CanvasManifest;

const storySceneIds = threeWaysToUseMoneyData.storyScenes.map((scene) => scene.id);
const filesOnDisk = readdirSync(packDir);

describe('canvas asset ids', () => {
  it('resolves a known asset id and rejects an unknown one', () => {
    assert.equal(isCanvasAssetId('WIS-MONEY-001-WELCOME-HERO'), true);
    assert.equal(isCanvasAssetId('WIS-MONEY-999-NOT-REAL'), false);
    assert.ok(canvasSourceKeyByAssetId['WIS-MONEY-001-WELCOME-HERO']);
  });

  it('declares fifteen unique asset ids', () => {
    assert.equal(wisdomCanvasAssetIds.length, 15);
    assert.equal(new Set(wisdomCanvasAssetIds).size, 15);
  });

  it('binds every asset id to a known source key', () => {
    for (const assetId of wisdomCanvasAssetIds) {
      const key = canvasSourceKeyByAssetId[assetId];
      assert.ok(key, `${assetId} has no source key`);
      assert.ok(
        (canvasSourceKeys as readonly string[]).includes(key),
        `${assetId} points at unknown source key "${key}"`,
      );
    }
  });
});

describe('story scenes', () => {
  it('gives all six scenes their own canvas asset id', () => {
    assert.equal(storySceneIds.length, 6);
    const mapped = storySceneIds.map((id) => storySceneCanvasAssetIds[id]);
    mapped.forEach((assetId, index) => {
      assert.ok(assetId, `scene ${storySceneIds[index]} is unmapped`);
    });
    assert.equal(new Set(mapped).size, 6, 'story scenes share a canvas');
  });

  it('keeps the approved per-scene artwork bindings', () => {
    assert.equal(canvasSourceKeyByAssetId['WIS-MONEY-001-STORY-SCENE-01'], 'cat-money');
    assert.equal(canvasSourceKeyByAssetId['WIS-MONEY-001-STORY-SCENE-03'], 'cloud-helps-friend');
    assert.equal(canvasSourceKeyByAssetId['WIS-MONEY-001-STORY-SCENE-06'], 'cloud-hero-wave');
  });
});

describe('manifest', () => {
  it('describes all fifteen assets with unique ids and filenames', () => {
    assert.equal(manifest.assets.length, 15);
    assert.equal(new Set(manifest.assets.map((a) => a.assetId)).size, 15);
    assert.equal(new Set(manifest.assets.map((a) => a.filename)).size, 15);
  });

  it('stays synchronized with the registry in both directions', () => {
    const manifestIds = manifest.assets.map((a) => a.assetId).sort();
    assert.deepEqual(manifestIds, [...wisdomCanvasAssetIds].sort());
  });

  it('keeps safe areas and focal points inside the image', () => {
    for (const asset of manifest.assets) {
      assert.ok(asset.focalPoint.x >= 0 && asset.focalPoint.x <= 1, asset.assetId);
      assert.ok(asset.focalPoint.y >= 0 && asset.focalPoint.y <= 1, asset.assetId);
      for (const area of asset.safeAreas) {
        assert.ok(area.x + area.width <= 1.0001, `${asset.assetId} ${area.purpose} width`);
        assert.ok(area.y + area.height <= 1.0001, `${asset.assetId} ${area.purpose} height`);
      }
    }
  });

  it('marks every asset as awaiting final art while no PNG exists', () => {
    for (const asset of manifest.assets) {
      assert.equal(asset.status, 'awaiting-final-art', asset.assetId);
      assert.equal(
        filesOnDisk.includes(asset.filename),
        false,
        `${asset.filename} unexpectedly present`,
      );
      assert.equal(asset.textFree, true, asset.assetId);
    }
  });

  it('passes Canvas Pack validation', () => {
    const issues = validateCanvasManifest(manifest, {
      knownWisdomIds: ['three-ways-to-use-money'],
      knownStorySceneIds: storySceneIds,
      existingFilenames: filesOnDisk,
    });
    assert.deepEqual(issues, [], formatCanvasIssues(issues));
  });
});

describe('validation rules', () => {
  const base = () => JSON.parse(JSON.stringify(manifest)) as CanvasManifest;
  const options = {
    knownWisdomIds: ['three-ways-to-use-money'],
    knownStorySceneIds: storySceneIds,
    existingFilenames: filesOnDisk,
  };

  it('detects a duplicate asset id', () => {
    const m = base();
    m.assets[1] = { ...m.assets[1], assetId: m.assets[0].assetId };
    const issues = validateCanvasManifest(m, options);
    assert.ok(issues.some((i) => i.field === 'assetId' && /Duplicate/.test(i.message)));
  });

  it('detects a safe area outside the image', () => {
    const m = base();
    m.assets[0].safeAreas.push({ x: 0.8, y: 0.8, width: 0.5, height: 0.5, purpose: 'title' });
    const issues = validateCanvasManifest(m, options);
    assert.ok(issues.some((i) => /beyond the image bounds/.test(i.message)));
  });

  it('detects an aspect ratio that disagrees with the dimensions', () => {
    const m = base();
    m.assets[0].aspectRatio = 9;
    const issues = validateCanvasManifest(m, options);
    assert.ok(issues.some((i) => i.field === 'aspectRatio'));
  });

  it('detects a missing accessibility description', () => {
    const m = base();
    m.assets[0].accessibilityDescription = '';
    const issues = validateCanvasManifest(m, options);
    assert.ok(issues.some((i) => i.field === 'accessibilityDescription'));
  });

  it('detects an asset claiming to be final with no file present', () => {
    const m = base();
    m.assets[0].status = 'final';
    const issues = validateCanvasManifest(m, options);
    assert.ok(issues.some((i) => i.field === 'status' && /not in the Canvas Pack folder/.test(i.message)));
  });

  it('detects a manifest entry missing from the registry', () => {
    const m = base();
    m.assets = m.assets.slice(1);
    const issues = validateCanvasManifest(m, options);
    assert.ok(issues.some((i) => i.field === 'manifest'));
  });

  it('detects an unknown Wisdom id and stage id', () => {
    const m = base();
    m.assets[0] = { ...m.assets[0], wisdomId: 'nope', stageId: 'nowhere' as never };
    const issues = validateCanvasManifest(m, options);
    assert.ok(issues.some((i) => i.field === 'wisdomId'));
    assert.ok(issues.some((i) => i.field === 'stageId'));
  });
});

describe('asset id stability', () => {
  it('survives a version change without the id changing', () => {
    const m = base2();
    const asset = m.assets[0];
    const originalId = asset.assetId;
    asset.version = 2;
    asset.filename = asset.filename.replace('-v1.png', '-v2.png');
    asset.replacementHistory = [
      { version: 1, filename: 'WIS-MONEY-001-welcome-hero-v1.png', replacedOn: '2026-01-01' },
    ];
    assert.equal(asset.assetId, originalId);
    const issues = validateCanvasManifest(m, {
      knownWisdomIds: ['three-ways-to-use-money'],
      knownStorySceneIds: storySceneIds,
    });
    assert.deepEqual(issues, [], formatCanvasIssues(issues));
  });

  function base2() {
    return JSON.parse(JSON.stringify(manifest)) as CanvasManifest;
  }
});

describe('production content stays asset-free', () => {
  it('imports no PNG files in the Wisdom data module', () => {
    const source = readFileSync(
      path.join(process.cwd(), 'src/content/wisdoms/threeWaysToUseMoney.data.ts'),
      'utf8',
    );
    assert.equal(/\.png/.test(source), false, 'data module must not reference PNGs');
    assert.equal(/require\(/.test(source), false, 'data module must not require assets');
  });

  it('records which asset ids still share existing artwork', () => {
    assert.equal(assetIdsSharingFallbackArtwork.length, 9);
    for (const assetId of assetIdsSharingFallbackArtwork) {
      assert.ok(isCanvasAssetId(assetId));
    }
    // The six story scenes are not fallbacks; they keep their own approved art.
    for (const assetId of Object.values(storySceneCanvasAssetIds)) {
      assert.equal(assetIdsSharingFallbackArtwork.includes(assetId), false);
    }
  });
});

describe('rejected reference artwork is quarantined', () => {
  const rejectedDir = path.join(
    process.cwd(),
    'docs/visual-references/wis-money-001-v1-rejected',
  );

  it('keeps the rejected v1 pack out of the production Canvas Pack folder', () => {
    for (const name of filesOnDisk) {
      assert.equal(
        /^WIS-MONEY-001-.*\.png$/.test(name),
        false,
        `${name} must not sit in the production canvases folder`,
      );
    }
    assert.deepEqual(filesOnDisk.sort(), ['README.md', 'manifest.json']);
  });

  it('still holds the rejected pack as a reference with a review', () => {
    const rejected = readdirSync(rejectedDir);
    assert.equal(rejected.filter((n) => n.endsWith('.png')).length, 15);
    assert.ok(rejected.includes('REVIEW.md'));
    assert.ok(rejected.includes('delivered-manifest.json'));
    assert.ok(rejected.includes('delivered-README.md'));
    const review = readFileSync(path.join(rejectedDir, 'REVIEW.md'), 'utf8');
    assert.ok(/Rejected for production use/.test(review));
  });

  it('never routes a production asset id at a rejected reference file', () => {
    // Source keys are plain identifiers bound to approved artwork in
    // registry.ts. None may point into the reference folder.
    for (const assetId of wisdomCanvasAssetIds) {
      const key = canvasSourceKeyByAssetId[assetId];
      assert.equal(/wis-money-001-v1-rejected|visual-references/.test(key), false, assetId);
    }
    const registrySource = readFileSync(
      path.join(process.cwd(), 'src/features/wisdomCanvas/registry.ts'),
      'utf8',
    );
    assert.equal(
      /visual-references|v1-rejected/.test(registrySource),
      false,
      'registry must not require anything from the reference folder',
    );
  });

  it('keeps every production asset awaiting final art', () => {
    for (const asset of manifest.assets) {
      assert.equal(asset.status, 'awaiting-final-art', asset.assetId);
      assert.equal(
        filesOnDisk.includes(asset.filename),
        false,
        `${asset.filename} should not be present while awaiting final art`,
      );
    }
  });

  it('preserves stage-specific canvas shapes rather than one shared ratio', () => {
    const ratios = new Set(manifest.assets.map((a) => a.aspectRatio));
    assert.ok(ratios.size > 1, 'manifest must not force a single aspect ratio');
    const byId = Object.fromEntries(manifest.assets.map((a) => [a.assetId, a]));
    // Every artwork region is now a fixed landscape band: wide, short, and
    // never taller than it is wide. Before stabilisation Your Choice was a
    // portrait full-stage background whose height moved with the allocation
    // controls, so its shape could not be specified at all.
    for (const asset of manifest.assets) {
      assert.ok(asset.aspectRatio > 1, `${asset.assetId} must be a landscape band`);
    }
    // The shorter the band, the wider its ratio. Takeaway (170) is the
    // shortest stage band, Talk (240) the tallest.
    assert.ok(
      byId['WIS-MONEY-001-TAKEAWAY-BACKGROUND'].aspectRatio >
        byId['WIS-MONEY-001-TALK-WITH-CLOUD'].aspectRatio,
      'Takeaway is the shortest stage band and must be the widest of the two',
    );
    assert.ok(byId['WIS-MONEY-001-LIBRARY-CARD'].aspectRatio > 2, 'Library card is wide');
  });
});
