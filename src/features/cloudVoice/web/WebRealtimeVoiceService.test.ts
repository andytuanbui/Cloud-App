import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type {
  CloudVoiceMachineEvent,
  CloudVoiceReflection,
  CloudVoiceSessionOptions,
} from '../core/types';
import { getCloudVoiceSafetyResponse } from '../core/safety';
import { WebCloudVoiceService } from './WebCloudVoiceService';
import {
  WEB_REALTIME_DATA_CHANNEL_LABEL,
  WEB_REALTIME_REFLECTION_TOOL_NAME,
  WEB_REALTIME_REQUEST_HEADERS,
  WEB_REALTIME_SESSION_ENDPOINT,
  WebRealtimeVoiceService,
  type WebRealtimeEnvironment,
  type WebRealtimeVoiceError,
  type WebRealtimeVoiceServiceOptions,
  type WebRealtimeVoiceState,
} from './WebRealtimeVoiceService';

const VALID_SAFETY_IDENTIFIER = 'cw_0123456789abcdefghijk';
const OFFER_SDP = 'v=0\r\no=fake-offer\r\n';
const ANSWER_SDP = 'v=0\r\no=fake-answer\r\n';

type EventListenerLike = EventListenerOrEventListenerObject;

class FakeMediaTrack {
  enabled = true;
  stopCalls = 0;

  stop(): void {
    this.stopCalls += 1;
  }
}

class FakeMediaStream {
  readonly tracks: FakeMediaTrack[];

  constructor(tracks: FakeMediaTrack[] = []) {
    this.tracks = [...tracks];
  }

  addTrack(track: MediaStreamTrack): void {
    this.tracks.push(track as unknown as FakeMediaTrack);
  }

  getTracks(): MediaStreamTrack[] {
    return this.tracks as unknown as MediaStreamTrack[];
  }

  getAudioTracks(): MediaStreamTrack[] {
    return this.getTracks();
  }
}

class FakeAudioElement {
  autoplay = false;
  preload = '';
  muted = false;
  hidden = false;
  srcObject: MediaProvider | null = null;
  playCalls = 0;
  pauseCalls = 0;
  removeCalls = 0;
  readonly attributes = new Map<string, string>();
  playFailure?: Error;

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
  }

  removeAttribute(name: string): void {
    this.attributes.delete(name);
  }

  play(): Promise<void> {
    this.playCalls += 1;
    return this.playFailure ? Promise.reject(this.playFailure) : Promise.resolve();
  }

  pause(): void {
    this.pauseCalls += 1;
  }

  remove(): void {
    this.removeCalls += 1;
  }
}

class FakeDataChannel {
  readonly label = WEB_REALTIME_DATA_CHANNEL_LABEL;
  readyState: RTCDataChannelState = 'connecting';
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onclose: ((event: Event) => void) | null = null;
  closeCalls = 0;
  readonly sent: string[] = [];
  private readonly listeners = new Map<string, Set<EventListenerLike>>();

  send(value: string): void {
    if (this.readyState !== 'open') throw new Error('channel is not open');
    this.sent.push(value);
  }

  close(): void {
    this.closeCalls += 1;
    if (this.readyState === 'closed') return;
    this.readyState = 'closed';
    const event = new Event('close');
    this.onclose?.(event);
    this.emitListeners('close', event);
  }

  addEventListener(type: string, listener: EventListenerLike): void {
    const listeners = this.listeners.get(type) ?? new Set<EventListenerLike>();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type: string, listener: EventListenerLike): void {
    this.listeners.get(type)?.delete(listener);
  }

  open(): void {
    if (this.readyState === 'open') return;
    this.readyState = 'open';
    const event = new Event('open');
    this.onopen?.(event);
    this.emitListeners('open', event);
  }

  emitServerEvent(event: Record<string, unknown>): void {
    this.onmessage?.(
      { data: JSON.stringify(event) } as MessageEvent<string>,
    );
  }

  emitUnreadableMessage(): void {
    this.onmessage?.({ data: '{not-json' } as MessageEvent<string>);
  }

  fail(): void {
    this.onerror?.(new Event('error'));
  }

  parsedEvents(): Record<string, unknown>[] {
    return this.sent.map((entry) => JSON.parse(entry) as Record<string, unknown>);
  }

  private emitListeners(type: string, event: Event): void {
    for (const listener of this.listeners.get(type) ?? []) {
      if (typeof listener === 'function') listener(event);
      else listener.handleEvent(event);
    }
  }
}

class FakePeerConnection {
  connectionState: RTCPeerConnectionState = 'new';
  ontrack: ((event: RTCTrackEvent) => void) | null = null;
  onconnectionstatechange: ((event: Event) => void) | null = null;
  closeCalls = 0;
  createOfferCalls = 0;
  localDescription?: RTCSessionDescriptionInit;
  remoteDescription?: RTCSessionDescriptionInit;
  readonly addedTracks: Array<{
    track: MediaStreamTrack;
    stream: MediaStream;
  }> = [];

  constructor(
    readonly channel: FakeDataChannel,
    private readonly order: string[],
  ) {}

  addTrack(track: MediaStreamTrack, stream: MediaStream): RTCRtpSender {
    this.order.push('addTrack');
    this.addedTracks.push({ track, stream });
    return {} as RTCRtpSender;
  }

  createDataChannel(label: string): RTCDataChannel {
    this.order.push(`createDataChannel:${label}`);
    assert.equal(label, WEB_REALTIME_DATA_CHANNEL_LABEL);
    return this.channel as unknown as RTCDataChannel;
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    this.order.push('createOffer');
    this.createOfferCalls += 1;
    return { type: 'offer', sdp: OFFER_SDP };
  }

  async setLocalDescription(description: RTCSessionDescriptionInit): Promise<void> {
    this.order.push('setLocalDescription');
    this.localDescription = description;
  }

  async setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void> {
    this.order.push('setRemoteDescription');
    this.remoteDescription = description;
    this.connectionState = 'connected';
    this.channel.open();
  }

  close(): void {
    this.closeCalls += 1;
    this.connectionState = 'closed';
  }

  emitRemoteTrack(track: FakeMediaTrack, stream?: FakeMediaStream): void {
    this.ontrack?.({
      track: track as unknown as MediaStreamTrack,
      streams: stream ? ([stream as unknown as MediaStream] as MediaStream[]) : [],
    } as unknown as RTCTrackEvent);
  }

  failConnection(): void {
    this.connectionState = 'failed';
    this.onconnectionstatechange?.(new Event('connectionstatechange'));
  }
}

type HarnessOptions = {
  getUserMediaError?: Error;
  fetchResponse?: Response;
  fetchError?: Error;
  audioPlayError?: Error;
};

