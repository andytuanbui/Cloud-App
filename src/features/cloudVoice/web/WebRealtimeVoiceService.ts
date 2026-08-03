export const WEB_REALTIME_DATA_CHANNEL_LABEL = 'oai-events';
export const WEB_REALTIME_SESSION_ENDPOINT =
  '/api/cloud-voice/realtime-session';
export const WEB_REALTIME_REFLECTION_TOOL_NAME = 'save_wisdom_reflection';

export const WEB_REALTIME_REQUEST_HEADERS = {
  safetyIdentifier: 'X-CloudWise-Safety-Identifier',
  wisdomId: 'X-CloudWise-Wisdom-Id',
  sceneId: 'X-CloudWise-Scene-Id',
  ageBand: 'X-CloudWise-Age-Band',
  maxTurns: 'X-CloudWise-Max-Turns',
  context: 'X-CloudWise-Context',
} as const;

const DEFAULT_MAX_CLOUD_TURNS = 6;
const DEFAULT_CONNECTION_TIMEOUT_MS = 15_000;
const MAX_CONTEXT_HEADER_CHARACTERS = 8 * 1024;
const MAX_SDP_CHARACTERS = 1_000_000;
const COMPACT_IDENTIFIER_PATTERN = /^[A-Za-z0-9._:-]+$/;
const OPAQUE_SAFETY_IDENTIFIER_PATTERN = /^[A-Za-z0-9_-]{20,128}$/;

export type WebRealtimeVoiceState =
  | 'idle'
  | 'requestingPermission'
  | 'connecting'
  | 'listening'
  | 'childSpeaking'
  | 'thinking'
  | 'cloudSpeaking'
  | 'muted'
  | 'ending'
  | 'ended'
  | 'error'
  | 'unavailable';

export type WebRealtimeTranscriptRole = 'child' | 'cloud';

export type WebRealtimeTranscriptUpdate = {
  itemId: string;
  role: WebRealtimeTranscriptRole;
  text: string;
  final: boolean;
};

export type WebRealtimeVoiceErrorCode =
  | 'unavailable'
  | 'invalid-configuration'
  | 'permission-denied'
  | 'microphone-failed'
  | 'session-request-failed'
  | 'connection-failed'
  | 'playback-blocked'
  | 'protocol-error'
  | 'tool-error';

export type WebRealtimeVoiceError = {
  code: WebRealtimeVoiceErrorCode;
  message: string;
  recoverable: boolean;
};

export type WebRealtimeInterruption = {
  responseId?: string;
  reason: 'turn_detected' | 'client_cancelled' | 'cancelled';
};

/**
 * This is intentionally an allowlist rather than an open record. In
 * particular, childFirstName is not accepted or encoded into request headers.
 */
export type WebRealtimeWisdomContext = {
  wisdomTitle: string;
  storySummary: string;
  currentStoryScene: string;
  reflectionGoal: string;
  childAgeBand: string;
  previousAnswer?: string;
  moneyDecision?: string;
  takeaway?: string;
  maximumConversationTurns?: number;
  maximumDurationSeconds?: number;
  authoredChoiceIds?: readonly string[];
};

export type WebRealtimeToolValidation =
  | { ok: true; value: unknown }
  | { ok: false; message: string };

export type WebRealtimeValidatedToolCall = {
  callId: string;
  name: string;
  arguments: unknown;
};

/** The handler is invoked only after its validator returns an accepted value. */
export type WebRealtimeToolHandler = {
  validate: (rawArguments: unknown) => WebRealtimeToolValidation;
  onCall: (call: WebRealtimeValidatedToolCall) => unknown | Promise<unknown>;
  createResponseAfterOutput?: boolean;
};

export type WebRealtimeVoiceCallbacks = {
  onStateChange?: (state: WebRealtimeVoiceState) => void;
  onVadChange?: (speaking: boolean, itemId?: string) => void;
  onThinkingChange?: (thinking: boolean, responseId?: string) => void;
  onPlaybackChange?: (playing: boolean, responseId?: string) => void;
  onTranscript?: (update: WebRealtimeTranscriptUpdate) => void;
  onValidatedToolCall?: (call: WebRealtimeValidatedToolCall) => void;
  onInterruption?: (interruption: WebRealtimeInterruption) => void;
  onMutedChange?: (muted: boolean) => void;
  onCloudTurn?: (turns: number, maximumTurns: number) => void;
  onMaxTurnsReached?: (turns: number) => void;
  onError?: (error: WebRealtimeVoiceError) => void;
  onEnded?: (reason: WebRealtimeEndReason) => void;
};

export type WebRealtimeEndReason =
  | 'user'
  | 'max-turns'
  | 'screen-exit'
  | 'connection-closed'
  | 'error'
  | 'disposed';

