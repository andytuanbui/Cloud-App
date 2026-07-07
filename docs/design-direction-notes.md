# Design Direction Notes

The Luma concept has gone through three distinct iterations. This doc exists so nobody (human or AI) building from this repo mistakes an old decision for the current one. Read this before the PRDs.

## Iteration 1 — Full 13-year curriculum + AI companion (`docs/PRD-v1-full-curriculum.md`)

The original vision: a 7-pillar curriculum spanning ages 5–17, with an always-on AI companion (originally named Lumi, renamed **Cloud** throughout this doc for consistency with the current direction) that remembers the child across years and holds open-ended Socratic conversations.

**Status: superseded.** This scope was judged too large and too costly/risky for a first version — an always-on conversational AI for young children carries significant child-safety and moderation burden, and a 13-year curriculum is a lot to build before validating anything. Kept for reference on the long-term vision and the curriculum pillar structure, which is still broadly relevant.

## Iteration 2 — Leaner, no-companion, anti-mascot daily habit app (`docs/PRD-v2-gamified-daily-wisdom.md`)

The pivot: drop the AI companion entirely (v1's biggest cost/risk driver), keep the 7 wisdom categories, and ship a static-content, human-reviewed library with a daily-unlock gamification mechanic. Visual direction went the opposite way from a typical kids' app — calm, editorial, muted palette, explicitly avoiding cartoon mascots — on the theory that this reads as more trustworthy to parents.

This is also the version that produced `prototypes/visual-direction-test.html`, a blind A/B test rig for calm/editorial vs. bright/mascot visual styles.

**Status: superseded.** After seeing a reference concept with a fully-designed mascot character, the direction shifted back toward having a companion character — see Iteration 3. The calm-vs-bright visual test is still a useful artifact if there's ever a reason to revisit that question, but the "no companion" and "anti-mascot" conclusions no longer hold.

## Iteration 3 — Cloud, the companion character (current direction)

The current direction reintroduces an AI companion — now named **Cloud** — with a warm, illustrated character design (navy hoodie, gold star motif, friendly expressions) rather than the calm/editorial anti-mascot look from Iteration 2. The core loop was also refined:

- **Home screen answers one question** — "what should I learn today?" — rather than acting as a dashboard. One "Today's Wisdom" card, not a menu of everything.
- **Four-step wisdom flow**: Read → Talk with Cloud → Reflection → Challenge. Only after all four steps does the next day's wisdom unlock.
- **Cloud's dialogue is scripted/structured** (pick-a-response, not open free-text chat) — this keeps the child-safety and moderation surface small while still delivering a "companion" feel. This is a deliberate difference from Iteration 1's open-ended conversational Cloud.
- **Locked content is reframed with anticipation**, not "gray and dead" — e.g. "✨ Cloud is preparing tomorrow's lesson" instead of a plain padlock.
- **Wisdom Library**: every completed wisdom stays accessible and favoritable, so the app is a growing personal reference, not a one-way progress bar.
- **Adaptive path ordering** (aspirational, not yet built): Cloud eventually recommends which wisdom comes next based on a child's interests, not just a fixed sequence.

This direction is captured in `prototypes/cloud-companion-flow.html`, a clickable prototype of the full journey.

## Open items — not yet resolved

- **No PRD reflects Iteration 3 yet.** Both PRDs in `docs/` are written against earlier, contradicted decisions (v1: unscripted always-on companion + 13-year scope; v2: no companion at all). A PRD v3 that documents the current Cloud-companion direction — scope, safety posture for scripted-dialogue AI, curriculum architecture, monetization — is the most valuable next writing task.
- **Child-safety posture needs re-review.** Even scripted/structured dialogue with a named companion character raises different expectations (and possibly different COPPA/GDPR-K considerations) than fully static content. This was flagged but not re-analyzed when Cloud was reintroduced.
- **Visual system isn't fully specified.** The prototype uses a flat/vector placeholder version of Cloud (no image-generation tool was available when it was built). A real illustration system — full character sheet, expressions, poses — still needs to be produced or sourced.
- **Curriculum content itself (the actual wisdom stories/exercises) is still just placeholder examples** in the prototype — only one wisdom ("Needs vs Wants") is fully written out end-to-end.
