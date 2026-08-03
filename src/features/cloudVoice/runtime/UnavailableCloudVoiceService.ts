import type {
  CloudVoiceService,
  CloudVoiceSession,
  CloudVoiceSessionOptions,
} from '../core/types';

export class UnavailableCloudVoiceService implements CloudVoiceService {
  readonly mode = 'unavailable' as const;
  readonly supported = false;

  createSession(options: CloudVoiceSessionOptions): CloudVoiceSession {
    return {
      id: options.sessionId,
      start: async () => {
        throw new Error('Live voice is unavailable on this platform. Continue by typing.');
      },
      setMuted: () => undefined,
      finish: async () => {
        throw new Error('No voice conversation is active.');
      },
      close: async () => undefined,
      getSnapshot: () => ({
        state: {
          status: 'unavailable',
          cloudTurns: 0,
          limits: {
            maxCloudTurns: options.limits?.maxCloudTurns ?? 6,
            maxDurationMs: options.limits?.maxDurationMs ?? 180_000,
          },
          lastTransitionAtMs: Date.now(),
          safetyStatus: 'safe',
          error: {
            code: 'unavailable',
            message: 'Live voice is unavailable on this platform. Continue by typing.',
            recoverable: true,
          },
        },
        transcript: [],
      }),
    };
  }

  async dispose(): Promise<void> {}
}
