import { dailyWisdomSchedule } from '../../content/schedule';

const DATE_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function dateParts(dateKey: string) {
  const match = DATE_KEY_PATTERN.exec(dateKey);
  if (!match) throw new Error(`Invalid local date key: ${dateKey}`);
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

export function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isValidLocalDateKey(dateKey: string): boolean {
  try {
    const { year, month, day } = dateParts(dateKey);
    const localNoon = new Date(year, month - 1, day, 12);
    return (
      localNoon.getFullYear() === year &&
      localNoon.getMonth() === month - 1 &&
      localNoon.getDate() === day
    );
  } catch {
    return false;
  }
}

export function compareLocalDateKeys(left: string, right: string): number {
  if (!isValidLocalDateKey(left) || !isValidLocalDateKey(right)) {
    throw new Error('Cannot compare invalid local date keys');
  }
  return left.localeCompare(right);
}

export function addLocalCalendarDays(dateKey: string, days: number): string {
  if (!isValidLocalDateKey(dateKey)) throw new Error(`Invalid local date key: ${dateKey}`);
  const { year, month, day } = dateParts(dateKey);
  const localNoon = new Date(year, month - 1, day + days, 12);
  return getLocalDateKey(localNoon);
}

export function getCalendarDayOffset(startDateKey: string, dateKey: string): number {
  if (!isValidLocalDateKey(startDateKey) || !isValidLocalDateKey(dateKey)) {
    throw new Error('Cannot calculate an offset for invalid local date keys');
  }
  const start = dateParts(startDateKey);
  const current = dateParts(dateKey);
  return Math.round(
    (Date.UTC(current.year, current.month - 1, current.day) -
      Date.UTC(start.year, start.month - 1, start.day)) /
      86_400_000,
  );
}

export function getAssignedWisdomId(
  programStartDateKey: string,
  currentDate: Date | string = new Date(),
): string | undefined {
  const currentDateKey =
    typeof currentDate === 'string' ? currentDate : getLocalDateKey(currentDate);
  const offset = getCalendarDayOffset(programStartDateKey, currentDateKey);
  return dailyWisdomSchedule.find((entry) => entry.dayOffset === offset)?.wisdomId;
}

export function hasTomorrowAssignment(
  programStartDateKey: string,
  currentDate: Date | string = new Date(),
): boolean {
  const currentDateKey =
    typeof currentDate === 'string' ? currentDate : getLocalDateKey(currentDate);
  return Boolean(getAssignedWisdomId(programStartDateKey, addLocalCalendarDays(currentDateKey, 1)));
}
