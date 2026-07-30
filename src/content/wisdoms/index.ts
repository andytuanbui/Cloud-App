import { needsVsWants } from './needsVsWants';
import { pauseBeforeYouAnswer } from './pauseBeforeYouAnswer';
import { threeWaysToUseMoney } from './threeWaysToUseMoney';

export * from './types';
export const wisdoms = [needsVsWants, pauseBeforeYouAnswer, threeWaysToUseMoney];

export function getWisdomById(id: string) {
  return wisdoms.find((wisdom) => wisdom.id === id);
}
