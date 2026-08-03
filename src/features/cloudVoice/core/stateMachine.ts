import {
  DEFAULT_CLOUD_VOICE_MAX_DURATION_MS,
  DEFAULT_CLOUD_VOICE_MAX_TURNS,
  type CloudVoiceLimits,
  type CloudVoiceMachineEvent,
  type CloudVoiceMachineState,
  type CloudVoiceResumableStatus,
  type CloudVoiceSessionStatus,
} from './types';

const MINIMUM_LIMIT = 1;

export function normalizeCloudVoiceLimits(
  limits: Partial<CloudVoiceLimits> = {},
): CloudVoiceLimits {
  return {
    maxCloudTurns: clampWholeNumber(
      limits.maxCloudTurns,
      MINIMUM_LIMIT,
      DEFAULT_CLOUD_VOICE_MAX_TURNS,
      DEFAULT_CLOUD_VOICE_MAX_TURNS,
    ),
    maxDurationMs: clampWholeNumber(
      limits.maxDurationMs,
      MINIMUM_LIMIT,
      DEFAULT_CLOUD_VOICE_MAX_DURATION_MS,
      DEFAULT_CLOUD_VOICE_MAX_DURATION_MS,
    ),
  };
}

export function createInitialCloudVoiceState(
  limits?: Partial<CloudVoiceLimits>,
  atMs = 0,
): CloudVoiceMachineState {
  return {
    status: 'idle',
    cloudTurns: 0,
    limits: normalizeCloudVoiceLimits(limits),
    lastTransitionAtMs: atMs,
    safetyStatus: 'safe',
  };
}

export function reduceCloudVoiceState(
  state: CloudVoiceMachineState,
  event: CloudVoiceMachineEvent,
): CloudVoiceMachineState {
  switch (event.type) {
    case 'PERMISSION_REQUESTED':
      return state.status === 'idle'
        ? transition(state, 'requestingPermission', event.atMs)
        : state;

    case 'PERMISSION_GRANTED':
      return state.status === 'requestingPermission'
        ? transition(state, 'connecting', event.atMs)
        : state;

    case 'PERMISSION_DENIED':
      return state.status === 'requestingPermission'
        ? transition(state, 'unavailable', event.atMs, {
            error: {
              code: 'permission_denied',
              message:
                event.message ??
                'Microphone permission was not granted. Continue by typing.',
              recoverable: true,
            },
          })
        : state;

    case 'CONNECTED':
      return state.status === 'connecting'
        ? transition(state, 'listening', event.atMs, {
            startedAtMs: event.atMs,
          })
        : state;

    case 'CHILD_SPEECH_STARTED':
      if (state.status === 'listening') {
        return transition(state, 'childSpeaking', event.atMs);
      }
      if (state.status === 'muted') {
        return transition(state, 'muted', event.atMs, {
          mutedFrom: 'childSpeaking',
        });
      }
      return state;

    case 'CHILD_SPEECH_ENDED':
      if (state.status === 'childSpeaking') {
        return transition(state, 'thinking', event.atMs);
      }
      if (state.status === 'muted' && state.mutedFrom === 'childSpeaking') {
        return transition(state, 'muted', event.atMs, {
          mutedFrom: 'thinking',
        });
      }
      return state;

    case 'CLOUD_RESPONSE_STARTED':
      if (state.status === 'thinking') {
        return transition(state, 'cloudSpeaking', event.atMs, {
          cloudTurns: Math.min(
            state.cloudTurns + 1,
            state.limits.maxCloudTurns,
          ),
        });
      }
      if (state.status === 'muted' && state.mutedFrom === 'thinking') {
        return transition(state, 'muted', event.atMs, {
          cloudTurns: Math.min(
            state.cloudTurns + 1,
            state.limits.maxCloudTurns,
          ),
          mutedFrom: 'cloudSpeaking',
        });
      }
      return state;

    case 'CLOUD_RESPONSE_ENDED': {
      const wasSpeaking =
        state.status === 'cloudSpeaking' ||
        (state.status === 'muted' && state.mutedFrom === 'cloudSpeaking');
      if (!wasSpeaking) return state;
      if (state.cloudTurns >= state.limits.maxCloudTurns) {
        return transition(state, 'ending', event.atMs, {
          endReason: 'turn_limit',
        });
      }
      return state.status === 'muted'
        ? transition(state, 'muted', event.atMs, { mutedFrom: 'listening' })
        : transition(state, 'listening', event.atMs);
    }

    case 'MUTED':
      return isResumableStatus(state.status)
        ? transition(state, 'muted', event.atMs, {
            mutedFrom: state.status,
          })
        : state;

    case 'UNMUTED':
      return state.status === 'muted'
        ? transition(state, state.mutedFrom ?? 'listening', event.atMs, {
            mutedFrom: undefined,
          })
        : state;

    case 'END_REQUESTED':
      return state.status === 'ending' || state.status === 'ended'
        ? state
        : transition(state, 'ending', event.atMs, {
            endReason: event.reason,
          });

    case 'TURN_LIMIT_REACHED':
      return state.status === 'ending' || state.status === 'ended'
        ? state
        : transition(state, 'ending', event.atMs, {
            endReason: 'turn_limit',
          });

    case 'DURATION_LIMIT_REACHED':
      return state.status === 'ending' || state.status === 'ended'
        ? state
        : transition(state, 'ending', event.atMs, {
            endReason: 'duration_limit',
          });

    case 'SAFETY_ESCALATED':
      return state.status === 'ending' || state.status === 'ended'
        ? state
        : transition(state, 'ending', event.atMs, {
            endReason: 'safety',
            safetyStatus: event.category,
          });

    case 'ENDED':
      return state.status === 'ended'
        ? state
        : transition(state, 'ended', event.atMs, {
            mutedFrom: undefined,
          });

    case 'FAILED':
      return state.status === 'ended'
        ? state
        : transition(state, 'error', event.atMs, {
            error: event.error,
            mutedFrom: undefined,
          });

    case 'MARKED_UNAVAILABLE':
      return state.status === 'ended'
        ? state
        : transition(state, 'unavailable', event.atMs, {
            error: {
              code: 'unavailable',
              message: event.message,
              recoverable: true,
            },
            mutedFrom: undefined,
          });

    case 'RESET':
      return createInitialCloudVoiceState(state.limits, event.atMs);
  }
}

export function isCloudVoiceSessionActive(
  status: CloudVoiceSessionStatus,
): boolean {
  return !['idle', 'ended', 'error', 'unavailable'].includes(status);
}

export function hasCloudVoiceDurationExpired(
  state: CloudVoiceMachineState,
  nowMs: number,
): boolean {
  return (
    state.startedAtMs !== undefined &&
    nowMs - state.startedAtMs >= state.limits.maxDurationMs
  );
}

function transition(
  state: CloudVoiceMachineState,
  status: CloudVoiceSessionStatus,
  atMs: number,
  update: Partial<CloudVoiceMachineState> = {},
): CloudVoiceMachineState {
  return {
    ...state,
    ...update,
    status,
    lastTransitionAtMs: atMs,
    error: update.error,
  };
}

function isResumableStatus(
  status: CloudVoiceSessionStatus,
): status is CloudVoiceResumableStatus {
  return [
    'listening',
    'childSpeaking',
    'thinking',
    'cloudSpeaking',
  ].includes(status);
}

function clampWholeNumber(
  value: number | undefined,
  minimum: number,
  maximum: number,
  fallback: number,
): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(maximum, Math.max(minimum, Math.floor(value)));
}
