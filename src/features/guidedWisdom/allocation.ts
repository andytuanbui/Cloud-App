import type {
  AllocationConfig,
  AllocationIssue,
  AllocationState,
  AllocationValues,
} from './types';

/**
 * A reusable "distribute a fixed value across destinations" exercise.
 *
 * Nothing here knows about money. A Wisdom about time, attention or items can
 * reuse it by supplying a different `unitSuffix` and destinations.
 */

export function createEmptyAllocation(config: AllocationConfig): AllocationValues {
  return Object.fromEntries(
    config.destinations.map((destination) => [destination.id, 0]),
  );
}

/** Even starting split, with any remainder left unplaced rather than guessed. */
export function createEvenAllocation(config: AllocationConfig): AllocationValues {
  const count = config.destinations.length;
  if (count === 0) return {};
  const steps = Math.floor(config.totalUnits / config.increment / count);
  const share = steps * config.increment;
  return Object.fromEntries(
    config.destinations.map((destination) => [destination.id, share]),
  );
}

export function sumAllocation(values: AllocationValues): number {
  return Object.values(values).reduce((total, amount) => total + amount, 0);
}

export function evaluateAllocation(
  config: AllocationConfig,
  values: AllocationValues,
): AllocationState {
  const issues: AllocationIssue[] = [];
  const placedUnits = sumAllocation(values);

  for (const destination of config.destinations) {
    const amount = values[destination.id] ?? 0;
    if (!Number.isInteger(amount)) {
      issues.push({ code: 'not-whole', destinationId: destination.id });
      continue;
    }
    if (amount < 0) {
      issues.push({ code: 'negative', destinationId: destination.id });
      continue;
    }
    if (amount % config.increment !== 0) {
      issues.push({ code: 'wrong-increment', destinationId: destination.id });
    }
    if (
      destination.minimumUnits !== undefined &&
      amount < destination.minimumUnits
    ) {
      issues.push({ code: 'below-minimum', destinationId: destination.id });
    }
    if (
      destination.maximumUnits !== undefined &&
      amount > destination.maximumUnits
    ) {
      issues.push({ code: 'above-maximum', destinationId: destination.id });
    }
  }

  if (placedUnits > config.totalUnits) issues.push({ code: 'above-total' });
  if (placedUnits < config.totalUnits) issues.push({ code: 'incomplete' });

  return {
    values,
    placedUnits,
    remainingUnits: config.totalUnits - placedUnits,
    isComplete: issues.length === 0,
    issues,
  };
}

/**
 * Applies one adjustment. Returns the unchanged values when the move would
 * break a rule, so callers can bind this straight to a control without
 * needing their own guards.
 */
export function applyAllocationStep(
  config: AllocationConfig,
  values: AllocationValues,
  destinationId: string,
  direction: 'increase' | 'decrease',
): AllocationValues {
  const destination = config.destinations.find(
    (item) => item.id === destinationId,
  );
  if (!destination) return values;

  const current = values[destinationId] ?? 0;
  const delta = direction === 'increase' ? config.increment : -config.increment;
  const next = current + delta;

  if (next < (destination.minimumUnits ?? 0)) return values;
  if (
    destination.maximumUnits !== undefined &&
    next > destination.maximumUnits
  ) {
    return values;
  }
  if (sumAllocation(values) - current + next > config.totalUnits) return values;

  return { ...values, [destinationId]: next };
}

export function canIncrease(
  config: AllocationConfig,
  values: AllocationValues,
  destinationId: string,
): boolean {
  return (
    applyAllocationStep(config, values, destinationId, 'increase') !== values
  );
}

export function canDecrease(
  config: AllocationConfig,
  values: AllocationValues,
  destinationId: string,
): boolean {
  return (
    applyAllocationStep(config, values, destinationId, 'decrease') !== values
  );
}

/** "30 kr" — formatting lives with the config, not in a component. */
export function formatUnits(config: AllocationConfig, amount: number): string {
  return `${amount} ${config.unitSuffix}`;
}

/** "90 of 90 kr" */
export function formatPlacedOfTotal(
  config: AllocationConfig,
  placedUnits: number,
): string {
  return `${placedUnits} of ${config.totalUnits} ${config.unitSuffix}`;
}
