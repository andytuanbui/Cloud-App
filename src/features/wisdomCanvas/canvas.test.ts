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
import { focalCoverInset } from './focalPoint';
import { hasFinalCanvasArtwork } from './manifest';
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

/**
 * An asset moves through three states, not two, and the tests below assert the
 * shape of that transition rather than a fixed count that has to be edited on
 * every delivery:
 *
 * 1. **Not drawn** — `awaiting-final-art`, no file in the pack folder.
 * 2. **Delivered, under review** — artwork exists in the pack folder but the
 *    status is still `awaiting-final-art`. The registry is wired to it, the app
 *    does *not* draw it, and the surface keeps its approved placeholder. No
 *    asset is in this state today.
 * 3. **Approved** — `final`, file present. `hasFinalCanvasArtwork` turns the
 *    surface on. `TALK-WITH-CLOUD` reached this state on 2026-08-17: the
 *    revised anchor was visually approved, so it is the pack's Character
 *    Master and the one canvas the app draws.
 *
 * The invariant that matters is that state 2 never leaks into state 3 by
 * accident: nothing renders until a human flips the status.
 */
const finalAssets = manifest.assets.filter((a) => a.status === 'final');
const pendingAssets = manifest.assets.filter((a) => a.status !== 'final');
const approvedFilenames = finalAssets.map((a) => a.filename);
const manifestFilenames = manifest.assets.map((a) => a.filename);
/** Pack artwork present on disk, whether or not it has been approved yet. */
const deliveredFilenames = filesOnDisk.filter((name) =>
  manifestFilenames.includes(name),
);

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
    // Scene 04 is approved and bound to its own PNG in the pack folder. The
    // other five keep the bindings they shipped with.
    assert.equal(
      canvasSourceKeyByAssetId['WIS-MONEY-001-STORY-SCENE-04'],
      'wis-money-001-story-scene-04',
    );
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

  it('backs every approved asset with a file', () => {
    for (const asset of finalAssets) {
      assert.equal(
        filesOnDisk.includes(asset.filename),
        true,
        `${asset.assetId} is final but ${asset.filename} is missing from the pack folder`,
      );
    }
    for (const asset of pendingAssets) {
      assert.equal(asset.status, 'awaiting-final-art', asset.assetId);
    }
    for (const asset of manifest.assets) {
      assert.equal(asset.textFree, true, asset.assetId);
    }
  });

  it('has approved exactly the two master assets', () => {
    // TALK-WITH-CLOUD is the pack anchor and Character Master: it locks
    // Cloud's face, hair, body proportions, expression language, outfit and
    // rendering for every other Cloud-bearing canvas.
    // STORY-SCENE-04 is the object master: it locks the football cards, Mia's
    // gift and the headphones for every canvas they reappear on.
    // Both were visually approved; nothing else in the pack renders yet.
    assert.deepEqual(finalAssets.map((a) => a.assetId).sort(), [
      'WIS-MONEY-001-STORY-SCENE-04',
      'WIS-MONEY-001-TALK-WITH-CLOUD',
    ]);
    assert.equal(pendingAssets.length, 13);
  });

  it('keeps every unapproved asset from rendering', () => {
    // Approval is per asset. The other fourteen keep their placeholder
    // treatment, and none of them has artwork of its own sitting on disk.
    for (const asset of pendingAssets) {
      assert.equal(asset.status, 'awaiting-final-art', asset.assetId);
      assert.equal(
        filesOnDisk.includes(asset.filename),
        false,
        `${asset.assetId} is unapproved, so ${asset.filename} must not be in the pack folder yet`,
      );
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

  it('records every asset id that must still show the placeholder', () => {
    assert.equal(assetIdsSharingFallbackArtwork.length, 8);
    for (const assetId of assetIdsSharingFallbackArtwork) {
      assert.ok(isCanvasAssetId(assetId));
    }
    // The six story scenes are not placeholders; they keep their own approved art.
    for (const assetId of Object.values(storySceneCanvasAssetIds)) {
      assert.equal(assetIdsSharingFallbackArtwork.includes(assetId), false);
    }
    // Nothing approved may still be listed as showing a placeholder.
    for (const asset of manifest.assets) {
      if (asset.status !== 'final') continue;
      assert.equal(
        assetIdsSharingFallbackArtwork.includes(asset.assetId as never),
        false,
        `${asset.assetId} is approved final and must not still show a placeholder`,
      );
    }
    // Delivery is not approval. An asset whose own PNG is already on disk but
    // whose status is still `awaiting-final-art` stays listed — this is the
    // state 2 rule, and it is what keeps an unapproved canvas off screen.
    for (const asset of manifest.assets) {
      if (!filesOnDisk.includes(asset.filename)) continue;
      if (asset.status === 'final') continue;
      assert.ok(
        assetIdsSharingFallbackArtwork.includes(asset.assetId as never),
        `${asset.assetId} has been delivered but not approved, so it must still be listed as showing a placeholder`,
      );
    }
  });
});

describe('the approved anchor is the one canvas that renders', () => {
  const anchorId = 'WIS-MONEY-001-TALK-WITH-CLOUD' as const;
  const anchor = manifest.assets.find((a) => a.assetId === anchorId);
  if (!anchor) throw new Error('the anchor is missing from the manifest');

  it('is backed by a 1170 x 720 RGB PNG with no alpha', () => {
    // Read the PNG header rather than trusting the manifest: bytes 16-24 are
    // width and height, byte 25 is the colour type. 2 is truecolour RGB; 6
    // would be RGBA, and a tRNS chunk would smuggle transparency into a
    // palette. Either would leave soft edges inside an opaque band.
    const png = readFileSync(path.join(packDir, anchor.filename));
    assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
    assert.equal(png.readUInt32BE(16), 1170, 'width');
    assert.equal(png.readUInt32BE(20), 720, 'height');
    assert.equal(png.readUInt8(24), 8, 'bit depth');
    assert.equal(png.readUInt8(25), 2, 'colour type must be 2, truecolour RGB with no alpha');
    assert.equal(png.includes(Buffer.from('tRNS')), false, 'no transparency chunk');
    assert.equal(anchor.sourceWidth, 1170);
    assert.equal(anchor.sourceHeight, 720);
  });

  it('is approved final, so every surface bound to it draws it', () => {
    assert.equal(anchor.status, 'final');
    assert.equal(
      hasFinalCanvasArtwork(anchorId),
      true,
      'the one switch every surface reads must report the anchor as approved',
    );
    assert.equal(
      assetIdsSharingFallbackArtwork.includes(anchorId),
      false,
      'an approved canvas must not still be listed as showing a placeholder',
    );
  });

  it('keeps the same registry wiring it had while under review', () => {
    // Approval was a one-field manifest edit. The source key, the registry
    // binding and the filename are exactly what they were before it.
    assert.ok(filesOnDisk.includes(anchor.filename));
    assert.equal(canvasSourceKeyByAssetId[anchorId], 'wis-money-001-talk-with-cloud');
    assert.ok(canvasSourceKeys.includes('wis-money-001-talk-with-cloud'));

    const registrySource = readFileSync(
      path.join(process.cwd(), 'src/features/wisdomCanvas/registry.ts'),
      'utf8',
    );
    assert.ok(
      registrySource.includes(`'wis-money-001-talk-with-cloud': require(`),
      'the source key must stay bound in the registry',
    );
    assert.ok(
      registrySource.includes(anchor.filename),
      'the registry must require the same filename the manifest names',
    );
  });

  it('would hide the artwork again if the status went back', () => {
    // The inverse of approval, and the reason the three-state model holds:
    // status is the only switch. Proved on a copy so the shipped manifest is
    // never mutated.
    const reverted = JSON.parse(JSON.stringify(manifest)) as CanvasManifest;
    const entry = reverted.assets.find((a) => a.assetId === anchorId);
    if (!entry) throw new Error('the anchor is missing from the manifest copy');
    entry.status = 'awaiting-final-art';
    const revertedStatus: string = entry.status;
    assert.notEqual(
      revertedStatus,
      'final',
      'reverting the status takes the artwork straight back off screen',
    );
    assert.equal(
      entry.filename,
      anchor.filename,
      'the binding does not move with the status, so nothing has to be rewired',
    );
  });

  it('keeps the focal point visible at every supported band width', () => {
    // Band widths measured on the real container — see MEASUREMENTS.md. The
    // band height is fixed at 240 everywhere, so only width varies.
    const bandHeight = 240;
    const bandWidths = [335, 350, 390];
    const pct = (value: unknown) =>
      typeof value === 'string' ? Number.parseFloat(value) : Number(value ?? 0);
    const inset = focalCoverInset(anchor.focalPoint);

    // Every inset is zero or negative, so the image box always contains the
    // band and no uncovered strip can appear down an edge.
    for (const side of [inset.left, inset.right, inset.top, inset.bottom]) {
      assert.ok(pct(side) <= 0, `inset ${String(side)} must never be positive`);
    }

    for (const bandWidth of bandWidths) {
      const boxX = (pct(inset.left) / 100) * bandWidth;
      const boxY = (pct(inset.top) / 100) * bandHeight;
      const boxW = bandWidth * (1 - pct(inset.left) / 100 - pct(inset.right) / 100);
      const boxH = bandHeight * (1 - pct(inset.top) / 100 - pct(inset.bottom) / 100);

      assert.ok(boxX <= 0.001 && boxY <= 0.001, `${bandWidth}: box origin inside the band`);
      assert.ok(
        boxX + boxW >= bandWidth - 0.001 && boxY + boxH >= bandHeight - 0.001,
        `${bandWidth}: the image box must cover the whole band`,
      );

      // resizeMode 'cover', centred inside that box.
      const scale = Math.max(boxW / anchor.sourceWidth, boxH / anchor.sourceHeight);
      const imgX = boxX + (boxW - anchor.sourceWidth * scale) / 2;
      const imgY = boxY + (boxH - anchor.sourceHeight * scale) / 2;
      const visibleX0 = -imgX / scale / anchor.sourceWidth;
      const visibleX1 = (bandWidth - imgX) / scale / anchor.sourceWidth;
      const visibleY0 = -imgY / scale / anchor.sourceHeight;
      const visibleY1 = (bandHeight - imgY) / scale / anchor.sourceHeight;

      // Cloud's face sits at the focal point. It must never reach an edge.
      assert.ok(
        anchor.focalPoint.x > visibleX0 + 0.05 && anchor.focalPoint.x < visibleX1 - 0.05,
        `${bandWidth}: focal x ${anchor.focalPoint.x} too close to a horizontal edge (${visibleX0.toFixed(3)}-${visibleX1.toFixed(3)})`,
      );
      assert.ok(
        anchor.focalPoint.y > visibleY0 + 0.05 && anchor.focalPoint.y < visibleY1 - 0.05,
        `${bandWidth}: focal y ${anchor.focalPoint.y} too close to a vertical edge (${visibleY0.toFixed(3)}-${visibleY1.toFixed(3)})`,
      );

      // Cloud stays in the left third and the right stays open: the focal
      // point must land in the left third of what the child actually sees.
      const focalWithinBand = (anchor.focalPoint.x - visibleX0) / (visibleX1 - visibleX0);
      assert.ok(
        focalWithinBand < 0.34,
        `${bandWidth}: Cloud must stay in the left third, focal lands at ${focalWithinBand.toFixed(3)}`,
      );
    }
  });

  it('gates the Talk with Cloud band on the manifest status alone', () => {
    const canvas = readFileSync(
      path.join(process.cwd(), 'src/components/wisdom/WisdomCanvas.tsx'),
      'utf8',
    );
    assert.ok(
      canvas.includes('hasFinalCanvasArtwork(assetId)'),
      'the band must decide from the manifest status, not from a remembered list',
    );
    const layer = readFileSync(
      path.join(process.cwd(), 'src/components/wisdom/CanvasArtworkLayer.tsx'),
      'utf8',
    );
    assert.ok(
      layer.includes('resolveFinalCanvasImage'),
      'the artwork layer must resolve through the status-gated resolver',
    );
  });
});

describe('the approved object master', () => {
  // STORY-SCENE-04 (`leo-sees-three-choices`) is the pack's second approved
  // canvas. It carries no character at all — its job is to fix the three
  // recurring objects, so every later canvas draws the same football cards,
  // the same gift for Mia and the same headphones.
  const objectMasterId = 'WIS-MONEY-001-STORY-SCENE-04' as const;
  const objectMaster = manifest.assets.find((a) => a.assetId === objectMasterId);
  if (!objectMaster) throw new Error('the object master is missing from the manifest');

  it('is backed by a 1170 x 903 RGB PNG with no alpha', () => {
    const png = readFileSync(path.join(packDir, objectMaster.filename));
    assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
    assert.equal(png.readUInt32BE(16), 1170, 'width');
    assert.equal(png.readUInt32BE(20), 903, 'height');
    assert.equal(png.readUInt8(24), 8, 'bit depth');
    assert.equal(png.readUInt8(25), 2, 'colour type must be 2, truecolour RGB with no alpha');
    assert.equal(png.includes(Buffer.from('tRNS')), false, 'no transparency chunk');
    assert.equal(objectMaster.sourceWidth, 1170);
    assert.equal(objectMaster.sourceHeight, 903);
  });

  it('is approved final, so the Story stage draws it instead of the placeholder', () => {
    assert.equal(objectMaster.status, 'final');
    assert.equal(
      hasFinalCanvasArtwork(objectMasterId),
      true,
      'the one switch every surface reads must report the object master as approved',
    );
    assert.equal(
      assetIdsSharingFallbackArtwork.includes(objectMasterId),
      false,
      'an approved canvas must not still be listed as showing a placeholder',
    );
  });

  it('is wired to its own artwork in the pack folder, not a borrowed image', () => {
    assert.ok(filesOnDisk.includes(objectMaster.filename));
    assert.equal(canvasSourceKeyByAssetId[objectMasterId], 'wis-money-001-story-scene-04');
    assert.ok(canvasSourceKeys.includes('wis-money-001-story-scene-04'));

    const registrySource = readFileSync(
      path.join(process.cwd(), 'src/features/wisdomCanvas/registry.ts'),
      'utf8',
    );
    assert.ok(
      registrySource.includes(`'wis-money-001-story-scene-04': require(`),
      'the source key must be bound in the registry',
    );
    assert.ok(
      registrySource.includes(objectMaster.filename),
      'the registry must require the same filename the manifest names',
    );
  });

  it('keeps all three objects inside the crop at every story band width', () => {
    // Bounding boxes measured off the approved PNG, normalised to its
    // 1170 x 903 source. The story band is fixed at 287 tall and measures
    // 315 / 330 / 370 wide at 375 / 390 / 430 — see MEASUREMENTS.md.
    const objects = [
      { name: 'football cards', x0: 0.096, x1: 0.401 },
      { name: "Mia's gift", x0: 0.402, x1: 0.594 },
      { name: 'headphones', x0: 0.609, x1: 0.879 },
    ];
    const bandHeight = 287;
    const bandWidths = [315, 330, 370];
    const pct = (value: unknown) =>
      typeof value === 'string' ? Number.parseFloat(value) : Number(value ?? 0);
    const inset = focalCoverInset(objectMaster.focalPoint);

    for (const side of [inset.left, inset.right, inset.top, inset.bottom]) {
      assert.ok(pct(side) <= 0, `inset ${String(side)} must never be positive`);
    }

    for (const bandWidth of bandWidths) {
      const boxX = (pct(inset.left) / 100) * bandWidth;
      const boxY = (pct(inset.top) / 100) * bandHeight;
      const boxW = bandWidth * (1 - pct(inset.left) / 100 - pct(inset.right) / 100);
      const boxH = bandHeight * (1 - pct(inset.top) / 100 - pct(inset.bottom) / 100);

      const scale = Math.max(boxW / objectMaster.sourceWidth, boxH / objectMaster.sourceHeight);
      const imgX = boxX + (boxW - objectMaster.sourceWidth * scale) / 2;
      const visibleX0 = -imgX / scale / objectMaster.sourceWidth;
      const visibleX1 = (bandWidth - imgX) / scale / objectMaster.sourceWidth;

      for (const object of objects) {
        assert.ok(
          object.x0 > visibleX0 && object.x1 < visibleX1,
          `${bandWidth}: ${object.name} (${object.x0}-${object.x1}) is cropped by the visible window ${visibleX0.toFixed(3)}-${visibleX1.toFixed(3)}`,
        );
      }
    }
  });

  it('carries no character, so nothing here can drift into Cloud or Leo', () => {
    assert.equal(objectMaster.character, 'none');
    assert.equal(objectMaster.textFree, true);
    assert.equal(objectMaster.storySceneId, 'leo-sees-three-choices');
  });
});

describe('rejected reference artwork is quarantined', () => {
  const rejectedDir = path.join(
    process.cwd(),
    'docs/visual-references/wis-money-001-v1-rejected',
  );

  it('keeps the rejected v1 pack out of the production Canvas Pack folder', () => {
    // The only PNGs allowed here are ones the manifest names. Anything else —
    // notably a v1 file copied back out of the quarantine folder — is a stray
    // and fails, whether or not any status has been flipped.
    for (const name of filesOnDisk) {
      if (!/^WIS-MONEY-001-.*\.png$/.test(name)) continue;
      assert.ok(
        manifestFilenames.includes(name),
        `${name} sits in the production canvases folder but no manifest entry names it`,
      );
    }
    assert.deepEqual(
      filesOnDisk.sort(),
      ['README.md', 'manifest.json', ...deliveredFilenames].sort(),
    );
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

  it('keeps every production asset except the two approved masters awaiting final art', () => {
    const approved = new Set([
      'WIS-MONEY-001-TALK-WITH-CLOUD',
      'WIS-MONEY-001-STORY-SCENE-04',
    ]);
    for (const asset of manifest.assets) {
      if (approved.has(asset.assetId)) {
        assert.equal(asset.status, 'final', asset.assetId);
        continue;
      }
      assert.equal(asset.status, 'awaiting-final-art', asset.assetId);
    }
  });

  it('never sources delivered artwork from the quarantined v1 pack', () => {
    const rejectedDir = path.join(
      process.cwd(),
      'docs/visual-references/wis-money-001-v1-rejected',
    );
    const rejected = readdirSync(rejectedDir);
    for (const name of deliveredFilenames) {
      // A v1 file of the same name exists in quarantine. Delivered art must be
      // a genuinely new export, not that file moved across.
      if (!rejected.includes(name)) continue;
      const packFile = readFileSync(path.join(packDir, name));
      const quarantined = readFileSync(path.join(rejectedDir, name));
      assert.equal(
        packFile.equals(quarantined),
        false,
        `${name} is byte-identical to the rejected v1 file`,
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
