export type DailyWisdomScheduleEntry = {
  dayOffset: number;
  wisdomId: string;
};

// Deterministic baseline for development fixtures. Each child still begins on
// their own persisted local start date so Day 0 is always their first day.
export const DEVELOPMENT_PROGRAM_START_DATE_KEY = '2026-07-30';

export const dailyWisdomSchedule: readonly DailyWisdomScheduleEntry[] = [
  { dayOffset: 0, wisdomId: 'needs-vs-wants' },
  { dayOffset: 1, wisdomId: 'pause-before-you-answer' },
  { dayOffset: 2, wisdomId: 'three-ways-to-use-money' },
];
