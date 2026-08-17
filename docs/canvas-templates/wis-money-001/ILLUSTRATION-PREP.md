# WIS-MONEY-001 — Illustration Prep Report

Wisdom: **Three Ways to Use Money** (`three-ways-to-use-money`)
Pack: 15 canvases, all layout-stable and render-path complete. **1 approved `final`** (`TALK-WITH-CLOUD`, the anchor / Character Master, approved 2026-08-17); the other **14 remain `awaiting-final-art`**.
Prepared against commit `f801421` on `claude/wisdom-canvas-viewport-tuning`.

Sources of truth, in priority order:

1. `assets/wisdoms/three-ways-to-use-money/canvases/manifest.json` — dimensions, focal points, safe areas
2. `docs/canvas-templates/wis-money-001/MEASUREMENTS.md` — real container measurements
3. `docs/canvas-templates/wis-money-001/ART-DIRECTION.md` — palette, style, character law
4. `docs/CLOUD_CHARACTER.md` — Cloud
5. `src/features/wisdomCanvas/renderPaths.ts` — which surface draws which asset

---

## 1. Final asset table

All fifteen verified against the manifest, `bandHeights.ts` and `renderPaths.ts`.
Band height is device-independent px and **constant** — only width scales.

| # | Asset ID | Screen / card location | Source px (ratio) | Band h | Visual role | Led by | Key composition note | UI / safe-area note |
|---|---|---|---|---|---|---|---|---|
| 1 | `WIS-MONEY-001-WELCOME-HERO` | Guided → Welcome stage | 1170 × 891 (1.3131) | 296 | Hero | **Object** | 90 kr + all three objects together; the opening image of the Wisdom | Bottom 62–96% = title. Top-left 4–20% = progress. Left 20–60% (y .20–.60) = controls. Focal 0.60 / 0.42 — deliberately right of centre, away from the controls block |
| 2 | `WIS-MONEY-001-STORY-SCENE-01` | Guided → Story, scene `leo-wants-the-cards-now` | 1170 × 903 (1.2957) | 287 | Story scene | **Object** | Football cards at the shop; Leo's hand holding money or a small wallet. Cropped hand only is ideal | Top 4–22% = title. Bottom 66–98% = body. Usable centre band is y .22–.66. Focal 0.50 / 0.42 |
| 3 | `WIS-MONEY-001-STORY-SCENE-02` | Guided → Story, `leo-remembers-the-headphones` | 1170 × 903 (1.2957) | 287 | Story scene | **Object** | Headphones + a part-filled savings container. The container reads "not there yet" — the story says Leo is still 120 kr short | Same as #2. No numerals on the jar, ever |
| 4 | `WIS-MONEY-001-STORY-SCENE-03` | Guided → Story, `leo-remembers-mias-birthday` | 1170 × 903 (1.2957) | 287 | Story scene | **Mixed** | Wrapped gift for Mia. Mia may appear — this is the **only** scene she may appear in | Same as #2. No writing on the gift tag |
| 5 | `WIS-MONEY-001-STORY-SCENE-04` | Guided → Story, `leo-sees-three-choices` | 1170 × 903 (1.2957) | 287 | Story scene | **Object** | The three objects side by side, **evenly weighted**. No character | Same as #2. No category words under the objects |
| 6 | `WIS-MONEY-001-STORY-SCENE-05` | Guided → Story, `leo-pauses` | 1170 × 903 (1.2957) | 287 | Story scene | **Mixed** | Leo pausing outside the shop. Highest character-risk frame in the pack | Same as #2. Shop signage must carry **no legible letters** |
| 7 | `WIS-MONEY-001-STORY-SCENE-06` | Guided → Story, `leo-makes-a-plan` | 1170 × 903 (1.2957) | 287 | Story scene | **Mixed** | Money sorted into **three unequal groups** — the story is 40 / 30 / 20 kr, not equal thirds | Same as #2. No labels, amounts or category words |
| 8 | `WIS-MONEY-001-TALK-WITH-CLOUD` | Guided → Talk with Cloud band | 1170 × 720 (1.625) | 240 | Background | **Character** | Cloud listening, left. Calm empty space right | Left 4–38% is `character` — Cloud belongs **inside** it. Right 40–96% `unrestricted`. Focal 0.22 / 0.42 |
| 9 | `WIS-MONEY-001-CHOICE-BACKGROUND` | Guided → Your Choice band | 1170 × 570 (2.0526) | 190 | Background | **Object** | Wide shallow band. A calm decision surface, atmosphere over subject | Whole 3–97% `unrestricted`; nothing drawn over it. But the stage below is dense — keep it quiet |
| 10 | `WIS-MONEY-001-TAKEAWAY-BACKGROUND` | Guided → Takeaway band | 1170 × 510 (2.2941) | 170 | Background | **Object** | The quietest surface in the pack. Reflective, near-empty | Whole 3–97% `unrestricted`. No character |
| 11 | `WIS-MONEY-001-PRACTICE-HERO` | Guided → Practice hero | 1070 × 588 (1.8197) | 196 | Hero | **Character** | Cloud beside symbols for pausing, money, thinking of others | Top-left 4–56% is `character` — Cloud goes there. Bottom 60–96% = body copy, keep clear. Focal 0.28 / 0.44 |
| 12 | `WIS-MONEY-001-COMPLETION-HERO` | Guided → Completion band | 1070 × 660 (1.6212) | 220 | Hero | **Character** | Cloud, warm and calm. **Mirrored** from Practice — Cloud sits right here | Right 58–98% is `character`. Left 4–54% `unrestricted`. Focal 0.74 / 0.44 |
| 13 | `WIS-MONEY-001-HOME-CARD` | Home → Today's Wisdom feature card (`TodayWisdomCard.tsx`) | 1170 × 714 (1.6387) | **238** learned / **132** before | Card | **Mixed** | Cloud + the money objects. Two crops — see §3 | Bottom 66–96% = title. Top-right 60–96% × 4–24% = progress. Focal 0.72 / 0.40 |
| 14 | `WIS-MONEY-001-HOME-CARD-COMPACT` | Home → learned compact card (`LibraryWisdomCard.tsx`, `surface="home"`) | 1170 × 462 (2.5325) | **154** learned / **80 × 84** before | Card | **Mixed** | Cloud beside the money objects, readable at half height and in a square crop | Bottom 54–94% = title. Top-right progress. Focal 0.72 / 0.44 |
| 15 | `WIS-MONEY-001-LIBRARY-CARD` | Library → Wisdom card (`LibraryWisdomCard.tsx`, `surface="library"`) | 1170 × 462 (2.5325) | **154** learned / **80 × 84** before | Card | **Object** | Objects only. **Cloud must not appear.** Must be visibly a different picture from #14 | Bottom 56–94% = title. Top-right progress. Focal 0.72 / 0.42 |

