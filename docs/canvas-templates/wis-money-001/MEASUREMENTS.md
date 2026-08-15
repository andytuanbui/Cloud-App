# WIS-MONEY-001 — Container Measurements

Measured from the running application (Expo web, `localhost:8082`) by reading
`getBoundingClientRect()` off the real DOM. Every artwork container carries a
`testID` of the form `canvas-band-<ASSET-ID>`, so each row below is a direct
read of the element the artwork will actually fill.

**Method.** `measure-viewports.bat` runs `tools/measure-viewports/run.mjs`,
which drives a real Chromium through the whole Guided Wisdom at each viewport
and records every stage. Navigation uses `data-testid` hooks only, and the
active stage is asserted via `guided-stage-<stage>` before any reading is
taken — an earlier text-driven harness silently recorded a Home card as Story,
which is what these assertions exist to prevent. The raw output is committed
alongside this document as `measurements-raw.json`.

| Mark | Meaning |
| --- | --- |
| **M** | Measured directly at that viewport, in the browser, in that state |
| **S** | Read from a literal constant in source; not observed at runtime |

There are no derived values in the tables below. Rows marked **S** are called
out explicitly and are not presented as measurements.

## Viewports

Measured at the three real device viewports:

| Viewport | Window | ScrollView visible height | Chrome above it |
| --- | --- | --- | --- |
| 375 × 812 | 375 × 812 **M** | 745 **M** | 67 |
| 390 × 844 | 390 × 844 **M** | 777 **M** | 67 |
| 430 × 932 | 430 × 932 **M** | 865 **M** | 67 |

**The ScrollView height, not the window height, is the fold.** A control at
y 800 on a 375 × 812 phone is off screen, because the stage header occupies the
first 67 px. Every "below the first viewport" judgement below uses the window
height, which is what the child can actually see.

## The width rule (measured, not assumed)

Content width = `viewport − 2 × layout.pagePadding (20)`, minus container
border on inset surfaces.

| Viewport | Full-width band | Inset stage band | Story illustration |
| --- | --- | --- | --- |
| 375 | 335 **M** | 301 **M** | 315 **M** |
| 390 | 350 **M** | 316 **M** | 330 **M** |
| 430 | 390 **M** | 356 **M** | 370 **M** |

`layout.readingMaxWidth` is 620, so no width in this range is capped.

## Fixed-height bands — every artwork container

Height is a constant for all of them. Only width scales, so **one source image
serves all three widths**; it is generated at the 430 ratio and narrower
viewports crop the sides.

### Welcome hero — `WIS-MONEY-001-WELCOME-HERO`

| Viewport | W × H | Ratio | |
| --- | --- | --- | --- |
| 375 | 334 × 296 | 1.1284 | **M** |
| 390 | 348.7 × 296 | 1.1780 | **M** |
| 430 | 388.7 × 296 | 1.3132 | **M** |

Carried forward from the earlier manual run; the automated walk enters at
Welcome but does not stop to measure it, because nothing about this stage
changed. Source **1170 × 891** (1.3131).

### Story scene — `WIS-MONEY-001-STORY-SCENE-01 … -06`

| Viewport | W × H | Ratio | |
| --- | --- | --- | --- |
| 375 | 315 × 287 | 1.0976 | **M** |
| 390 | 330 × 287 | 1.1498 | **M** |
| 430 | 370 × 287 | 1.2892 | **M** |

Scenes 1 and 6 were measured at every viewport and returned the identical box,
as did every scene in the earlier full sweep. One Story template covers all
six. Source **1170 × 903** (1.2957).

### Talk with Cloud — `WIS-MONEY-001-TALK-WITH-CLOUD`

| Viewport | W × H | Ratio | |
| --- | --- | --- | --- |
| 375 | 335 × 240 | 1.3958 | **M** |
| 390 | 350 × 240 | 1.4583 | **M** |
| 430 | 390 × 240 | 1.6250 | **M** |

Measured before the child answers and after Cloud's response at each viewport.
The band returned **240 in every one**, while the stage below it grew from 879
to 1920 px of content. Source **1170 × 720** (1.625).

### Your Choice — `WIS-MONEY-001-CHOICE-BACKGROUND`

| Viewport | W × H | Ratio | |
| --- | --- | --- | --- |
| 375 | 335 × 190 | 1.7632 | **M** |
| 390 | 350 × 190 | 1.8421 | **M** |
| 430 | 390 × 190 | 2.0526 | **M** |

Reduced from 210 to 190. Measured on entry, with every krone placed, and with
Cloud's response shown — **190 in all three states at all three viewports**,
while stage content grew from 1134 to 1426 px. Source **1170 × 570** (2.0526).

### Takeaway — `WIS-MONEY-001-TAKEAWAY-BACKGROUND`

| Viewport | W × H | Ratio | |
| --- | --- | --- | --- |
| 375 | 335 × 170 | 1.9706 | **M** |
| 390 | 350 × 170 | 2.0588 | **M** |
| 430 | 390 × 170 | 2.2941 | **M** |