export type WebRealtimeEnvironment = {
  fetch: typeof fetch;
  getUserMedia: (
    constraints: MediaStreamConstraints,
  ) => Promise<MediaStream>;
  createPeerConnection: (configuration?: RTCConfiguration) => RTCPeerConnection;
  createMediaStream: () => MediaStream;
  createAudioElement: () => HTMLAudioElement;
  attachOwnedAudioElement: (audio: HTMLAudioElement) => () => void;
  createAbortController: () => AbortController;
  encodeBase64UrlUtf8: (value: string) => string;
  setTimeout: (callback: () => void, delayMs: number) => number;
  clearTimeout: (handle: number) => void;
};

export type WebRealtimeVoiceServiceOptions = {
  safetyIdentifier: string;
  wisdomId: string;
  sceneId: string;
  context: WebRealtimeWisdomContext;
  endpoint?: string;
  maxCloudTurns?: number;
  connectionTimeoutMs?: number;
  rtcConfiguration?: RTCConfiguration;
  audioElement?: HTMLAudioElement;
  callbacks?: WebRealtimeVoiceCallbacks;
  toolHandlers?: Readonly<Record<string, WebRealtimeToolHandler>>;
  /** Dependency injection is intended for offline tests only. */
  environment?: WebRealtimeEnvironment;
};

type TranscriptAssembly = {
  role: WebRealtimeTranscriptRole;
  text: string;
  final: boolean;
};

type RealtimeRecord = Record<string, unknown>;

export function isValidOpaqueSafetyIdentifier(value: string): boolean {
  return OPAQUE_SAFETY_IDENTIFIER_PATTERN.test(value);
}

export function isWebRealtimeVoiceSupported(): boolean {
  return createBrowserWebRealtimeEnvironment() !== null;
}

/**
 * Single-use browser WebRTC transport for an OpenAI Realtime session.
 * startFromUserGesture must be called directly from a click/press handler so
 * microphone permission and remote autoplay are both tied to user intent.
 */
export class WebRealtimeVoiceService {
  readonly supported: boolean;

  private readonly options: WebRealtimeVoiceServiceOptions;
  private readonly callbacks: WebRealtimeVoiceCallbacks;
  private readonly environment: WebRealtimeEnvironment | null;
  private readonly maximumTurns: number;
  private state: WebRealtimeVoiceState;
  private peerConnection?: RTCPeerConnection;
  private eventChannel?: RTCDataChannel;
  private localStream?: MediaStream;
  private remoteStream?: MediaStream;
  private audioElement?: HTMLAudioElement;
  private detachOwnedAudioElement?: () => void;
  private abortController?: AbortController;
  private connectionTimeoutHandle?: number;
  private started = false;
  private endRequested = false;
  private endPromise?: Promise<void>;
  private muted = false;
  private childSpeaking = false;
  private playbackActive = false;
  private activeResponseId?: string;
  private cloudTurns = 0;
  private readonly transcriptsByItem = new Map<string, TranscriptAssembly>();
  private readonly handledToolCallIds = new Set<string>();
  private readonly countedResponseIds = new Set<string>();
  private readonly completedResponseIds = new Set<string>();
  private readonly spokenResponseIds = new Set<string>();

  constructor(options: WebRealtimeVoiceServiceOptions) {
    this.options = options;
    this.callbacks = options.callbacks ?? {};
    this.environment = options.environment ?? createBrowserWebRealtimeEnvironment();
    this.supported = this.environment !== null;
    this.state = this.supported ? 'idle' : 'unavailable';
    this.maximumTurns = normalizeWholeNumber(
      options.maxCloudTurns ?? options.context.maximumConversationTurns,
      1,
      12,
      DEFAULT_MAX_CLOUD_TURNS,
    );
  }

  getState(): WebRealtimeVoiceState {
    return this.state;
  }

  isMuted(): boolean {
    return this.muted;
  }

  getCloudTurnCount(): number {
    return this.cloudTurns;
  }

