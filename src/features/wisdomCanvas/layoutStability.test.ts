import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import {
  assetIdsSharingFallbackArtwork,
  canvasSourceKeyByAssetId,
  wisdomCanvasAssetIds,
} from './assetIds';
import {
  canvasBandHeightRanges,
  canvasBandHeights,
  stabilisedBandAssetIds,
} from './bandHeights';
import type { CanvasManifest } from './types';

/**
 * Layout stabilisation coverage.
 *
 * Final canvases can only be commissioned once each artwork container has a
 * height that does not move with stage content. Before this change the Talk,
 * Your Choice, Takeaway and Completion "canvases" were full-stage gradient
 * wrappers whose measured height grew as answers, allocation controls and
 * recognition copy appeared — Talk alone swung from 576.7 to 1532.3 px.
 *
 * These are source-level assertions on purpose. The band height is a constant
 * looked up by asset id and applied with `overflow: hidden`, so the only way a
 * stage could reintroduce a variable height is by passing a state-dependent
 * `height` prop or by nesting the band inside a growing container. Both are
 * checked here against the real screen source.
 */

const screenSource = readFileSync(
  path.join(process.cwd(), 'src/screens/guided/GuidedWisdomScreen.tsx'),
  'utf8',
);
const bandSource = readFileSync(
  path.join(process.cwd(), 'src/components/wisdom/WisdomCanvasBand.tsx'),
  'utf8',
);
const storySceneCardSource = readFileSync(
  path.join(process.cwd(), 'src/components/wisdom/guided/StorySceneCard.tsx'),
  'utf8',
);
const measurementsDoc = readFileSync(
  path.join(process.cwd(), 'docs/canvas-templates/wis-money-001/MEASUREMENTS.md'),
  'utf8',
);
const manifest = JSON.parse(
  readFileSync(
    path.join(
      process.cwd(),
      'assets/wisdoms/three-ways-to-use-money/canvases/manifest.json',
    ),
    'utf8',
  ),
) as CanvasManifest;

/** Every `<WisdomCanvasBand …/>` element in the screen, as raw source. */
function bandElements(source: string): string[] {
  return source.match(/<WisdomCanvasBand[\s\S]*?\/>/g) ?? [];
}

describe('band heights are fixed constants', () => {
  it('gives every asset id exactly one declared height', () => {
    for (const assetId of wisdomCanvasAssetIds) {
      const height = canvasBandHeights[assetId];
      assert.equal(typeof height, 'number', `${assetId} has no declared height`);
      assert.ok(Number.isFinite(height) && height > 0, `${assetId} height is not positive`);
    }
    assert.equal(Object.keys(canvasBandHeights).length, wisdomCanvasAssetIds.length);
  });

  it('keeps every stabilised band inside its approved range', () => {
    for (const assetId of stabilisedBandAssetIds) {
      const range = canvasBandHeightRanges[assetId];
      assert.ok(range, `${assetId} is stabilised but has no approved range`);
      const height = canvasBandHeights[assetId];
      assert.ok(
        height >= range.min && height <= range.max,
        `${assetId} height ${height} is outside ${range.min}–${range.max}`,
      );
    }
  });

  it('matches the brief: Talk 240, Your Choice 190, Takeaway 170, Completion 220', () => {
    assert.equal(canvasBandHeights['WIS-MONEY-001-TALK-WITH-CLOUD'], 240);
    assert.equal(canvasBandHeights['WIS-MONEY-001-CHOICE-BACKGROUND'], 190);
    assert.equal(canvasBandHeights['WIS-MONEY-001-TAKEAWAY-BACKGROUND'], 170);
    assert.equal(canvasBandHeights['WIS-MONEY-001-COMPLETION-HERO'], 220);
  });

  it('leaves the already-stable Welcome, Story and Practice regions untouched', () => {
    assert.equal(canvasBandHeights['WIS-MONEY-001-WELCOME-HERO'], 296);
    assert.equal(canvasBandHeights['WIS-MONEY-001-PRACTICE-HERO'], 196);
    const storyHeights = new Set(
      wisdomCanvasAssetIds
        .filter((id) => id.startsWith('WIS-MONEY-001-STORY-SCENE-'))
        .map((id) => canvasBandHeights[id]),
    );
    assert.equal(storyHeights.size, 1, 'all six story scenes share one container');
    assert.equal([...storyHeights][0], 287);
  });

  it('clips the band so nothing inside it can push it taller', () => {
    assert.match(bandSource, /overflow:\s*'hidden'/);
    assert.match(bandSource, /height:\s*bandHeight/);
  });
});

