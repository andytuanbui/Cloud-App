// A real type scale, not one size per screen. Large sizes lead — this app
// should read like an editorial product, not a dashboard.

export const typography = {
  size: {
    caption: 12,
    bodySmall: 14,
    body: 16,
    subheading: 18,
    heading: 22,
    title: 28,
    display: 34,
  },
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: 1.15,
    normal: 1.35,
    relaxed: 1.55,
  },
} as const;

export type Typography = typeof typography;
