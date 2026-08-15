/**
 * Automated Wisdom Canvas viewport measurement.
 *
 * Drives the Guided Wisdom end to end in a real Chromium at three real device
 * viewports and reads `getBoundingClientRect()` off the live DOM. Every value
 * in the output is measured; nothing is derived from source constants.
 *
 * Navigation is driven entirely by `data-testid` hooks (React Native `testID`
 * on web). No button-text matching: an earlier text-driven harness silently
 * recorded a Home card as Story and Story as Talk, so before any measurement is
 * recorded this runner asserts the active stage via `guided-stage-<stage>`.
 *
 *   node run.mjs                       # against http://localhost:8082
 *   CW_URL=http://localhost:8081 node run.mjs
 */

import { chromium } from 'playwright';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const OUT_DIR = path.join(REPO, 'docs', 'canvas-templates', 'wis-money-001');
const OUT_FILE = path.join(OUT_DIR, 'measurements-raw.json');

const BASE_URL = process.env.CW_URL || 'http://localhost:8082';
const HEADLESS = process.env.CW_HEADED !== '1';
const WISDOM_ID = 'three-ways-to-use-money';

const VIEWPORTS = [
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
];

/** AsyncStorage on web writes straight to localStorage under this key. */
const APP_STATE_KEY_FRAGMENT = '@cloudwise/app-state';

const log = (...a) => console.log('[measure]', ...a);

/**
 * The Wisdom's position in the daily schedule, read from the app's own source
 * so the runner cannot drift from it.
 *
 * This is the whole reason the first automated run failed. A fresh Playwright
 * profile starts the programme today, and the schedule puts
 * `three-ways-to-use-money` on day 2 — so on day 0 it is neither Today's
 * Wisdom nor learned nor available in the Library, and Home offers no way in.
 */
function scheduledDayOffset(wisdomId) {
  const source = readFileSync(
    path.join(REPO, 'src', 'content', 'schedule', 'dailyWisdomSchedule.ts'),
    'utf8',
  );
  const match = new RegExp(
    `dayOffset:\\s*(\\d+)\\s*,\\s*wisdomId:\\s*['"]${wisdomId}['"]`,
  ).exec(source);
  if (!match) {
    throw new Error(`${wisdomId} is not in dailyWisdomSchedule.ts`);
  }
  return Number(match[1]);
}

/* ---------------------------------------------------------------- helpers */

const tid = (id) => `[data-testid="${id}"]`;

async function tap(page, testId, { timeout = 15000 } = {}) {
  const el = page.locator(tid(testId)).first();
  await el.waitFor({ state: 'visible', timeout });
  await el.scrollIntoViewIfNeeded();
  await el.click({ timeout });
  await page.waitForTimeout(250);
}

async function present(page, testId) {
  return (await page.locator(tid(testId)).count()) > 0;
}

/** Hard stage assertion. Nothing is recorded unless this passes. */
async function requireStage(page, stage, { timeout = 20000 } = {}) {
  await page.locator(tid(`guided-stage-${stage}`)).first().waitFor({
    state: 'attached',
    timeout,
  });
}

/* ------------------------------------------------------------ measurement */

/**
 * Runs inside the page. Returns one reading of whatever is currently rendered.
 * Kept as a single self-contained function so it can be passed to evaluate().
 */