Nine distinct ratios are in use. One export per asset. No shared ratio.

---

## 2. Shared visual language

### Cloud

- The CloudWise guide. Clearly a child, reading **close to 11 years old** — slightly mature proportions, less baby-ish face and body, calm and confident. Per `docs/CLOUD_CHARACTER.md` → *Character direction — CURRENT*. Never a teenager, never an adult, never regressed to baby-like proportions.
- Navy hoodie carrying the **cloud emblem** — the emblem must be present and visible, but **a glow is not required**; the approved anchor renders it as a clean pale mark. Signature sneakers.
- Warm, curious, thoughtful, quietly confident. An intelligent, emotionally safe presence. A companion, not a mascot.
- His companion **Nimbus**, a small cloud of light, is part of his canonical design. It is *not* referenced in any manifest entry — see §5.
- Cloud appears in **exactly four** places: `TALK-WITH-CLOUD`, `PRACTICE-HERO`, `COMPLETION-HERO`, and the two Home cards. Nowhere else. **Never in a Story scene.**
- His face is never cropped, at any supported width, on any surface.

#### Outfit rule

The full rule is in **`docs/CLOUD_CHARACTER.md` → Outfit direction — FINAL**.
It is binding on every asset in this pack. In short:

- Cloud has a **fixed core identity**: same facial identity, same black hair
  silhouette language, same age read (a child close to 11), same body
  proportions, same expression language, same cloud emblem, same premium soft
  3D style, same deep navy core.
