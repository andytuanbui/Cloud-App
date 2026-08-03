import type {
  CloudVoiceClock,
  CloudVoiceTimerHandle,
} from '../core/types';

type ScheduledTask = {
  id: number;
  dueAtMs: number;
  callback: () => void;
};

/** Deterministic clock for mock mode, stories, and unit tests. */
export class ManualCloudVoiceClock implements CloudVoiceClock {
  private currentTimeMs: number;
  private nextId = 1;
  private readonly tasks = new Map<number, ScheduledTask>();

  constructor(initialTimeMs = 0) {
    this.currentTimeMs = initialTimeMs;
  }

  now(): number {
    return this.currentTimeMs;
  }

  setTimeout(callback: () => void, delayMs: number): CloudVoiceTimerHandle {
    const id = this.nextId++;
    this.tasks.set(id, {
      id,
      dueAtMs: this.currentTimeMs + Math.max(0, Math.floor(delayMs)),
      callback,
    });
    return id;
  }

  clearTimeout(handle: CloudVoiceTimerHandle): void {
    if (typeof handle === 'number') this.tasks.delete(handle);
  }

  advanceBy(milliseconds: number): void {
    if (!Number.isFinite(milliseconds) || milliseconds < 0) {
      throw new Error('Manual clock can only advance by a non-negative duration.');
    }
    this.advanceTo(this.currentTimeMs + milliseconds);
  }

  advanceTo(targetTimeMs: number): void {
    if (!Number.isFinite(targetTimeMs) || targetTimeMs < this.currentTimeMs) {
      throw new Error('Manual clock cannot move backwards.');
    }

    let next = this.nextDueTask(targetTimeMs);
    while (next) {
      this.tasks.delete(next.id);
      this.currentTimeMs = next.dueAtMs;
      next.callback();
      next = this.nextDueTask(targetTimeMs);
    }
    this.currentTimeMs = targetTimeMs;
  }

  runAll(maximumTasks = 10_000): void {
    let processed = 0;
    while (this.tasks.size > 0) {
      if (processed++ >= maximumTasks) {
        throw new Error('Manual clock task limit reached.');
      }
      const next = this.nextDueTask(Number.POSITIVE_INFINITY);
      if (!next) return;
      this.tasks.delete(next.id);
      this.currentTimeMs = next.dueAtMs;
      next.callback();
    }
  }

  clearAll(): void {
    this.tasks.clear();
  }

  get pendingTaskCount(): number {
    return this.tasks.size;
  }

  private nextDueTask(targetTimeMs: number): ScheduledTask | undefined {
    return Array.from(this.tasks.values())
      .filter((task) => task.dueAtMs <= targetTimeMs)
      .sort((left, right) =>
        left.dueAtMs === right.dueAtMs
          ? left.id - right.id
          : left.dueAtMs - right.dueAtMs,
      )[0];
  }
}

export const systemCloudVoiceClock: CloudVoiceClock = {
  now: () => Date.now(),
  setTimeout: (callback, delayMs) => globalThis.setTimeout(callback, delayMs),
  clearTimeout: (handle) =>
    globalThis.clearTimeout(
      handle as ReturnType<typeof globalThis.setTimeout>,
    ),
};
