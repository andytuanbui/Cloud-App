# Luma

Luma is a mobile app (iOS & Android) that helps children build practical, real-world wisdom — money sense, critical thinking, street smarts, communication, character, and digital literacy — through short daily stories, reflection, and real-life challenges.

**Cloud** is Luma's companion character: a warm, curious guide who greets the child each day, walks them through a short "wisdom," and grows with them over time. Cloud's personality, look, and conversation style are defined in the design docs and prototype below.

This repo is the shared source of truth for building Luma across tools — Cowork, ChatGPT, and Codex are all working from what's here.

## Status

Active design exploration. The product direction has gone through a few iterations — **read [`docs/design-direction-notes.md`](docs/design-direction-notes.md) first** before diving into the PRDs below, since it explains which decisions are current and which are historical/superseded.

## What's in here

```
docs/
  design-direction-notes.md         ← start here — explains the pivot history
  PRD-v1-full-curriculum.md         ← original 13-year curriculum + AI companion concept (superseded)
  PRD-v2-gamified-daily-wisdom.md   ← pivot to a leaner, no-companion daily-habit app (superseded)
prototypes/
  cloud-companion-flow.html         ← current direction: clickable Home → Wisdom → Cloud → Library flow
  visual-direction-test.html        ← earlier calm-vs-bright A/B visual test (historical reference)
```

The prototypes are self-contained HTML files — open either one directly in a browser, no build step required.

## Next step

Neither PRD fully reflects the current Cloud-companion direction yet. The recommended next step is a PRD v3 that reconciles the reintroduced AI companion (now scripted/structured rather than open-ended chat, for child-safety reasons) and the warm illustrated visual direction with the rest of the product spec — see the open items at the bottom of `design-direction-notes.md`.