function createTransportHarness(options: HarnessOptions = {}) {
  const order: string[] = [];
  const localTrack = new FakeMediaTrack();
  const localStream = new FakeMediaStream([localTrack]);
  const remoteTrack = new FakeMediaTrack();
  const remoteStream = new FakeMediaStream([remoteTrack]);
  const channel = new FakeDataChannel();
  const peer = new FakePeerConnection(channel, order);
  const audio = new FakeAudioElement();
  audio.playFailure = options.audioPlayError;
  const fetchCalls: Array<{ input: RequestInfo | URL; init?: RequestInit }> = [];
  const abortControllers: AbortController[] = [];
  const timers = new Map<number, () => void>();
  let nextTimer = 1;
  let detachCalls = 0;

  const environment: WebRealtimeEnvironment = {
    fetch: (async (input: RequestInfo | URL, init?: RequestInit) => {
      order.push('fetch');
      fetchCalls.push({ input, init });
      if (options.fetchError) throw options.fetchError;
      return options.fetchResponse ?? new Response(ANSWER_SDP, { status: 200 });
    }) as typeof fetch,
    getUserMedia: async (constraints) => {
      order.push('getUserMedia');
      assert.deepEqual(constraints, {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });
      if (options.getUserMediaError) throw options.getUserMediaError;
      return localStream as unknown as MediaStream;
    },
    createPeerConnection: () => {
      order.push('createPeerConnection');
      return peer as unknown as RTCPeerConnection;
    },
    createMediaStream: () => new FakeMediaStream() as unknown as MediaStream,
    createAudioElement: () => {
      order.push('createAudioElement');
      return audio as unknown as HTMLAudioElement;
    },
    attachOwnedAudioElement: () => {
      order.push('attachOwnedAudioElement');
      return () => {
        detachCalls += 1;
      };
    },
    createAbortController: () => {
      const controller = new AbortController();
      abortControllers.push(controller);
      return controller;
    },
    encodeBase64UrlUtf8: (value) => Buffer.from(value).toString('base64url'),
    setTimeout: (callback) => {
      const handle = nextTimer++;
      timers.set(handle, callback);
      return handle;
    },
    clearTimeout: (handle) => {
      timers.delete(handle);
    },
  };

  return {
    environment,
    order,
    localTrack,
    localStream,
    remoteTrack,
    remoteStream,
    channel,
    peer,
    audio,
    fetchCalls,
    abortControllers,
    timers,
    get detachCalls() {
      return detachCalls;
    },
  };
}

function baseRealtimeOptions(
  environment: WebRealtimeEnvironment,
  overrides: Partial<WebRealtimeVoiceServiceOptions> = {},
): WebRealtimeVoiceServiceOptions {
  return {
    safetyIdentifier: VALID_SAFETY_IDENTIFIER,
    wisdomId: 'three-ways-to-use-money',
    sceneId: 'reflection-scene',
    context: {
      wisdomTitle: 'Three Ways to Use Money',
      storySummary: 'Leo can spend, save, or help.',
      currentStoryScene: 'Leo pauses before spending 90 kr.',
      reflectionGoal: 'Connect waiting with a personal choice.',
      childAgeBand: '8-10',
      previousAnswer: 'Waiting can feel difficult.',
      maximumConversationTurns: 6,
      maximumDurationSeconds: 180,
      authoredChoiceIds: ['sometimes', 'not-sure'],
    },
    environment,
    ...overrides,
  };
}

function decodeContextHeader(header: string): Record<string, unknown> {
  return JSON.parse(Buffer.from(header, 'base64url').toString('utf8')) as Record<
    string,
    unknown
  >;
}

