All AI contributors must read this document before making related changes.

# CloudWise Engineering Handbook & Architecture Review

Owner: Claude Cowork (Software Architect and Code Reviewer, per `docs/AI_TEAM_ROLES.md`)
Scope: full repository as of commit `6dd043b` ("refactor: project foundation sprint 0")

This document has two parts. Part 1 is the living engineering handbook — the reference every contributor (human or AI) should read before touching architecture, navigation, theming, content, or state. Part 2 is the Sprint 0 review — a point-in-time assessment of what exists today against Part 1's target architecture, ending in an approval verdict.

Per scope: this document does not redesign the product or change UI. It covers architecture and maintainability only.

---

# Part 1 — Engineering Handbook

## 1. Current Project Structure

```
App.tsx                      ← entry point, renders NavigationContainer + RootNavigator
app.json, tsconfig.json, package.json
assets/
  cloud/                      ← in-use Cloud character art
  lumi/                       ← legacy, pre-rename art (unreferenced — see Section 10)
docs/                         ← product + engineering docs, read by all AI contributors
prototypes/                   ← standalone HTML concept prototypes (not part of the app build)
src/
  components/                 ← small, single-purpose presentational components
  content/                    ← static content + asset registry (wisdom.ts)
  hooks/                      ← reserved, currently empty
  navigation/                 ← RootNavigator + route typing
  screens/                    ← HomeScreen, WisdomDetailScreen
  services/                   ← reserved, currently empty
  theme/                      ← styles.ts (single shared stylesheet)
  types/                      ← shared TypeScript types
```

## 2. Why This Structure Was Chosen

The guiding principle is separation by *concern*, not by *feature*, at this stage: UI (`components`, `screens`) is separated from data (`content`, `types`) which is separated from cross-cutting concerns (`theme`, `navigation`). `hooks/` and `services/` are reserved ahead of need — this is deliberate. The moment external data (Supabase) or shared logic (AI conversation state, entitlement checks) exists, it has a home already, instead of forcing a restructure at the same time new functionality is being built. This structure is appropriate for the project's current size (a handful of screens) and does not need to change shape yet — it needs to be *filled in* (services, hooks, theme tokens) more than it needs to be reorganized.

A feature-based structure (`src/features/wisdom/`, `src/features/auth/`, etc.) becomes worth considering once the app has enough independent feature areas that cross-feature file-hunting becomes the bottleneck — likely once parent dashboard, subscriptions, and AI chat all exist alongside the core wisdom flow. Not needed yet; noted here so the eventual trigger is explicit rather than debated from scratch later.

## 3. Navigation Architecture

**Library:** React Navigation (`@react-navigation/native` + `native-stack`), not Expo Router.

**Current state:** one stack (`RootNavigator`) with two routes, `Home` and `WisdomDetail`, typed via `RootStackParamList`. `BottomNav` is a presentational component only — it is not a real tab navigator, has no route wiring, and is manually rendered inside each screen.

**Target architecture:**
- A bottom tab navigator (`createBottomTabNavigator`) owning the five persistent destinations the UI already visually promises: Home, Wisdoms, Favorites, Growth, Profile. Each tab owns its own nested stack navigator, so e.g. Home → WisdomDetail lives inside the Home tab's stack, not the root stack.
- A nested flow navigator for the wisdom experience itself: Read → Talk with Cloud → Reflect → Challenge → Complete, parented under `WisdomDetail`. This mirrors the flow already validated in `prototypes/cloud-companion-flow.html` and specified in the PRDs. Treating this as a proper nested navigator (rather than four independent screens each manually wired) keeps back-navigation, progress state, and step-skipping rules centralized in one place.
- Route params should reference a `wisdomId` (see Section 5), not a category key + hero/locked slot as they do today.

**Open decision — React Navigation vs. Expo Router:** Expo's current guidance favors Expo Router for new projects, and recent Expo SDKs have moved Router away from direct `@react-navigation/*` imports. Recommendation: **do not migrate yet.** The current integration is small (2 routes) and correct for what exists; migrating now would be churn without present benefit. Revisit this decision specifically when auth flows and deep linking (magic links, subscription webhooks, password reset) are designed — that's the point where Expo Router's built-in linking config starts paying for itself. Flagging the decision point now so it's made deliberately then, not drifted into by default.

## 4. Theme Architecture

**Current state:** one file, `src/theme/styles.ts`, a single `StyleSheet.create()` containing every style for every screen and component (580+ lines and growing), with colors, spacing, and radii hardcoded as raw values throughout.