describe('stage artwork does not move with stage content', () => {
  const elements = bandElements(screenSource);

  it('renders each stabilised band exactly once', () => {
    for (const assetId of stabilisedBandAssetIds) {
      const matches = elements.filter((el) => el.includes(assetId));
      assert.equal(matches.length, 1, `${assetId} must render exactly once`);
    }
  });

  it('never passes a height to a stage band, so state cannot change it', () => {
    for (const element of elements) {
      assert.ok(
        !/\bheight=/.test(element),
        `a band overrides its height:\n${element}`,
      );
    }
  });

  it('keeps Talk artwork the same height when an answer or follow-up appears', () => {
    // The band is a sibling of, not a parent of, the conversation surface, so
    // answers and follow-ups grow below it.
    const talk = elements.find((el) => el.includes('WIS-MONEY-001-TALK-WITH-CLOUD'));
    assert.ok(talk, 'Talk band is missing');
    assert.ok(!/\bheight=/.test(talk), 'Talk band height must not be overridden');
    assert.equal(canvasBandHeights['WIS-MONEY-001-TALK-WITH-CLOUD'], 240);
  });

  it('keeps Your Choice artwork the same height across every allocation state', () => {
    const choice = elements.find((el) => el.includes('WIS-MONEY-001-CHOICE-BACKGROUND'));
    assert.ok(choice, 'Your Choice band is missing');
    assert.ok(!/\bheight=/.test(choice), 'Your Choice band height must not be overridden');
    // Allocation controls render below the band, never inside it.
    assert.ok(choice.endsWith('/>'), 'Your Choice band must not wrap allocation controls');
  });

  it('keeps Takeaway artwork the same height while a thought is selected or written', () => {
    const takeaway = elements.find((el) =>
      el.includes('WIS-MONEY-001-TAKEAWAY-BACKGROUND'),
    );
    assert.ok(takeaway, 'Takeaway band is missing');
    assert.ok(!/\bheight=/.test(takeaway), 'Takeaway band height must not be overridden');
    assert.ok(takeaway.endsWith('/>'), 'Takeaway band must not wrap the response field');
  });

  it('keeps Completion artwork the same height when recognition copy wraps', () => {
    const completion = elements.find((el) =>
      el.includes('WIS-MONEY-001-COMPLETION-HERO'),
    );
    assert.ok(completion, 'Completion band is missing');
    assert.ok(!/\bheight=/.test(completion), 'Completion band height must not be overridden');
    // Recognition text is dynamic, so it must live in its own region below.
    assert.match(screenSource, /styles\.completionCopy/);
  });
});

/**
 * Reads a single named entry out of a `StyleSheet.create({ … })` literal.
 *
 * Occlusion is a source-level fact: a sibling card with a negative `marginTop`
 * is drawn over the bottom of the artwork region above it, so the container
 * measures its declared height while the illustrator only ever sees less.
 */
function styleBlock(source: string, name: string): string {
  const start = source.indexOf(`\n  ${name}: {`);
  assert.ok(start >= 0, `style "${name}" not found`);
  const end = source.indexOf('\n  },', start);
  assert.ok(end > start, `style "${name}" is not terminated`);
  // Comments in these blocks quote the old negative values on purpose, so they
  // are stripped before the declarations are checked.
  return source
    .slice(start, end)
    .split('\n')
    .filter((line) => !line.trim().startsWith('//'))
    .join('\n');
}

describe('artwork regions are not covered by the card below them', () => {
  it('does not pull the Story body card over the Story illustration', () => {
    const body = styleBlock(storySceneCardSource, 'body');
    assert.ok(
      !/marginTop:\s*-/.test(body),
      'StorySceneCard.body must not use a negative marginTop; it hid 24 px of Story artwork',
    );
    assert.match(body, /marginTop:\s*0/);
  });

  it('does not pull the Practice card over the Practice hero', () => {
    const card = styleBlock(screenSource, 'practiceCard');
    assert.ok(
      !/marginTop:\s*-/.test(card),
      'practiceCard must not use a negative marginTop; it hid 20 px of Practice artwork',
    );
    assert.match(card, /marginTop:\s*0/);
  });

  it('keeps the declared Story and Practice heights, now fully visible', () => {
    // The fix was structural, not a resize: the containers still measure the
    // heights the pack was specified at, and all of both is now visible.
    assert.equal(canvasBandHeights['WIS-MONEY-001-STORY-SCENE-01'], 287);
    assert.equal(canvasBandHeights['WIS-MONEY-001-PRACTICE-HERO'], 196);
  });
});

