import { cloudVoiceFlags } from '../features/cloudVoice/config/cloudVoiceFlags';
import { runNarrationProviderFallback } from './narrationProviderFallback';

export type NarrationState =
  | 'unavailable'
  | 'idle'
  | 'loading'
  | 'speaking'
  | 'paused';

export type NarrationProviderName = 'openai' | 'browser';

export type NarrationCallbacks = {
  cacheKey?: string;
  onStateChange?: (state: NarrationState) => void;
  onProviderUsed?: (provider: NarrationProviderName) => void;
  onComplete?: () => void;
  onError?: (message: string) => void;
};

export type NarrationService = {
  readonly supported: boolean;
  getState: () => NarrationState;
  getProvider: () => NarrationProviderName | null;
  read: (text: string, callbacks?: NarrationCallbacks) => Promise<boolean>;
  pause: () => boolean;
  resume: () => Promise<boolean>;
  stop: () => void;
  clearSessionCache: () => void;
  setSafetyIdentifier: (identifier: string | undefined) => void;
};

type ActiveNarration = {
  pause: () => boolean;
  resume: () => Promise<boolean>;
  stop: () => void;
};

const unavailableMessage = 'Narration is unavailable on this device.';

export const unsupportedNarrationService: NarrationService = {
  supported: false,
  getState: () => 'unavailable',
  getProvider: () => null,
  read: async (_text, callbacks) => {
    callbacks?.onStateChange?.('unavailable');
    callbacks?.onError?.(unavailableMessage);
    return false;
  },
  pause: () => false,
  resume: async () => false,
  stop: () => undefined,
  clearSessionCache: () => undefined,
  setSafetyIdentifier: () => undefined,
};

/**
 * Prefers server-side OpenAI Speech audio on web and falls back to the
 * browser's local speech engine. Generated audio is held only in this
 * in-memory, current-page cache.
 */