  /** Invoke this method synchronously from the child's explicit UI action. */
  async startFromUserGesture(): Promise<void> {
    if (this.started) {
      throw new Error('A Web Realtime voice service instance can only start once.');
    }
    this.started = true;

    if (!this.environment) {
      const error = createVoiceError(
        'unavailable',
        'Live voice is unavailable in this browser. Continue by typing.',
        true,
      );
      this.setState('unavailable');
      this.callbacks.onError?.(error);
      throw new Error(error.message);
    }

    let requestHeaders: Record<string, string>;
    try {
      requestHeaders = buildSessionRequestHeaders(
        this.options,
        this.maximumTurns,
        this.environment.encodeBase64UrlUtf8,
      );
      validateEndpoint(this.options.endpoint ?? WEB_REALTIME_SESSION_ENDPOINT);
    } catch (cause) {
      const error = createVoiceError(
        'invalid-configuration',
        errorMessage(cause, 'Voice session configuration is invalid.'),
        true,
      );
      this.setState('error');
      this.callbacks.onError?.(error);
      throw cause;
    }

    this.setState('requestingPermission');
    try {
      // Keep this as the first asynchronous browser operation so the permission
      // prompt remains attributable to the click/press that called this method.
      const stream = await this.environment.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });
      if (this.endRequested) {
        stopMediaStream(stream);
        return;
      }
      this.localStream = stream;
      this.setState('connecting');
      await this.connect(requestHeaders);
    } catch (cause) {
      if (this.endRequested) return;
      const permissionDenied = isPermissionDeniedError(cause);
      const code: WebRealtimeVoiceErrorCode = permissionDenied
        ? 'permission-denied'
        : this.localStream
          ? 'connection-failed'
          : 'microphone-failed';
      const fallbackMessage = permissionDenied
        ? 'Microphone permission was not granted. Continue by typing.'
        : this.localStream
          ? 'Cloud could not connect. Continue by typing.'
          : 'The microphone could not be started. Continue by typing.';
      const error = createVoiceError(
        code,
        errorMessage(cause, fallbackMessage),
        true,
      );
      this.releaseResources();
      this.setState('error');
      this.callbacks.onError?.(error);
      throw cause;
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    this.localStream?.getAudioTracks().forEach((track) => {
      track.enabled = !muted;
    });
    if (muted && this.childSpeaking) {
      this.childSpeaking = false;
      this.callbacks.onVadChange?.(false);
    }
    this.callbacks.onMutedChange?.(muted);
    if (!this.isTerminalState()) {
      this.setState(muted ? 'muted' : this.deriveActiveState());
    }
  }

  /** Cancels an active model response and clears audio only while it is playing. */
  interrupt(responseId = this.activeResponseId): void {
    if (!this.isEventChannelOpen()) return;
    if (this.activeResponseId && responseId === this.activeResponseId) {
      this.sendClientEvent({
        type: 'response.cancel',
        response_id: this.activeResponseId,
      });
    }
    if (this.playbackActive) {
      this.sendClientEvent({ type: 'output_audio_buffer.clear' });
    }
  }

  /** Requests one response using a short, locally-authored instruction only. */
  requestResponse(instructions: string): void {
    const boundedInstructions = requireBoundedText(
      instructions,
      'response instructions',
      600,
    );
    this.sendClientEvent({
      type: 'response.create',
      response: { instructions: boundedInstructions },
    });
    this.markThinking();
  }

  /**
   * Used by Finish Talking when the model has not called the reflection tool
   * on its own. The specific function choice prevents another open-ended turn.
   */
  requestStructuredReflection(): void {
    this.sendClientEvent({
      type: 'response.create',
      response: {
        instructions:
          `Finish the conversation now. Briefly acknowledge the child, then ` +
          `call ${WEB_REALTIME_REFLECTION_TOOL_NAME} with the short structured ` +
          'reflection. Do not ask another question.',
        tool_choice: {
          type: 'function',
          name: WEB_REALTIME_REFLECTION_TOOL_NAME,
        },
      },
    });
    this.markThinking();
  }

  private markThinking(): void {
    this.callbacks.onThinkingChange?.(true);
    this.setState(this.muted ? 'muted' : 'thinking');
  }

  sendFunctionCallOutput(
    callId: string,
    output: unknown,
    createResponse = true,
  ): void {
    assertCompactIdentifier('tool call id', callId, 128);
    this.sendClientEvent({
      type: 'conversation.item.create',
      item: {
        type: 'function_call_output',
        call_id: callId,
        output: JSON.stringify(output ?? null),
      },
    });
    if (createResponse) this.sendClientEvent({ type: 'response.create' });
  }

  async end(reason: WebRealtimeEndReason = 'user'): Promise<void> {
    if (this.endPromise) return this.endPromise;
    if (this.state === 'ended') return;

    this.endRequested = true;
    if (this.state !== 'unavailable') this.setState('ending');
    this.endPromise = Promise.resolve().then(() => {
      this.releaseResources();
      this.setState('ended');
      this.callbacks.onEnded?.(reason);
    });
    return this.endPromise;
  }

  dispose(): Promise<void> {
    return this.end('disposed');
  }

  /** Releases microphone/WebRTC resources while leaving the visible state as error. */
  teardownAfterError(): void {
    if (this.state === 'ended') return;
    this.endRequested = true;
    this.releaseResources();
    this.setState('error');
  }

  private async connect(requestHeaders: Record<string, string>): Promise<void> {
    const environment = this.requireEnvironment();
    const peerConnection = environment.createPeerConnection(
      this.options.rtcConfiguration,
    );
    this.peerConnection = peerConnection;
    this.installPeerConnectionHandlers(peerConnection);

    this.audioElement = this.options.audioElement ?? environment.createAudioElement();
    this.configureAudioElement(this.audioElement, !this.options.audioElement);

    this.localStream?.getTracks().forEach((track) => {
      peerConnection.addTrack(track, this.localStream as MediaStream);
    });

    const channel = peerConnection.createDataChannel(
      WEB_REALTIME_DATA_CHANNEL_LABEL,
    );
    this.eventChannel = channel;
    this.installDataChannelHandlers(channel);

    this.abortController = environment.createAbortController();
    const timeoutMs = normalizeWholeNumber(
      this.options.connectionTimeoutMs,
      3_000,
      60_000,
      DEFAULT_CONNECTION_TIMEOUT_MS,
    );
    let connectionTimedOut = false;
    this.connectionTimeoutHandle = environment.setTimeout(() => {
      connectionTimedOut = true;
      this.abortController?.abort();
    }, timeoutMs);

    const offer = await peerConnection.createOffer();
    if (!offer.sdp) throw new Error('The browser did not create an SDP offer.');
    await peerConnection.setLocalDescription(offer);
    if (this.endRequested) return;

    let response: Response;
    try {
      response = await environment.fetch(
        this.options.endpoint ?? WEB_REALTIME_SESSION_ENDPOINT,
        {
          method: 'POST',
          headers: requestHeaders,
          body: offer.sdp,
          signal: this.abortController.signal,
        },
      );
    } catch (cause) {
      if (connectionTimedOut) {
        throw new Error('Cloud voice connection timed out. Continue by typing.');
      }
      throw cause;
    }

    if (!response.ok) {
      throw new Error(
        `Cloud voice session request failed with status ${response.status}.`,
      );
    }
    const answerSdp = await response.text();
    if (!isValidSdp(answerSdp)) {
      throw new Error('Cloud voice returned an invalid SDP answer.');
    }
    if (this.endRequested) return;

    await peerConnection.setRemoteDescription({
      type: 'answer',
      sdp: answerSdp,
    });
    try {
      await waitForDataChannelOpen(
        channel,
        this.abortController.signal,
        timeoutMs,
        environment,
      );
    } catch (cause) {
      if (connectionTimedOut) {
        throw new Error('Cloud voice connection timed out. Continue by typing.');
      }
      throw cause;
    }
    this.clearConnectionTimeout();
  }

  private installPeerConnectionHandlers(peerConnection: RTCPeerConnection): void {
    peerConnection.ontrack = (event) => {
      if (this.endRequested) {
        event.track.stop();
        return;
      }
      const environment = this.requireEnvironment();
      const suppliedStream = event.streams[0];
      if (suppliedStream) {
        this.remoteStream = suppliedStream;
      } else {
        this.remoteStream ??= environment.createMediaStream();
        this.remoteStream.addTrack(event.track);
      }
      if (!this.audioElement) return;
      this.audioElement.srcObject = this.remoteStream;
      const playResult = this.audioElement.play();
      void playResult.catch(() => {
        if (this.endRequested) return;
        const error = createVoiceError(
          'playback-blocked',
          'Cloud audio could not start. Continue by typing.',
          true,
        );
        this.callbacks.onError?.(error);
      });
    };

    peerConnection.onconnectionstatechange = () => {
      if (this.endRequested) return;
      if (peerConnection.connectionState === 'failed') {
        this.failUnexpected(
          createVoiceError(
            'connection-failed',
            'Cloud lost the voice connection. Continue by typing.',
            true,
          ),
        );
      }
    };
  }

  private installDataChannelHandlers(channel: RTCDataChannel): void {
    channel.onopen = () => {
      if (this.endRequested) return;
      this.clearConnectionTimeout();
      this.setState(this.muted ? 'muted' : 'listening');
    };
    channel.onmessage = (message) => this.handleServerMessage(message.data);
    channel.onerror = () => {
      if (this.endRequested) return;
      this.failUnexpected(
        createVoiceError(
          'connection-failed',
          'Cloud lost the voice connection. Continue by typing.',
          true,
        ),
      );
    };
    channel.onclose = () => {
      if (this.endRequested || this.isTerminalState()) return;
      this.failUnexpected(
        createVoiceError(
          'connection-failed',
          'Cloud closed the voice connection. Continue by typing.',
          true,
        ),
      );
    };
  }

  private handleServerMessage(data: unknown): void {
    if (typeof data !== 'string') return;
    let event: RealtimeRecord;
    try {
      const parsed: unknown = JSON.parse(data);
      if (!isRecord(parsed)) throw new Error('Expected an event object.');
      event = parsed;
    } catch {
      this.callbacks.onError?.(
        createVoiceError(
          'protocol-error',
          'Cloud sent an unreadable voice event.',
          true,
        ),
      );
      return;
    }

    const eventType = readString(event, 'type');
    switch (eventType) {
      case 'input_audio_buffer.speech_started': {
        this.childSpeaking = true;
        const itemId = readOptionalString(event, 'item_id');
        this.callbacks.onVadChange?.(true, itemId);
        this.setState('childSpeaking');
        break;
      }
      case 'input_audio_buffer.speech_stopped': {
        this.childSpeaking = false;
        const itemId = readOptionalString(event, 'item_id');
        this.callbacks.onVadChange?.(false, itemId);
        this.callbacks.onThinkingChange?.(true);
        this.setState(this.muted ? 'muted' : 'thinking');
        break;
      }
      case 'conversation.item.input_audio_transcription.delta':
        this.applyTranscriptDelta(event, 'child');
        break;
      case 'conversation.item.input_audio_transcription.completed':
        this.completeTranscript(event, 'child');
        break;
      case 'conversation.item.input_audio_transcription.failed':
        this.callbacks.onError?.(
          createVoiceError(
            'protocol-error',
            'Cloud could not transcribe that turn. Please try again.',
            true,
          ),
        );
        break;
      case 'response.created': {
        const response = readRecord(event, 'response');
        this.activeResponseId = response
          ? readOptionalString(response, 'id')
          : undefined;
        this.callbacks.onThinkingChange?.(true, this.activeResponseId);
        if (!this.childSpeaking) {
          this.setState(this.muted ? 'muted' : 'thinking');
        }
        break;
      }
      case 'response.output_audio_transcript.delta':
        this.markSpokenResponse(event);
        this.applyTranscriptDelta(event, 'cloud');
        break;
      case 'response.output_audio_transcript.done':
        this.markSpokenResponse(event);
        this.completeTranscript(event, 'cloud');
        break;
      case 'output_audio_buffer.started': {
        this.playbackActive = true;
        const responseId = readOptionalString(event, 'response_id');
        if (responseId) this.markSpokenResponseId(responseId);
        this.activeResponseId = responseId ?? this.activeResponseId;
        this.callbacks.onThinkingChange?.(false, responseId);
        this.callbacks.onPlaybackChange?.(true, responseId);
        this.setState(this.muted ? 'muted' : 'cloudSpeaking');
        break;
      }
      case 'output_audio_buffer.stopped':
      case 'output_audio_buffer.cleared': {
        this.playbackActive = false;
        const responseId = readOptionalString(event, 'response_id');
        this.callbacks.onPlaybackChange?.(false, responseId);
        if (eventType === 'output_audio_buffer.cleared') {
          this.callbacks.onThinkingChange?.(!this.childSpeaking, responseId);
        }
        this.setState(this.deriveActiveState());
        break;
      }
      case 'response.function_call_arguments.done':
        void this.handleToolCall(event);
        break;
      case 'response.done':
        this.handleResponseDone(event);
        break;
      case 'error':
        this.callbacks.onError?.(
          createVoiceError(
            'protocol-error',
            'Cloud reported a voice session error. Continue by typing.',
            true,
          ),
        );
        break;
    }
  }

  private applyTranscriptDelta(
    event: RealtimeRecord,
    role: WebRealtimeTranscriptRole,
  ): void {
    const itemId = readOptionalString(event, 'item_id');
    const delta = readOptionalString(event, 'delta');
    if (!itemId || delta === undefined) return;
    const existing = this.transcriptsByItem.get(itemId);
    const text = `${existing?.role === role ? existing.text : ''}${delta}`;
    const update = { role, text, final: false } satisfies TranscriptAssembly;
    this.transcriptsByItem.set(itemId, update);
    this.callbacks.onTranscript?.({ itemId, ...update });
  }

  private completeTranscript(
    event: RealtimeRecord,
    role: WebRealtimeTranscriptRole,
  ): void {
    const itemId = readOptionalString(event, 'item_id');
    if (!itemId) return;
    const existing = this.transcriptsByItem.get(itemId);
    const transcript = readOptionalString(event, 'transcript');
    const text = transcript ?? (existing?.role === role ? existing.text : '');
    const update = { role, text, final: true } satisfies TranscriptAssembly;
    this.transcriptsByItem.set(itemId, update);
    this.callbacks.onTranscript?.({ itemId, ...update });
  }

  private handleResponseDone(event: RealtimeRecord): void {
    const response = readRecord(event, 'response');
    if (!response) return;
    const responseId = readOptionalString(response, 'id');
    const status = readOptionalString(response, 'status');
    const statusDetails = readRecord(response, 'status_details');
    const reason = statusDetails
      ? readOptionalString(statusDetails, 'reason')
      : undefined;

    const output = response.output;
    if (Array.isArray(output)) {
      for (const item of output) {
        if (isRecord(item) && readOptionalString(item, 'type') === 'function_call') {
          void this.handleToolCall(item);
        }
      }
    }

    this.callbacks.onThinkingChange?.(false, responseId);
    if (status === 'cancelled') {
      this.callbacks.onInterruption?.({
        responseId,
        reason:
          reason === 'turn_detected' || reason === 'client_cancelled'
            ? reason
            : 'cancelled',
      });
    } else if (status === 'completed' && responseId) {
      this.completedResponseIds.add(responseId);
      this.countCompletedSpokenResponse(responseId);
    }

    if (responseId === this.activeResponseId) this.activeResponseId = undefined;
    if (!this.playbackActive) this.setState(this.deriveActiveState());
  }

  private markSpokenResponse(event: RealtimeRecord): void {
    const responseId = readOptionalString(event, 'response_id');
    if (responseId) this.markSpokenResponseId(responseId);
  }

  private markSpokenResponseId(responseId: string): void {
    this.spokenResponseIds.add(responseId);
    this.countCompletedSpokenResponse(responseId);
  }

  private countCompletedSpokenResponse(responseId: string): void {
    if (
      !this.completedResponseIds.has(responseId) ||
      !this.spokenResponseIds.has(responseId) ||
      this.countedResponseIds.has(responseId)
    ) {
      return;
    }
    this.countedResponseIds.add(responseId);
    this.cloudTurns += 1;
    this.callbacks.onCloudTurn?.(this.cloudTurns, this.maximumTurns);
    if (this.cloudTurns >= this.maximumTurns) {
      this.callbacks.onMaxTurnsReached?.(this.cloudTurns);
    }
  }

  private async handleToolCall(event: RealtimeRecord): Promise<void> {
    const callId = readOptionalString(event, 'call_id');
    const name = readOptionalString(event, 'name');
    const serializedArguments = readOptionalString(event, 'arguments');
    if (!callId || !name || serializedArguments === undefined) return;
    if (this.handledToolCallIds.has(callId)) return;
    this.handledToolCallIds.add(callId);

    const handler = this.options.toolHandlers?.[name];
    if (!handler) {
      this.sendToolFailure(callId, 'unsupported_tool', 'Tool is not supported.');
      return;
    }

    let rawArguments: unknown;
    try {
      rawArguments = JSON.parse(serializedArguments);
    } catch {
      this.sendToolFailure(callId, 'invalid_json', 'Tool arguments were not JSON.');
      return;
    }

    let validation: WebRealtimeToolValidation;
    try {
      validation = handler.validate(rawArguments);
    } catch {
      this.sendToolFailure(
        callId,
        'invalid_arguments',
        'Tool arguments failed validation.',
      );
      return;
    }
    if (!validation.ok) {
      this.sendToolFailure(
        callId,
        'invalid_arguments',
        validation.message.slice(0, 240),
      );
      return;
    }

    const call: WebRealtimeValidatedToolCall = {
      callId,
      name,
      arguments: validation.value,
    };
    this.callbacks.onValidatedToolCall?.(call);
    try {
      const output = await handler.onCall(call);
      if (!this.endRequested && this.isEventChannelOpen()) {
        this.sendFunctionCallOutput(
          callId,
          output,
          handler.createResponseAfterOutput ?? true,
        );
      }
    } catch {
      this.sendToolFailure(callId, 'tool_failed', 'Tool execution failed.');
    }
  }

  private sendToolFailure(callId: string, code: string, message: string): void {
    this.callbacks.onError?.(
      createVoiceError('tool-error', message, true),
    );
    if (!this.isEventChannelOpen()) return;
    this.sendFunctionCallOutput(
      callId,
      { ok: false, error: { code, message } },
      true,
    );
  }

  private sendClientEvent(event: RealtimeRecord): void {
    if (!this.eventChannel || this.eventChannel.readyState !== 'open') {
      throw new Error('The Realtime event channel is not open.');
    }
    this.eventChannel.send(JSON.stringify(event));
  }

  private configureAudioElement(audio: HTMLAudioElement, owned: boolean): void {
    audio.autoplay = true;
    audio.setAttribute('playsinline', 'true');
    audio.preload = 'auto';
    audio.muted = false;
    if (owned) {
      audio.hidden = true;
      audio.setAttribute('aria-hidden', 'true');
      this.detachOwnedAudioElement =
        this.requireEnvironment().attachOwnedAudioElement(audio);
    }
  }

  private deriveActiveState(): WebRealtimeVoiceState {
    if (this.childSpeaking) return 'childSpeaking';
    if (this.playbackActive) return 'cloudSpeaking';
    if (this.muted) return 'muted';
    return this.activeResponseId ? 'thinking' : 'listening';
  }

  private failUnexpected(error: WebRealtimeVoiceError): void {
    if (this.endRequested || this.isTerminalState()) return;
    this.endRequested = true;
    this.releaseResources();
    this.setState('error');
    this.callbacks.onError?.(error);
  }

  private releaseResources(): void {
    this.clearConnectionTimeout();
    this.abortController?.abort();
    this.abortController = undefined;

    if (this.eventChannel) {
      this.eventChannel.onopen = null;
      this.eventChannel.onmessage = null;
      this.eventChannel.onerror = null;
      this.eventChannel.onclose = null;
      if (this.eventChannel.readyState !== 'closed') this.eventChannel.close();
      this.eventChannel = undefined;
    }

    if (this.peerConnection) {
      this.peerConnection.ontrack = null;
      this.peerConnection.onconnectionstatechange = null;
      if (this.peerConnection.connectionState !== 'closed') {
        this.peerConnection.close();
      }
      this.peerConnection = undefined;
    }

    stopMediaStream(this.localStream);
    stopMediaStream(this.remoteStream);
    this.localStream = undefined;
    this.remoteStream = undefined;

    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.srcObject = null;
      this.audioElement.removeAttribute('src');
      this.audioElement = undefined;
    }
    this.detachOwnedAudioElement?.();
    this.detachOwnedAudioElement = undefined;

    this.transcriptsByItem.clear();
    this.handledToolCallIds.clear();
    this.countedResponseIds.clear();
    this.completedResponseIds.clear();
    this.spokenResponseIds.clear();
    this.activeResponseId = undefined;
    this.childSpeaking = false;
    this.playbackActive = false;
  }

  private clearConnectionTimeout(): void {
    if (this.connectionTimeoutHandle === undefined || !this.environment) return;
    this.environment.clearTimeout(this.connectionTimeoutHandle);
    this.connectionTimeoutHandle = undefined;
  }

  private isEventChannelOpen(): boolean {
    return this.eventChannel?.readyState === 'open';
  }

  private isTerminalState(): boolean {
    return ['ending', 'ended', 'error', 'unavailable'].includes(this.state);
  }

  private setState(nextState: WebRealtimeVoiceState): void {
    if (this.state === nextState) return;
    this.state = nextState;
    this.callbacks.onStateChange?.(nextState);
  }

  private requireEnvironment(): WebRealtimeEnvironment {
    if (!this.environment) throw new Error('Web Realtime voice is unavailable.');
    return this.environment;
  }
}

