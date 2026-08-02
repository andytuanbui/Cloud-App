export type NarrationState =
  | 'unavailable'
  | 'idle'
  | 'speaking'
  | 'paused';

export type NarrationCallbacks = {
  onStateChange?: (state: NarrationState) => void;
  onComplete?: () => void;
  onError?: (message: string) => void;
};

export type NarrationService = {
  readonly supported: boolean;
  getState: () => NarrationState;
  read: (text: string, callbacks?: NarrationCallbacks) => boolean;
  pause: () => boolean;
  resume: () => boolean;
  stop: () => void;
};

const unavailableMessage = 'Narration is unavailable on this device.';

export const unsupportedNarrationService: NarrationService = {
  supported: false,
  getState: () => 'unavailable',
  read: (_text, callbacks) => {
    callbacks?.onStateChange?.('unavailable');
    callbacks?.onError?.(unavailableMessage);
    return false;
  },
  pause: () => false,
  resume: () => false,
  stop: () => undefined,
};

/**
 * Uses the browser's built-in speech engine when it is genuinely available.
 * Native platforms receive the explicit unsupported adapter until a native
 * narration implementation is added behind this same interface.
 */
export function createNarrationService(): NarrationService {
  const environment = getWebSpeechEnvironment();
  if (!environment) return unsupportedNarrationService;

  const { speechSynthesis, Utterance } = environment;
  let state: NarrationState = 'idle';
  let requestRevision = 0;
  let activeCallbacks: NarrationCallbacks | undefined;

  const setState = (
    nextState: NarrationState,
    callbacks = activeCallbacks,
  ) => {
    state = nextState;
    callbacks?.onStateChange?.(nextState);
  };

  const stop = () => {
    requestRevision += 1;
    speechSynthesis.cancel();
    const callbacks = activeCallbacks;
    activeCallbacks = undefined;
    setState('idle', callbacks);
  };

  return {
    supported: true,
    getState: () => state,
    read: (text, callbacks) => {
      const narrationText = text.replace(/\s+/g, ' ').trim();
      if (!narrationText) {
        callbacks?.onError?.('Narration text cannot be empty.');
        return false;
      }

      if (state !== 'idle') stop();

      const revision = ++requestRevision;
      const utterance = new Utterance(narrationText);
      activeCallbacks = callbacks;
      utterance.onend = () => {
        if (revision !== requestRevision) return;
        activeCallbacks = undefined;
        setState('idle', callbacks);
        callbacks?.onComplete?.();
      };
      utterance.onerror = (event) => {
        if (revision !== requestRevision) return;
        activeCallbacks = undefined;
        setState('idle', callbacks);
        callbacks?.onError?.(
          event.error
            ? `Narration stopped: ${event.error}.`
            : 'Narration stopped unexpectedly.',
        );
      };

      try {
        speechSynthesis.speak(utterance);
        setState('speaking', callbacks);
        return true;
      } catch (error) {
        if (revision === requestRevision) {
          activeCallbacks = undefined;
          setState('idle', callbacks);
        }
        callbacks?.onError?.(
          error instanceof Error
            ? error.message
            : 'Narration could not be started.',
        );
        return false;
      }
    },
    pause: () => {
      if (state !== 'speaking') return false;
      speechSynthesis.pause();
      setState('paused');
      return true;
    },
    resume: () => {
      if (state !== 'paused') return false;
      speechSynthesis.resume();
      setState('speaking');
      return true;
    },
    stop,
  };
}

export const narrationService = createNarrationService();

function getWebSpeechEnvironment(): {
  speechSynthesis: SpeechSynthesis;
  Utterance: typeof SpeechSynthesisUtterance;
} | null {
  if (
    typeof window === 'undefined' ||
    !('speechSynthesis' in window) ||
    typeof SpeechSynthesisUtterance === 'undefined'
  ) {
    return null;
  }

  return {
    speechSynthesis: window.speechSynthesis,
    Utterance: SpeechSynthesisUtterance,
  };
}
