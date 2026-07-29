import { needsVsWants } from './needsVsWants';

export * from './types';
export const wisdoms = [needsVsWants];
export const todayWisdom = needsVsWants;

export function getWisdomById(id: string) {
  return wisdoms.find((wisdom) => wisdom.id === id);
}