export function buildSessionRequestHeaders(
  options: Pick<
    WebRealtimeVoiceServiceOptions,
    'safetyIdentifier' | 'wisdomId' | 'sceneId' | 'context'
  >,
  maximumTurns = normalizeWholeNumber(
    options.context.maximumConversationTurns,
    1,
    12,
    DEFAULT_MAX_CLOUD_TURNS,
  ),
  encodeContext = encodeBase64UrlUtf8,
): Record<string, string> {
  if (!isValidOpaqueSafetyIdentifier(options.safetyIdentifier)) {
    throw new Error(
      'Safety identifier must be a 20-128 character opaque base64url value.',
    );
  }
  assertCompactIdentifier('wisdom id', options.wisdomId, 96);
  assertCompactIdentifier('scene id', options.sceneId, 96);
  assertCompactIdentifier('age band', options.context.childAgeBand, 32);

  const normalizedMaximumTurns = normalizeWholeNumber(
    maximumTurns,
    1,
    12,
    DEFAULT_MAX_CLOUD_TURNS,
  );

  const encodedContext = encodeAllowlistedContext(options.context, encodeContext);
  if (encodedContext.length > MAX_CONTEXT_HEADER_CHARACTERS) {
    throw new Error('Voice context exceeds the 8 KiB request-header limit.');
  }

  return {
    Accept: 'application/sdp',
    'Content-Type': 'application/sdp',
    [WEB_REALTIME_REQUEST_HEADERS.safetyIdentifier]: options.safetyIdentifier,
    [WEB_REALTIME_REQUEST_HEADERS.wisdomId]: options.wisdomId,
    [WEB_REALTIME_REQUEST_HEADERS.sceneId]: options.sceneId,
    [WEB_REALTIME_REQUEST_HEADERS.ageBand]: options.context.childAgeBand,
    [WEB_REALTIME_REQUEST_HEADERS.maxTurns]: String(normalizedMaximumTurns),
    [WEB_REALTIME_REQUEST_HEADERS.context]: encodedContext,
  };
}