const MEASURE = (stageLabel) => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const vis = (r) => r.width > 1 && r.height > 1;
  const txt = (el) => (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ');

  // Only bands that are actually laid out. Unmounted Home/Library cards report
  // a 0x0 box and previously poisoned every derived number.
  const bandEls = [...document.querySelectorAll('[data-testid^="canvas-band-"]')]
    .map((el) => ({ el, r: el.getBoundingClientRect() }))
    .filter((x) => vis(x.r));

  // The first painted element after the band, walking up the ancestor chain.
  // This is exactly the element that used to be pulled over the artwork by a
  // negative marginTop.
  function nextPainted(el) {
    let node = el;
    while (node && node.parentElement) {
      let sib = node.nextElementSibling;
      while (sib) {
        const r = sib.getBoundingClientRect();
        if (vis(r)) return r;
        sib = sib.nextElementSibling;
      }
      node = node.parentElement;
    }
    return null;
  }

  const bands = bandEls.map(({ el, r }) => {
    const next = nextPainted(el);
    return {
      assetId: el.getAttribute('data-testid').replace('canvas-band-', ''),
      canvasWidth: +r.width.toFixed(1),
      canvasHeight: +r.height.toFixed(1),
      canvasTop: +r.top.toFixed(1),
      canvasBottom: +r.bottom.toFixed(1),
      firstContentBelowY: next ? +next.top.toFixed(1) : null,
      occlusionPx: next ? +Math.max(0, r.bottom - next.top).toFixed(1) : null,
      visibleArtworkHeight: next
        ? +Math.min(r.height, Math.max(0, next.top - r.top)).toFixed(1)
        : +r.height.toFixed(1),
    };
  });

  const interactive = [...document.querySelectorAll('[role="button"],[role="radio"],button')]
    .map((el) => ({ el, r: el.getBoundingClientRect() }))
    .filter((x) => vis(x.r))
    .map(({ el, r }) => ({
      testId: el.getAttribute('data-testid') || null,
      label: (el.getAttribute('aria-label') || txt(el)).slice(0, 60),
      top: +r.top.toFixed(1),
      bottom: +r.bottom.toFixed(1),
      belowFirstViewport: r.bottom > vh,
    }));

  // The app's ScrollView, identified by being the tallest overflowing box.
  let host = null;
  let delta = 0;
  for (const el of document.querySelectorAll('*')) {
    const s = getComputedStyle(el);
    if (s.overflowY === 'auto' || s.overflowY === 'scroll') {
      const d = el.scrollHeight - el.clientHeight;
      if (d > delta) {
        delta = d;
        host = el;
      }
    }
  }

  const lowest = interactive.length
    ? interactive.reduce((a, b) => (b.bottom > a.bottom ? b : a))
    : null;

  return {
    stage: stageLabel,
    viewport: { width: vw, height: vh },
    bands,
    interactive,
    lowestInteractive: lowest,
    belowFirstViewport: interactive.filter((b) => b.belowFirstViewport).map((b) => b.label),
    scrollRequired: !!host,
    scrollContentHeight: host ? host.scrollHeight : null,
    scrollViewportHeight: host ? host.clientHeight : null,
    scrollOverflowPx: host ? host.scrollHeight - host.clientHeight : 0,
    scrollTop: host ? +host.scrollTop.toFixed(1) : null,
  };
};

/** Measures the stage as the child first sees it: scrolled to the top. */
async function snap(page, stage, label) {
  await requireStage(page, stage);
  await page.evaluate(() => {
    let host = null;
    let delta = 0;
    for (const el of document.querySelectorAll('*')) {
      const s = getComputedStyle(el);
      if (s.overflowY === 'auto' || s.overflowY === 'scroll') {
        const d = el.scrollHeight - el.clientHeight;
        if (d > delta) {
          delta = d;
          host = el;
        }
      }
    }
    if (host) host.scrollTop = 0;
  });
  await page.waitForTimeout(350);
  const reading = await page.evaluate(MEASURE, label || stage);
  log(
    `  ${reading.stage}:`,
    reading.bands.map((b) => `${b.assetId} ${b.canvasWidth}x${b.canvasHeight}`).join(' | ') ||
      'no band',
  );
  return reading;
}

/* ----------------------------------------------------------- setup / entry */

async function completeProfileSetupIfShown(page) {
  if (!(await present(page, 'setup-cta-begin'))) return false;
  log('  first-run profile setup detected — completing it');
  await tap(page, 'setup-cta-begin');
  const input = page.locator('input, textarea').first();
  await input.waitFor({ state: 'visible', timeout: 10000 });
  await input.fill('Measure');
  await tap(page, 'setup-cta-name-continue');
  await page.locator('[aria-label="Age 9"]').first().click();
  await tap(page, 'setup-cta-age-continue');
  await tap(page, 'setup-cta-open');
  return true;
}

/**
 * Puts the measurement profile on the day this Wisdom is scheduled, and clears
 * any progress it already has.
 *
 * This only rewrites the automation browser's own persisted state — the same
 * state the app would hold on day 2 of a real child's programme. No production
 * scheduling, progress or learning behaviour is touched, and the app is not
 * given a special code path.
 *
 * Clearing progress also makes all three viewport runs identical: every one
 * walks the first-time path rather than the first walking it fresh and the
 * next two entering in review mode.
 */
