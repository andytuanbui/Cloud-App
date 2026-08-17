# Wisdom Canvas Pack — Three Ways to Use Money

Canvas artwork for `WIS-MONEY-001`. Everything here is **text-free visual art**.

## The text-free rule

Titles, body copy, progress indicators, buttons, child response choices,
amounts, currency, allocation controls, takeaway options, written responses,
learned status and accessibility labels are **rendered by the application**.
Never bake any of them into a PNG. Embedded text cannot be translated, resized,
read by a screen reader, or kept in sync with saved progress.

## Naming convention

```
WIS-MONEY-001-<stage>-<detail>-v<version>.png
```

`WIS` = Wisdom asset · `MONEY` = category · `001` = Wisdom number ·
`<stage>` = where it appears · `v<version>` = visual version.

## Asset ID convention

Asset IDs are uppercase and **stable for the life of the Wisdom**:

```
WIS-MONEY-001-WELCOME-HERO
WIS-MONEY-001-STORY-SCENE-01 … -06
WIS-MONEY-001-TALK-WITH-CLOUD
WIS-MONEY-001-CHOICE-BACKGROUND
WIS-MONEY-001-TAKEAWAY-BACKGROUND
WIS-MONEY-001-PRACTICE-HERO
WIS-MONEY-001-COMPLETION-HERO
WIS-MONEY-001-HOME-CARD
WIS-MONEY-001-HOME-CARD-COMPACT
WIS-MONEY-001-LIBRARY-CARD
```

The Home card renders at two heights — 238 as Today's Wisdom and 154 once
learned — so it is two assets. The Library card shares the compact shape but is
object-led and must not reuse Home artwork.

## Versioning

Replacing artwork changes the **filename and `version`**, never the asset ID.
Move the previous entry into `replacementHistory` so the change is traceable.
Because the Wisdom definition references IDs, no application code changes when
art is replaced.

## Safe-area system

Each manifest entry lists normalized (0–1) rectangles. **They are not all the
same kind of rectangle** — read the `purpose` before composing:

| Purpose | Meaning for the illustrator |
| --- | --- |
| `title`, `body`, `controls`, `amount`, `progress` | **Keep clear.** The app draws text or controls here. No face, no key object, no busy detail. |
| `character` | **Place here.** This zone is reserved *for* the subject; it is where the character or hero object belongs. |
| `unrestricted` | Free. Nothing is drawn over it and nothing is required in it. |

So on `TALK-WITH-CLOUD`, Cloud belongs *inside* the `character` rectangle at
the left, not outside it. `focalPoint` marks what must stay visible when a
container forces a crop.

Enable `showSafeAreas` on `WisdomCanvas` during development to see the outlines.
It is off by default and additionally gated on `__DEV__`.

## Character rules

These are binding. A pack that breaks them will be rejected.

- **Cloud is the CloudWise guide.** See `docs/CLOUD_CHARACTER.md`.
- **Cloud's age read is fixed**: clearly a child, reading **close to 11** —
  slightly mature proportions, less baby-ish face and body, calm confidence, an
  intelligent and emotionally safe presence. Never a teenager or an adult, never
  back to baby-like proportions. See `docs/CLOUD_CHARACTER.md` →
  *Character direction — CURRENT*.
- **Cloud is one character, not an interpretation per image.** Facial identity,
  black hair silhouette language, body proportions and rendering style do not
  drift between canvases.
- **Cloud's outfit rule is fixed** — see `docs/CLOUD_CHARACTER.md` →
  *Outfit direction — FINAL*. The deep navy hoodie with the cloud emblem is the
  base outfit and the visual foundation. The emblem is never removed, the navy
  base is never swapped for another main colour, and outfit variation is allowed
  only as a small contextual layer on top of that base. Face, hair, proportions,
  expression language and rendering style never change. Every Cloud canvas in
  this pack uses the base outfit with no added layer, and the anchor
  (`TALK-WITH-CLOUD`) carries the classic navy hoodie only — no extra layer, no
  major outfit variation.
- Cloud may appear in **Talk with Cloud, Practice, Completion, and selected
  guide-led cards**.
- **Cloud must never represent Leo.**
- **Leo must not wear Cloud's cloud emblem** or the navy hoodie that carries it.
- Leo's Story scenes should remain **object-led** wherever possible.
- Story scenes may show hands, objects, environments, or Leo — provided Leo
  carries no Cloud branding.