function encodeAllowlistedContext(
  context: WebRealtimeWisdomContext,
  encodeContext: (value: string) => string,
): string {
  const allowlistedContext = {
    wisdomTitle: requireBoundedText(context.wisdomTitle, 'wisdom title', 160),
    storySummary: requireBoundedText(context.storySummary, 'story summary', 1_200),
    currentStoryScene: requireBoundedText(
      context.currentStoryScene,
      'current story scene',
      2_400,
    ),
    reflectionGoal: requireBoundedText(
      context.reflectionGoal,
      'reflection goal',
      600,
    ),
    childAgeBand: context.childAgeBand,
    ...(context.previousAnswer
      ? {
          previousAnswer: requireBoundedText(
            context.previousAnswer,
            'previous answer',
            600,
          ),
        }
      : {}),
    ...(context.moneyDecision
      ? {
          moneyDecision: requireBoundedText(
            context.moneyDecision,
            'money decision',
            800,
          ),
        }
      : {}),
    ...(context.takeaway
      ? { takeaway: requireBoundedText(context.takeaway, 'takeaway', 600) }
      : {}),
    ...(context.maximumConversationTurns !== undefined
      ? {
          maximumConversationTurns: normalizeWholeNumber(
            context.maximumConversationTurns,
            1,
            12,
            DEFAULT_MAX_CLOUD_TURNS,
          ),
        }
      : {}),
    ...(context.maximumDurationSeconds !== undefined
      ? {
          maximumDurationSeconds: normalizeWholeNumber(
            context.maximumDurationSeconds,
            15,
            15 * 60,
            3 * 60,
          ),
        }
      : {}),
    ...(context.authoredChoiceIds
      ? {
          authoredChoiceIds: context.authoredChoiceIds.slice(0, 24).map((id) => {
            assertCompactIdentifier('authored choice id', id, 96);
            return id;
          }),
        }
      : {}),
  };
  return encodeContext(JSON.stringify(allowlistedContext));
}