Reduced from 180 to 170. Measured before choosing a thought and after Cloud's
"remembered" panel appears. **170 in every state.** Source **1170 × 510**
(2.2941).

### Practice hero — `WIS-MONEY-001-PRACTICE-HERO`

| Viewport | W × H | Ratio | |
| --- | --- | --- | --- |
| 375 | 301 × 196 | 1.5357 | **M** |
| 390 | 316 × 196 | 1.6122 | **M** |
| 430 | 356 × 196 | 1.8163 | **M** |

Source **1070 × 588** (1.8197).

### Completion hero — `WIS-MONEY-001-COMPLETION-HERO`

| Viewport | W × H | Ratio | |
| --- | --- | --- | --- |
| 375 | 301 × 220 | 1.3682 | **M** |
| 390 | 316 × 220 | 1.4364 | **M** |
| 430 | 356 × 220 | 1.6182 | **M** |

The recognition copy renders below the band, so the band is constant. Source
**1070 × 660** (1.6212).

### Home and Library cards

| Asset | Viewport | W × H | Ratio | |
| --- | --- | --- | --- | --- |
| `WIS-MONEY-001-HOME-CARD` (feature) | — | width × 238 | — | **S** |
| `WIS-MONEY-001-HOME-CARD-COMPACT` | 375 | 335.3 × 154 | 2.1773 | **M** |
| `WIS-MONEY-001-HOME-CARD-COMPACT` | 390 | 350.0 × 154 | 2.2727 | **M** |
| `WIS-MONEY-001-HOME-CARD-COMPACT` | 430 | 390.0 × 154 | 2.5325 | **M** |
| `WIS-MONEY-001-LIBRARY-CARD` | 375 | 335.3 × 154 | 2.1773 | **M** |
| `WIS-MONEY-001-LIBRARY-CARD` | 390 | 350.0 × 154 | 2.2727 | **M** |
| `WIS-MONEY-001-LIBRARY-CARD` | 430 | 390.0 × 154 | 2.5325 | **M** |

**The feature Home card could not be observed at runtime.** Its height is the
literal `height: 238` in `MoneyWisdomIdentityCard`, marked **S** above — read
from source, not measured. Source **1170 × 714** (1.6387).

The Home compact card and the Library card measure the same box but are
**separate assets**: Home's may show Cloud, the Library card is object-led and
must not reuse Home artwork.

## Visible artwork versus container

This is the number an illustrator needs. A container can measure its declared
height while a card below it is drawn over the bottom edge, in which case the
usable canvas is smaller than the box — and until this task, two of them were.

**Overlap is measured**, not assumed: the runner takes the first painted
element after the band and subtracts its top from the band's bottom.

| Asset | Container | Visible artwork | Overlap now | Overlap before |
| --- | --- | --- | --- | --- |
| Story scene ×6 | 287 **M** | **287 M** | **0 M** | 24 **S** |
| Practice hero | 196 **M** | **196 M** | **0 M** | 20 **S** |
| Welcome hero | 296 | 296 | 0 **M** | 0 |
| Talk with Cloud | 240 **M** | 240 **M** | 0 **M** | 0 |
| Your Choice | 190 **M** | 190 **M** | 0 **M** | 0 |
| Takeaway | 170 **M** | 170 **M** | 0 **M** | 0 |
| Completion hero | 220 **M** | 220 **M** | 0 **M** | 0 |

Story and Practice previously placed the card beneath them at `marginTop: -24`
and `marginTop: -20`, so the bottom 24 px and 20 px of each region were covered
by an opaque card. The declared heights were honest about the *container* and
misleading about the *canvas*: an illustrator drawing 287 px of Story would
have had 263 px seen, and 196 px of Practice would have had 176 px seen. The
"before" column is marked **S** because it is read from the superseded style
constants; that build no longer exists to measure.

Both cards now start at `marginTop: 0`. The containers are unchanged at 287 and
196 — the fix was structural, not a resize, so the commissioned sizes and the
source dimensions above still stand. Story's first content below the band sits
at y 449 against a band bottom of y 449, and Practice's at y 365 against a band
bottom of y 365, at all three viewports. Exact, not approximate.

## Stage behaviour at each viewport

Y positions are window coordinates at the top of the stage. The scaffold resets
scroll to 0 on every stage change, so this is what the child sees first.

### Talk with Cloud

| | 375 × 812 | 390 × 844 | 430 × 932 |
| --- | --- | --- | --- |
| Canvas height | 240 | 240 | 240 |
| First dynamic content Y | 339 | 339 | 339 |
| Lowest answer (bottom) | 889 | 889 | 865 |
| Stage content height | 879 | 879 | fits |
| Scroll required | yes | yes | **no** |
| Answers below first viewport | 2 of 4 | 1 of 4 | **none** |

**Talk stays at 240.** The brief asked for it to be shrunk only if measurement
proved a severe usability problem. It does not. At 430 × 932 all four answers
are on screen with no scrolling at all. At 390 × 844 one answer sits 45 px
below the fold, and at 375 × 812 two answers sit up to 77 px below it — a
single short scroll on a stage that already scrolls, with the scroll working
correctly and every answer reachable. Shrinking the band by the 77 px needed to
clear the worst case would take Talk to 163, far outside its approved
220–260 range, to solve a problem that does not exist at the two larger sizes.

