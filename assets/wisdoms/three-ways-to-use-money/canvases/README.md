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
WIS-MONEY-001-LIBRARY-CARD
```

## Versioning

Replacing artwork changes the **filename and `version`**, never the asset ID.
Move the previous entry into `replacementHistory` so the change is traceable.
Because the Wisdom definition references IDs, no application code changes when
art is replaced.

## Safe-area system

Each manifest entry lists normalized (0–1) rectangles the application draws
over. Purposes: `title`, `body`, `controls`, `amount`, `progress`, `character`,
`unrestricted`.

Keep faces and key objects **out of** safe areas. `focalPoint` marks what must
stay visible when a container forces a crop.

Enable `showSafeAreas` on `WisdomCanvas` during development to see the outlines.
It is off by default and additionally gated on `__DEV__`.

## Visual rules

- Cloud is the guide. He appears only where the definition requires him —
  Talk with Cloud, guidance, reflection, practice and completion.
- Leo's Story scenes are **object-led**. There is no approved Leo artwork, so
  never substitute Cloud for him.
- No permanent interface text inside images.
- No important face or object beneath a known text safe area.
- Never stretch outside the approved aspect ratio.
- Never crop a character's face.
- Interactive controls stay outside the artwork.
- Visual meaning must be understandable without embedded words.

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

`contact-sheet.png` should show all fourteen canvases together with the asset
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

**No final artwork has been delivered.** Every entry is
`awaiting-final-art` and the app still composes its own visuals, so the
approved appearance is unchanged. Eight IDs temporarily share an existing
approved image; the six story scenes keep their own approved artwork.
