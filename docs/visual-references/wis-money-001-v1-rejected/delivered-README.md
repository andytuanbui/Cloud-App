# CloudWise Wisdom Canvas Pack

Pack ID: WIS-MONEY-001
Wisdom ID: three-ways-to-use-money
Canvas version: v1
Canvas size: 1024 × 576 PNG
Aspect ratio: 16:9

## Naming convention

WIS-{CATEGORY}-{NUMBER}-{PURPOSE}-v{VERSION}.png

Example:

WIS-MONEY-001-story-scene-01-v1.png

The asset ID stays stable when the image version changes. CoWork should reference the asset ID from manifest.json, then bind the filename through a static React Native require.

## Integration rules

1. Keep all titles, body copy, amounts, currency, progress, buttons, choices, and accessibility labels live in the application.
2. Do not stretch a canvas outside its approved aspect ratio.
3. Use the focalPoint and fitMode values from manifest.json.
4. Keep important faces and objects outside the listed safe areas.
5. Do not crop Cloud or Leo at the face.
6. Keep buttons and interactive controls outside the image file.
7. Resolve every image through its stable asset ID.
8. React Native image paths must use explicit static require calls. Do not build require paths dynamically.

## Character rules

Cloud is the guide. Cloud appears in Talk with Cloud, Practice, Completion, and the Home card.

Leo carries the Story. Story scenes focus on the choice, the objects, and the decision.

Mia appears only when the birthday choice requires her.

## Story scene mapping

01. leo-wants-the-cards-now
02. leo-remembers-the-headphones
03. leo-remembers-mias-birthday
04. leo-sees-three-choices
05. leo-pauses
06. leo-makes-a-plan

## Review status

These v1 canvases are marked ready-for-visual-review. CoWork can integrate them through the Canvas Asset Registry while the team reviews crop behavior, safe areas, and character consistency on real devices.

## Replacement procedure

1. Generate or approve a replacement image.
2. Increase only the filename version, for example v1 to v2.
3. Keep the existing asset ID.
4. Update manifest.json.
5. Add the old filename and replacement date to replacementHistory.
6. Update the static React Native registry.
7. Run canvas validation and inspect the contact sheet.

## Adding another Wisdom Canvas Pack

Create a sibling folder under assets/wisdoms/{wisdom-id}/canvases. Use a unique Wisdom code, stable asset IDs, a manifest, a README, and a labeled contact sheet.
