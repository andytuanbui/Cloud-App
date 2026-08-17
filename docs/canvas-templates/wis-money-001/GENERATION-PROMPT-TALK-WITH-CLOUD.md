# WIS-MONEY-001-TALK-WITH-CLOUD — Generation Brief

The **anchor** asset for the pack. It locks Cloud's face, outfit, proportions,
expression, rendering style, lighting and finish level for every other
Cloud-bearing canvas. Approve this one before any of the remaining fourteen are
drawn.

Everything below is derived from `ILLUSTRATION-PREP.md`, `ART-DIRECTION.md`,
`MEASUREMENTS.md`, `docs/CLOUD_CHARACTER.md`, the production `manifest.json`
and the real render geometry in `WisdomCanvas.tsx`.

> **Status: APPROVED — 2026-08-17.** The revised delivery in the pack folder is
> approved production art and the asset is `final`. This brief is now a record
> of what was asked for and a **reference for future Cloud canvases**, not an
> outstanding request. Nothing here needs generating again. The revision brief
> below is kept because it documents what changed between the unapproved
> delivery and the approved one.

---

## Deliverable

| | |
| --- | --- |
| Filename | `WIS-MONEY-001-talk-with-cloud-v1.png` |
| Location | `assets/wisdoms/three-ways-to-use-money/canvases/` |
| Dimensions | **1170 × 720 px**, exactly. Ratio 1.625 |
| Format | PNG, opaque, no alpha edges, no border, no rounded corners baked in |
| Text | **None.** No letters, numbers, currency, logos or wordmarks anywhere |

Overwrite the existing file and keep `version: 1`. The first delivery was never
approved or shipped, so this is a corrected v1, not a v2 replacement — no
`replacementHistory` entry is needed.

Do not deliver 16:9. A 1024 × 576 export is what got pack v1 rejected.

---

## Revision brief — what to change and what to keep

### Keep, unchanged

The character work in the current file is approved-quality in identity,
expression and finish, and is the reason this asset is the anchor. Carry these
over exactly:

- Cloud's **facial identity** — warm, attentive, calm half-smile, listening
  rather than performing. The same face, image to image.
- His **expression language** and **black hair silhouette language**
- The **deep navy hoodie** and the **glowing cloud emblem**
- The **premium soft 3D rendering** and finish level
- The **open-hand gesture** — it reads well and suits a listening surface

**One thing is deliberately not carried over: the age read.** Per the character
direction approved on 2026-08-17 (`docs/CLOUD_CHARACTER.md` → *Character
direction — CURRENT*), Cloud's **age read and proportions move up**: still
clearly a child, but reading **close to 11**, with slightly more mature, less
baby-ish face and body proportions and a calm, confident, thoughtful presence.
Not a teenager, not an adult, and not a different character — the same Cloud,
read slightly older.

### Change

1. **Re-stage Cloud into the left third.** His face must centre near
   **x 0.22 / y 0.42** — inside the manifest's `character` rectangle. The
   current delivery centres him at x 0.554, which puts 71.6% of the subject
   energy into the region the spec reserves as calm empty space.
2. **Open the right side.** x 0.40–0.96 is `unrestricted` and should be quiet
   atmosphere, the space the conversation breathes into. Nothing to look at.
3. **Turn the hand gesture inward, toward that open right side**, so the
   composition points at the space where the child's answer appears.
4. **Restore the palette.** The current delivery is periwinkle and royal blue
   (`#9DB7E6`, `#3067BC`, `#849AD7`) with peach clouds; approved forest green
   and soft gold are absent entirely. Grade back to **deep navy, forest green,
   warm cream, with soft gold as accent** — see the palette table below.

Everything else stays as delivered.

---

## Cloud's outfit — binding

The full rule is `docs/CLOUD_CHARACTER.md` → **Outfit direction — FINAL**.
For this asset specifically:

- **Classic deep navy hoodie with the cloud emblem. The anchor look.**
- **No outfit variation of any kind here.** No jacket, no zip layer, no rain
  layer, no accent styling. This image *defines* the baseline that contextual
  variations elsewhere are layered on top of, so it must show the base outfit
  clean.
- The emblem stays visible and unobstructed.
- Hairstyle, proportions and design language do not change.
- **Recognition test:** Cloud must read as Cloud in about one second.

---

## The prompt

> A soft cinematic children's storybook illustration, 3D-rendered stylised
> character in warm painterly light. A friendly boy who reads as about eleven —
> clearly a child, but with slightly mature, un-baby-ish face and body
> proportions and a calm, confident, thoughtful presence — stands three-quarter
> turned toward the viewer on the **left third** of a wide horizontal frame,
> listening. Tousled black hair, warm brown eyes, a calm open half-smile —
> attentive, the expression of someone who has just asked a question and is
> waiting for the answer. He wears a **deep navy hoodie with a
> small softly glowing pale cloud emblem** on the chest — no jacket, no extra
> layer. One hand is open in a gentle, welcoming gesture that **points inward
> across the frame, toward the open space on his left**. Beside his shoulder
> floats a tiny luminous cloud of light, warm gold, like a small companion.
>
> The right two-thirds of the frame is calm, near-empty atmosphere — a soft
> **deep navy to muted forest green** gradient with gentle warm light falling
> from the upper right, a few faint warm gold motes, nothing to look at. Depth
> comes from light and layering, not from objects.
>
> Palette strictly: deep navy `#10333A` and `#071F28`, muted forest green
> `#285F54`, warm cream `#FFF8EA`, soft gold `#EFB63D` as accent only,
> restrained mint `#DCEDE6`. No royal blue, no periwinkle, no pink or peach.
> Low contrast, one clear light source from the upper right, warm and unhurried.
> Premium, calm, emotionally clear. Readable at thumbnail size.
>
> No text, no numbers, no currency, no logos, no props, no clutter, no confetti,
> no arcade energy, no stock-photo look. Not a teenager, not an adult, not
> baby-faced, not chibi.