function createBrowserWebRealtimeEnvironment(): WebRealtimeEnvironment | null {
  if (
    typeof window === 'undefined' ||
    typeof document === 'undefined' ||
    typeof navigator === 'undefined' ||
    !navigator.mediaDevices?.getUserMedia ||
    typeof window.RTCPeerConnection !== 'function' ||
    typeof window.MediaStream !== 'function' ||
    typeof window.fetch !== 'function' ||
    typeof window.AbortController !== 'function' ||
    typeof window.TextEncoder !== 'function' ||
    typeof window.btoa !== 'function'
  ) {
    return null;
  }

  return {
    fetch: window.fetch.bind(window),
    getUserMedia: navigator.mediaDevices.getUserMedia.bind(
      navigator.mediaDevices,
    ),
    createPeerConnection: (configuration) =>
      new window.RTCPeerConnection(configuration),
    createMediaStream: () => new window.MediaStream(),
    createAudioElement: () => document.createElement('audio'),
    attachOwnedAudioElement: (audio) => {
      document.body?.appendChild(audio);
      return () => audio.remove();
    },
    createAbortController: () => new window.AbortController(),
    encodeBase64UrlUtf8,
    setTimeout: (callback, delayMs) => window.setTimeout(callback, delayMs),
    clearTimeout: (handle) => window.clearTimeout(handle),
  };
}