- The **deep navy hoodie with the cloud emblem is the base outfit** and the
  visual foundation. The emblem is never removed; the navy base is never
  swapped for another main colour.
- Outfit variation is allowed **only as a contextual layer on top of that
  base** — weather, mood, activity or setting. A jacket or zip layer when it is
  cold, a rain layer when it is wet, simpler styling for a reflective beat.
  Secondary, never dominant.
- No hairstyle, proportion or design-language changes. No new fashion look per
  asset. Clothing must never produce a different character.
- **Recognition test:** Cloud reads as Cloud in about one second, whatever the
  outfit detail.

Within this pack every Cloud surface is a calm indoor or neutral moment, so all
four should sit at or very close to the **base outfit** — navy hoodie, emblem
visible, no added layer. `TALK-WITH-CLOUD` is the anchor and carries no
variation at all: classic navy hoodie only, no extra outfit layer, no major
outfit variation.

### Leo

- The child inside this story. Roughly the reader's age.
- Must be **unmistakably not Cloud**: different hair, different clothing, no navy-hoodie silhouette, **never the cloud emblem**. This single rule sank pack v1.
- Prefer hands, forearms, partial figures, over-the-shoulder framing. Where objects can carry the meaning, use objects.
- Whatever Leo looks like in scene 05 must be identical in 06, 02 and 03. Lock him once.

### Mia

- Leo's **younger sister**. Appears only in Story scene 03, the birthday context. Nowhere else in the pack.

### The three recurring objects

These are the spine of the Wisdom. They must be recognisably the *same three things* on every surface they appear:

| Object | Meaning in the lesson | Appears in |
|---|---|---|
| **Pack of football cards** | Spend now | 1, 2, 5, 7, 8, 13, 14, 15 |
| **Headphones** | Save toward a goal | 1, 3, 5, 7, 8, 13, 14, 15 |
| **Wrapped birthday gift** | Give / help someone | 1, 4, 5, 7, 8, 13, 14, 15 |

Same silhouette, same colourway, same scale relationship each time. A child should recognise the headphones from the Welcome hero when they reappear on the Library card.

Supporting object: a **savings container** (part-filled jar or tin) in scene 02. It must read "part of the way there" purely through fill level — no markings.

### The money — 90 kr

- **Never draw the amount.** No "90", no "kr", no denominations on notes or coins, no printed values anywhere including background props and blurred detail.
- Money is drawn as **generic, unmarked notes and coins**. The app renders every figure.
- Where money is divided (scene 06, Welcome hero), show **three unequal groups**. The story's answer is 40 / 30 / 20 kr. Equal thirds would contradict the lesson — the copy says explicitly *"the amounts were different because each choice mattered in a different way."*

### Colour, lighting, mood

| Role | Colour |
|---|---|
| Deep navy | `#10333A` / `#071F28` |
| Muted forest green | `#285F54` |
| Warm cream | `#FFF8EA` |
| Soft gold | `#EFB63D` |
| Restrained mint | `#DCEDE6` |

No new hues. Soft cinematic children's illustration. Calm, **low-contrast** lighting with **one clear light source**, consistent in direction across the pack. Warm and unhurried — never loud, never arcade-like.

### Simplicity and child readability

- Target reader: **ages 7–12**.
- **One subject reads first**, everything else supports. Depth through light and layering, not clutter.
- **No letters or numbers anywhere** — not on cards, jars, signs, packages, screens, posters, books or clothing. No logos or wordmarks.
- Every image must be understandable **without any embedded words**, because there are none and because the app text is translatable.
- Nothing important in the **outer 14%** of a full-width band — that is the maximum horizontal crop between a 375 and a 430 phone.

