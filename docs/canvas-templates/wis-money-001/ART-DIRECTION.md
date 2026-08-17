# WIS-MONEY-001 — Art Direction for the v2 Canvas Pack

Read alongside `MEASUREMENTS.md`, the production `manifest.json`, and
`docs/CLOUD_CHARACTER.md`. Pack v1 was rejected — see
`docs/visual-references/wis-money-001-v1-rejected/REVIEW.md`.

## Palette

Use the approved CloudWise palette. Do not introduce new hues.

| Role | Colour |
| --- | --- |
| Deep navy | `#10333A` / `#071F28` |
| Muted forest green | `#285F54` |
| Warm cream | `#FFF8EA` |
| Soft gold | `#EFB63D` |
| Restrained mint | `#DCEDE6` |

## Style

Soft cinematic children's illustration. Calm, low-contrast lighting with one
clear light source. Clear object hierarchy — one subject reads first, the rest
supports. Depth through light and layering, not clutter. Warm and unhurried,
never loud or arcade-like. Aimed at ages 8–11.

## Absolute prohibitions

- No permanent interface text of any kind.
- **No letters or numbers** on cards, jars, signs, packages, screens, posters,
  books or clothing. This includes background props and blurred detail.
- No logos, brand marks or wordmarks.
- **No currency printed inside images** — no "90", no "kr", no coins with
  denominations. Amounts are rendered by the app.