async function seedMeasurementProfile(page, dayOffset) {
  const result = await page.evaluate(
    ({ fragment, offset, wisdomId }) => {
      const key = Object.keys(window.localStorage).find((k) => k.includes(fragment));
      if (!key) return { ok: false, reason: 'no persisted app state in localStorage' };

      let state;
      try {
        state = JSON.parse(window.localStorage.getItem(key));
      } catch {
        return { ok: false, reason: 'persisted app state is not valid JSON' };
      }
      if (!state || typeof state !== 'object' || !state.profile) {
        return { ok: false, reason: 'persisted app state has no profile' };
      }

      // Local date key, matching getLocalDateKey() in the app. Noon avoids DST
      // edges when stepping back across days.
      const d = new Date();
      d.setHours(12, 0, 0, 0);
      d.setDate(d.getDate() - offset);
      const pad = (n) => String(n).padStart(2, '0');
      const startKey = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

      state.profile.programStartDateKey = startKey;
      if (state.wisdomProgress && state.wisdomProgress[wisdomId]) {
        delete state.wisdomProgress[wisdomId];
      }
      window.localStorage.setItem(key, JSON.stringify(state));
      return { ok: true, key, startKey };
    },
    { fragment: APP_STATE_KEY_FRAGMENT, offset: dayOffset, wisdomId: WISDOM_ID },
  );

  if (!result.ok) throw new Error(`Could not seed measurement profile: ${result.reason}`);
  log(`  seeded programStartDateKey=${result.startKey} (day ${dayOffset} = ${WISDOM_ID})`);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
}

async function openWisdom(page) {
  // Covers every shape Home can take: not started, in progress, learned, and
  // the compact/library cards.
  const candidates = [
    `wisdom-card-today-open-${WISDOM_ID}`,
    `wisdom-card-today-${WISDOM_ID}`,
    `wisdom-card-home-${WISDOM_ID}`,
    `wisdom-card-library-${WISDOM_ID}`,
  ];
  for (const id of candidates) {
    if (await present(page, id)) {
      await tap(page, id);
      return id;
    }
  }
  const seen = await page.evaluate(() =>
    [...document.querySelectorAll('[data-testid]')]
      .map((el) => el.getAttribute('data-testid'))
      .slice(0, 40),
  );
  throw new Error(
    `No entry point for ${WISDOM_ID} on Home.\n` +
      `  looked for: ${candidates.join(', ')}\n` +
      `  testIDs present: ${seen.join(', ') || '(none)'}`,
  );
}

/* ------------------------------------------------------------- the walk */

