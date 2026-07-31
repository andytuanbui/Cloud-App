# CloudWise Visual System

This document describes the visual system implemented by the current production
screens. It is an implementation guide, not a separate brand concept.

## Direction: Warm Premium Wisdom

CloudWise combines the warmth of a modern illustrated children's book with the
clarity of a refined consumer application. The interface is calm, editorial,
and trustworthy. Illustration supplies personality; controls and layout remain
quiet enough for the child’s thinking to stay central.

The production system uses:

- a warm ivory canvas instead of pure white;
- cream and warm-white surfaces;
- deep navy-green text instead of black;
- a muted forest primary action;
- restrained gold for emphasis and completion;
- generous spacing, rounded cards, and subtle elevation;
- existing Cloud artwork as a meaningful focal point, not repeated decoration.

## Token Architecture

Production visual values are exported from `src/theme/index.ts`.

| File | Responsibility |
| --- | --- |
| `colors.ts` | `appColors` semantic production palette |
| `typography.ts` | `typeStyles` hierarchy |
| `spacing.ts` | `space` layout scale |
| `radius.ts` | `radii` corner system |
| `shadows.ts` | subtle, card, and focus elevation |
| `layout.ts` | page width, padding, touch target, and navigation constants |

The older `colors`, `typography`, `spacing`, and `radius` exports remain only for
unreachable prototype code. New production work must use the semantic exports.

## Color Roles

| Role | Use |
| --- | --- |
| `canvas`, `canvasSoft` | app and supporting page backgrounds |
| `surface`, `surfaceElevated` | cards, fields, and controls |
| `surfaceSoft`, `surfaceMuted` | quiet supporting panels |
| `textPrimary` | headings and high-emphasis copy |
| `textSecondary` | normal body copy |
| `textMuted` | captions and secondary labels; still text-contrast safe |
| `border`, `borderStrong` | card, input, and control boundaries |
| `primary`, `primaryPressed`, `primarySoft` | primary action and selection |
| `wisdomGreen`, `wisdomGreenSoft` | Wisdom-specific emphasis |
| `warmGold`, `warmGoldSoft` | restrained warmth and completion detail |
| `success`, `successSoft` | completed and correct states |
| `caution`, `cautionSoft` | gentle retry and attention states |
| `error`, `errorSoft` | form errors only |
| `focus` | visible web keyboard focus |
| `overlay`, `surfaceOverlay*` | readable copy over artwork |

Do not add screen-specific colors when a semantic role already exists. Normal
text must not use decorative gold or low-opacity overlays.

## Typography

CloudWise uses platform-safe system fonts so names and lesson content render
without an external font dependency. `AppText` exposes the hierarchy.

| Variant | Purpose |
| --- | --- |
| `display` | setup and completion moments |
| `screenTitle` | top-level destinations |
| `sectionTitle` | major sections and flow questions |
| `cardTitle` | Wisdom and surface titles |
| `body` | primary reading and explanatory copy |
| `supporting` | secondary explanations and metadata |
| `label` | field labels, category labels, and compact emphasis |
| `button` | action labels |
| `caption` | progress and compact supporting information |

Headings use strong weight and compact line height. Body text uses comfortable
line height and the content width is capped for long-form readability.

## Spacing and Layout

The `space` scale is `4, 8, 12, 16, 20, 24, 32, 40, 48`.

- Mobile page padding: `layout.pagePadding` (20)
- Production content width: `layout.maxContentWidth` (560)
- Reading width: `layout.readingMaxWidth` (620)
- Minimum touch target: `layout.minimumTouchTarget` (44)
- Standard section separation: `layout.sectionSpacing` (28)
- Standard card padding: `layout.cardPadding` (20)

`Screen` owns the warm canvas, top/side safe areas, centered maximum width, and
scrolling. Bottom navigation owns the bottom safe-area inset.

## Corner Radius

Use only the intentional `radii` set:

- `small` for compact nested elements;
- `medium` for controls and status panels;
- `large` for larger controls and inset groups;
- `card` for normal surfaces;
- `hero` for image-led focal surfaces;
- `round` for circular controls and artwork frames.

Pills are reserved for small state or identity details. Whole layouts should not
become collections of pills.

## Shadows

- `shadows.subtle` separates controls or navigation from nearby surfaces.
- `shadows.card` is reserved for the signature Today card and focal surfaces.
- `shadows.focus` reinforces the visible keyboard-focus boundary on web.

Every card does not need elevation. Borders and surface contrast are preferred
for most hierarchy.

## Buttons

`PrimaryButton`, `SecondaryButton`, and `TextButton` share:

- a 56-point primary control height;
- disabled, pressed, loading, and accessibility state;
- visible keyboard focus;
- consistent type and spacing.

`WisdomButton` is a compatibility wrapper over these shared buttons. Do not
create another screen-local primary button.

Primary actions appear once per decision point. Secondary and text actions must
remain visually quieter.

## Cards and Status Panels

`SurfaceCard` provides the common surface, border, radius, and optional elevation.
Its soft, gold, success, and caution tones are semantic—not decorative variants.