---

## 3. Safe areas and cropping

### How to read a safe area

`purpose` determines the instruction — they are not all keep-clear zones:

- `title`, `body`, `controls`, `amount`, `progress` → **keep clear**. The app draws over it.
- `character` → **place here**. Reserved *for* the subject.
- `unrestricted` → free.

### Crop tolerance

| Container class | Horizontal crop 375 → 430 | Bottom hidden? |
|---|---|---|
| Full-width bands (1, 8, 9, 10, 13) | up to **14%** | **No** — 0 px overlap, fully visible |
| Story scenes ×6 | up to **14%** | **No** — 0 px overlap (was 24 px, fixed in `f801421`) |
| Practice hero | up to **14%** | **No** — 0 px overlap (was 20 px, fixed in `f801421`) |
| Compact cards (14, 15) | up to **14%** learned; **~62%** before learned | No |

**Every band bottom is now fully visible.** Story's first content below the band sits at y 449 against a band bottom of y 449; Practice at y 365 against 365. Nothing is drawn over any artwork's bottom edge. Compose to the full declared height.

### The pre-learned crop — the one real trap

The band heights above are the **learned** state. Before the child finishes the Wisdom, the three card assets are drawn into a much smaller region by `WisdomArtworkStage`:

| Asset | Learned | Before learned |
|---|---|---|
| `HOME-CARD` | full width × 238 | full width × **132** |
| `HOME-CARD-COMPACT` | full width × 154 | **80 × 84** thumbnail |
| `LIBRARY-CARD` | full width × 154 | **80 × 84** thumbnail |

Both use `resizeMode: cover`, centred. A 2.5325 source in an 80 × 84 box keeps only the **middle ~38% of its width**. This is what the child sees *first*.

**Rule:** on assets 14 and 15, the one object that identifies the Wisdom must sit inside the **middle 40% of the width**, vertically centred, and survive a square crop. Outer thirds are atmosphere. On asset 13, expect to lose roughly the top and bottom sixth in the 132 region.

### Safe composition for mobile, generally

Centre-weighted, horizontally forgiving, vertically committed. Height is fixed everywhere, so vertical composition is exact and can be trusted; width is the only variable, so never place meaning near a left or right edge.

---

## 4. Per-asset art notes

**1. `WELCOME-HERO`** — Show: unmarked notes and coins with the football cards, headphones and wrapped gift, all three legible as distinct objects. Avoid: any character, any number, clutter in the bottom third. Subject sits **right of centre, upper-middle** (focal 0.60 / 0.42) — the left and bottom carry progress, controls and title.

**2. `STORY-SCENE-01`** — Show: a pack of football cards waiting at a shop; Leo's hand holding money or a small wallet, cropped at the wrist. Avoid: Cloud, Leo's face, printed values, shop signage with letters. Subject **centred, slightly high** (0.50 / 0.42), clear of the title band on top and body band below.

**3. `STORY-SCENE-02`** — Show: the headphones and a part-filled savings jar or tin; the gap between them is the point. Avoid: Cloud, any numeral or gauge marking, a full-length Leo. Subject centred; keep the fill line inside the middle band.

**4. `STORY-SCENE-03`** — Show: a wrapped birthday gift, warm and small-scale, associated with Mia; Mia may appear. Avoid: Cloud, writing on the tag, party clutter. Subject centred; if Mia appears, her face must clear both the title and body zones.

**5. `STORY-SCENE-04`** — Show: the three objects side by side, **evenly weighted and evenly lit** — no object favoured. Avoid: any character, any hierarchy between the three, category words. Subject centred and horizontal; this is the pack's reference image for all three objects.

**6. `STORY-SCENE-05`** — Show: Leo pausing at a shop entrance, the moment before deciding. Avoid: **any** navy hoodie silhouette, any cloud emblem, legible signage, a Cloud-like face. This is the frame that killed v1 — if in doubt, frame from behind or in three-quarter rear view. Subject centred, figure clear of the body band.