- **No cloud emblem on Leo.**
- No excessive detail beneath live text areas (see each template's safe areas).

## Characters

**Cloud** is the CloudWise guide and must follow `docs/CLOUD_CHARACTER.md`:
a child who reads **close to 11 years old** — slightly mature proportions, not
baby-faced, calm and confident — in the deep navy hoodie with the cloud emblem
(present and visible; **a glow is not required**), signature sneakers. Never a
teenager, never an adult.

**The Character Master is `WIS-MONEY-001-TALK-WITH-CLOUD`**, approved 2026-08-17
and `final` in the manifest. Match Cloud's facial identity, hair silhouette,
body proportions, expression language and rendering to that file on every
Cloud-bearing canvas in this pack. Do not reinterpret his face or proportions
from asset to asset.
Cloud appears in **Talk with Cloud, Practice, Completion, and both Home
cards** — the feature card and the compact learned card. On the two card
canvases his **full face must sit inside the focal-safe area** and must never be
cropped at any supported width.

**Cloud's outfit rule is fixed.** See `docs/CLOUD_CHARACTER.md` →
*Outfit direction — FINAL* for the binding version. The core identity — face,
hair, age read (a child close to 11), body proportions, expression language,
cloud emblem, premium soft 3D style, deep navy core — does not change between
assets. The **deep navy hoodie with the cloud
emblem is the base outfit and the visual foundation**; the emblem is not
removed and the navy base is not replaced with another main colour. Outfit
variation is permitted **only as a contextual layer on top of that base**
(weather, mood, activity, setting) and must stay secondary — the same child
dressed for the moment, never a redesigned character. Hairstyle, proportions
and design language never change. Cloud must be recognisable in about one
second regardless of outfit detail.

All four Cloud canvases in this pack are calm, neutral moments, so all four use
the **base outfit** with no added layer. `TALK-WITH-CLOUD` is the anchor and
defines that baseline for the rest of the pack — anchors carry the classic navy
hoodie only, with no extra layer and no major outfit variation.

**Leo** is the child inside this story and must be **visually separate from
Cloud**: different hair, different clothing, no navy-hoodie silhouette, and
never the cloud emblem. Where Leo's meaning can be carried by objects, hands or
an over-the-shoulder framing, prefer that.

**Leo's positive definition is `LEO-CHARACTER.md` in this folder** — age read,
hair, face, proportions, clothing, expression language and the one-second
separation test from Cloud. It is binding on every Story scene, and it is the
reference Leo is inherited from; no single scene is his master image.

**The three recurring objects are locked by
`GENERATION-PROMPT-STORY-SCENE-04.md`** — the football cards, the headphones and
the wrapped gift, with the shape, colours, details and relative scale that must
not change on any later canvas.

**Mia** appears only in the birthday context, Story scene 03.

Character faces must never be cropped by the container. Check each template's
crop boundary before finalising a composition.

## Role per canvas

| Canvas | Role | Character |
| --- | --- | --- |
| Welcome hero | Object-led | None — no Cloud, no Leo |
| Story scenes 01–06 | Leo's story | Leo only, never Cloud |
| Talk with Cloud | Guide-led | Cloud |
| Your Choice | Object-led band | None |
| Takeaway | Reflection band | None — object-led and character-free |
| Practice hero | Guide-led | Cloud |
| Completion hero | Guide-led | Cloud |
| Home card (feature, 238) | Guide-led | Cloud may appear |
| Home card (compact, 154) | Guide-led | Cloud may appear |
| Library card (wide, 154) | Object-led | Cloud must not appear |

## Story visual plan

Six scenes, one shared container — measured 330 × 287 at 390 (ratio 1.1498),
identical for all six scenes at 375, 390 and 430. Source export is
**1170 × 903** (1.2957). Design to these nominal figures; earlier fractional
readings (331.3 × 286.7) were browser rounding, not a different layout.

**Reading the manifest `character` field.** All six Story entries carry
`character: "none"`. That is binding on composition, not a ban on Leo: it means
**no full standing character is required and the scene must read object-led at
a glance**. Leo may appear as hands, forearms, a partial figure or an
over-the-shoulder framing, but the objects must carry the meaning. Nothing
labelled `character: "none"` may be built around a full-body character portrait.

**Scene 01 — `leo-wants-the-cards-now`**
Football cards waiting at the shop, with Leo's hand holding money or a small
wallet. Cropped hand only is ideal. **Do not show Cloud.** No printed values on
the notes or cards.

**Scene 02 — `leo-remembers-the-headphones`**
Headphones beside a savings container showing that Leo is still saving — a
part-filled jar or tin reads the progress. **No written numbers.** **Do not show
Cloud.** Leo may appear without Cloud clothing or emblem.

**Scene 03 — `leo-remembers-mias-birthday`**
A wrapped birthday gift associated with Mia. Mia may appear. Leo may appear
without Cloud clothing or emblem. **Do not show Cloud.** No writing on the gift
tag.

**Scene 04 — `leo-sees-three-choices`**
Football cards, headphones and a birthday gift presented as three meaningful
possibilities, evenly weighted. **Object-led, no character required.** No
category words beneath the objects.

**Scene 05 — `leo-pauses`**
Leo pausing outside the shop before deciding. Leo must not resemble Cloud and
must not wear a cloud emblem. Shop signage must carry **no legible letters**.

**Scene 06 — `leo-makes-a-plan`**
Leo arranging money into three groups or containers. **No written labels,
amounts or category words inside the image.** Leo must not resemble Cloud.

## Dimensions

Take `sourceWidth`, `sourceHeight` and `aspectRatio` per asset from the
production `manifest.json`. Every figure there now comes from a direct
measurement of the real container — see `MEASUREMENTS.md`.

**Do not force one ratio across the pack** — v1 was rejected partly for shipping
everything at 16:9. Nine distinct ratios are in use, from 1.2957 (story scene)
to 2.5325 (compact cards).

### Fixed-height bands

Every artwork container is now a **fixed-height band**: the height never changes
with stage content, and only the width scales with the viewport. Compose for
this.

| Canvas | Band height | Compose for |
| --- | --- | --- |
| Welcome hero | 296 | Object-led opening |
| Story scene ×6 | 287 | One shared container, all six scenes |
| Talk with Cloud | 240 | Cloud at left, calm space at right |
| Your Choice | 190 | The three money objects, evenly weighted |
| Takeaway | 170 | Quiet reflective space, no character |
| Practice hero | 196 | Cloud beside the practice symbols |
| Completion hero | 220 | Cloud, warm, celebratory but calm |
| Home card feature | 238 | Cloud plus the money objects |
| Home card compact | 154 | Same subject, readable at half the height |
| Library card | 154 | Objects only, distinct from the Home card |

No interface text, amounts, status or controls belong inside any band. They are
all drawn by the application in a sibling region **below** the artwork.

The compact Home card and the Library card share a shape but are **different
pictures**. Do not deliver one file for both, and do not crop one from the
other: the Home card is guide-led and the Library card is object-led.

### The three card canvases have a second, smaller crop

The band heights above are the **learned** state. Before the child has finished
the Wisdom, the same three card assets are drawn into a different, much smaller
region — read from the style constants in source, not measured at runtime:

| Asset | Learned region | Before learned | Component |
| --- | --- | --- | --- |
| `WIS-MONEY-001-HOME-CARD` | full width × 238 | full width × **132** | `WisdomArtworkStage` feature |
| `WIS-MONEY-001-HOME-CARD-COMPACT` | full width × 154 | **80 × 84** thumbnail | `WisdomArtworkStage` compact |
| `WIS-MONEY-001-LIBRARY-CARD` | full width × 154 | **80 × 84** thumbnail | `WisdomArtworkStage` compact |

Both regions use `resizeMode: cover` and centre the image, so a 2.5325 source
placed in an 80 × 84 box keeps only the middle ~38% of its width. **This is the
first thing a child sees, before the learned card ever appears.**

Practical rule for the two compact cards: the subject that identifies the
Wisdom must survive a centred square crop. Put one clear hero object — or
Cloud's face, on the Home compact card — inside the **middle 40% of the width**,
vertically centred. Treat the outer thirds as supporting atmosphere only. The
same applies less severely to the feature Home card, whose 1.6387 source loses
roughly the top and bottom sixth in the 132 region.

## Before delivering

1. Every canvas matches its template's source dimensions exactly.
2. No letters, numbers or currency anywhere, including background props.
3. No cloud emblem outside Cloud's own canvases.
4. Leo is unmistakably not Cloud.
5. Faces and key objects sit clear of the safe areas.
6. Asset IDs unchanged; only filenames and versions move.
7. Nothing important sits in the outer 14% of a full-width band — that is the
   maximum horizontal crop between a 375 and a 430 phone.
8. The compact Home card and the Library card are two separate compositions.
9. Cloud reads as a child close to 11 — slightly mature proportions, not
   baby-faced, not a teenager — with the same face, hair silhouette and
   proportions as every other Cloud asset in the pack.