describe('measurements are recorded for the real device viewports', () => {
  it('reports 375×812, 390×844 and 430×932', () => {
    for (const viewport of ['375 × 812', '390 × 844', '430 × 932']) {
      assert.ok(
        measurementsDoc.includes(viewport),
        `MEASUREMENTS.md does not report ${viewport}`,
      );
    }
  });

  it('reports the visible artwork area, not just the container', () => {
    assert.match(measurementsDoc, /visible artwork/i);
    assert.match(measurementsDoc, /overlap/i);
  });

  it('no longer quotes the superseded Choice and Takeaway band heights', () => {
    assert.ok(!/× 210\b/.test(measurementsDoc), 'Choice still documented at 210');
    assert.ok(!/× 180\b/.test(measurementsDoc), 'Takeaway still documented at 180');
  });
});

describe('Home and Library artwork stay separate', () => {
  const byId = Object.fromEntries(manifest.assets.map((a) => [a.assetId, a]));

  it('gives the feature and compact Home cards their own asset ids', () => {
    assert.ok(wisdomCanvasAssetIds.includes('WIS-MONEY-001-HOME-CARD'));
    assert.ok(wisdomCanvasAssetIds.includes('WIS-MONEY-001-HOME-CARD-COMPACT'));
    assert.notEqual(
      canvasBandHeights['WIS-MONEY-001-HOME-CARD'],
      canvasBandHeights['WIS-MONEY-001-HOME-CARD-COMPACT'],
      'the two Home cards render at different heights, which is why they are separate assets',
    );
  });

  it('resolves both Home cards through the registry', () => {
    for (const assetId of [
      'WIS-MONEY-001-HOME-CARD',
      'WIS-MONEY-001-HOME-CARD-COMPACT',
    ] as const) {
      assert.ok(canvasSourceKeyByAssetId[assetId], `${assetId} has no source binding`);
      assert.ok(
        assetIdsSharingFallbackArtwork.includes(assetId),
        `${assetId} must be recorded as awaiting its own artwork`,
      );
    }
  });

  it('keeps both Home cards guide-led and the Library card object-led', () => {
    assert.equal(byId['WIS-MONEY-001-HOME-CARD'].character, 'Cloud');
    assert.equal(byId['WIS-MONEY-001-HOME-CARD-COMPACT'].character, 'Cloud');
    assert.equal(byId['WIS-MONEY-001-LIBRARY-CARD'].character, 'none');
  });

  it('does not let the Library card reuse Home artwork', () => {
    const home = byId['WIS-MONEY-001-HOME-CARD'];
    const compact = byId['WIS-MONEY-001-HOME-CARD-COMPACT'];
    const library = byId['WIS-MONEY-001-LIBRARY-CARD'];
    assert.notEqual(library.filename, home.filename);
    assert.notEqual(library.filename, compact.filename);
    assert.notEqual(library.character, home.character);
  });

  it('expects a compact Home card filename that has not been delivered yet', () => {
    assert.equal(
      byId['WIS-MONEY-001-HOME-CARD-COMPACT'].filename,
      'WIS-MONEY-001-home-card-compact-v1.png',
    );
    assert.equal(byId['WIS-MONEY-001-HOME-CARD-COMPACT'].status, 'awaiting-final-art');
  });
});

describe('rejected v1 artwork stays out of production', () => {
  it('binds every asset id to an approved existing image', () => {
    for (const assetId of wisdomCanvasAssetIds) {
      const key = canvasSourceKeyByAssetId[assetId];
      assert.ok(key, `${assetId} is unbound`);
      assert.ok(
        !key.includes('rejected') && !key.includes('v1'),
        `${assetId} falls back to rejected artwork`,
      );
    }
  });

  it('never references the quarantined reference folder from production code', () => {
    assert.ok(!screenSource.includes('wis-money-001-v1-rejected'));
    assert.ok(!bandSource.includes('wis-money-001-v1-rejected'));
  });
});
