// Design tokens — CloudWise
// A small, deliberate palette. If a color isn't here, it doesn't belong in the app.
// Base brand values come from the official Cloud character sheet.

const brand = {
  navyDeepest: '#07111C', // app background, night sky
  navyDeep: '#0D1B2A', // official Cloud navy — cards, panels
  navy: '#101827', // official Cloud dark gray — ink text on light surfaces
  blue: '#1E3A8A', // official Cloud blue — secondary accents
  gold: '#FED84D', // official Cloud gold — primary CTA, highlights
  goldDeep: '#D98A2B', // gold gradient partner, warm shadow tones
  green: '#22C55E', // official Cloud green — growth/success moments only
};

const neutral = {
  white: '#FFFFFF',
  offWhite: '#E5E7EB', // official Cloud light gray
  mistLight: '#D9E2F2',
  mist: '#AEBBD0',
  mistDeep: '#6A7488',
};

export const colors = {
  brand,
  neutral,

  // Semantic roles — screens should reach for these, not brand/neutral directly.
  background: {
    app: brand.navyDeepest,
    surface: brand.navyDeep,
    surfaceRaised: '#132339',
  },
  text: {
    onDark: neutral.white,
    onDarkMuted: neutral.mist,
    onDarkSubtle: neutral.mistDeep,
    onLight: brand.navy,
    onLightMuted: '#5A4A33',
    accent: brand.gold,
  },
  border: {
    subtle: 'rgba(255,255,255,0.12)',
    medium: 'rgba(255,255,255,0.2)',
    gold: 'rgba(254,216,77,0.5)',
  },
  overlay: {
    scrimLight: 'rgba(7,17,28,0.35)',
    scrimMedium: 'rgba(7,17,28,0.65)',
    scrimStrong: 'rgba(7,17,28,0.9)',
  },

  // A tiny, named set of gradients — every new one should earn its place here.
  gradient: {
    heroFade: ['rgba(7,17,28,0)', 'rgba(7,17,28,0.55)', 'rgba(7,17,28,1)'] as const,
    goldCta: [brand.gold, brand.goldDeep] as const,
    lockedCard: ['#1A2B44', brand.navyDeep] as const,
  },
} as const;

export type Colors = typeof colors;
