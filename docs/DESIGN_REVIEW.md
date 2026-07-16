All AI contributors must read this document before making related changes.

# Design Review — Implementation & Recommendations

Reviewer: Claude Cowork (Software Architect and Code Reviewer, per `docs/AI_TEAM_ROLES.md`)
Reviewed commit: `7770a34`. No application code has changed since Sprint 0 (`6dd043b`) — the only commits since are a `.bat` helper script and a lockfile update, so this review covers the same code as `docs/ARCHITECTURE_REVIEW.md`, viewed specifically through a design/visual-implementation lens rather than a general architecture lens.

This document splits recommendations into two kinds, deliberately. Per `docs/AI_TEAM_ROLES.md`, creative and art direction belong to ChatGPT; architecture and code review belong here. Section 1 is written with full confidence — these are implementation problems, not taste. Section 2 is written as observations to raise, not decisions — they're flagged for ChatGPT and Andy to weigh in on, not something this review resolves unilaterally.

---

## How It's Coded Today (summary)

Codex's Sprint 0 split the app cleanly into `src/components`, `src/screens`, `src/content`, `src/theme`, `src/navigation`, `src/types`. Components are small and single-purpose, TypeScript is strict with zero use of `any` anywhere, and navigation is properly typed for the two screens that exist. That part of the foundation is solid and doesn't need rework.

The gap is one level deeper: "today's wisdom" and "the next locked wisdom" are hardcoded as two fixed fields on each category, rather than existing as independent, addressable records. That's a content/data-model issue, not a visual one — full detail is in `docs/ARCHITECTURE_REVIEW.md` (Finding 2.1 / 6.1), not repeated here since this document's focus is design implementation specifically.

---

## Section 1 — Implementation-Level Design Issues (confident recommendations)

These are about how the current visual design is *built in code*, not what it looks like. Fixing these doesn't change the app's appearance — it changes how easy the current appearance is to maintain and extend consistently.

**1.1 — No design tokens; `theme/styles.ts` is 580+ lines of raw hex values**
The current stylesheet has 20+ distinct hardcoded hex colors repeated across dozens of style objects, with no `colors.ts`/`spacing.ts`/`typography.ts` layer underneath. `docs/DESIGN_SYSTEM.md` describes a specific visual language, but nothing in code enforces it — two components can drift out of sync with no single place to fix it, and a future palette change means a manual find-and-replace across one large file instead of a one-line token edit.
*Recommendation:* Extract named tokens now, before more screens add to the flat file. Component styles should reference `colors.accentGold`, not `'#FFD166'` inline.

**1.2 — The same card layout is implemented three separate times**
`TodayCard`, `LockedNextCard`, and `RecommendedCard` (plus the hero section in `WisdomDetailScreen`) each independently implement "image + gradient overlay + floating text," with separate near-duplicate style blocks for each. Today that's roughly 3x duplication; it will keep multiplying as more screens are added rather than converging on a shared shape.
*Recommendation:* Extract one shared primitive (e.g. `GradientMediaCard`), parameterized by size/copy/colors, that all four call sites compose.

**1.3 — `BottomNav` visually promises five destinations; only one is real**
Home, Wisdoms, Favorites, Growth, and Profile all render, but only Home has a route and behavior — the other four are static decoration with no navigator behind them, and "active" state is hardcoded rather than driven by actual navigation state.
*Recommendation:* Decide the navigation shape (a real tab navigator is the natural fit for five persistent destinations) before more screens are built assuming the current manual-render pattern.

**1.4 — A couple of tap targets sit just under the usual minimum**
The back button and favorite button on the Wisdom Detail screen are 42×42 — just under Apple's common 44pt minimum touch-target guideline. Small, easy to fix, worth doing before more buttons copy the same size.
*Recommendation:* Bump shared round-button styles to at least 44×44.

---

## Section 2 — Observations for Creative Direction (flagged, not decided)

These are genuine reactions to how the app currently looks and feels, offered because they were asked for directly — but they're creative-direction calls, which belong to ChatGPT and Andy per the team's own working agreement, not something this review resolves. Treat this section as input, not a verdict.

**2.1 — Every screen currently shares close to the same dark navy gradient**
The mood reads premium and calm, which fits the "not game-like" principle in `docs/DESIGN_SYSTEM.md` well. But that same document also says "colorful," and right now there isn't much color variation from screen to screen — Home, Wisdom Detail, and (implicitly) every category all sit on a similar dark background. Worth checking deliberately whether that's the intended feel, or whether categories should carry more distinct visual identity from each other (a warmer treatment for Money, a cooler one for Thinking, etc.) rather than all sharing one dominant mood.

**2.2 — Worth testing the current implementation with actual kids in the target age range**
The tone as built now leans premium/moody rather than bright/playful — which was a deliberate earlier bet against generic "kids app" mascot design (see `docs/design-direction-notes.md`, Iteration 2's anti-mascot reasoning). That bet was never actually tested with real parents or kids, only reasoned about — the `prototypes/visual-direction-test.html` rig built earlier for exactly this purpose hasn't been run against this specific implementation. Worth doing before investing much further design polish in this direction, one way or the other.

---

## Suggested Next Step

Section 1 (tokens, shared card primitive, nav wiring) can be picked up as straightforward engineering work at any time and doesn't require a creative-direction decision first. Section 2 is worth a short, explicit conversation with ChatGPT and Andy before more screens are designed on top of the current mood — cheap to discuss now, more expensive to walk back after ten more screens match the current style.