**Target architecture:** a token layer beneath the styles, not just more styles:
- `theme/colors.ts` — the palette as named tokens (matching `docs/DESIGN_SYSTEM.md` and `docs/CLOUD_CHARACTER.md`'s official palette), not raw hex scattered through component styles.
- `theme/spacing.ts`, `theme/typography.ts`, `theme/radii.ts` — same principle.
- Component/screen styles reference tokens (`colors.accentGold`, not `'#FFD166'` inline) so a palette change is a one-file edit, not a find-and-replace across dozens of style objects.
- Styles can stay colocated per-component/per-screen (small `ComponentName.styles.ts` files) or remain grouped — the token layer matters more than the file-splitting, and should be done first.

This is what makes `docs/DESIGN_SYSTEM.md` enforceable in code rather than aspirational.

## 5. Content Architecture

This is the most consequential architectural decision in the codebase right now, so it gets its own section rather than being folded into "content organization" generically.

**Current state:** there is no independent `Wisdom` entity. `WisdomWorld` (`= Category & { heroTitle, heroDescription, lockedTitle, lockedDescription, ... }`) hardcodes exactly two wisdom-shaped slots per category — "today's" and "the next locked one" — as fields on the category itself. "Three Jars" exists only as a string value, not as a thing with its own ID, story content, exercises, or route.

**Why this matters architecturally:** every planned feature needs "a wisdom" to be a first-class, independently addressable record — daily unlock logic, the Wisdom Library, favorites, growth milestones, parent-dashboard progress tracking, the AI content-review pipeline (per the PRDs), and Supabase content sync. A model that can only represent two wisdoms per category, ever, cannot support any of them.

**Target schema (content stays local/static for now — this is a shape change, not a backend change):**

```ts
type Wisdom = {
  id: string;
  categoryKey: string;
  sequence: number;              // order within category
  status: 'locked' | 'available' | 'completed';
  title: string;
  description: string;
  minutes: number;
  storyContent: /* structured story blocks, not a single string */;
  exercises: Exercise[];
  challenge: Challenge;
  locale: string;                 // reserved from day one — see Section 12
};

type Category = {
  key: string;
  label: string;
  icon: IconName;
  // presentation (colors, icon) lives here or in a separate CategoryTheme —
  // NOT on Wisdom, so AI-generated content never needs to specify a gradient pair
};
```

Content and presentation should be joinable at render time, not stored on the same record — an AI-generation-and-human-review pipeline (per `docs/PRD-v2-gamified-daily-wisdom.md`) should only ever need to produce content fields, never design-system decisions.

All access to this data should go through a service (`src/services/wisdomService.ts`), not direct imports of the content module into screens — see Section 8.

## 6. Component Philosophy

What's already working and should continue: components are small (12–40 lines), single-purpose, prop-driven, and free of business logic. This is the right default and should stay the convention as the component count grows into the hundreds.

What to add as the component count grows:
- **Extract a shared primitive before a visual pattern is implemented a third time.** The "image + gradient overlay + floating text" layout currently exists independently in `TodayCard`, `LockedNextCard`, `RecommendedCard`, and the `WisdomDetailScreen` hero — four implementations of the same idea. A `GradientMediaCard` primitive, parameterized by size/copy/colors, should back all four.
- **Name and export prop types** (`export type TodayCardProps = {...}`) rather than typing inline. Costs nothing now, pays off once components need to share prop shapes or get referenced from tests.
- **Presentational components stay presentational.** Data-fetching and business logic belong in screens or hooks, not components — this is already being followed; keep following it once services/hooks are real.

## 7. State Management Strategy

**Current state:** minimal — one `useState` (`activeIndex`) and one `Animated.Value` ref, no global state library. This is correct for what the app does today, and should not be "fixed" by adding a library preemptively.

**Target strategy, introduced only when the triggering condition is actually met:**
- **React Context** for auth/session data — low-frequency updates, needs to be read widely (Home, Profile, Parent Dashboard). Introduce when auth exists.
- **React Query** (or equivalent server-cache library) for anything coming from Supabase — handles loading/error/cache/refetch state that hand-rolled `useState` + `useEffect` does not, and pairs naturally with the service layer in Section 8. Introduce when Supabase integration begins.
- **Local, flow-scoped state** for in-progress data that doesn't need to be global — e.g., a child's in-progress answers within a single Wisdom flow (Read → Talk → Reflect → Challenge) most likely belongs to that flow's navigator state, not a global store.
- **Redux/Zustand:** not recommended unless a specific, concrete need for complex cross-cutting client state emerges that Context + React Query don't cover. Do not add either preemptively — this is an explicit "avoid" (Section 11).

## 8. Future Supabase Architecture

- **All Supabase access goes through `src/services/`.** No screen or component should import a Supabase client directly. Services expose domain functions (`getWisdomsForCategory(categoryKey)`, `markWisdomComplete(wisdomId)`), not raw queries, so the data source can change without call sites changing.
- **Schema mirrors Section 5's content model** — `wisdoms`, `categories`, plus `users` (parent account), `child_profiles`, `progress`/`completions`, `favorites`. Given this is a children's app, the account model most likely needs to be parent-account-owns-child-profiles rather than child-owns-account directly — this affects Supabase Auth design and should be decided alongside the PRDs' consent/COPPA requirements, not purely as a technical choice.
- **Row-Level Security (RLS)** should be treated as required, not optional, given child data is involved — a parent should only be able to read/write their own children's records. Design RLS policies alongside the schema, not after.
- **Migrations tracked in-repo** (Supabase CLI migration files committed to the repo) so schema changes are reviewable the same way code changes are.
- **Offline consideration belongs here too**, not as a separate later project — see Section 13.

## 9. Future AI Integration Strategy

- Per `docs/design-direction-notes.md`, "Talk with Cloud" is scripted/structured (pick-a-response), not open-ended free-text chat — this was a deliberate child-safety decision and this handbook treats it as a constraint, not a suggestion.
- AI conversation should be modeled as its own service (`src/services/cloudConversationService.ts`), abstracting the underlying AI provider so it can change without UI changes.
- Conversation state should attach to a specific `Wisdom` (Section 5) and a specific step within the flow (Section 3) — both of which need to exist as real entities before this feature can be built correctly, not worked around.
- **AI calls should be proxied server-side** (Supabase Edge Function or equivalent), never called directly from the client with an embedded API key. This is both a security requirement and the natural place to enforce content moderation on responses before they reach a child.
- Personalization ("Cloud recommends what's next based on interest," per the design-direction notes) is a later-stage feature on top of this same service boundary — it should not be built as ad hoc logic inside a screen when it arrives.

## 10. Asset Organization

**Current state:** `assets/cloud/` (in active use, 11 of 14 files actually referenced) and `assets/lumi/` (10MB, 20 files, entirely unreferenced — leftover from before the Cloud rename). All images are local, bundled, and `require()`'d directly inside `src/content/wisdom.ts`.

**Recommendations:**
- Remove `assets/lumi/` when convenient — it's dead weight, not urgent, previously flagged.
- Introduce an asset registry/manifest rather than `require()` calls scattered inline in content data, so assets and content data have a cleaner seam (this also supports Section 5's content/presentation split).
- Local bundled images work at current scale and should not be changed today. Once content is backend-driven (Section 5, 8) and could reach the "thousands of entries" scale the product is designed for, images can no longer all be bundled — plan a migration to `expo-image` (built-in caching, remote-source support) at that point, not before.

## 11. Coding Conventions

- TypeScript `strict: true`, zero `any` — already the practice; keep enforcing it. Consider adding `noUncheckedIndexedAccess` as the codebase grows, since array/lookup access is where untyped `undefined` tends to reappear.
- Prefer literal union types over bare `string` for known, closed sets of values (category keys, wisdom status, etc.) so invalid values are compile errors, not runtime surprises.
- Fail loudly on unexpected states in development (e.g., a lookup that should always succeed but doesn't) rather than silently substituting a default — silent fallbacks hide bugs instead of surfacing them.
- All external data access (Supabase, AI providers) goes through `src/services/` — no exceptions, no "just this once" direct calls from a screen.
- One shared primitive beats three near-identical components — extract on the third repetition, not before (avoid speculative abstraction, but don't let real duplication compound either).

## 12. Localization

Not built yet, and that's fine at this stage — but the data model should not have to be migrated later to support it. Reserve a `locale` field on the `Wisdom` schema now (Section 5), even with only one locale live. Treat UI-string translation (standard i18n library, e.g. `i18next`/`react-i18next` with `expo-localization` for device locale detection) and Wisdom-content translation (likely per-locale content rows, since content is plausibly AI-generated per locale rather than machine-translated after the fact) as two separate problems with two separate solutions — don't assume one i18n library solves both.

## 13. Things We Should Avoid

- Adding Redux/Zustand/any global state library before a concrete need exists (Section 7).
- Building new screens or features directly against the current Category/Wisdom conflated model (Section 5) — fix the model first, or new work has to be redone.
- Screens or components importing Supabase or an AI provider directly, bypassing `src/services/` (Sections 8–9).
- Letting `theme/styles.ts` keep growing as one flat file without extracting tokens first (Section 4) — file-splitting without tokens doesn't solve the underlying duplication.
- Copying the current `ScrollView` + `.map()` pattern into any list that could grow unbounded (e.g., a future Favorites or Wisdom Library screen) — use `FlatList`/`FlashList` for those from the start.
- Migrating to Expo Router, upgrading the Expo SDK by multiple versions at once, or any other non-urgent tooling churn without a concrete triggering need (Section 3, Section 15).
- Scope creep into product or creative direction — per `docs/AI_TEAM_ROLES.md`, that's ChatGPT's lane; this document and this role stay in architecture and code review.

## 14. Recommendations for Scaling to a Production Application

In rough priority order, once the Section 5/3 foundation work (see Part 2) is in place:
1. Establish a test convention early (`jest-expo` + `@testing-library/react-native`) — cheap now, expensive to retrofit once the codebase is large.
2. Design the Supabase schema and RLS policies together with the offline strategy (cache last-fetched content, queue writes made while offline) — not as two separate projects.
3. Set an Expo SDK upgrade cadence (e.g., every 1–2 releases) rather than deferring indefinitely.
4. Add `eas.json` before the first internal test build is needed.
5. Add a `scheme` and `expo-updates` configuration before auth flows and first production release, respectively.
6. Introduce virtualized lists (`FlatList`/`FlashList`) and `expo-image` specifically when content becomes dynamic/remote — not preemptively.
7. Add error boundaries and crash reporting (e.g., Sentry) before beta users are involved.

---

# Part 2 — Sprint 0 Review

Reviewed commit: `6dd043b` ("refactor: project foundation sprint 0").

## What Was Done Well

- **The `src/` restructure is the correct shape for this stage.** Moving off a single 1,284-line `App.tsx` into `components/`, `screens/`, `content/`, `types/`, `theme/`, `navigation/` — with `hooks/` and `services/` correctly reserved ahead of need — is exactly right, and matches Section 1–2 of this handbook without needing further changes to the shape itself.
- **TypeScript hygiene is genuinely strong.** `strict: true`, and zero use of `any` anywhere in `src/`. That's an above-average starting point and should be maintained as the explicit bar going forward (Section 11).
- **Navigation was introduced correctly for what exists.** `RootNavigator` and typed route params are properly set up for the two current routes — the gap is that only two of five promised destinations exist yet (see below), not that what was built was built wrong.
- **State management restraint was correct.** No premature Redux/Zustand/Context — exactly the right call per Section 7, and easy to get wrong by over-engineering early. This wasn't.
- **Components are appropriately small and side-effect-free.** Matches the target philosophy in Section 6 already, without needing correction.

## What Should Be Improved (before Sprint 1's content work goes much further)

1. **The Wisdom/Category data model (Section 5).** This is the one item that gets more expensive the longer it's deferred, because Sprint 1's own planned work (reading and read-to-me content, per `docs/ROADMAP.md`) needs to attach to a real, addressable Wisdom entity. Building that content against the current two-hardcoded-slots model means rebuilding it almost immediately after.
2. **The navigation shape for the bottom tabs and the 4-step wisdom flow (Section 3).** `BottomNav` currently has no wiring and no navigator behind it; the four wisdom-flow steps have no nested structure. Two of Sprint 1's next screens (reading, read-to-me) are steps within that unbuilt flow — deciding the shape now avoids rework on screens about to be built.
3. **Theme tokens (Section 4).** Not urgent for Sprint 1 specifically, but the flat stylesheet is already 580+ lines and every new screen adds to it without a token layer underneath — worth doing before it grows further, not after.

## What Should Wait Until Later

- Localization (Section 12) — reserve the schema field now, do the actual translation work later.
- Testing harness (Section 14 item 1) — genuinely fine to wait a short while, though the cost of waiting compounds; not a Sprint 1 blocker.
- Offline strategy, Supabase schema/RLS design — design alongside actual backend integration, not before it.
- Expo SDK upgrade, EAS config, `scheme`/`expo-updates` — real but not urgent; bundle into a pre-beta pass.
- Expo Router migration — explicitly deferred to the point where auth/deep-linking is designed (Section 3); do not migrate speculatively.
- Virtualized lists, `expo-image`, memoization — deferred until lists and content are actually large enough to need them (Sections 10, 14).

## Sprint 0 Approved as the Engineering Foundation?

**Approved, conditional on two fixes landing before Sprint 1's content-heavy work proceeds:** the Wisdom/Category data model (Section 5 / Improvement 1) and the navigation shape for tabs and the wisdom flow (Section 3 / Improvement 2). Sprint 0's actual foundation — folder structure, TypeScript rigor, component philosophy, and restraint on state management — is sound and does not need rework. The two required fixes are shape corrections to the content and navigation layers specifically, not a signal that Sprint 0 should be redone. Everything under "What Should Wait" can proceed in parallel with or after Sprint 1 without blocking it.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        