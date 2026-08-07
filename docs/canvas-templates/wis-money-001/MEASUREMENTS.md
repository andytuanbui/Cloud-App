# WIS-MONEY-001 — Container Measurements

Measured from the running application (Expo web, `localhost:8082`) by reading
`getBoundingClientRect()` off the real DOM. Every artwork container carries a
`testID` of the form `canvas-band-<ASSET-ID>`, so each row below is a direct
read of the element the artwork will actually fill.

**Method.** The app was loaded inside an iframe sized exactly to each viewport
(`contentWindow.innerWidth/innerHeight` verified as 375 × 844, 390 × 844 and
430 × 844), then driven through the whole Wisdom — Welcome, all six Story
scenes, Talk, Your Choice, Takeaway, Practice, Completion — and both card
surfaces, measuring at every state.

| Mark | Meaning |
| --- | --- |
| **M** | Measured directly at that width, in the browser, in that state |
| **S** | Read from a literal constant in source; not observed at runtime |

There are no derived values in this document. The single **S** row is called out
explicitly and is not presented as a measurement.

## The width rule (measured, not assumed)

Content width = `viewport − 2 × layout.pagePadding (20)`, minus ~1.3 px of
container border on inset surfaces.

| Viewport | Full-width band | Inset stage band | Story illustration |
| --- | --- | --- | --- |
| 375 | 335.3 **M** | 302.0 **M** | 316.7 **M** |
| 390 | 350.0 **M** | 316.7 **M** | 331.3 **M** |
| 430 | 390.0 **M** | 356.7 **M** | 371.3 **M** |

`layout.readingMaxWidth` is 620, so no width in this range is capped.

## Fixed-height bands — every artwork container

Height is now a constant for all of them. Only width scales, so **one source
image serves all three widths**; it is generated at the 430 ratio and narrower
viewports crop the sides.

### Welcome hero — `WIS-MONEY-001-WELCOME-HERO`

| Viewport | W × H | Ratio | |
| --- | --- | --- | --- |
| 375 | 334.0 × 296 | 1.1284 | **M** |
| 390 | 348.7 × 296 | 1.1780 | **M** |
| 430 | 388.7 × 296 | 1.3132 | **M** |

Unchanged by this task. Source **1170 × 891** (1.3131).

### Story scene — `WIS-MONEY-001-STORY-SCENE-01 … -06`

| Viewport | W × H | Ratio | |
| --- | --- | --- | --- |
| 375 | 316.7 × 286.7 | 1.1047 | **M** |
| 390 | 331.3 × 286.7 | 1.1556 | **M** |
| 430 | 371.3 × 286.7 | 1.2951 | **M** |

**All six scenes measured identical at all three widths** — scenes 1 to 6 each
returned the same box. One Story template covers all six. Source
**1170 × 903** (1.2957).

### Talk with Cloud — `WIS-MONEY-001-TALK-WITH-CLOUD` (stabilised)

| Viewport | W × H | Ratio | |
| --- | --- | --- | --- |
| 375 | 335.3 × 240 | 1.3971 | **M** |
| 390 | 350.0 × 240 | 1.4583 | **M** |
| 430 | 390.0 × 240 | 1.6250 | **M** |

Measured in four states at each width — question only, after the child answers,
after the follow-up question appears, and after Cloud's response — and the band
returned **240 in every one**. Source **1170 × 720** (1.625).

### Your Choice — `WIS-MONEY-001-CHOICE-BACKGROUND` (stabilised)

| Viewport | W × H | Ratio | |
| --- | --- | --- | --- |
| 375 | 335.3 × 210 | 1.5967 | **M** |
| 390 | 350.0 × 210 | 1.6667 | **M** |
| 430 | 390.0 × 210 | 1.8571 | **M** |

Measured with the default split, with money still unplaced (80 of 90 kr), with
every krone placed, and with Cloud's response shown. **210 in every state.**
Source **1170 × 630** (1.8571).

### Takeaway — `WIS-MONEY-001-TAKEAWAY-BACKGROUND` (stabilised)

| Viewport | W × H | Ratio | |
| --- | --- | --- | --- |
| 375 | 335.3 × 180 | 1.8628 | **M** |
| 390 | 350.0 × 180 | 1.9444 | **M** |
| 430 | 390.0 × 180 | 2.1667 | **M** |

Measured before choosing a thought, after selecting one, and after Cloud's
"remembered" panel appears. **180 in every state.** Source **1170 × 540**
(2.1667).

### Practice hero — `WIS-MONEY-001-PRACTICE-HERO`

| Viewport | W × H | Ratio | |
| --- | --- | --- | --- |
| 375 | 302.0 × 196 | 1.5408 | **M** |
| 390 | 316.7 × 196 | 1.6158 | **M** |
| 430 | 356.7 × 196 | 1.8199 | **M** |

Unchanged by this task. Source **1070 × 588** (1.8197).

### Completion hero — `WIS-MONEY-001-COMPLETION-HERO` (stabilised)

| Viewport | W × H | Ratio | |
| --- | --- | --- | --- |
| 375 | 302.0 × 220 | 1.3727 | **M** |
| 390 | 316.7 × 220 | 1.4395 | **M** |
| 430 | 356.7 × 220 | 1.6214 | **M** |

Previously this box moved with *width* as well as content, because the
recognition sentences wrapped inside it — 0.85 at 375 up to 1.19 at 430. The
recognition copy now renders below the band, so the band is constant. Source
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

**The feature Home card could not be observed at runtime.** It appears only
while the money Wisdom is Today's Wisdom, and the Wisdom is already learned on
this build, so the Home screen shows the compact card instead. Its height is the
literal `height: 238` in `MoneyWisdomIdentityCard`, marked **S** above — read
from source, not measured. Source **1170 × 714** (1.6387), matching the compact
card's measured full-content width of 390 at the widest supported phone.

The Home compact card and the Library card measure the same box but are
**separate assets**: Home's may show Cloud, the Library card is object-led and
must not reuse Home artwork. `LibraryWisdomCard` takes a `surface` prop so the
two resolve to different canvas ids.

## Can one source image support all three widths?

| Container | One source? | Why |
| --- | --- | --- |
| Welcome hero | **Yes** | Fixed height, ~14% side crop |
| Story scene (×6) | **Yes** | Fixed height, identical across all six scenes |
| Talk with Cloud | **Yes** | Fixed 240 in all four conversation states |
| Your Choice | **Yes** | Fixed 210 across every allocation state |
| Takeaway | **Yes** | Fixed 180 before and after the thought is chosen |
| Practice hero | **Yes** | Fixed height |
| Completion hero | **Yes** | Fixed 220; recognition copy moved below the band |
| Home card (feature) | **Yes** | Fixed 238 in source |
| Home card (compact) | **Yes** | Fixed 154 |
| Library card | **Yes** | Fixed 154 |

Every container in the pack now answers **yes**. That is the point of this
change: before it, four of them could not be specified at all.

## Device-width risk

- Below 375 the content width drops under 335 and the fixed-height bands
  approach ratio 1.10; the Welcome hero would crop about 16% of its width.
- Above 620 (`readingMaxWidth`) content stops growing and centres, so tablets
  are safe — the containers simply stop widening.
- Maximum horizontal crop across the supported range is 375 vs 430, about
  **14%** on full-width bands. Keep the focal subject inside the middle 72% of
  each canvas.