async function walkOneViewport(page, viewport, dayOffset) {
  const run = { requested: viewport, actual: null, stages: [], notes: [] };

  await page.setViewportSize(viewport);
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  await completeProfileSetupIfShown(page);
  await page.waitForTimeout(800);

  // Without this the Wisdom is simply not offered anywhere on Home.
  await seedMeasurementProfile(page, dayOffset);
  run.notes.push(`seeded programme day ${dayOffset}`);

  run.actual = await page.evaluate(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));
  log(`viewport requested ${viewport.width}x${viewport.height}, actual ${run.actual.width}x${run.actual.height}`);

  const entry = await openWisdom(page);
  run.notes.push(`entered via ${entry}`);

  // Requirement: never measure anything until the Guided Wisdom is genuinely
  // open at its first stage.
  try {
    await requireStage(page, 'welcome');
  } catch {
    const stage = await page.evaluate(() => {
      const el = document.querySelector('[data-testid^="guided-stage-"]');
      return el ? el.getAttribute('data-testid') : null;
    });
    throw new Error(
      `Expected guided-stage-welcome after entering the Wisdom; found ${stage ?? 'no guided stage at all'}`,
    );
  }

  // Welcome -> Story
  await tap(page, 'guided-cta-welcome-start');
  await requireStage(page, 'story');
  run.stages.push(await snap(page, 'story', 'story-scene-01'));

  // Walk the six scenes. The same control advances the scene and, on the last
  // scene, leaves for Talk -- so the loop watches the scene band id change.
  for (let i = 0; i < 5; i++) {
    const before = await page.evaluate(() =>
      [...document.querySelectorAll('[data-testid^="canvas-band-WIS-MONEY-001-STORY-SCENE"]')]
        .map((el) => el.getAttribute('data-testid'))
        .join(','),
    );
    await tap(page, 'guided-cta-story-next');
    await page
      .waitForFunction(
        (prev) =>
          [...document.querySelectorAll('[data-testid^="canvas-band-WIS-MONEY-001-STORY-SCENE"]')]
            .map((el) => el.getAttribute('data-testid'))
            .join(',') !== prev,
        before,
        { timeout: 10000 },
      )
      .catch(() => run.notes.push(`story scene ${i + 2} did not change band id`));
  }
  run.stages.push(await snap(page, 'story', 'story-scene-06'));

  // Story -> Talk
  await tap(page, 'guided-cta-story-next');
  await requireStage(page, 'talk');
  run.stages.push(await snap(page, 'talk', 'talk-before-answering'));

  // Answer: pick the first reflection choice, then the first suggested reply.
  const choiceId = await page.evaluate(() => {
    const el = document.querySelector('[data-testid^="guided-talk-choice-"]');
    return el ? el.getAttribute('data-testid') : null;
  });
  if (!choiceId) throw new Error('Talk stage exposed no guided-talk-choice-* controls');
  await tap(page, choiceId);

  const suggestionId = await page.evaluate(() => {
    const el = document.querySelector('[data-testid^="guided-talk-response-suggestion-"]');
    return el ? el.getAttribute('data-testid') : null;
  });
  if (suggestionId) await tap(page, suggestionId);
  await tap(page, 'guided-talk-response-submit');
  await page.waitForTimeout(600);
  run.stages.push(await snap(page, 'talk', 'talk-after-answering'));

  // Talk -> Your Choice
  await tap(page, 'guided-cta-talk-continue');
  await requireStage(page, 'choice');
  run.stages.push(await snap(page, 'choice', 'your-choice-on-entry'));

  // Allocate all 90 kr, 10 at a time, until the CTA reports itself enabled.
  const tones = ['spend', 'save', 'give'];
  for (let i = 0; i < 30; i++) {
    const enabled = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="guided-cta-choice-evaluate"]');
      return el ? el.getAttribute('aria-disabled') !== 'true' && !el.disabled : false;
    });
    if (enabled) break;
    const tone = tones[i % tones.length];
    const btn = page.locator(tid(`guided-stepper-${tone}-increase`)).first();
    if ((await btn.count()) === 0) break;
    if (await btn.isEnabled().catch(() => false)) {
      await btn.click().catch(() => {});
      await page.waitForTimeout(80);
    }
  }
  run.stages.push(await snap(page, 'choice', 'your-choice-fully-allocated'));

  await tap(page, 'guided-cta-choice-evaluate');
  await page.waitForTimeout(700);
  run.stages.push(await snap(page, 'choice', 'your-choice-after-cloud-responds'));

  // Your Choice -> Takeaway
  await tap(page, 'guided-cta-choice-keep');
  await requireStage(page, 'takeaway');
  run.stages.push(await snap(page, 'takeaway', 'takeaway-on-entry'));

  const takeawayId = await page.evaluate(() => {
    const el = document.querySelector('[data-testid^="guided-takeaway-response-suggestion-"]');
    return el ? el.getAttribute('data-testid') : null;
  });
  if (takeawayId) await tap(page, takeawayId);
  await tap(page, 'guided-takeaway-response-submit');
  await page.waitForTimeout(600);
  run.stages.push(await snap(page, 'takeaway', 'takeaway-after-choosing'));

  // Takeaway -> Practice
  await tap(page, 'guided-cta-takeaway-continue');
  await requireStage(page, 'practice');
  run.stages.push(await snap(page, 'practice', 'practice'));

  // Practice -> Completion
  await tap(page, 'guided-cta-practice-complete');
  await requireStage(page, 'completion');
  run.stages.push(await snap(page, 'completion', 'completion'));

  return run;
}

/* ------------------------------------------------------------------ main */

async function main() {
  log(`target ${BASE_URL}`);
  const dayOffset = scheduledDayOffset(WISDOM_ID);
  log(`${WISDOM_ID} is scheduled on programme day ${dayOffset}`);
  const browser = await chromium.launch({ headless: HEADLESS });
  // One context for the whole run so the profile created on the first pass
  // survives into the later viewports.
  const context = await browser.newContext({ viewport: VIEWPORTS[0] });
  const page = await context.newPage();

  const runs = [];
  let failure = null;

  try {
    for (const viewport of VIEWPORTS) {
      try {
        runs.push(await walkOneViewport(page, viewport, dayOffset));
      } catch (error) {
        log(`FAILED at ${viewport.width}x${viewport.height}: ${error.message}`);
        runs.push({
          requested: viewport,
          error: error.message,
          stages: [],
          notes: ['run aborted'],
        });
        failure = failure || error;
      }
    }
  } finally {
    await browser.close();
  }

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(
    OUT_FILE,
    JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        baseUrl: BASE_URL,
        method:
          'Playwright Chromium, real viewport, getBoundingClientRect on the live DOM. ' +
          'Stage identity asserted via guided-stage-<stage> before every reading. ' +
          'The automation profile is seeded onto the programme day this Wisdom is ' +
          'scheduled; no app scheduling or learning behaviour is modified.',
        scheduledDayOffset: dayOffset,
        runs,
      },
      null,
      2,
    ),
  );

  log(`wrote ${OUT_FILE}`);
  const ok = runs.filter((r) => !r.error).length;
  log(`${ok} of ${runs.length} viewports measured`);
  if (failure) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