The Today Wisdom uses the strongest card treatment and the largest artwork
stage. Wisdoms collection cards use the same visual language in a more compact
composition. Status information uses `StatusPanel` or a similarly structured
semantic surface instead of inventing a new card.

Artwork uses `cover` only when the focal subject remains intact. Portrait or
transparent lesson artwork uses a contained stage so Cloud’s face or the lesson
object is not cropped.

## Forms

Setup and Edit Profile share `ProfileNameField` and `AgeSelector`.

- Inputs have visible labels, help/error text, and keyboard focus.
- Validation is calm and text-based; color is not the only signal.
- Age options expose radio selected state and keep at least 44-point targets.
- Actions remain reachable with the keyboard open through keyboard-avoiding,
  scrollable layouts.
- Unicode names are supported and the visible 24-character limit is enforced.

## Progress

`ProgressSteps` represents setup and Wisdom stages with segments and a concise
“Step X of Y” label. It exposes progressbar semantics and an accessible numeric
value. Percentages are not shown.

## Navigation

`BottomNavigation` keeps the five approved destinations: Today, Wisdoms, Cloud,
Family, and Profile.

- Active state combines a filled icon, soft primary backing, and darker label.
- Inactive icons and labels remain readable.
- Each destination has a strong touch target and tab semantics.
- The bar respects the bottom safe area and content remains above it.
- The component does not float or use heavy elevation.

The current native-stack-backed navigation behavior is preserved in this visual
sprint.

## Wisdom Flow Layout

`FlowScaffold` provides one shell for Opening Question, Read, Talk with Cloud,
Reflect, Practice, Quiz, Completion, and Review.

- compact back control and stage context;
- accessible segmented progress without percentages;
- centered readable content width;
- scroll-to-top when the stage changes;
- keyboard avoidance and stable action placement;
- supportive Cloud and child-response surfaces that avoid business-chat styling;
- success and retry feedback that remains calm and never uses alarming failure
  treatment.

Each stage reuses the same heading, choice, card, message, and action language.

## Cloud Artwork Principles

Production artwork has three strict roles:

| Role | Approved use | Presentation rules |
| --- | --- | --- |
| Cloud character art | Welcome, Today greeting, Cloud messages, Profile, and completion moments | Use the consistent polished 3D Cloud appearance. Protect the face, expression, and gesture; do not place copy over them. |
| Wisdom scene art | Wisdom covers and lesson moments that benefit from story context | Use a cohesive 3D story-scene treatment. Crop around the relevant people or action and keep every face intact. No embedded labels or captions may be visible. |
| Object art | A lesson cover where one clear object communicates the idea better than a scene | Use a clean isolated object with consistent warm lighting and a quiet semantic background. Do not add decorative circles or unrelated geometry. |

The following rules apply to every production image:

- Use the existing Cloud asset family; do not mix the legacy `assets/lumi/`
  identity into production.
- Use one major illustration per screen or moment, and do not repeat the same
  scene in adjacent hero and card roles.
- Assets with embedded captions, labels, contact-sheet borders, or brand-sheet
  framing are reference sources only. A deliberate overflow-hidden crop is
  acceptable only when it excludes all embedded text and framing at every
  supported viewport.
- Use `cover` for a scene only after checking that the focal faces and action
  survive the crop. Use a contained object treatment when cover would cut off
  the lesson object.
- Today and Wisdoms use the same crop for a Wisdom at feature and compact sizes,
  adjusted only to keep the focal subject intact. Decorative geometry must
  never look like missing artwork.
- Keep interface copy in a dedicated high-contrast surface rather than baking
  it into artwork.
- Decorative images are hidden from assistive technology when nearby text
  already communicates the meaning.

Current Wisdom cover assignments are:

- Needs vs Wants: object art, using a label-free upper-jar crop;
- Pause Before You Answer: story-scene art, using a caption-free friendship
  crop that keeps both faces;
- Three Ways to Use Money: the clean neighborhood story scene, with the child
  kept as the focal subject.

## Accessibility

- Normal text and controls target WCAG AA contrast.
- Touch targets are at least 44 by 44.
- Inputs and icon controls have explicit accessible labels.
- Choice and age controls expose radio and selected state.
- Screen and section headings expose header semantics.
- Progress exposes numeric progressbar semantics.
- Quiz and validation feedback uses polite live announcements.
- Web keyboard focus is visible.
- Content scrolls for large text and is not hidden by bottom navigation.
- Layouts are validated at 375×667, 390×844, and 430×932 without horizontal
  overflow.

## Motion

Motion is limited to native screen transitions, pressed-state feedback, and
small state changes that clarify selection or completion. Do not add perpetual
animation, bouncing, parallax, confetti, or a heavy animation dependency. Any
future nonessential animation must respect reduced-motion preferences.

## Patterns to Avoid

- pure-white full-app backgrounds or pure-black normal text;
- raw production color literals and duplicate button implementations;
- generic dashboards, dense metadata, or settings-style profile layouts;
- neon, gaming rewards, scores, points, streaks, or progress percentages;
- competing gradients, random card colors, and decoration without meaning;
- tiny type, low-contrast captions, clipped artwork, or fixed-height text areas;
- fake controls on Cloud or Family placeholders;
- visual changes to unreachable prototype routes in place of production work.
