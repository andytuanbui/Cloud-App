# WIS-MONEY-001 — Container Measurements

Measured from the running application (Expo web, `localhost:8082`) by reading
`getBoundingClientRect()` and computed styles off the real DOM, cross-checked
against the source layout constants. Not inferred from screenshots.

**Method.** The app was loaded in an exactly-sized frame at each viewport width
and every clipped (`overflow: hidden`) container was measured. Values marked
**M** were measured directly at that width. Values marked **D** are derived
from the rule verified below and the fixed heights in source. Values marked
**V** are variable and were not captured at that width.

## The width rule (verified)

Content width = `viewport − 2 × layout.pagePadding (20)`, then minus ~1.3 px of
container border. Confirmed by direct measurement at all three widths:

| Viewport | Measured content width |
| --- | --- |
| 375 | 335.3 **M** |
| 390 | 350.0 **M** |
| 430 | 390.0 **M** |

`layout.readingMaxWidth` is 620, so no width in range is capped.

## Fixed-height containers

Height is a constant in source; only width scales. **One source image serves all
three widths**, generated at the 430 ratio so narrower viewports crop the sides.

### Welcome hero — `WIS-MONEY-001-WELCOME-HERO`

| Viewport | W × H | Ratio | |
| --- | --- | --- | --- |
| 375 | 334.0 × 296 | 1.1284 | **M** |
| 390 | 348.7 × 296 | 1.1780 | **M** |
| 430 | 388.7 × 296 | 1.3132 | **M** |

Radius 0 (clipped by the parent canvas, radius 28). Fit `cover`. Max horizontal
crop 375 vs 430 ≈ **14%**. Recommended source **1170 × 890** (1.3146).

### Story scene canvas — `WIS-MONEY-001-STORY-SCENE-01 … -06`

| Viewport | W × H | Ratio | |
| --- | --- | --- | --- |
| 375 | 316.3 × 286.7 | 1.1033 | **D** |
| 390 | 331.3 × 286.7 | 1.1556 | **M** |
| 430 | 371.3 × 286.7 | 1.2951 | **D** |

**All six scenes share one container.** Measured identical at 390 for scenes
1, 2, 3, 4, 5 and 6 — every scene returned `331.3 × 286.7`. The scene artwork is
absolutely positioned inside a fixed wrapper, so scene content cannot change the
box. **One Story template covers all six.** Recommended source **1116 × 861**.

### Practice hero — `WIS-MONEY-001-PRACTICE-HERO`

| Viewport | W × H | Ratio | |
| --- | --- | --- | --- |
| 375 | 302.0 × 196 | 1.5408 | **D** |
| 390 | 316.7 × 196 | 1.6158 | **M** |
| 430 | 356.7 × 196 | 1.8199 | **D** |

Inner visual inside the Practice canvas; radius 22. Recommended source
**1070 × 588** (1.8197).

### Home and Library cards

| Asset | Viewport | W × H | Ratio | |
| --- | --- | --- | --- | --- |
| Home (feature) | 390 | 350 × 238 | 1.4706 | **D** |
| Home (learned, compact) | 390 | 350 × 154 | 2.2727 | **M** |
| Home (learned, compact) | 430 | 390 × 154 | 2.5325 | **M** |
| Library (compact) | 390 | 350 × 154 | 2.2727 | **M** |
| Library (compact) | 430 | 390 × 154 | 2.5325 | **M** |

**The Home card has two container shapes.** When the money Wisdom is Today's
Wisdom it renders at feature height 238; once learned it moves to the "Learned
Wisdoms" section and renders compact at 154. Both were observed. The artwork
must survive both crops, or the pack needs a second Home asset.

## Variable-height containers — the risk

These grow with content and with text wrapping, so their aspect ratio is not
stable. Measured at 390:

| Container | Minimum state | Maximum state | Ratio range |
| --- | --- | --- | --- |
| Talk with Cloud | 350 × 576.7 (0.6069) | 350 × 1532.3 (0.2284) | **2.66× height swing** |
| Your Choice | 350 × 892.7 (0.3921) | 350 × 1126.0 (0.3108) | 1.26× |
| Takeaway | 350 × 694.3 (0.5041) | 350 × 1023.7 (0.3419) | 1.47× |

**Completion hero** varies with *width* as well, and was measured at all three:

| Viewport | W × H | Ratio | |
| --- | --- | --- | --- |
| 375 | 302.0 × 356.7 | 0.8466 | **M** |
| 390 | 316.7 × 332.7 | 0.9519 | **M** |
| 430 | 356.7 × 300.7 | 1.1862 | **M** |

Height *shrinks* as width grows because the recognition text wraps onto fewer
lines. A **40% ratio swing** across supported phones.

## Can one source image support all three widths?

| Container | One source? | Why |
| --- | --- | --- |
| Welcome hero | **Yes** | Fixed height, ~14% side crop |
| Story scene (×6) | **Yes** | Fixed height, identical across all six scenes |
| Practice hero | **Yes** | Fixed height |
| Library card | **Yes** | Fixed height |
| Home card | **Qualified** | Two heights (238 / 154); art must read in both |
| Completion hero | **No, not safely** | 0.85 → 1.19 ratio swing |
| Talk with Cloud | **No** | 2.66× height swing |
| Your Choice | **No** | Height depends on Cloud's response |
| Takeaway | **No** | Height depends on the memory card |

## Device-width risk

- Below 375 the content width drops under 335 and the fixed-height containers
  approach ratio 1.10; the Welcome hero would crop about 16% of its width.
- Above 620 (`readingMaxWidth`) content stops growing and centres, so tablets
  are safe — the containers simply stop widening.
- The four variable containers are the real risk. A single background stretched
  across a 2.66× height range will either distort or leave the lower canvas
  empty.

## Recommended layout corrections — reported, not applied

Per the task instruction I have **not changed any layout**. Three containers
should be settled before v2 art is commissioned:

1. **Talk with Cloud** should not be a full-canvas background. Either make it a
   fixed-height header canvas like the Welcome hero, or accept a top-anchored
   band with the existing gradient continuing beneath it.
2. **Your Choice** and **Takeaway** have the same problem at smaller scale. A
   top-anchored band with a gradient tail is the low-risk option.
3. **Completion hero** should be given a fixed height so its ratio stops moving
   with the viewport, or the art must tolerate 0.85–1.19.

Until these are decided, the templates for those four use the **minimum
measured state** and mark the area below the band as gradient fallback.

## Measurement gaps

Story, Talk, Your Choice, Takeaway and Practice were measured directly at
**390 only**. Welcome and Completion were measured at all three widths, and the
content-width rule was verified at all three. The derived cells follow that
verified rule plus the fixed heights in source, but they are labelled **D** and
have not been observed at 375 or 430.