**7. `STORY-SCENE-06`** — Show: money arranged into **three unequal groups** or containers, largest to smallest. Avoid: written labels, amounts, category words, equal thirds, Cloud resemblance. Subject centred and low-contrast; if Leo's hands appear, hands only is safest.

**8. `TALK-WITH-CLOUD`** — Show: Cloud, listening, three-quarter or seated, in the left 4–38%, hand gesture directed **inward** toward the open space. Warm empty space at the right for the conversation to breathe into. Avoid: filling the right side, cropping Cloud's face, any object clutter, any embedded text. Subject at **0.22 / 0.42**, inside the `character` rectangle. This is the pack anchor: 1170 × 720, classic navy hoodie only, mature Cloud read per `docs/CLOUD_CHARACTER.md`.

**9. `CHOICE-BACKGROUND`** — Show: a calm surface — soft table or board texture, warm light — that reads as "a place to decide". Avoid: characters, the three objects rendered in detail, any focal point that competes with the allocation UI below. Wide and shallow; keep it near-flat with a gentle centre lift.

**10. `TAKEAWAY-BACKGROUND`** — Show: the quietest image in the pack. Light, air, one soft gradient of warmth. Avoid: characters, objects, anything that asks for attention. Subject: effectively none — this is a mood surface.

**11. `PRACTICE-HERO`** — Show: Cloud upper-left with three light symbolic cues for pausing, money and thinking of others. Symbols must be **abstract**, not the three story objects. Avoid: text-like glyphs, arrows resembling letters, detail in the bottom 40%. Subject at **0.28 / 0.44**, inside the top-left `character` zone.

**12. `COMPLETION-HERO`** — Show: Cloud at the **right**, warm and calm recognition. Not a celebration — a quiet well-done. Avoid: confetti, stars, arcade energy, filling the left side. Subject at **0.74 / 0.44**; this is the deliberate mirror of Practice.

**13. `HOME-CARD`** — Show: Cloud with the three money objects, composed for a wide card that also survives a 132-tall crop. Avoid: detail in the bottom third (title) or top-right (progress). Subject at **0.72 / 0.40**, vertically near-centred so the 132 crop keeps it.

**14. `HOME-CARD-COMPACT`** — Show: the same subject as #13, **recomposed** — not cropped from it — for half the height. Cloud's face plus one hero object. Avoid: three objects competing at this size, anything below 54% height. Subject at **0.72 / 0.44** and inside the middle 40% of width so it survives the 80 × 84 thumbnail.

**15. `LIBRARY-CARD`** — Show: the three objects only, in an arrangement that is obviously a *different picture* from #14 — different angle, different grouping, different light. Avoid: **Cloud, in any form**; reusing or cropping #14. Subject at **0.72 / 0.42**, hero object inside the middle 40% of width.

---

## 5. Recommended illustration order

One sequence, first to last. The logic: lock the two things everything else inherits — **Cloud's look** and **the three objects** — before anything that combines them, and leave the character-free atmosphere bands until last, when they carry the least risk.