function encodeBase64UrlUtf8(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function validateEndpoint(endpoint: string): void {
  if (!endpoint || endpoint.length > 2_048 || /[\r\n]/.test(endpoint)) {
    throw new Error('Voice session endpoint is invalid.');
  }
  const base = typeof window === 'undefined' ? 'https://localhost' : window.location.href;
  const parsed = new URL(endpoint, base);
  if (
    !['http:', 'https:'].includes(parsed.protocol) ||
    parsed.username ||
    parsed.password
  ) {
    throw new Error('Voice session endpoint must be an HTTP(S) URL.');
  }
}

function assertCompactIdentifier(
  label: string,
  value: string,
  maximumLength: number,
): void {
  if (
    !value ||
    value.length > maximumLength ||
    !COMPACT_IDENTIFIER_PATTERN.test(value)
  ) {
    throw new Error(`${label} is not a compact identifier.`);
  }
}

function requireBoundedText(
  value: string,
  label: string,
  maximumLength: number,
): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (!normalized) throw new Error(`${label} cannot be empty.`);
  if (normalized.length > maximumLength) {
    throw new Error(`${label} exceeds its voice-context limit.`);
  }
  return normalized;
}

function normalizeWholeNumber(
  value: number | undefined,
  minimum: number,
  maximum: number,
  fallback: number,
): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(maximum, Math.max(minimum, Math.floor(value)));
}