---

## Composition, in source pixels

The band is **fixed at 240 device px tall**, and its measured width is
**335 / 350 / 390** at the three supported viewports.

| Region | Normalised | Source px | Instruction |
| --- | --- | --- | --- |
| `character` | x .04–.38, y .06–.94 | x 47–445, y 43–677 | **Cloud belongs here.** Not a keep-clear zone |
| `unrestricted` | x .40–.96 | x 468–1123 | Calm empty space. Nothing required, nothing drawn over it |
| Focal point | .22 / .42 | **257, 302** | Cloud's face centres here |

**Cloud's head and face must sit entirely inside x 0.10–0.36, y 0.12–0.70**
(px 117–421, 86–504). That is the intersection of the character zone with every
crop the app can apply. His body may extend to the frame's left edge and below
the bottom edge; his face may not go near either.

### What the real crops do

`fitMode: cover`. The band is narrower than the 1.625 source at two of the three
viewports, so the crop is **horizontal**:

| Viewport | Band | Visible source window | Lost |
| --- | --- | --- | --- |
| 375 × 812 | 335 × 240 | x 0.060 → 0.911 | ~14.9%, mostly off the right |
| 390 × 844 | 350 × 240 | x 0.041 → 0.930 | ~11.1% |
| 430 × 932 | 390 × 240 | x 0.000 → 0.967 | ~3.3% |

Keep everything that matters inside **x 0.06 → 0.91**. Nothing important in the
top or bottom 6% either.

`WisdomCanvas` pans toward the focal point by growing the image box outward
(`focalCoverInset`, see `src/features/wisdomCanvas/focalPoint.ts`), so the band
is always fully covered — there is no edge strip to compose around.

---

## Character law — non-negotiable

- Cloud is **clearly a child who reads close to eleven**, per
  `docs/CLOUD_CHARACTER.md` → *Character direction — CURRENT*: slightly mature
  proportions, less baby-ish face and body, calm confidence, intelligent and
  thoughtful, emotionally safe. **Never a teenager or an adult; never back to
  very young or baby-like proportions.** He is the guide and companion, not a
  mascot. Inspired by the founder's son — treat with care.
- **Facial identity, black hair silhouette, body proportions and rendering style
  do not drift** between this asset and any other Cloud asset. Each illustration
  is the same character, not a fresh interpretation.
- Navy hoodie carrying the **cloud emblem** — present and visible; **a glow is
  not required**, and the approved anchor renders it as a clean pale mark.
  Signature sneakers if the legs are in frame.
- **Nimbus**, his small cloud of light, is canonical and welcome here.
- **No Leo.** He does not appear on this surface.
- Face is **never cropped**, at any supported width.
- Match the established Cloud in `assets/cloud/cloud-hero-wave.png` and
  `assets/cloud/cloud-full-body.png`, and the face in the current delivery, for
  **facial identity, hair silhouette, hoodie, emblem and rendering style**. Use
  them as reference images if the tool accepts them. Where any of those older
  references reads younger than the approved direction, **the mature direction
  wins** — take identity from them, not age.
- Do **not** reuse or re-render
  `docs/visual-references/wis-money-001-v1-rejected/WIS-MONEY-001-talk-with-cloud-v1.png`.
  A byte-identical copy is rejected by the test suite.

---

## Quality bar before this is accepted

This file becomes the standard for the whole pack, so judge it as such:

1. Cloud's face — warm, attentive, confident; clearly a child who reads close to
   eleven, and the same face as every other Cloud asset
2. Cloud's outfit — classic deep navy hoodie, cloud emblem, base look, no extra
   layer, no outfit variation
3. Cloud's proportions — slightly mature child: not chibi, not baby-faced, not
   teen, not adult
4. Cloud's expression — listening, not performing
5. Rendering style — soft cinematic, premium, not stock-photo, not v1
6. Lighting — one source, upper right, low contrast, warm
7. Finish level — holds up at 240 px tall on a phone
8. **Staging** — face near 0.22 / 0.42, right side open and quiet
9. **Palette** — navy, forest green, cream, gold accent; no new hues
10. **Recognition** — reads as Cloud in about one second

If any of the ten is off, revise this file. Do not proceed to asset two.

---

## Once the PNG is in place

The wiring is already done and waiting for it:

- `manifest.json` — `WIS-MONEY-001-TALK-WITH-CLOUD` is `status: "final"`, set
  on 2026-08-17 after visual approval. Nothing else in the manifest moved: the
  filename and `version: 1` are unchanged, and `replacementHistory` stays empty
  because the earlier delivery was never approved or shipped
- `assetIds.ts` — source key `wis-money-001-talk-with-cloud`
- `registry.ts` — static `require` pointing at this folder
- Tests read the manifest, so no further edits are needed

Then run `npm run validate:wisdom-canvas`.
