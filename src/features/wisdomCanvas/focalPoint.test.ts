import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { focalCoverInset } from './focalPoint';
import type { CanvasManifest } from './types';

/**
 * Focal-point coverage.
 *
 * A `cover` image fills its box exactly, so panning it by shifting a
 * container-sized box slides the picture off one side and leaves the opposite
 * edge of the band uncovered. The original implementation set `left` on top of
 * `StyleSheet.absoluteFillObject`, whose `right: 0` stayed in force — that
 * narrows the box rather than moving it, and put a 3.36% transparent strip down
 * the left of the Talk band, exactly where Cloud stands.
 *
 * The invariant that prevents it coming back: every inset is zero or negative,
 * so the image box always contains the band.
 */

const manifest = JSON.parse(
  readFileSync(
    path.join(
      process.cwd(),
      'assets/wisdoms/three-ways-to-use-money/canvases/manifest.json',
    ),
    'utf8',
  ),
) as CanvasManifest;

function percent(value: unknown): number {
  assert.equal(typeof value, 'string', `expected a percentage, got ${String(value)}`);
  const parsed = Number(String(value).replace('%', ''));
  assert.ok(Number.isFinite(parsed), `unparseable percentage ${String(value)}`);
  return parsed;
}

function insetValues(focal: { x: number; y: number }) {
  const inset = focalCoverInset(focal);
  return {
    bottom: percent(inset.bottom),
    left: percent(inset.left),
    right: percent(inset.right),
    top: percent(inset.top),
  };
}

describe('focal cover inset', () => {
  it('never insets an edge, so the band is always fully covered', () => {
    // The whole point. A positive inset is what produced the empty strip.
    for (let x = 0; x <= 1.0001; x += 0.05) {
      for (let y = 0; y <= 1.0001; y += 0.05) {
        const { bottom, left, right, top } = insetValues({ x, y });
        assert.ok(left <= 0, `focal ${x},${y} insets the left by ${left}%`);
        assert.ok(right <= 0, `focal ${x},${y} insets the right by ${right}%`);
        assert.ok(top <= 0, `focal ${x},${y} insets the top by ${top}%`);
        assert.ok(bottom <= 0, `focal ${x},${y} insets the bottom by ${bottom}%`);
      }
    }
  });

  it('covers the band for every focal point in the shipped manifest', () => {
    for (const asset of manifest.assets) {
      const { bottom, left, right, top } = insetValues(asset.focalPoint);
      // Box width  = 100% - left - right  ≥ 100%.
      assert.ok(100 - left - right >= 100, `${asset.assetId} box is narrower than its band`);
      assert.ok(100 - top - bottom >= 100, `${asset.assetId} box is shorter than its band`);
    }
  });

  it('leaves a centred focal point exactly filling the band', () => {
    assert.deepEqual(insetValues({ x: 0.5, y: 0.5 }), {
      bottom: 0,
      left: 0,
      right: 0,
      top: 0,
    });
  });

  it('grows the box away from the focal point rather than sliding it', () => {
    // Talk with Cloud: 0.22 / 0.42, left of centre and slightly above it.
    const talk = insetValues({ x: 0.22, y: 0.42 });
    assert.equal(talk.left, 0, 'a left-biased focal point must stay flush left');
    assert.ok(talk.right < 0, 'the box must overflow right to reveal the left of the image');
    assert.equal(talk.top, 0);
    assert.ok(talk.bottom < 0);

    // Completion hero: 0.74, right of centre — the mirror case.
    const completion = insetValues({ x: 0.74, y: 0.44 });
    assert.ok(completion.left < 0, 'a right-biased focal point must overflow left');
    assert.equal(completion.right, 0, 'and stay flush right');
  });

  it('keeps the original pan magnitude, so no composition moves', () => {
    // Previously `(0.5 - focal.x) * 12`. Same distance, corrected direction.
    const { right } = insetValues({ x: 0.22, y: 0.5 });
    assert.equal(Math.abs(right), (0.5 - 0.22) * 12);
    const { left } = insetValues({ x: 0.74, y: 0.5 });
    assert.equal(Math.abs(left), Math.abs((0.5 - 0.74) * 12));
  });
});

describe('both canvas surfaces share the focal implementation', () => {
  const files = [
    'src/components/wisdom/WisdomCanvas.tsx',
    'src/components/wisdom/CanvasArtworkLayer.tsx',
  ];

  it('routes every cover image through focalCoverInset', () => {
    for (const file of files) {
      const source = readFileSync(path.join(process.cwd(), file), 'utf8');
      assert.ok(
        source.includes('focalCoverInset(focal)'),
        `${file} must pan through the shared helper`,
      );
    }
  });

  it('never re-introduces a bare left/top shift beside absoluteFillObject', () => {
    for (const file of files) {
      const source = readFileSync(path.join(process.cwd(), file), 'utf8');
      assert.equal(
        /left:\s*`\$\{\(0\.5\s*-\s*focal\.x\)/.test(source),
        false,
        `${file} shifts the image box by hand again; that uncovers a band edge`,
      );
    }
  });

  it('sizes the web image inside the focal frame instead of using intrinsic pixels', () => {
    for (const file of files) {
      const source = readFileSync(path.join(process.cwd(), file), 'utf8');
      assert.match(source, /<View[\s\S]*?focalCoverInset\(focal\)[\s\S]*?<Image/);
      assert.match(source, /height:\s*'100%'/);
      assert.match(source, /width:\s*'100%'/);
    }
  });
});