function isValidSdp(value: string): boolean {
  return (
    value.length > 0 &&
    value.length <= MAX_SDP_CHARACTERS &&
    value.trimStart().startsWith('v=0')
  );
}

function stopMediaStream(stream?: MediaStream): void {
  stream?.getTracks().forEach((track) => track.stop());
}

function isRecord(value: unknown): value is RealtimeRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readRecord(record: RealtimeRecord, key: string): RealtimeRecord | undefined {
  const value = record[key];
  return isRecord(value) ? value : undefined;
}

function readString(record: RealtimeRecord, key: string): string {
  const value = record[key];
  return typeof value === 'string' ? value : '';
}

function readOptionalString(
  record: RealtimeRecord,
  key: string,
): string | undefined {
  const value = record[key];
  return typeof value === 'string' ? value : undefined;
}

function createVoiceError(
  code: WebRealtimeVoiceErrorCode,
  message: string,
  recoverable: boolean,
): WebRealtimeVoiceError {
  return { code, message, recoverable };
}

function errorMessage(cause: unknown, fallback: string): string {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}

function isPermissionDeniedError(cause: unknown): boolean {
  return (
    isRecord(cause) &&
    typeof cause.name === 'string' &&
    ['NotAllowedError', 'PermissionDeniedError', 'SecurityError'].includes(
      cause.name,
    )
  );
}

async function waitForDataChannelOpen(
  channel: RTCDataChannel,
  signal: AbortSignal,
  timeoutMs: number,
  environment: WebRealtimeEnvironment,
): Promise<void> {
  if (channel.readyState === 'open') return;
  await new Promise<void>((resolve, reject) => {
    const timeout = environment.setTimeout(() => {
      cleanup();
      reject(new Error('Realtime event channel did not open in time.'));
    }, timeoutMs);
    const handleOpen = () => {
      cleanup();
      resolve();
    };
    const handleClose = () => {
      cleanup();
      reject(new Error('Realtime event channel closed before opening.'));
    };
    const handleAbort = () => {
      cleanup();
      const error = new Error('Realtime connection was aborted.');
      error.name = 'AbortError';
      reject(error);
    };
    const cleanup = () => {
      environment.clearTimeout(timeout);
      channel.removeEventListener('open', handleOpen);
      channel.removeEventListener('close', handleClose);
      signal.removeEventListener('abort', handleAbort);
    };
    channel.addEventListener('open', handleOpen, { once: true });
    channel.addEventListener('close', handleClose, { once: true });
    signal.addEventListener('abort', handleAbort, { once: true });
  });
}
