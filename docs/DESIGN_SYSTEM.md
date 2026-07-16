All AI contributors must read this document before making related changes.

# Design System

CloudWise should feel premium, clean, modern, colorful, child-friendly, and not game-like.

Design principles:

- Clear hierarchy before decoration.
- Warm, high-contrast visuals.
- Premium rounded cards and thoughtful spacing.
- Story-driven illustration, not flat UI decoration.
- Calm motion and no noisy arcade effects.
- Child-friendly without becoming childish.

The visual language should support trust, curiosity, wisdom, safety, and real-life growth.

## Token Architecture

Design values live in `src/theme/`:

- `colors.ts` for semantic color, shadow, and gradient tokens.
- `spacing.ts` for reusable spacing values.
- `typography.ts` for font sizes and weights.
- `radius.ts` for reusable rounded-corner values.
- `index.ts` as the central theme export.

`src/theme/styles.ts` should contain layout and component style definitions only. New styles should reference semantic tokens such as `colors.background.primary`, `colors.text.primary`, `colors.accent.gold`, `spacing.s24`, `typography.weight.black`, and `radius.xl`.

Do not add repeated raw hex, RGB, or RGBA values directly to screens, components, or `styles.ts`. If a new color or gradient is genuinely needed, add it to `colors.ts` with a clear semantic name first.

Do not redesign product direction without approval.
