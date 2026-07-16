// A real 4pt-based spacing scale. Eight steps, not one value per usage site.
// Screens should compose these, never write a raw pixel number inline.

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  huge: 64,
} as const;

export type Spacing = typeof spacing;