- **Mia appears only in the birthday Story context.**
- **Character faces must not be cropped.**
- **No permanent words, numbers, currency, buttons or interface labels may
  appear inside a canvas.**

## Visual rules

- No important face or object beneath a known text safe area.
- Never stretch outside the approved aspect ratio.
- Interactive controls stay outside the artwork.
- Visual meaning must be understandable without embedded words.

## Canvas shapes

**Do not force one image ratio across the pack.** Each canvas is generated for
the real container it appears in; the required `sourceWidth`, `sourceHeight`
and `aspectRatio` are in `manifest.json` per asset. Ratios currently run from
1.2957 (Story scene) to 2.5325 (compact cards). Story and Welcome are the
tallest; Your Choice, Takeaway and the compact cards are wide, shallow bands.
A single 16:9 export is not acceptable.

## Replacing an image

1. Export at the manifest's `sourceWidth` × `sourceHeight`.
2. Save as `…-v<next>.png` in this folder.
3. Update `filename`, `version` and `replacementHistory`; set `status` to
   `final`.
4. Point the source key in `src/features/wisdomCanvas/assetIds.ts` at the new
   image and add the `require` in `registry.ts`.
5. Run `npm run validate:wisdom-canvas`.
6. Check the stage in the app with safe areas enabled, then disable them.

## Validation

```
npm run validate:wisdom-canvas
```

Detects duplicate asset IDs, duplicate active filenames, unknown Wisdom or
stage IDs, missing story-scene mappings, out-of-range coordinates, safe areas
outside the image, invalid dimensions or aspect ratios, missing accessibility
descriptions, manifest/registry drift in either direction, and assets marked
`final` whose file is absent.

## Contact sheet

`contact-sheet.png` should show all fifteen canvases together with the asset
ID and stage name under each, so the correct canvas can be confirmed at a
glance. It is **not** shipped to the app and is not yet present.

## React Native static require limitation

Metro cannot build a `require` path from a string. Every image is listed
explicitly in `src/features/wisdomCanvas/registry.ts`, typed as an exhaustive
record so a missing binding fails the typecheck. `assetIds.ts` stays free of
image imports so Node tests can read it.

## Adding another Wisdom Canvas Pack

1. `assets/wisdoms/<wisdom-id>/canvases/` with `manifest.json` and a README.
2. Allocate a code such as `WIS-TIME-002` and define the asset IDs.
3. Add IDs and source keys to `assetIds.ts`, `require` calls to `registry.ts`.
4. Map each story scene id to its own canvas asset ID.
5. Extend the canvas tests to cover the new pack.

## Current status

**One of fifteen is final: `WIS-MONEY-001-TALK-WITH-CLOUD`.** The revised
anchor was visually approved on 2026-08-17 and its manifest status is `final`,
so it is the one canvas in this pack the application actually draws.

It is the pack **anchor** and the **Character Master** for Cloud: every other
Cloud-bearing canvas takes his facial identity, hair silhouette, body
proportions, expression language, hoodie, emblem and rendering from this file.
Its composition is locked: Cloud in the left third, face near
**x 0.22 / y 0.42**, open calm space to the right, hand gesture directed inward
toward that space, **1170 × 720**, no text inside the illustration.

`WIS-MONEY-001-talk-with-cloud-v1.png` — 1170 × 720, RGB, no alpha — sits in
this folder, bound to the source key `wis-money-001-talk-with-cloud` in
`src/features/wisdomCanvas/assetIds.ts`. The earlier unapproved delivery has
been moved out to
`docs/visual-references/wis-money-001-talk-with-cloud-superseded/`; nothing in
the application loads it, and it must not come back into this folder.

The other **fourteen entries remain `awaiting-final-art`** and are unchanged:
the app still composes its own visuals for them, so their approved appearance
is untouched. **Eight IDs keep showing a placeholder** — see
`assetIdsSharingFallbackArtwork` in `src/features/wisdomCanvas/assetIds.ts` —
because nothing of their own has been drawn. `TALK-WITH-CLOUD` has left that
list now that it is approved, and the six story scenes were never in it: they
keep their own approved artwork.

Canvas Pack **v1 was delivered and rejected** — see
`docs/visual-references/wis-money-001-v1-rejected/REVIEW.md`. Nothing in that
folder is loaded by the application. The corrected pack will reuse the same
stable asset IDs, so no application code will need to change.
