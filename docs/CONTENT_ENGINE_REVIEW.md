All AI contributors must read this document before making related changes.

# Content Engine Review — Sprint: Content Engine Foundation

Reviewer: Claude Cowork (Software Architect and Code Reviewer, per `docs/AI_TEAM_ROLES.md`)
Reviewed commit: `ab85543` ("feat: content engine foundation")
Scope: strict architecture review only. No application code was modified to produce this document.

This review was performed against a fresh clone of `main`, reading every changed file in the commit (`src/types/wisdom.ts`, `src/content/wisdom.ts`, `src/services/contentService.ts`, `src/services/wisdomService.ts`, `src/services/cloudPresenceService.ts`, all six journey screens, `src/navigation/WisdomJourneyNavigator.tsx`, `docs/CONTENT_ARCHITECTURE.md`), verified with `grep` for import boundaries and `tsc --noEmit` for type correctness rather than assumed from the commit message or the sprint's own documentation.

---

## 1. Scalability to 1,000+ wisdoms

The data model is now correctly normalized: `Category`, `Wisdom`, `Story`, `Challenge`, `Conversation`, and `Reward` are independent records linked by id, and `getWisdomsForCategory()` returns however many wisdoms a category has, sorted by `order`. This is the real fix for the conflated `WisdomWorld` type flagged in the original architecture review — a category can now hold any number of wisdoms, not just one hardcoded "hero" and one "locked."

**Limitation:** all content still lives as hand-written array literals in one file (`src/content/wisdom.ts`, 650 lines for 14 wisdoms today). At 1,000+ wisdoms with full storybook pages, challenges, and conversations attached, that file would run into the tens of thousands of lines and get compiled directly into the app bundle — every content addition ships as a full app rebuild, with no lazy-loading or remote-content path yet. Correct and expected for a foundation sprint; this is the first wall you'll hit if content volume grows before it's addressed.

## 2. Separation of UI and content

**Pass, verified not assumed.** Zero screens or components import `content/wisdom.ts` directly — confirmed by grepping the whole `src/` tree. Every screen goes through `contentService.ts` (raw domain records) or `wisdomService.ts` (view-model shaping for the current UI). `contentService.ts` also now throws on a missing id instead of the old `worlds.find(...) ?? worlds[0]` silent fallback — a real data-integrity improvement, not just a refactor.

## 3. Technical debt

`theme/styles.ts` nearly tripled this sprint, 584 → 1,452 lines, still one flat `StyleSheet.create()` with 36 distinct raw hex values and no token layer. This was flagged in the prior design review and is now larger, not smaller — it is the clearest compounding debt in the codebase.

Other items, unrelated to this sprint's scope but still open: `BottomNav` remains fully decorative (no `onPress` anywhere). `Conversation.suggestedReplies` is defined in the type and populated in content but never rendered by `TalkWithCloudScreen` — the content model has gotten ahead of the UI here, worth tracking so it isn't forgotten.

## 4. Future compatibility with Supabase

The layering is right — `contentService.ts` is genuinely the single swap point `docs/CONTENT_ARCHITECTURE.md` claims it to be. The gap that document doesn't mention: every service function is synchronous (`getWisdom(id): Wisdom`, not `Promise<Wisdom>`), and every screen calls these directly in the render body rather than inside `useEffect` or a data-fetching hook. Supabase calls are network-bound and async by nature, so swapping local arrays for Supabase queries will require reworking every screen's data-fetching pattern to handle loading and error states — not the drop-in swap the current docs imply.

## 5. Future compatibility with AI conversations

`Conversation` plus `conversationId` per wisdom gives AI a real anchor point later. But `cloudPresenceService.ts` hardcodes the name "Andy" directly into 24 canned greeting lines, selected by a date-seeded rotation — this is static scripted content, not a personalization system, and as written it will greet every user by name specifically. Fine as a personal placeholder during early testing; needs to be replaced, not extended, before this ships to anyone else.

## 6. Future compatibility with localization

`locale` exists on every `Wisdom` record (all 14 currently hardcoded to `'en-US'`), but nothing anywhere — no service, no screen — reads, filters, or switches on it. It's modeled but inert. Separately, all UI chrome text (button labels, step labels like "Growth 2 of 4", screen titles) is hardcoded English directly in JSX across screens, with no central copy layer distinct from content records. Accurate to call this scaffolded, not implemented.

## 7. Can future contributors add new wisdoms without changing existing code

**Yes, verified true rather than just claimed.** `docs/CONTENT_ARCHITECTURE.md`'s 9-step recipe matches the actual code: a new wisdom is a `Wisdom` object plus matching `Story`, `Challenge`, `Conversation`, and `Reward` entries in `content/wisdom.ts`. No screen contains wisdom-specific branching — the choice/branch logic in `ReadingScreen` is entirely data-driven off `branchId`. This is the strongest result of the sprint.

---

## What Passed

- Normalized content schema (`Category`/`Wisdom`/`Story`/`Challenge`/`Conversation`/`Reward`) replacing the earlier conflated `WisdomWorld` data model.
- Zero direct content imports outside the service layer — UI/content boundary is enforced in code, not just documented.
- `contentService.ts` fails loudly on missing ids instead of silently falling back.
- Zero use of `any` anywhere in `src/`; `tsc --noEmit` passes clean.
- New wisdoms can be added by data alone — no screen changes required for standard content, confirmed by reading the actual screen implementations.

## Current Limitations

- Content is bundled directly into the app binary as TypeScript array literals — no remote or lazy-loaded content path yet.
- Service layer is fully synchronous, which will not survive a Supabase migration without touching every screen's data-fetching pattern.
- `locale` field exists but is not read or acted on anywhere.
- UI chrome copy is hardcoded English in JSX with no central strings layer.
- `cloudPresenceService.ts` hardcodes a specific real name into shipped greeting content.

## Deferred Items (reasonable to defer, should be tracked)

- Splitting `content/wisdom.ts` into per-wisdom or per-category files / remote content delivery.
- Wiring `BottomNav` to real navigation state.
- Rendering `Conversation.suggestedReplies` in `TalkWithCloudScreen`.
- Building an actual localization mechanism on top of the existing `locale` field.
- Extracting UI chrome copy into a dedicated strings/copy layer.

---

## Verdict: Approved, conditional on two required improvements

This foundation is real progress, not a repaint. The data-model fix identified in the original architecture review actually landed this sprint, and the UI/content boundary is enforced, not just documented. Two items are load-bearing for surviving the next several years of CloudWise development and should land before content volume scales further. Everything else above is reasonable to defer, provided it stays tracked rather than forgotten.

### Required improvement 1 — Async content-service contract

Convert `contentService.ts` and `wisdomService.ts` functions to return `Promise`s (or adopt a data-fetching hook pattern at the screen level) now, while there are only 14 wisdoms and 7 screens consuming them directly in the render body. Retrofitting this after Supabase is introduced, or after significantly more screens are built on the synchronous assumption, will be materially more expensive than doing it now.

### Required improvement 2 — Theme tokens and style-file restructuring

`theme/styles.ts` has grown to 1,452 lines with 36 duplicated raw hex values and no token layer, and it grew rather than shrank this sprint. Extract a `colors.ts` / `spacing.ts` / `typography.ts` token layer before more screens are added on top of the current flat-file pattern — every screen built against the current structure increases the cost of fixing it later.
