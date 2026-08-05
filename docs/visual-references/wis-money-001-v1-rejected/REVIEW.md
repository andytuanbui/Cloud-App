# WIS-MONEY-001 Canvas Pack v1 — Visual Review

## Status

**Rejected for production use.**

This folder holds a visual reference only. Nothing here is approved or final,
and no file in this folder is loaded by the application. The production Canvas
Pack at `assets/wisdoms/three-ways-to-use-money/canvases/` remains
`awaiting-final-art`.

## Reasons for rejection

1. **Cloud's visual identity is incorrectly used for Leo in four Story scenes.**
   Scenes 02, 03, 05 and 06 show a boy standing in for Leo. The delivered
   manifest labels this character `"Leo"`, but the figure is Cloud.
2. **Cloud's cloud emblem appears inside Leo's Story.** The navy hoodie with
   the glowing cloud logo is Cloud's signature per `docs/CLOUD_CHARACTER.md`
   and the brand sheet. It is clearly visible in scenes 02 and 03.
3. **Story scenes are not consistently object-led.** Scenes 01 and 04 are
   object-led as specified; 02, 03, 05 and 06 are character-led.
4. **Every canvas uses one 16:9 format despite different application
   containers.** All fourteen files are 1024 × 576.
5. **Portrait stages would require excessive cropping.** Your Choice is a tall
   container (specified 1170 × 1560, ratio 0.75). A 16:9 source would lose most
   of its height.
6. **Home and Library card canvases do not match their real container
   ratios.** Home is specified 1.5042 and Library 2.3247; both were delivered
   at 1.7778.
7. **Final device-safe areas have not been verified.** The delivered safe areas
   were authored against 16:9 art and have not been checked at 375 × 667,
   390 × 844 or 430 × 932.

## Additional observation

`WIS-MONEY-001-HOME-CARD` also places Cloud on a card that was specified as
object-led. This is a softer call than the Story scenes — Cloud is the app's
guide and may legitimately appear on guide-led cards — but it should be
confirmed rather than assumed.

## What was good

The craft, lighting and warmth are strong, and the object work is on-brief.
`WELCOME-HERO`, `STORY-SCENE-01`, `STORY-SCENE-04`, `TALK-WITH-CLOUD`,
`CHOICE-BACKGROUND`, `TAKEAWAY-BACKGROUND`, `PRACTICE-HERO`,
`COMPLETION-HERO` and `LIBRARY-CARD` are free of the character problem.
Cloud in `TALK-WITH-CLOUD`, `PRACTICE-HERO` and `COMPLETION-HERO` is correct —
those are guide-led surfaces.

## What the next pack needs

- Object-led Story scenes, or a Leo who carries no Cloud branding.
- Per-stage dimensions taken from the production `manifest.json`, not one
  shared ratio.
- The same fourteen stable asset IDs, so no application code changes.

## Contents

Delivered 2026-08-05, reviewed the same day.

| File | Note |
| --- | --- |
| `WIS-MONEY-001-*.png` (14) | Delivered artwork, all 1024 × 576 |
| `asset-index.json` | As delivered |
| `contact-sheet.png` | As delivered |
| `delivered-manifest.json` | As delivered, unmodified |
| `delivered-README.md` | As delivered, unmodified |
