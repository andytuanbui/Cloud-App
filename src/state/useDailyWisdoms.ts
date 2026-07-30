import { useMemo } from 'react';
import { dailyWisdomSchedule } from '../content/schedule';
import { getWisdomById } from '../content/wisdoms';
import type { WisdomContent } from '../content/wisdoms';
import {
  addLocalCalendarDays,
  compareLocalDateKeys,
  getAssignedWisdomId,
  getLocalDateKey,
  hasTomorrowAssignment,
} from '../services/date/dateService';
import type { WisdomProgress } from './types';
import { useAppState } from './useAppState';

export type ScheduledWisdom = {
  wisdom: WisdomContent;
  assignedDateKey: string;
  progress?: WisdomProgress;
  completionDateKey?: string;
};

export function useDailyWisdoms() {
  const { profile, wisdomProgress, currentDateKey } = useAppState();

  return useMemo(() => {
    const assignedDateForWisdom = (wisdomId: string) => {
      const entry = dailyWisdomSchedule.find((item) => item.wisdomId === wisdomId);
      return entry
        ? addLocalCalendarDays(profile.programStartDateKey, entry.dayOffset)
        : undefined;
    };

    const isWisdomAvailable = (wisdomId: string) => {
      const assignedDateKey = assignedDateForWisdom(wisdomId);
      return Boolean(
        assignedDateKey && compareLocalDateKeys(assignedDateKey, currentDateKey) <= 0,
      );
    };

    const scheduled = dailyWisdomSchedule.flatMap<ScheduledWisdom>((entry) => {
      const wisdom = getWisdomById(entry.wisdomId);
      const assignedDateKey = assignedDateForWisdom(entry.wisdomId);
      if (!wisdom || !assignedDateKey) return [];
      const progress = wisdomProgress[entry.wisdomId];
      return [
        {
          wisdom,
          assignedDateKey,
          progress,
          completionDateKey: progress?.completedAt
            ? getLocalDateKey(new Date(progress.completedAt))
            : undefined,
        },
      ];
    });

    const accessible = scheduled.filter(
      (item) => compareLocalDateKeys(item.assignedDateKey, currentDateKey) <= 0,
    );
    const todayId = getAssignedWisdomId(profile.programStartDateKey, currentDateKey);

    return {
      todayWisdom: todayId ? getWisdomById(todayId) : undefined,
      todayProgress: todayId ? wisdomProgress[todayId] : undefined,
      tomorrowWisdomExists: hasTomorrowAssignment(
        profile.programStartDateKey,
        currentDateKey,
      ),
      availableWisdoms: accessible.filter((item) => !item.progress),
      inProgressWisdoms: accessible.filter(
        (item) => item.progress && !item.progress.completed,
      ),
      completedWisdoms: accessible
        .filter((item) => item.progress?.completed)
        .sort((left, right) =>
          (right.progress?.completedAt ?? '').localeCompare(
            left.progress?.completedAt ?? '',
          ),
        ),
      assignedDateForWisdom,
      isWisdomAvailable,
    };
  }, [currentDateKey, profile.programStartDateKey, wisdomProgress]);
}