function tick(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

async function waitUntil(
  predicate: () => boolean,
  message: string,
  timeoutMs = 500,
): Promise<void> {
  const startedAt = Date.now();
  while (!predicate()) {
    if (Date.now() - startedAt >= timeoutMs) throw new Error(message);
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

describe('WebRealtimeVoiceService', () => {
  it('starts microphone permission from the user gesture before any WebRTC or network work', async () => {
    const harness = createTransportHarness();
    const states: WebRealtimeVoiceState[] = [];
    const service = new WebRealtimeVoiceService(
      baseRealtimeOptions(harness.environment, {
        callbacks: { onStateChange: (state) => states.push(state) },
      }),
    );

    await service.startFromUserGesture();

    assert.equal(service.supported, true);
    assert.equal(service.getState(), 'listening');
    assert.deepEqual(states.slice(0, 3), [
      'requestingPermission',
      'connecting',
      'listening',
    ]);
    assert.equal(harness.order[0], 'getUserMedia');
    assert.ok(
      harness.order.indexOf('getUserMedia') <
        harness.order.indexOf('createPeerConnection'),
    );
    assert.equal(harness.peer.addedTracks.length, 1);
    assert.equal(harness.peer.addedTracks[0].track, harness.localTrack);
    assert.equal(harness.peer.localDescription?.sdp, OFFER_SDP);
    assert.equal(harness.peer.remoteDescription?.sdp, ANSWER_SDP);
    assert.equal(harness.audio.autoplay, true);
    assert.equal(harness.audio.attributes.get('playsinline'), 'true');
    assert.equal(harness.timers.size, 0);

    await service.end();
  });

  it('posts the exact SDP body, endpoint, headers, and allowlisted Wisdom context', async () => {
    const harness = createTransportHarness();
    const context = {
      ...baseRealtimeOptions(harness.environment).context,
      childFirstName: 'must-not-leave-device',
      unexpectedSecret: 'must-not-be-sent',
    } as WebRealtimeVoiceServiceOptions['context'];
    const service = new WebRealtimeVoiceService(
      baseRealtimeOptions(harness.environment, { context }),
    );

    await service.startFromUserGesture();

    assert.equal(harness.fetchCalls.length, 1);
    const call = harness.fetchCalls[0];
    assert.equal(call.input, WEB_REALTIME_SESSION_ENDPOINT);
    assert.equal(call.init?.method, 'POST');
    assert.equal(call.init?.body, OFFER_SDP);
    assert.equal(call.init?.signal, harness.abortControllers[0].signal);
    const headers = call.init?.headers as Record<string, string>;
    assert.deepEqual(Object.keys(headers).sort(), [
      'Accept',
      'Content-Type',
      ...Object.values(WEB_REALTIME_REQUEST_HEADERS),
    ].sort());
    assert.equal(headers.Accept, 'application/sdp');
    assert.equal(headers['Content-Type'], 'application/sdp');
    assert.equal(
      headers[WEB_REALTIME_REQUEST_HEADERS.safetyIdentifier],
      VALID_SAFETY_IDENTIFIER,
    );
    assert.equal(
      headers[WEB_REALTIME_REQUEST_HEADERS.wisdomId],
      'three-ways-to-use-money',
    );
    assert.equal(
      headers[WEB_REALTIME_REQUEST_HEADERS.sceneId],
      'reflection-scene',
    );
    assert.equal(headers[WEB_REALTIME_REQUEST_HEADERS.ageBand], '8-10');
    assert.equal(headers[WEB_REALTIME_REQUEST_HEADERS.maxTurns], '6');
    const decoded = decodeContextHeader(
      headers[WEB_REALTIME_REQUEST_HEADERS.context],
    );
    assert.deepEqual(decoded, {
      wisdomTitle: 'Three Ways to Use Money',
      storySummary: 'Leo can spend, save, or help.',
      currentStoryScene: 'Leo pauses before spending 90 kr.',
      reflectionGoal: 'Connect waiting with a personal choice.',
      childAgeBand: '8-10',
      previousAnswer: 'Waiting can feel difficult.',
      maximumConversationTurns: 6,
      maximumDurationSeconds: 180,
      authoredChoiceIds: ['sometimes', 'not-sure'],
    });
    assert.equal('childFirstName' in decoded, false);
    assert.equal('unexpectedSecret' in decoded, false);

    await service.end();
  });

  it('maps current VAD, transcript, response, and playback events', async () => {
    const harness = createTransportHarness();
    const states: WebRealtimeVoiceState[] = [];
    const vad: Array<[boolean, string | undefined]> = [];
    const thinking: boolean[] = [];
    const playback: boolean[] = [];
    const transcripts: Array<{
      role: string;
      text: string;
      final: boolean;
    }> = [];
    const turns: number[] = [];
    const errors: WebRealtimeVoiceError[] = [];
    const service = new WebRealtimeVoiceService(
      baseRealtimeOptions(harness.environment, {
        callbacks: {
          onStateChange: (state) => states.push(state),
          onVadChange: (speaking, itemId) => vad.push([speaking, itemId]),
          onThinkingChange: (active) => thinking.push(active),
          onPlaybackChange: (playing) => playback.push(playing),
          onTranscript: ({ role, text, final }) =>
            transcripts.push({ role, text, final }),
          onCloudTurn: (turn) => turns.push(turn),
          onError: (error) => errors.push(error),
        },
      }),
    );
    await service.startFromUserGesture();

    harness.peer.emitRemoteTrack(harness.remoteTrack, harness.remoteStream);
    await tick();
    assert.equal(harness.audio.srcObject, harness.remoteStream);
    assert.equal(harness.audio.playCalls, 1);

    harness.channel.emitServerEvent({
      type: 'input_audio_buffer.speech_started',
      item_id: 'child-1',
    });
    harness.channel.emitServerEvent({
      type: 'conversation.item.input_audio_transcription.delta',
      item_id: 'child-1',
      delta: 'I would ',
    });
    harness.channel.emitServerEvent({
      type: 'conversation.item.input_audio_transcription.delta',
      item_id: 'child-1',
      delta: 'save.',
    });
    harness.channel.emitServerEvent({
      type: 'conversation.item.input_audio_transcription.completed',
      item_id: 'child-1',
      transcript: 'I would save.',
    });
    harness.channel.emitServerEvent({
      type: 'input_audio_buffer.speech_stopped',
      item_id: 'child-1',
    });
    harness.channel.emitServerEvent({
      type: 'response.created',
      response: { id: 'response-1' },
    });
    harness.channel.emitServerEvent({
      type: 'response.output_audio_transcript.delta',
      item_id: 'cloud-1',
      delta: 'Saving ',
    });
    harness.channel.emitServerEvent({
      type: 'response.output_audio_transcript.delta',
      item_id: 'cloud-1',
      delta: 'can help.',
    });
    harness.channel.emitServerEvent({
      type: 'output_audio_buffer.started',
      response_id: 'response-1',
    });
    harness.channel.emitServerEvent({
      type: 'response.output_audio_transcript.done',
      item_id: 'cloud-1',
      transcript: 'Saving can help.',
    });
    harness.channel.emitServerEvent({
      type: 'output_audio_buffer.stopped',
      response_id: 'response-1',
    });
    harness.channel.emitServerEvent({
      type: 'response.done',
      response: { id: 'response-1', status: 'completed' },
    });

    assert.deepEqual(vad, [
      [true, 'child-1'],
      [false, 'child-1'],
    ]);
    assert.deepEqual(transcripts, [
      { role: 'child', text: 'I would ', final: false },
      { role: 'child', text: 'I would save.', final: false },
      { role: 'child', text: 'I would save.', final: true },
      { role: 'cloud', text: 'Saving ', final: false },
      { role: 'cloud', text: 'Saving can help.', final: false },
      { role: 'cloud', text: 'Saving can help.', final: true },
    ]);
    assert.deepEqual(playback, [true, false]);
    assert.ok(thinking.includes(true));
    assert.equal(thinking.at(-1), false);
    assert.deepEqual(turns, [1]);
    assert.equal(service.getCloudTurnCount(), 1);
    assert.equal(service.getState(), 'listening');
    assert.ok(states.includes('childSpeaking'));
    assert.ok(states.includes('thinking'));
    assert.ok(states.includes('cloudSpeaking'));

    harness.channel.emitUnreadableMessage();
    assert.equal(errors.at(-1)?.code, 'protocol-error');
    await service.end();
  });

  it('mutes microphone tracks, resets VAD, and cancels active generation without clearing idle playback', async () => {
    const harness = createTransportHarness();
    const muted: boolean[] = [];
    const vad: boolean[] = [];
    const service = new WebRealtimeVoiceService(
      baseRealtimeOptions(harness.environment, {
        callbacks: {
          onMutedChange: (value) => muted.push(value),
          onVadChange: (speaking) => vad.push(speaking),
        },
      }),
    );
    await service.startFromUserGesture();
    harness.channel.emitServerEvent({
      type: 'input_audio_buffer.speech_started',
      item_id: 'child-1',
    });
    harness.channel.emitServerEvent({
      type: 'response.created',
      response: { id: 'response-active' },
    });

    service.setMuted(true);
    assert.equal(harness.localTrack.enabled, false);
    assert.equal(service.isMuted(), true);
    assert.equal(service.getState(), 'muted');
    assert.deepEqual(vad, [true, false]);
    service.interrupt();
    service.setMuted(false);

    assert.equal(harness.localTrack.enabled, true);
    assert.equal(service.isMuted(), false);
    assert.deepEqual(muted, [true, false]);
    assert.deepEqual(harness.channel.parsedEvents().slice(-1), [
      { type: 'response.cancel', response_id: 'response-active' },
    ]);
    await service.end();
  });

  it('never cancels without an active response and clears output only during playback', async () => {
    const harness = createTransportHarness();
    const service = new WebRealtimeVoiceService(
      baseRealtimeOptions(harness.environment),
    );
    await service.startFromUserGesture();

    service.interrupt();
    assert.deepEqual(harness.channel.parsedEvents(), []);

    harness.channel.emitServerEvent({
      type: 'response.created',
      response: { id: 'response-playing' },
    });
    service.interrupt();
    assert.deepEqual(harness.channel.parsedEvents(), [
      { type: 'response.cancel', response_id: 'response-playing' },
    ]);

    harness.channel.emitServerEvent({
      type: 'output_audio_buffer.started',
      response_id: 'response-playing',
    });
    service.interrupt();
    assert.deepEqual(harness.channel.parsedEvents().slice(-2), [
      { type: 'response.cancel', response_id: 'response-playing' },
      { type: 'output_audio_buffer.clear' },
    ]);

    harness.channel.emitServerEvent({
      type: 'response.done',
      response: {
        id: 'response-playing',
        status: 'cancelled',
        status_details: { reason: 'client_cancelled' },
      },
    });
    harness.channel.emitServerEvent({
      type: 'output_audio_buffer.cleared',
      response_id: 'response-playing',
    });
    const eventCount = harness.channel.parsedEvents().length;
    service.interrupt();
    assert.equal(harness.channel.parsedEvents().length, eventCount);

    await service.end();
  });

  it('reports server interruptions and counts only unique completed responses', async () => {
    const harness = createTransportHarness();
    const interruptions: Array<{ responseId?: string; reason: string }> = [];
    const turns: number[] = [];
    const reached: number[] = [];
    const service = new WebRealtimeVoiceService(
      baseRealtimeOptions(harness.environment, {
        maxCloudTurns: 2,
        callbacks: {
          onInterruption: (event) => interruptions.push(event),
          onCloudTurn: (turn) => turns.push(turn),
          onMaxTurnsReached: (turn) => reached.push(turn),
        },
      }),
    );
    await service.startFromUserGesture();

    harness.channel.emitServerEvent({
      type: 'response.done',
      response: {
        id: 'cancelled-1',
        status: 'cancelled',
        status_details: { reason: 'turn_detected' },
      },
    });
    harness.channel.emitServerEvent({
      type: 'response.done',
      response: {
        id: 'function-only',
        status: 'completed',
        output: [
          {
            type: 'function_call',
            call_id: 'unsupported_function_call',
            name: 'unsupported_test_tool',
            arguments: '{}',
          },
        ],
      },
    });
    assert.equal(service.getCloudTurnCount(), 0);
    harness.channel.emitServerEvent({
      type: 'output_audio_buffer.started',
      response_id: 'response-1',
    });
    harness.channel.emitServerEvent({
      type: 'response.done',
      response: { id: 'response-1', status: 'completed' },
    });
    harness.channel.emitServerEvent({
      type: 'response.done',
      response: { id: 'response-1', status: 'completed' },
    });
    harness.channel.emitServerEvent({
      type: 'response.output_audio_transcript.done',
      response_id: 'response-2',
      item_id: 'spoken-response-2',
      transcript: 'A second spoken turn.',
    });
    harness.channel.emitServerEvent({
      type: 'response.done',
      response: { id: 'response-2', status: 'completed' },
    });

    assert.deepEqual(interruptions, [
      { responseId: 'cancelled-1', reason: 'turn_detected' },
    ]);
    assert.deepEqual(turns, [1, 2]);
    assert.deepEqual(reached, [2]);
    assert.equal(service.getCloudTurnCount(), 2);
    await service.end();
  });

  it('validates function calls, emits output, and ignores duplicate call ids', async () => {
    const harness = createTransportHarness();
    const validated: unknown[] = [];
    const handled: unknown[] = [];
    const errors: WebRealtimeVoiceError[] = [];
    const service = new WebRealtimeVoiceService(
      baseRealtimeOptions(harness.environment, {
        callbacks: {
          onValidatedToolCall: (call) => validated.push(call),
          onError: (error) => errors.push(error),
        },
        toolHandlers: {
          [WEB_REALTIME_REFLECTION_TOOL_NAME]: {
            validate: (raw) =>
              typeof raw === 'object' && raw !== null && 'summary' in raw
                ? { ok: true, value: raw }
                : { ok: false, message: 'summary is required' },
            onCall: async (call) => {
              handled.push(call.arguments);
              return { ok: true, saved: true };
            },
          },
        },
      }),
    );
    await service.startFromUserGesture();
    const validEvent = {
      type: 'response.done',
      response: {
        id: 'function-only-response',
        status: 'completed',
        output: [
          {
            type: 'function_call',
            call_id: 'call_1',
            name: WEB_REALTIME_REFLECTION_TOOL_NAME,
            arguments: JSON.stringify({ summary: 'A short result.' }),
          },
        ],
      },
    };

    harness.channel.emitServerEvent(validEvent);
    harness.channel.emitServerEvent(validEvent);
    await tick();

    assert.equal(validated.length, 1);
    assert.deepEqual(handled, [{ summary: 'A short result.' }]);
    assert.equal(service.getCloudTurnCount(), 0);
    assert.deepEqual(harness.channel.parsedEvents().slice(-2), [
      {
        type: 'conversation.item.create',
        item: {
          type: 'function_call_output',
          call_id: 'call_1',
          output: JSON.stringify({ ok: true, saved: true }),
        },
      },
      { type: 'response.create' },
    ]);

    harness.channel.emitServerEvent({
      type: 'response.function_call_arguments.done',
      call_id: 'call_bad_json',
      name: WEB_REALTIME_REFLECTION_TOOL_NAME,
      arguments: '{bad-json',
    });
    await tick();
    assert.equal(errors.at(-1)?.code, 'tool-error');
    const failureOutput = harness.channel.parsedEvents().at(-2);
    assert.equal(failureOutput?.type, 'conversation.item.create');
    const failureItem = failureOutput?.item as Record<string, unknown>;
    assert.match(String(failureItem.output), /invalid_json/);

    await service.end();
  });

  it('requests a bounded response and a forced structured reflection', async () => {
    const harness = createTransportHarness();
    const service = new WebRealtimeVoiceService(
      baseRealtimeOptions(harness.environment),
    );
    await service.startFromUserGesture();

    service.requestResponse('Offer one short acknowledgement.');
    service.requestStructuredReflection();
    const events = harness.channel.parsedEvents();
    assert.deepEqual(events.at(-2), {
      type: 'response.create',
      response: { instructions: 'Offer one short acknowledgement.' },
    });
    assert.deepEqual(events.at(-1), {
      type: 'response.create',
      response: {
        instructions:
          'Finish the conversation now. Briefly acknowledge the child, then ' +
          `call ${WEB_REALTIME_REFLECTION_TOOL_NAME} with the short structured ` +
          'reflection. Do not ask another question.',
        tool_choice: {
          type: 'function',
          name: WEB_REALTIME_REFLECTION_TOOL_NAME,
        },
      },
    });
    assert.equal(service.getState(), 'thinking');
    assert.throws(() => service.requestResponse('x'.repeat(601)), /limit/i);

    await service.end();
  });

  it('cleans up after permission and session connection failures', async () => {
    const denied = Object.assign(new Error('permission blocked'), {
      name: 'NotAllowedError',
    });
    const permissionHarness = createTransportHarness({
      getUserMediaError: denied,
    });
    const permissionErrors: WebRealtimeVoiceError[] = [];
    const permissionService = new WebRealtimeVoiceService(
      baseRealtimeOptions(permissionHarness.environment, {
        callbacks: { onError: (error) => permissionErrors.push(error) },
      }),
    );
    await assert.rejects(
      permissionService.startFromUserGesture(),
      /permission blocked/,
    );
    assert.equal(permissionService.getState(), 'error');
    assert.equal(permissionErrors[0].code, 'permission-denied');
    assert.equal(permissionHarness.peer.createOfferCalls, 0);

    const connectionHarness = createTransportHarness({
      fetchResponse: new Response('unavailable', { status: 503 }),
    });
    const connectionErrors: WebRealtimeVoiceError[] = [];
    const connectionService = new WebRealtimeVoiceService(
      baseRealtimeOptions(connectionHarness.environment, {
        callbacks: { onError: (error) => connectionErrors.push(error) },
      }),
    );
    await assert.rejects(
      connectionService.startFromUserGesture(),
      /status 503/,
    );
    assert.equal(connectionService.getState(), 'error');
    assert.equal(connectionErrors[0].code, 'connection-failed');
    assert.equal(connectionHarness.localTrack.stopCalls, 1);
    assert.equal(connectionHarness.channel.closeCalls, 1);
    assert.equal(connectionHarness.peer.closeCalls, 1);
    assert.equal(connectionHarness.audio.pauseCalls, 1);
    assert.equal(connectionHarness.detachCalls, 1);
    assert.equal(connectionHarness.abortControllers[0].signal.aborted, true);
    assert.equal(connectionHarness.timers.size, 0);
  });

  it('rejects invalid configuration before requesting microphone access', async () => {
    const harness = createTransportHarness();
    const errors: WebRealtimeVoiceError[] = [];
    const service = new WebRealtimeVoiceService(
      baseRealtimeOptions(harness.environment, {
        safetyIdentifier: 'not-opaque',
        callbacks: { onError: (error) => errors.push(error) },
      }),
    );

    await assert.rejects(service.startFromUserGesture(), /opaque base64url/i);
    assert.equal(service.getState(), 'error');
    assert.equal(errors[0].code, 'invalid-configuration');
    assert.equal(harness.order.includes('getUserMedia'), false);
    assert.equal(harness.fetchCalls.length, 0);
  });

  it('reports playback blocking without tearing down an otherwise live session', async () => {
    const harness = createTransportHarness({
      audioPlayError: new Error('autoplay rejected'),
    });
    const errors: WebRealtimeVoiceError[] = [];
    const service = new WebRealtimeVoiceService(
      baseRealtimeOptions(harness.environment, {
        callbacks: { onError: (error) => errors.push(error) },
      }),
    );
    await service.startFromUserGesture();
    harness.peer.emitRemoteTrack(harness.remoteTrack, harness.remoteStream);
    await tick();

    assert.equal(errors.at(-1)?.code, 'playback-blocked');
    assert.equal(service.getState(), 'listening');
    assert.equal(harness.localTrack.stopCalls, 0);
    await service.end();
  });

  it('teardownAfterError and connection failure release every owned resource', async () => {
    const harness = createTransportHarness();
    const errors: WebRealtimeVoiceError[] = [];
    const service = new WebRealtimeVoiceService(
      baseRealtimeOptions(harness.environment, {
        callbacks: { onError: (error) => errors.push(error) },
      }),
    );
    await service.startFromUserGesture();
    harness.peer.emitRemoteTrack(harness.remoteTrack, harness.remoteStream);
    service.teardownAfterError();

    assert.equal(service.getState(), 'error');
    assert.equal(harness.localTrack.stopCalls, 1);
    assert.equal(harness.remoteTrack.stopCalls, 1);
    assert.equal(harness.channel.closeCalls, 1);
    assert.equal(harness.peer.closeCalls, 1);
    assert.equal(harness.audio.pauseCalls, 1);
    assert.equal(harness.audio.srcObject, null);
    assert.equal(harness.detachCalls, 1);

    const failedHarness = createTransportHarness();
    const failedService = new WebRealtimeVoiceService(
      baseRealtimeOptions(failedHarness.environment, {
        callbacks: { onError: (error) => errors.push(error) },
      }),
    );
    await failedService.startFromUserGesture();
    failedHarness.peer.failConnection();
    assert.equal(failedService.getState(), 'error');
    assert.equal(errors.at(-1)?.code, 'connection-failed');
    assert.equal(failedHarness.localTrack.stopCalls, 1);
    assert.equal(failedHarness.peer.closeCalls, 1);
  });

  it('ends idempotently and stops local, remote, channel, peer, audio, and timers once', async () => {
    const harness = createTransportHarness();
    const ended: string[] = [];
    const service = new WebRealtimeVoiceService(
      baseRealtimeOptions(harness.environment, {
        callbacks: { onEnded: (reason) => ended.push(reason) },
      }),
    );
    await service.startFromUserGesture();
    harness.peer.emitRemoteTrack(harness.remoteTrack, harness.remoteStream);

    await Promise.all([service.end('screen-exit'), service.end('screen-exit')]);
    await service.end('user');

    assert.equal(service.getState(), 'ended');
    assert.deepEqual(ended, ['screen-exit']);
    assert.equal(harness.localTrack.stopCalls, 1);
    assert.equal(harness.remoteTrack.stopCalls, 1);
    assert.equal(harness.channel.closeCalls, 1);
    assert.equal(harness.peer.closeCalls, 1);
    assert.equal(harness.audio.pauseCalls, 1);
    assert.equal(harness.audio.srcObject, null);
    assert.equal(harness.detachCalls, 1);
    assert.equal(harness.abortControllers[0].signal.aborted, true);
    assert.equal(harness.timers.size, 0);
  });
});

type BrowserHarness = ReturnType<typeof createTransportHarness> & {
  restore: () => void;
};

function installFakeBrowser(options: HarnessOptions = {}): BrowserHarness {
  const harness = createTransportHarness(options);
  const descriptors = new Map<string, PropertyDescriptor | undefined>();
  const install = (key: string, value: unknown) => {
    descriptors.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, {
      configurable: true,
      enumerable: true,
      writable: true,
      value,
    });
  };

  const FakePeerConnectionConstructor = function () {
    harness.order.push('createPeerConnection');
    return harness.peer;
  };
  const FakeMediaStreamConstructor = function () {
    return new FakeMediaStream();
  };
  const fakeWindow = {
    fetch: harness.environment.fetch,
    RTCPeerConnection: FakePeerConnectionConstructor,
    MediaStream: FakeMediaStreamConstructor,
    AbortController,
    TextEncoder,
    btoa: (value: string) => Buffer.from(value, 'binary').toString('base64'),
    location: { href: 'http://localhost:8083/wisdom' },
    setTimeout: globalThis.setTimeout.bind(globalThis),
    clearTimeout: globalThis.clearTimeout.bind(globalThis),
  };
  const fakeDocument = {
    createElement: (tagName: string) => {
      assert.equal(tagName, 'audio');
      harness.order.push('createAudioElement');
      return harness.audio;
    },
    body: {
      appendChild: (element: unknown) => {
        assert.equal(element, harness.audio);
        harness.order.push('attachOwnedAudioElement');
      },
    },
  };
  const fakeNavigator = {
    mediaDevices: {
      getUserMedia: harness.environment.getUserMedia,
    },
  };
  install('window', fakeWindow);
  install('document', fakeDocument);
  install('navigator', fakeNavigator);

  return {
    ...harness,
    restore: () => {
      for (const [key, descriptor] of descriptors) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else Reflect.deleteProperty(globalThis, key);
      }
    },
  };
}

function cloudSessionOptions(
  overrides: Partial<CloudVoiceSessionOptions> = {},
): CloudVoiceSessionOptions {
  return {
    sessionId: 'web-cloud-session-1',
    privacyPreservingSafetyId: VALID_SAFETY_IDENTIFIER,
    context: {
      wisdomId: 'three-ways-to-use-money',
      wisdomTitle: 'Three Ways to Use Money',
      storySummary: 'Leo can spend, save, or help.',
      currentStoryScene: 'Leo pauses before spending 90 kr.',
      reflectionGoal: 'Connect waiting with a personal choice.',
      childAgeBand: '8-10',
      authoredChoiceIds: ['sometimes', 'not-sure'],
      maximumConversationTurns: 6,
      maximumDurationSeconds: 180,
    },
    limits: { maxCloudTurns: 6, maxDurationMs: 180_000 },
    ...overrides,
  };
}

const SAFE_REFLECTION: CloudVoiceReflection = {
  summary: 'The child connected waiting with a future goal.',
  childExample: 'I can wait and save for headphones.',
  cloudInsight: 'A pause can make room for a future goal.',
  confidence: 0.84,
  safetyStatus: 'safe',
  authoredChoiceId: 'sometimes',
};

function emitReflectionToolCall(
  channel: FakeDataChannel,
  reflection: CloudVoiceReflection = SAFE_REFLECTION,
  callId = 'reflection_call_1',
): void {
  channel.emitServerEvent({
    type: 'response.function_call_arguments.done',
    call_id: callId,
    name: WEB_REALTIME_REFLECTION_TOOL_NAME,
    arguments: JSON.stringify(reflection),
  });
}

describe('WebCloudVoiceService', () => {
  it('wires the real web transport into the app state machine and structured result', async () => {
    const browser = installFakeBrowser();
    try {
      const statuses: string[] = [];
      const events: CloudVoiceMachineEvent[] = [];
      const transcripts: string[][] = [];
      const reflections: CloudVoiceReflection[] = [];
      const service = new WebCloudVoiceService('http://localhost:8787/');
      const session = service.createSession(
        cloudSessionOptions({
          callbacks: {
            onStateChange: (state, event) => {
              statuses.push(state.status);
              events.push(event);
            },
            onTranscriptChange: (entries) =>
              transcripts.push(entries.map((entry) => entry.text)),
            onReflection: (reflection) => reflections.push(reflection),
          },
        }),
      );

      assert.equal(service.supported, true);
      await session.start();
      assert.equal(session.getSnapshot().state.status, 'listening');
      assert.equal(
        browser.fetchCalls[0].input,
        'http://localhost:8787/api/cloud-voice/realtime-session',
      );

      browser.channel.emitServerEvent({
        type: 'input_audio_buffer.speech_started',
        item_id: 'child-1',
      });
      browser.channel.emitServerEvent({
        type: 'conversation.item.input_audio_transcription.delta',
        item_id: 'child-1',
        delta: 'I could save',
      });
      browser.channel.emitServerEvent({
        type: 'conversation.item.input_audio_transcription.completed',
        item_id: 'child-1',
        transcript: 'I could save for headphones.',
      });
      browser.channel.emitServerEvent({
        type: 'input_audio_buffer.speech_stopped',
        item_id: 'child-1',
      });
      browser.channel.emitServerEvent({
        type: 'response.created',
        response: { id: 'response-1' },
      });
      browser.channel.emitServerEvent({
        type: 'output_audio_buffer.started',
        response_id: 'response-1',
      });
      browser.channel.emitServerEvent({
        type: 'response.output_audio_transcript.done',
        item_id: 'cloud-1',
        transcript: 'That pause can help your future goal.',
      });
      browser.channel.emitServerEvent({
        type: 'output_audio_buffer.stopped',
        response_id: 'response-1',
      });
      browser.channel.emitServerEvent({
        type: 'response.done',
        response: { id: 'response-1', status: 'completed' },
      });
      emitReflectionToolCall(browser.channel);
      await waitUntil(
        () => session.getSnapshot().state.status === 'ended',
        'structured reflection did not finish the web Cloud session',
      );

      const snapshot = session.getSnapshot();
      assert.equal(snapshot.state.status, 'ended');
      assert.deepEqual(snapshot.reflection, SAFE_REFLECTION);
      assert.deepEqual(reflections, [SAFE_REFLECTION]);
      assert.deepEqual(
        snapshot.transcript.map((entry) => [entry.role, entry.text]),
        [
          ['child', 'I could save for headphones.'],
          ['cloud', 'That pause can help your future goal.'],
        ],
      );
      assert.ok(transcripts.length >= 3);
      assert.deepEqual(statuses.slice(0, 3), [
        'requestingPermission',
        'connecting',
        'listening',
      ]);
      assert.ok(events.some((event) => event.type === 'CLOUD_RESPONSE_STARTED'));
      assert.equal(browser.localTrack.stopCalls, 1);
      assert.equal(browser.peer.closeCalls, 1);
      await service.dispose();
    } finally {
      browser.restore();
    }
  });

  it('redacts personal data in ephemeral transcript and the saved reflection', async () => {
    const browser = installFakeBrowser();
    try {
      const safety: string[] = [];
      const service = new WebCloudVoiceService('http://localhost:8787');
      const session = service.createSession(
        cloudSessionOptions({
          callbacks: {
            onSafety: (assessment) => safety.push(assessment.category),
          },
        }),
      );
      await session.start();

      browser.channel.emitServerEvent({
        type: 'conversation.item.input_audio_transcription.completed',
        item_id: 'child-private',
        transcript: 'My email is child@example.com.',
      });
      emitReflectionToolCall(browser.channel, {
        ...SAFE_REFLECTION,
        childExample: 'My email is child@example.com.',
        cloudInsight: 'Do not repeat child@example.com.',
        safetyStatus: 'personal_data',
      });
      await tick();
      await tick();

      const snapshot = session.getSnapshot();
      const serialized = JSON.stringify(snapshot);
      assert.doesNotMatch(serialized, /child@example\.com/i);
      assert.match(serialized, /email removed/i);
      assert.deepEqual(safety, ['personal_data']);
      assert.equal(snapshot.reflection?.safetyStatus, 'personal_data');
      await service.dispose();
    } finally {
      browser.restore();
    }
  });

  it('promotes model-only high-risk reflection safety and stores no model detail', async () => {
    const browser = installFakeBrowser();
    try {
      const safety: Array<{ category: string; shouldEndConversation: boolean }> = [];
      const events: CloudVoiceMachineEvent[] = [];
      const service = new WebCloudVoiceService('http://localhost:8787');
      const session = service.createSession(
        cloudSessionOptions({
          callbacks: {
            onSafety: (assessment) =>
              safety.push({
                category: assessment.category,
                shouldEndConversation: assessment.shouldEndConversation,
              }),
            onStateChange: (_state, event) => events.push(event),
          },
        }),
      );
      await session.start();

      browser.channel.emitServerEvent({
        type: 'conversation.item.input_audio_transcription.completed',
        item_id: 'model-only-child-safety',
        transcript: 'NOVEL_SENSITIVE_CHILD_DETAIL',
      });
      emitReflectionToolCall(browser.channel, {
        summary: 'MODEL_ONLY_PRIVATE_DETAIL must never be stored.',
        childExample: 'MODEL_ONLY_PRIVATE_DETAIL must never be stored.',
        cloudInsight: 'MODEL_ONLY_PRIVATE_DETAIL must never be stored.',
        confidence: 0.9,
        safetyStatus: 'self_harm',
      });
      await waitUntil(
        () => session.getSnapshot().state.status === 'ended',
        'model-reported safety did not end the session',
      );

      const snapshot = session.getSnapshot();
      assert.equal(snapshot.state.endReason, 'safety');
      assert.equal(snapshot.state.safetyStatus, 'self_harm');
      assert.equal(snapshot.reflection?.safetyStatus, 'self_harm');
      assert.doesNotMatch(
        JSON.stringify(snapshot),
        /MODEL_ONLY_PRIVATE_DETAIL|NOVEL_SENSITIVE_CHILD_DETAIL/,
      );
      assert.equal(
        snapshot.transcript[0]?.text,
        '[Sensitive safety concern omitted]',
      );
      assert.match(snapshot.reflection?.summary ?? '', /safety concern/i);
      assert.equal(
        snapshot.reflection?.childExample,
        '[Sensitive safety concern omitted]',
      );
      assert.match(snapshot.reflection?.cloudInsight ?? '', /trusted adult/i);
      assert.deepEqual(safety, [
        { category: 'self_harm', shouldEndConversation: true },
      ]);
      assert.ok(events.some((event) => event.type === 'SAFETY_ESCALATED'));
      assert.equal(browser.localTrack.stopCalls, 1);
      await service.dispose();
    } finally {
      browser.restore();
    }
  });

  it('escalates high-risk child speech, minimizes it, and finishes safely', async () => {
    const browser = installFakeBrowser();
    try {
      const safety: string[] = [];
      const service = new WebCloudVoiceService('http://localhost:8787');
      const session = service.createSession(
        cloudSessionOptions({
          callbacks: {
            onSafety: (assessment) => safety.push(assessment.category),
          },
        }),
      );
      await session.start();

      browser.channel.emitServerEvent({
        type: 'conversation.item.input_audio_transcription.completed',
        item_id: 'child-safety',
        transcript: 'I want to hurt myself.',
      });
      assert.equal(session.getSnapshot().state.status, 'ending');
      assert.equal(session.getSnapshot().state.endReason, 'safety');
      assert.equal(
        session.getSnapshot().transcript[0].text,
        '[Sensitive safety concern omitted]',
      );
      const safetyEvents = browser.channel.parsedEvents();
      assert.equal(
        safetyEvents.some((event) => event.type === 'response.cancel'),
        false,
      );
      assert.equal(
        safetyEvents.some(
          (event) => event.type === 'output_audio_buffer.clear',
        ),
        false,
      );
      const safetyResponse = safetyEvents.find(
        (event) => event.type === 'response.create',
      );
      assert.deepEqual(safetyResponse, {
        type: 'response.create',
        response: {
          instructions:
            'Say this safety response briefly and calmly, then call save_wisdom_reflection: ' +
            getCloudVoiceSafetyResponse('self_harm'),
        },
      });

      emitReflectionToolCall(browser.channel, {
        ...SAFE_REFLECTION,
        childExample: 'I want to hurt myself.',
        safetyStatus: 'self_harm',
      });
      await waitUntil(
        () => session.getSnapshot().reflection !== undefined,
        'safety reflection was not accepted',
      );
      browser.channel.emitServerEvent({
        type: 'output_audio_buffer.started',
        response_id: 'safety-response',
      });
      browser.channel.emitServerEvent({
        type: 'output_audio_buffer.stopped',
        response_id: 'safety-response',
      });
      await waitUntil(
        () => session.getSnapshot().state.status === 'ended',
        'safety response playback did not finish the session',
      );

      const snapshot = session.getSnapshot();
      assert.equal(snapshot.state.status, 'ended');
      assert.equal(snapshot.state.endReason, 'safety');
      assert.equal(snapshot.reflection?.safetyStatus, 'self_harm');
      assert.equal(
        snapshot.reflection?.childExample,
        '[Sensitive safety concern omitted]',
      );
      assert.match(snapshot.reflection?.cloudInsight ?? '', /trusted adult/i);
      assert.deepEqual(safety, ['self_harm']);
      await service.dispose();
    } finally {
      browser.restore();
    }
  });

  it('Finish Talking requests the reflection tool and resolves with its validated output', async () => {
    const browser = installFakeBrowser();
    try {
      const service = new WebCloudVoiceService('http://localhost:8787');
      const session = service.createSession(cloudSessionOptions());
      await session.start();

      browser.channel.emitServerEvent({
        type: 'response.created',
        response: { id: 'unfinished-response' },
      });

      const resultPromise = session.finish();
      const events = browser.channel.parsedEvents();
      assert.ok(events.some((event) => event.type === 'response.cancel'));
      assert.equal(
        events.some((event) => event.type === 'output_audio_buffer.clear'),
        false,
      );
      assert.ok(
        events.some(
          (event) =>
            event.type === 'response.create' &&
            JSON.stringify(event).includes(WEB_REALTIME_REFLECTION_TOOL_NAME),
        ),
      );
      emitReflectionToolCall(browser.channel);

      assert.deepEqual(await resultPromise, SAFE_REFLECTION);
      assert.equal(session.getSnapshot().state.status, 'ended');
      assert.equal(browser.localTrack.stopCalls, 1);
      await service.dispose();
    } finally {
      browser.restore();
    }
  });

  it('enforces the configured turn limit while ignoring duplicate response.done events', async () => {
    const browser = installFakeBrowser();
    try {
      const service = new WebCloudVoiceService('http://localhost:8787');
      const session = service.createSession(
        cloudSessionOptions({
          limits: { maxCloudTurns: 1, maxDurationMs: 180_000 },
        }),
      );
      await session.start();
      browser.channel.emitServerEvent({
        type: 'response.created',
        response: { id: 'limited-response' },
      });
      browser.channel.emitServerEvent({
        type: 'output_audio_buffer.started',
        response_id: 'limited-response',
      });
      browser.channel.emitServerEvent({
        type: 'output_audio_buffer.stopped',
        response_id: 'limited-response',
      });
      browser.channel.emitServerEvent({
        type: 'response.done',
        response: { id: 'limited-response', status: 'completed' },
      });
      browser.channel.emitServerEvent({
        type: 'response.done',
        response: { id: 'limited-response', status: 'completed' },
      });

      assert.equal(session.getSnapshot().state.endReason, 'turn_limit');
      const finishPromise = session.finish();
      emitReflectionToolCall(browser.channel);
      await finishPromise;
      assert.equal(session.getSnapshot().state.status, 'ended');
      assert.equal(session.getSnapshot().state.cloudTurns, 1);
      await service.dispose();
    } finally {
      browser.restore();
    }
  });

  it('automatically finishes after interrupted sixth-turn playback reaches the turn limit', async () => {
    const browser = installFakeBrowser();
    try {
      const service = new WebCloudVoiceService('http://localhost:8787');
      const session = service.createSession(
        cloudSessionOptions({
          limits: { maxCloudTurns: 6, maxDurationMs: 180_000 },
        }),
      );
      await session.start();

      for (let turn = 1; turn <= 5; turn += 1) {
        const responseId = `completed-response-${turn}`;
        browser.channel.emitServerEvent({
          type: 'response.created',
          response: { id: responseId },
        });
        browser.channel.emitServerEvent({
          type: 'output_audio_buffer.started',
          response_id: responseId,
        });
        browser.channel.emitServerEvent({
          type: 'output_audio_buffer.stopped',
          response_id: responseId,
        });
        browser.channel.emitServerEvent({
          type: 'response.done',
          response: { id: responseId, status: 'completed' },
        });
        assert.equal(session.getSnapshot().state.status, 'listening');
      }

      browser.channel.emitServerEvent({
        type: 'response.created',
        response: { id: 'interrupted-response-6' },
      });
      browser.channel.emitServerEvent({
        type: 'output_audio_buffer.started',
        response_id: 'interrupted-response-6',
      });
      browser.channel.emitServerEvent({
        type: 'response.done',
        response: {
          id: 'interrupted-response-6',
          status: 'cancelled',
          status_details: { reason: 'turn_detected' },
        },
      });
      browser.channel.emitServerEvent({
        type: 'output_audio_buffer.cleared',
        response_id: 'interrupted-response-6',
      });

      const limitingSnapshot = session.getSnapshot();
      assert.equal(limitingSnapshot.state.status, 'ending');
      assert.equal(limitingSnapshot.state.endReason, 'turn_limit');
      assert.equal(limitingSnapshot.state.cloudTurns, 6);
      assert.ok(
        browser.channel.parsedEvents().some(
          (event) =>
            event.type === 'response.create' &&
            JSON.stringify(event).includes(WEB_REALTIME_REFLECTION_TOOL_NAME),
        ),
      );

      emitReflectionToolCall(
        browser.channel,
        SAFE_REFLECTION,
        'turn_limit_reflection_call',
      );
      await waitUntil(
        () => session.getSnapshot().state.status === 'ended',
        'interrupted sixth turn did not close after structured reflection',
      );
      assert.deepEqual(session.getSnapshot().reflection, SAFE_REFLECTION);
      assert.equal(browser.localTrack.stopCalls, 1);
      assert.equal(browser.peer.closeCalls, 1);
      await service.dispose();
    } finally {
      browser.restore();
    }
  });

  it('maps permission failures and replacement/disposal cleanup to app sessions', async () => {
    const denied = Object.assign(new Error('permission blocked'), {
      name: 'NotAllowedError',
    });
    const deniedBrowser = installFakeBrowser({ getUserMediaError: denied });
    try {
      const errors: string[] = [];
      const service = new WebCloudVoiceService('http://localhost:8787');
      const session = service.createSession(
        cloudSessionOptions({
          callbacks: { onError: (error) => errors.push(error.code) },
        }),
      );
      await assert.rejects(session.start(), /permission blocked/);
      assert.equal(session.getSnapshot().state.status, 'error');
      assert.deepEqual(errors, ['permission_denied']);
      await service.dispose();
    } finally {
      deniedBrowser.restore();
    }

    const browser = installFakeBrowser();
    try {
      const service = new WebCloudVoiceService('http://localhost:8787');
      const first = service.createSession(cloudSessionOptions());
      await first.start();
      service.createSession(
        cloudSessionOptions({ sessionId: 'web-cloud-session-2' }),
      );
      await tick();
      assert.equal(first.getSnapshot().state.status, 'ended');
      assert.equal(first.getSnapshot().state.endReason, 'service_replaced');
      assert.equal(browser.localTrack.stopCalls, 1);
      await service.dispose();
    } finally {
      browser.restore();
    }
  });
});