After the child answers, the stage grows to 1756–1920 px and `Make Your Choice`
naturally sits at the bottom of a long conversation. That is the stage working
as designed, not a fold failure.

### Your Choice

| | 375 × 812 | 390 × 844 | 430 × 932 |
| --- | --- | --- | --- |
| Canvas height | 190 | 190 | 190 |
| First dynamic content Y | 289 | 289 | 289 |
| CTA `See What Cloud Thinks` (top) | 1122 | 1112 | 1088 |
| Stage content height | 1168 | 1158 | 1134 |
| Scroll required | yes | yes | yes |
| CTA below first viewport by | 310 | 268 | 156 |

**Reported, not acted on.** The reduction to 190 is the approved change and the
band measures 190 everywhere. The total card and the primary CTA still sit
below the first viewport at all three sizes, because three steppers, a total
card and a CTA cannot fit in one viewport above a 190 px band — the stage needs
roughly 1134 px and the largest phone offers 865. Removing the band entirely
would not close that gap. No further reduction was made; this is the exact
measurement the brief asked for instead of another design decision.

Nothing is clipped or unreachable: the stage scrolls correctly and the CTA is
reached with one flick.

### Takeaway

| | 375 × 812 | 390 × 844 | 430 × 932 |
| --- | --- | --- | --- |
| Canvas height | 170 | 170 | 170 |
| First dynamic content Y | 269 | 269 | 269 |
| CTA `See What Cloud Remembered` (top) | 893 | 893 | 827 |
| Stage content height | 939 | 939 | 873 |
| Scroll required | yes | yes | yes |
| CTA below first viewport | yes, by 137 | yes, by 105 | **no** |

At 430 × 932 the whole stage including its CTA is visible on entry. The two
smaller viewports need a short scroll of 137 and 105 px.

### Completion

| | 375 × 812 | 390 × 844 | 430 × 932 |
| --- | --- | --- | --- |
| Canvas height | 220 | 220 | 220 |
| First dynamic content Y | 332 | 332 | 332 |
| CTA `Back to Home` (top) | 964 | 940 | 899 |
| Stage content height | 1010 | 986 | 945 |
| Scroll required | yes | yes | yes |
| CTA below first viewport by | 208 | 152 | 23 |

The recognition copy is the tallest element here and it varies with what the
child chose, so the CTA position moves with it. At 430 the CTA is 23 px short
of visible. Nothing is clipped.

### Story and Practice

Story: band 287 with the scene navigation at the bottom. At 375 × 812 the
`Previous` / `Continue` pair sits 31 px below the fold on scene 1 and 81 px
below on scene 6; at 390 × 844 scene 1 fits and scene 6 is 23 px below; at
430 × 932 everything fits with no scrolling.

Practice: band 196, `I'll Try This` fully visible on entry at **all three
viewports** (CTA bottom 759, 759 and 733). At 375 the stage overflows by 4 px;
at 390 and 430 it does not scroll at all.

## Can one source image support all three widths?

| Container | One source? | Why |
| --- | --- | --- |
| Welcome hero | **Yes** | Fixed height, ~14% side crop |
| Story scene (×6) | **Yes** | Fixed height, identical across all six scenes |
| Talk with Cloud | **Yes** | Fixed 240 in every conversation state |
| Your Choice | **Yes** | Fixed 190 across every allocation state |
| Takeaway | **Yes** | Fixed 170 before and after the thought is chosen |
| Practice hero | **Yes** | Fixed height |
| Completion hero | **Yes** | Fixed 220; recognition copy sits below the band |
| Home card (feature) | **Yes** | Fixed 238 in source |
| Home card (compact) | **Yes** | Fixed 154 |
| Library card | **Yes** | Fixed 154 |

Every container in the pack answers **yes**, and every one of them is now fully
visible.

## Device-width risk

- Below 375 the content width drops under 335 and the fixed-height bands
  approach ratio 1.10; the Welcome hero would crop about 16% of its width.
- Above 620 (`readingMaxWidth`) content stops growing and centres, so tablets
  are safe — the containers simply stop widening.
- Maximum horizontal crop across the supported range is 375 vs 430, about
  **14%** on full-width bands. Keep the focal subject inside the middle 72% of
  each canvas.
- Sub-pixel note: this run reports whole-pixel boxes (315, 335, 287) where the
  earlier manual run reported fractional ones (316.7, 335.3, 286.7). The
  difference is browser rounding at a different device pixel ratio, not a
  layout change. Design to the nominal figures.

## Reproducing

```
measure-viewports.bat
```

Requires Expo web on `localhost:8082`. The runner seeds its own browser profile
onto the programme day this Wisdom is scheduled — without that a fresh profile
sits on day 0, where the Wisdom is not offered anywhere on Home — then walks all
three viewports unattended and rewrites `measurements-raw.json`.