| # | Asset | Why here |
|---|---|---|
| 1 | `TALK-WITH-CLOUD` | **Anchor A — Cloud. ✅ APPROVED 2026-08-17, `final`.** The largest, calmest, most generous Cloud frame in the pack, and now the **Character Master**: everything Cloud-bearing inherits his facial identity, hair silhouette, body proportions, age read and rendering from this file. Match it — do not reinterpret Cloud per asset. |
| 2 | `STORY-SCENE-04` | **Anchor B — the three objects.** All three at once, evenly weighted, no character to distract. Every subsequent object appearance is measured against this file. |
| 3 | `STORY-SCENE-01` | Isolates the football cards from Anchor B. Adds Leo's hand — the lowest-risk way to establish Leo. |
| 4 | `STORY-SCENE-02` | Isolates the headphones; introduces the savings container. |
| 5 | `STORY-SCENE-03` | Isolates the gift; introduces Mia. Only scene she appears in, so it is self-contained. |
| 6 | `STORY-SCENE-05` | **Highest risk.** Leo most visible. Do it only after Cloud is locked (1) so the visual contrast is a deliberate decision, not a hope. |
| 7 | `STORY-SCENE-06` | Reuses Leo from 05 and money from 01. Must show three unequal groups. |
| 8 | `WELCOME-HERO` | Combines money and all three objects. Depends on Anchor B; benefits from the six scenes being settled first. |
| 9 | `HOME-CARD` | **Anchor C — the card family.** Needs both Cloud and the objects. Its composition drives 10 and 11. |
| 10 | `HOME-CARD-COMPACT` | Recomposed from 9's subject for half height and a square thumbnail. Do it immediately after 9, while the composition is fresh. |
| 11 | `LIBRARY-CARD` | Must be visibly distinct from 10. Drawing it directly after 10 is what makes the difference deliberate rather than accidental. |
| 12 | `PRACTICE-HERO` | Cloud plus abstract symbols. Needs Cloud locked but nothing else — safely late. |
| 13 | `COMPLETION-HERO` | Cloud mirrored to the right. Easiest Cloud frame once 1 and 12 exist. |
| 14 | `CHOICE-BACKGROUND` | Pure atmosphere. No character, no required object, generous `unrestricted` area. Near-zero dependency. |
| 15 | `TAKEAWAY-BACKGROUND` | The quietest asset in the pack and the least constrained. Safest possible last file. |

Approval gates: **stop after #1** and **stop after #2**. If Cloud and the three objects are both signed off, the remaining thirteen carry very little risk. Those two files are where a second rejection would be caught cheaply.

---

## 6. Blockers and open questions

Four documentation-level inconsistencies were found. **All four have been fixed in the briefing layer** — no layout, learning logic, copy or application behaviour was changed.

| Issue found | Resolution |
|---|---|
| README's safe-area section said "keep faces and key objects **out of** safe areas", but `TALK-WITH-CLOUD` and `PRACTICE-HERO` use `purpose: "character"` rectangles that mark where the subject **belongs**. Following the README literally would place Cloud outside his own reserved zone. | README now documents the two rectangle kinds separately. |
| README said "Your Choice is portrait". The manifest specifies 1170 × 570, ratio **2.0526** — a wide, shallow band. The portrait figure is a stale v1-era spec that survived in `REVIEW.md`. | README now describes the real ratio range, 1.2957 → 2.5325. |
| The three card assets have a **second, much smaller pre-learned crop** (132 tall, and 80 × 84 for both compact cards) that appeared in no brief. An illustrator composing only for 154 would lose ~62% of the width in the state the child sees first. | Documented in ART-DIRECTION with the middle-40% rule. |
| Manifest sets `character: "none"` on all six Story scenes while ART-DIRECTION says Leo may appear in 02, 03, 05 and 06 — a direct contradiction on the exact axis that caused the v1 rejection. | ART-DIRECTION now defines `character: "none"` as *object-led, no full standing character required; Leo permitted as hands or partial figure*. The manifest data was left untouched. |

One smaller drift also corrected: ART-DIRECTION's stale fractional Story container figures (331.3 × 286.7 → the nominal 330 × 287).

**Placeholder-list count — verified against code, 2026-08-17.** `assetIdsSharingFallbackArtwork` in `src/features/wisdomCanvas/assetIds.ts` lists **eight** asset IDs, matching the canvas README. The list records every asset that must still show the approved placeholder, which is every asset not approved `final`. `WIS-MONEY-001-TALK-WITH-CLOUD` was briefly listed while it was delivered but under review, and left the list when it was approved — delivering a file does not remove an ID, only approval does. The **six** story scenes were never listed; they keep their own approved artwork. 8 placeholders + 6 story scenes + 1 approved anchor = the full fifteen.

**NO BLOCKERS — READY FOR ILLUSTRATION PRODUCTION**