export function createNarrationService(): NarrationService {
  if (typeof window === 'undefined') return unsupportedNarrationService;

  const browserSpeech = getWebSpeechEnvironment();
  const canUseAi =
    cloudVoiceFlags.cloudVoiceEnabled &&
    cloudVoiceFlags.cloudAiNarrationEnabled &&
    typeof Audio !== 'undefined' &&
    typeof fetch !== 'undefined';
  if (!canUseAi && !browserSpeech) return unsupportedNarrationService;

  let state: NarrationState = 'idle';
  let provider: NarrationProviderName | null = null;
  let active: ActiveNarration | null = null;
  let requestRevision = 0;
  let activeCallbacks: NarrationCallbacks | undefined;
  let safetyIdentifier: string | undefined;
  const audioCache = new Map<string, { blob: Blob; url: string }>();

  const setState = (
    nextState: NarrationState,
    callbacks = activeCallbacks,
  ) => {
    state = nextState;
    callbacks?.onStateChange?.(nextState);
  };

  const stop = () => {
    requestRevision += 1;
    const callbacks = activeCallbacks;
    activeCallbacks = undefined;
    active?.stop();
    active = null;
    provider = null;
    setState('idle', callbacks);
  };

  const finish = (
    revision: number,
    callbacks: NarrationCallbacks | undefined,
  ) => {
    if (revision !== requestRevision) return;
    active = null;
    provider = null;
    activeCallbacks = undefined;
    setState('idle', callbacks);
    callbacks?.onComplete?.();
  };

  const fail = (
    revision: number,
    callbacks: NarrationCallbacks | undefined,
    error: unknown,
  ) => {
    if (revision !== requestRevision) return;
    active = null;
    provider = null;
    activeCallbacks = undefined;
    setState('idle', callbacks);
    callbacks?.onError?.(
      error instanceof Error ? error.message : 'Narration could not be started.',
    );
  };

  const playAudio = async (
    blob: Blob,
    revision: number,
    callbacks: NarrationCallbacks | undefined,
    cacheKey?: string,
  ): Promise<boolean> => {
    if (revision !== requestRevision) return false;
    const cached = cacheKey ? audioCache.get(cacheKey) : undefined;
    const url = cached?.blob === blob ? cached.url : URL.createObjectURL(blob);
    if (cacheKey && !cached) audioCache.set(cacheKey, { blob, url });

    const audio = new Audio(url);
    active = {
      pause: () => {
        if (audio.paused || audio.ended) return false;
        audio.pause();
        setState('paused', callbacks);
        return true;
      },
      resume: async () => {
        if (!audio.paused || audio.ended) return false;
        await audio.play();
        setState('speaking', callbacks);
        return true;
      },
      stop: () => {
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
        if (!cacheKey) URL.revokeObjectURL(url);
      },
    };
    audio.onended = () => finish(revision, callbacks);
    audio.onerror = () => fail(
      revision,
      callbacks,
      new Error('The generated narration audio could not be played.'),
    );
    await audio.play();
    if (revision !== requestRevision) return false;
    provider = 'openai';
    callbacks?.onProviderUsed?.('openai');
    setState('speaking', callbacks);
    return true;
  };

  const readWithAi = async (
    narrationText: string,
    revision: number,
    callbacks: NarrationCallbacks | undefined,
  ): Promise<boolean> => {
    const cached = callbacks?.cacheKey
      ? audioCache.get(callbacks.cacheKey)
      : undefined;
    if (cached) {
      return playAudio(
        cached.blob,
        revision,
        callbacks,
        callbacks?.cacheKey,
      );
    }

    const controller = new AbortController();
    active = {
      pause: () => false,
      resume: async () => false,
      stop: () => controller.abort(),
    };
    setState('loading', callbacks);
    const response = await fetch(
      `${cloudVoiceFlags.serverUrl}/api/cloud-voice/narration`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(safetyIdentifier
            ? { 'X-CloudWise-Safety-Identifier': safetyIdentifier }
            : {}),
        },
        body: JSON.stringify({ text: narrationText }),
        signal: controller.signal,
      },
    );
    if (!response.ok) {
      throw new Error(
        response.status === 503
          ? 'AI narration is not configured.'
          : 'AI narration is temporarily unavailable.',
      );
    }

    // Read the backend's streamed body incrementally. Playback uses a Blob for
    // broad Expo-web browser compatibility; the upstream is never buffered by
    // the server and the page can be upgraded to MediaSource behind this seam.
    const reader = response.body?.getReader();
    const chunks: Uint8Array[] = [];
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }
    } else {
      chunks.push(new Uint8Array(await response.arrayBuffer()));
    }
    if (revision !== requestRevision) return false;
    const contentType = response.headers.get('content-type') || 'audio/mpeg';
    return playAudio(
      new Blob(chunks as BlobPart[], { type: contentType }),
      revision,
      callbacks,
      callbacks?.cacheKey,
    );
  };

  const readWithBrowser = async (
    narrationText: string,
    revision: number,
    callbacks: NarrationCallbacks | undefined,
  ): Promise<boolean> => {
    if (!browserSpeech || revision !== requestRevision) return false;
    const { speechSynthesis, Utterance } = browserSpeech;
    const utterance = new Utterance(narrationText);
    utterance.rate = 0.92;
    active = {
      pause: () => {
        if (state !== 'speaking') return false;
        speechSynthesis.pause();
        setState('paused', callbacks);
        return true;
      },
      resume: async () => {
        if (state !== 'paused') return false;
        speechSynthesis.resume();
        setState('speaking', callbacks);
        return true;
      },
      stop: () => speechSynthesis.cancel(),
    };
    utterance.onend = () => finish(revision, callbacks);
    utterance.onerror = (event) => fail(
      revision,
      callbacks,
      new Error(
        event.error
          ? `Narration stopped: ${event.error}.`
          : 'Narration stopped unexpectedly.',
      ),
    );
    speechSynthesis.speak(utterance);
    provider = 'browser';
    callbacks?.onProviderUsed?.('browser');
    setState('speaking', callbacks);
    return true;
  };

  return {
    supported: true,
    getState: () => state,
    getProvider: () => provider,
    read: async (text, callbacks) => {
      const narrationText = text;
      if (!narrationText.trim()) {
        callbacks?.onError?.('Narration text cannot be empty.');
        return false;
      }
      if (state !== 'idle') stop();
      const revision = ++requestRevision;
      activeCallbacks = callbacks;

      const started = await runNarrationProviderFallback(
        canUseAi
          ? async () => readWithAi(narrationText, revision, callbacks)
          : undefined,
        browserSpeech
          ? async () => readWithBrowser(narrationText, revision, callbacks)
          : undefined,
      );
      if (!started && revision === requestRevision) {
        fail(revision, callbacks, new Error(unavailableMessage));
      }
      return started;
    },
    pause: () => active?.pause() ?? false,
    resume: async () => active?.resume() ?? false,
    stop,
    clearSessionCache: () => {
      stop();
      for (const value of audioCache.values()) URL.revokeObjectURL(value.url);
      audioCache.clear();
    },
    setSafetyIdentifier: (identifier) => {
      safetyIdentifier =
        identifier && /^[A-Za-z0-9_-]{20,128}$/.test(identifier)
          ? identifier
          : undefined;
    },
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
