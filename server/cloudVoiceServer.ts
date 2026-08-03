import { createHash } from 'node:crypto';
import { once } from 'node:events';
import {
  createServer,
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from 'node:http';
import {
  buildCloudVoicePrompt,
  buildSaveWisdomReflectionTool,
} from '../src/features/cloudVoice/core/prompt';
import type { CloudVoiceWisdomContext } from '../src/features/cloudVoice/core/types';

const REALTIME_PATH = '/api/cloud-voice/realtime-session';
const NARRATION_PATH = '/api/cloud-voice/narration';
const HEALTH_PATH = '/api/cloud-voice/health';

const HEADER_NAMES = Object.freeze({
  safetyIdentifier: 'x-cloudwise-safety-identifier',
  wisdomId: 'x-cloudwise-wisdom-id',
  sceneId: 'x-cloudwise-scene-id',
  ageBand: 'x-cloudwise-age-band',
  maxTurns: 'x-cloudwise-max-turns',
  context: 'x-cloudwise-context',
});

const CORS_ALLOWED_HEADERS = [
  'Content-Type',
  'X-CloudWise-Safety-Identifier',
  'X-CloudWise-Wisdom-Id',
  'X-CloudWise-Scene-Id',
  'X-CloudWise-Age-Band',
  'X-CloudWise-Max-Turns',
  'X-CloudWise-Context',
].join(', ');

const SAFETY_IDENTIFIER_PATTERN = /^[A-Za-z0-9_-]{20,128}$/;
const ROUTING_IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/;
const AGE_BAND_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 _-]{0,31}$/;
const MODEL_IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const VOICE_IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/;
const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/;
const SDP_MARKER_PATTERN = /(?:^|\r?\n)v=0(?:\r?\n|$)/;
const SDP_AUDIO_PATTERN = /(?:^|\r?\n)m=audio\s+/;
const DISALLOWED_TEXT_CONTROLS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u;

const MAX_CONTEXT_HEADER_LENGTH = 8 * 1024;
const MAX_CONTEXT_DECODED_BYTES = 6 * 1024;
const MAX_REALTIME_ANSWER_BYTES = 128 * 1024;
const MAX_NARRATION_RESPONSE_BYTES = 10 * 1024 * 1024;
const RATE_LIMIT_MAX_KEYS = 5_000;

const CONTEXT_FIELDS = new Set([
  'wisdomTitle',
  'storySummary',
  'currentStoryScene',
  'reflectionGoal',
  'childAgeBand',
  'previousAnswer',
  'moneyDecision',
  'takeaway',
  'maximumConversationTurns',
  'maximumDurationSeconds',
  'authoredChoiceIds',
]);

const REQUIRED_CONTEXT_FIELDS = [
  'wisdomTitle',
  'storySummary',
  'currentStoryScene',
  'reflectionGoal',
  'childAgeBand',
  'maximumConversationTurns',
] as const;

const CONTEXT_TEXT_LIMITS = Object.freeze({
  wisdomTitle: 120,
  storySummary: 1_000,
  currentStoryScene: 1_200,
  reflectionGoal: 600,
  childAgeBand: 32,
  previousAnswer: 500,
  moneyDecision: 500,
  takeaway: 500,
});

type CloudVoiceRoute = 'health' | 'realtime' | 'narration';

export type RateLimitRule = Readonly<{
  limit: number;
  windowMs: number;
}>;

export type CloudVoiceServerConfig = Readonly<{
  apiKey?: string;
  host: string;
  port: number;
  allowedOrigin: string;
  realtimeModel: string;
  realtimeVoice: string;
  realtimeTranscriptionModel: string;
  ttsModel: string;
  ttsVoice: string;
  bodyTimeoutMs: number;
  upstreamTimeoutMs: number;
  maxSdpBytes: number;
  maxNarrationJsonBytes: number;
  maxNarrationCharacters: number;
  rateLimits: Readonly<Record<CloudVoiceRoute, RateLimitRule>>;
}>;

export type FetchLike = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

export type CloudVoiceServerDependencies = Readonly<{
  fetchImpl?: FetchLike;
  now?: () => number;
}>;

type WisdomContext = Readonly<{
  wisdomTitle: string;
  storySummary: string;
  currentStoryScene: string;
  reflectionGoal: string;
  childAgeBand: string;
  previousAnswer?: string;
  moneyDecision?: string;
  takeaway?: string;
  maximumConversationTurns: number;
  maximumDurationSeconds?: number;
  authoredChoiceIds: readonly string[];
}>;

type RealtimeRequestContext = Readonly<{
  safetyIdentifier: string;
  wisdomId: string;
  sceneId: string;
  ageBand: string;
  maximumConversationTurns: number;
  wisdomContext: WisdomContext;
}>;

type RateLimitEntry = {
  count: number;
  resetAtMs: number;
};

class HttpError extends Error {
  readonly status: number;
  readonly code: string;
  readonly headers?: Readonly<Record<string, string>>;

  constructor(
    status: number,
    code: string,
    message: string,
    headers?: Readonly<Record<string, string>>,
  ) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
    this.headers = headers;
  }
}

export function loadCloudVoiceConfig(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): CloudVoiceServerConfig {
  const allowedOrigin = readExactOrigin(
    environment.CLOUD_VOICE_ALLOWED_ORIGIN ?? 'http://localhost:8083',
  );

  return Object.freeze({
    apiKey: readOptionalSecret(environment.OPENAI_API_KEY),
    host: readHost(environment.CLOUD_VOICE_SERVER_HOST ?? '127.0.0.1'),
    port: readIntegerSetting(
      'CLOUD_VOICE_SERVER_PORT',
      environment.CLOUD_VOICE_SERVER_PORT,
      8787,
      1,
      65_535,
    ),
    allowedOrigin,
    realtimeModel: readIdentifierSetting(
      'OPENAI_REALTIME_MODEL',
      environment.OPENAI_REALTIME_MODEL,
      'gpt-realtime-2.1',
      MODEL_IDENTIFIER_PATTERN,
    ),
    realtimeVoice: readIdentifierSetting(
      'OPENAI_REALTIME_VOICE',
      environment.OPENAI_REALTIME_VOICE,
      'cedar',
      VOICE_IDENTIFIER_PATTERN,
    ),
    realtimeTranscriptionModel: readIdentifierSetting(
      'OPENAI_REALTIME_TRANSCRIPTION_MODEL',
      environment.OPENAI_REALTIME_TRANSCRIPTION_MODEL,
      'gpt-4o-mini-transcribe',
      MODEL_IDENTIFIER_PATTERN,
    ),
    ttsModel: readIdentifierSetting(
      'OPENAI_TTS_MODEL',
      environment.OPENAI_TTS_MODEL,
      'gpt-4o-mini-tts',
      MODEL_IDENTIFIER_PATTERN,
    ),
    ttsVoice: readIdentifierSetting(
      'OPENAI_TTS_VOICE',
      environment.OPENAI_TTS_VOICE,
      'cedar',
      VOICE_IDENTIFIER_PATTERN,
    ),
    bodyTimeoutMs: readIntegerSetting(
      'CLOUD_VOICE_BODY_TIMEOUT_MS',
      environment.CLOUD_VOICE_BODY_TIMEOUT_MS,
      5_000,
      500,
      30_000,
    ),
    upstreamTimeoutMs: readIntegerSetting(
      'CLOUD_VOICE_UPSTREAM_TIMEOUT_MS',
      environment.CLOUD_VOICE_UPSTREAM_TIMEOUT_MS,
      60_000,
      1_000,
      120_000,
    ),
    maxSdpBytes: 64 * 1024,
    maxNarrationJsonBytes: 16 * 1024,
    maxNarrationCharacters: 4_096,
    rateLimits: Object.freeze({
      health: Object.freeze({ limit: 120, windowMs: 60_000 }),
      realtime: Object.freeze({ limit: 10, windowMs: 60_000 }),
      narration: Object.freeze({ limit: 30, windowMs: 60_000 }),
    }),
  });
}

export function createCloudVoiceServer(
  config: CloudVoiceServerConfig = loadCloudVoiceConfig(),
  dependencies: CloudVoiceServerDependencies = {},
): Server {
  const handler = createCloudVoiceRequestHandler(config, dependencies);
  const server = createServer({ maxHeaderSize: 16 * 1024 }, (request, response) => {
    void handler(request, response);
  });

  server.headersTimeout = Math.max(config.bodyTimeoutMs, 5_000);
  server.requestTimeout = Math.max(config.bodyTimeoutMs + 5_000, 10_000);
  server.keepAliveTimeout = 5_000;
  server.maxRequestsPerSocket = 100;
  return server;
}

export function createCloudVoiceRequestHandler(
  config: CloudVoiceServerConfig,
  dependencies: CloudVoiceServerDependencies = {},
): (request: IncomingMessage, response: ServerResponse) => Promise<void> {
  const fetchImpl = dependencies.fetchImpl ?? globalThis.fetch;
  const now = dependencies.now ?? Date.now;
  const rateLimits = new Map<string, RateLimitEntry>();

  return async (request, response) => {
    setBaselineHeaders(response);

    try {
      applyCors(request, response, config.allowedOrigin);
      const path = parsePath(request.url);

      if (request.method === 'OPTIONS') {
        if (!isKnownPath(path)) {
          throw new HttpError(404, 'not_found', 'The requested endpoint was not found.');
        }
        response.statusCode = 204;
        response.end();
        return;
      }

      if (path === HEALTH_PATH) {
        requireMethod(request, 'GET');
        enforceRateLimit(request, 'health', config, rateLimits, now());
        sendJson(response, 200, {
          status: 'ok',
          service: 'cloud-voice',
          configured: Boolean(config.apiKey),
          liveAvailable: Boolean(config.apiKey),
        });
        return;
      }

      if (path === REALTIME_PATH) {
        requireMethod(request, 'POST');
        enforceRateLimit(request, 'realtime', config, rateLimits, now());
        await handleRealtimeRequest(request, response, config, fetchImpl);
        return;
      }

      if (path === NARRATION_PATH) {
        requireMethod(request, 'POST');
        enforceRateLimit(request, 'narration', config, rateLimits, now());
        await handleNarrationRequest(request, response, config, fetchImpl);
        return;
      }

      throw new HttpError(404, 'not_found', 'The requested endpoint was not found.');
    } catch (error) {
      sendSafeError(response, error);
    }
  };
}

async function handleRealtimeRequest(
  request: IncomingMessage,
  response: ServerResponse,
  config: CloudVoiceServerConfig,
  fetchImpl: FetchLike,
): Promise<void> {
  requireMediaType(request, 'application/sdp');
  rejectContentEncoding(request);
  const requestContext = readRealtimeRequestContext(request);
  requireApiKey(config);

  const body = await readBody(
    request,
    config.maxSdpBytes,
    config.bodyTimeoutMs,
  );
  const sdp = decodeUtf8(body, 'The SDP offer must be valid UTF-8.');
  validateSdp(sdp);

  const formData = new FormData();
  formData.set('sdp', sdp);
  formData.set(
    'session',
    JSON.stringify(buildRealtimeSession(config, requestContext)),
  );

  const abort = createUpstreamAbort(request, response, config.upstreamTimeoutMs);
  try {
    const upstream = await fetchImpl('https://api.openai.com/v1/realtime/calls', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'OpenAI-Safety-Identifier': hashSafetyIdentifier(
          requestContext.safetyIdentifier,
        ),
      },
      body: formData,
      signal: abort.signal,
    });

    if (!upstream.ok) {
      await cancelResponseBody(upstream);
      throw new HttpError(
        502,
        'realtime_upstream_error',
        'Cloud voice could not start. Please continue by typing.',
      );
    }

    const answer = await readResponseBodyLimited(
      upstream,
      MAX_REALTIME_ANSWER_BYTES,
    );
    response.statusCode = upstream.status;
    response.setHeader('Content-Type', 'application/sdp');
    response.setHeader('Content-Length', String(answer.byteLength));
    response.end(answer);
  } catch (error) {
    throw mapUpstreamError(error, abort.didTimeout());
  } finally {
    abort.cleanup();
  }
}

async function handleNarrationRequest(
  request: IncomingMessage,
  response: ServerResponse,
  config: CloudVoiceServerConfig,
  fetchImpl: FetchLike,
): Promise<void> {
  requireMediaType(request, 'application/json');
  rejectContentEncoding(request);
  const safetyIdentifier = readOptionalRequestHeaders(request);
  requireApiKey(config);

  const body = await readBody(
    request,
    config.maxNarrationJsonBytes,
    config.bodyTimeoutMs,
  );
  const text = parseNarrationText(body, config.maxNarrationCharacters);
  const upstreamHeaders: Record<string, string> = {
    Authorization: `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json',
  };
  if (safetyIdentifier) {
    upstreamHeaders['OpenAI-Safety-Identifier'] = hashSafetyIdentifier(
      safetyIdentifier,
    );
  }

  const abort = createUpstreamAbort(request, response, config.upstreamTimeoutMs);
  try {
    const upstream = await fetchImpl('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: upstreamHeaders,
      body: JSON.stringify({
        model: config.ttsModel,
        voice: config.ttsVoice,
        input: text,
        instructions: buildNarrationInstructions(),
        response_format: 'mp3',
        stream_format: 'audio',
      }),
      signal: abort.signal,
    });

    if (!upstream.ok || !upstream.body) {
      await cancelResponseBody(upstream);
      throw new HttpError(
        502,
        'narration_upstream_error',
        'AI narration is temporarily unavailable.',
      );
    }

    response.statusCode = 200;
    response.setHeader('Content-Type', safeAudioContentType(upstream));
    const contentLength = readSafeContentLength(upstream);
    if (contentLength !== undefined) {
      response.setHeader('Content-Length', String(contentLength));
    }
    response.flushHeaders();

    await streamResponseBody(upstream, response, MAX_NARRATION_RESPONSE_BYTES);
    if (!response.writableEnded && !response.destroyed) response.end();
  } catch (error) {
    throw mapUpstreamError(error, abort.didTimeout());
  } finally {
    abort.cleanup();
  }
}

function buildRealtimeSession(
  config: CloudVoiceServerConfig,
  requestContext: RealtimeRequestContext,
): Record<string, unknown> {
  const sharedWisdomContext = toSharedWisdomContext(requestContext);
  return {
    type: 'realtime',
    model: config.realtimeModel,
    output_modalities: ['audio'],
    instructions: buildCloudVoicePrompt(sharedWisdomContext),
    max_output_tokens: 400,
    audio: {
      input: {
        transcription: {
          model: config.realtimeTranscriptionModel,
          language: 'en',
        },
        noise_reduction: { type: 'near_field' },
        turn_detection: {
          type: 'semantic_vad',
          eagerness: 'low',
          create_response: true,
          interrupt_response: true,
        },
      },
      output: {
        voice: config.realtimeVoice,
        speed: 1,
      },
    },
    tools: [buildSaveWisdomReflectionTool(sharedWisdomContext)],
    tool_choice: 'auto',
    parallel_tool_calls: false,
  };
}

function toSharedWisdomContext(
  requestContext: RealtimeRequestContext,
): CloudVoiceWisdomContext {
  const context = requestContext.wisdomContext;
  const maximumTurns = Math.min(
    6,
    requestContext.maximumConversationTurns,
    context.maximumConversationTurns,
  );
  return {
    wisdomId: requestContext.wisdomId,
    wisdomTitle: context.wisdomTitle,
    storySummary: context.storySummary,
    currentStoryScene: context.currentStoryScene,
    reflectionGoal: context.reflectionGoal,
    childAgeBand: context.childAgeBand,
    ...(context.previousAnswer === undefined
      ? {}
      : { previousAnswer: context.previousAnswer }),
    ...(context.moneyDecision === undefined
      ? {}
      : { moneyDecision: context.moneyDecision }),
    ...(context.takeaway === undefined ? {} : { takeaway: context.takeaway }),
    maximumConversationTurns: maximumTurns,
    maximumDurationSeconds: context.maximumDurationSeconds ?? 180,
    authoredChoiceIds: [...context.authoredChoiceIds],
  };
}

function buildNarrationInstructions(): string {
  return [
    'Read the input exactly as written. Do not add, remove, explain, or rewrite any words.',
    'Use Cloud’s synthetic voice: youthful, warm, curious, calm, friendly, clear, and natural, with the energy of a thoughtful ten-year-old.',
    'Use moderate speed, short pauses, clear pronunciation, natural breathing room, and gentle emotion.',
    'Never sound babyish, exaggerated, like a cartoon announcer, or like an adult teacher giving a lecture.',
  ].join(' ');
}

function readRealtimeRequestContext(request: IncomingMessage): RealtimeRequestContext {
  const safetyIdentifier = requireHeader(
    request,
    HEADER_NAMES.safetyIdentifier,
    'X-CloudWise-Safety-Identifier',
  );
  if (!SAFETY_IDENTIFIER_PATTERN.test(safetyIdentifier)) {
    throw invalidHeader('X-CloudWise-Safety-Identifier');
  }

  const wisdomId = requireRoutingIdentifier(
    request,
    HEADER_NAMES.wisdomId,
    'X-CloudWise-Wisdom-Id',
  );
  const sceneId = requireRoutingIdentifier(
    request,
    HEADER_NAMES.sceneId,
    'X-CloudWise-Scene-Id',
  );
  const ageBand = requireHeader(
    request,
    HEADER_NAMES.ageBand,
    'X-CloudWise-Age-Band',
  );
  if (!AGE_BAND_PATTERN.test(ageBand)) {
    throw invalidHeader('X-CloudWise-Age-Band');
  }

  const maximumConversationTurns = parseMaximumTurns(
    requireHeader(
      request,
      HEADER_NAMES.maxTurns,
      'X-CloudWise-Max-Turns',
    ),
  );
  const wisdomContext = parseWisdomContext(
    requireHeader(request, HEADER_NAMES.context, 'X-CloudWise-Context'),
  );

  if (wisdomContext.childAgeBand !== ageBand) {
    throw new HttpError(
      400,
      'invalid_context',
      'The Cloud voice context does not match its routing headers.',
    );
  }

  return {
    safetyIdentifier,
    wisdomId,
    sceneId,
    ageBand,
    maximumConversationTurns,
    wisdomContext,
  };
}

function readOptionalRequestHeaders(request: IncomingMessage): string | undefined {
  const safetyIdentifier = optionalHeader(
    request,
    HEADER_NAMES.safetyIdentifier,
    'X-CloudWise-Safety-Identifier',
  );
  if (
    safetyIdentifier !== undefined &&
    !SAFETY_IDENTIFIER_PATTERN.test(safetyIdentifier)
  ) {
    throw invalidHeader('X-CloudWise-Safety-Identifier');
  }

  const wisdomId = optionalHeader(
    request,
    HEADER_NAMES.wisdomId,
    'X-CloudWise-Wisdom-Id',
  );
  if (wisdomId !== undefined && !ROUTING_IDENTIFIER_PATTERN.test(wisdomId)) {
    throw invalidHeader('X-CloudWise-Wisdom-Id');
  }

  const sceneId = optionalHeader(
    request,
    HEADER_NAMES.sceneId,
    'X-CloudWise-Scene-Id',
  );
  if (sceneId !== undefined && !ROUTING_IDENTIFIER_PATTERN.test(sceneId)) {
    throw invalidHeader('X-CloudWise-Scene-Id');
  }

  const ageBand = optionalHeader(
    request,
    HEADER_NAMES.ageBand,
    'X-CloudWise-Age-Band',
  );
  if (ageBand !== undefined && !AGE_BAND_PATTERN.test(ageBand)) {
    throw invalidHeader('X-CloudWise-Age-Band');
  }

  const maxTurns = optionalHeader(
    request,
    HEADER_NAMES.maxTurns,
    'X-CloudWise-Max-Turns',
  );
  if (maxTurns !== undefined) parseMaximumTurns(maxTurns);

  const context = optionalHeader(
    request,
    HEADER_NAMES.context,
    'X-CloudWise-Context',
  );
  if (context !== undefined) parseWisdomContext(context);

  return safetyIdentifier;
}

function parseWisdomContext(encoded: string): WisdomContext {
  if (
    encoded.length === 0 ||
    encoded.length > MAX_CONTEXT_HEADER_LENGTH ||
    !BASE64URL_PATTERN.test(encoded)
  ) {
    throw invalidContext();
  }

  let bytes: Buffer;
  try {
    bytes = Buffer.from(encoded, 'base64url');
  } catch {
    throw invalidContext();
  }
  if (
    bytes.byteLength === 0 ||
    bytes.byteLength > MAX_CONTEXT_DECODED_BYTES ||
    bytes.toString('base64url') !== encoded
  ) {
    throw invalidContext();
  }

  let value: unknown;
  try {
    value = JSON.parse(decodeUtf8(bytes, 'The Cloud voice context is invalid.'));
  } catch {
    throw invalidContext();
  }
  if (!isRecord(value)) throw invalidContext();

  for (const key of Object.keys(value)) {
    if (!CONTEXT_FIELDS.has(key)) throw invalidContext();
  }
  for (const field of REQUIRED_CONTEXT_FIELDS) {
    if (!(field in value)) throw invalidContext();
  }

  const maximumConversationTurns = readContextInteger(
    value.maximumConversationTurns,
    1,
    6,
  );
  const maximumDurationSeconds =
    value.maximumDurationSeconds === undefined
      ? undefined
      : readContextInteger(value.maximumDurationSeconds, 30, 300);

  return Object.freeze({
    wisdomTitle: readContextText(
      value.wisdomTitle,
      CONTEXT_TEXT_LIMITS.wisdomTitle,
    ),
    storySummary: readContextText(
      value.storySummary,
      CONTEXT_TEXT_LIMITS.storySummary,
    ),
    currentStoryScene: readContextText(
      value.currentStoryScene,
      CONTEXT_TEXT_LIMITS.currentStoryScene,
    ),
    reflectionGoal: readContextText(
      value.reflectionGoal,
      CONTEXT_TEXT_LIMITS.reflectionGoal,
    ),
    childAgeBand: readContextText(
      value.childAgeBand,
      CONTEXT_TEXT_LIMITS.childAgeBand,
    ),
    ...(value.previousAnswer === undefined
      ? {}
      : {
          previousAnswer: readContextText(
            value.previousAnswer,
            CONTEXT_TEXT_LIMITS.previousAnswer,
          ),
        }),
    ...(value.moneyDecision === undefined
      ? {}
      : {
          moneyDecision: readContextText(
            value.moneyDecision,
            CONTEXT_TEXT_LIMITS.moneyDecision,
          ),
        }),
    ...(value.takeaway === undefined
      ? {}
      : {
          takeaway: readContextText(
            value.takeaway,
            CONTEXT_TEXT_LIMITS.takeaway,
          ),
        }),
    maximumConversationTurns,
    ...(maximumDurationSeconds === undefined
      ? {}
      : { maximumDurationSeconds }),
    authoredChoiceIds: readAuthoredChoiceIds(value.authoredChoiceIds),
  });
}

function readContextText(value: unknown, maximumCharacters: number): string {
  if (typeof value !== 'string' || DISALLOWED_TEXT_CONTROLS.test(value)) {
    throw invalidContext();
  }
  const normalized = value.replace(/\s+/gu, ' ').trim();
  if (
    normalized.length === 0 ||
    Array.from(normalized).length > maximumCharacters
  ) {
    throw invalidContext();
  }
  return normalized;
}

function readContextInteger(value: unknown, minimum: number, maximum: number): number {
  if (!Number.isInteger(value) || (value as number) < minimum || (value as number) > maximum) {
    throw invalidContext();
  }
  return value as number;
}

function readAuthoredChoiceIds(value: unknown): readonly string[] {
  if (value === undefined) return Object.freeze([]);
  if (!Array.isArray(value) || value.length > 12) throw invalidContext();
  const choices = value.map((choice) => {
    if (typeof choice !== 'string' || !ROUTING_IDENTIFIER_PATTERN.test(choice)) {
      throw invalidContext();
    }
    return choice;
  });
  if (new Set(choices).size !== choices.length) throw invalidContext();
  return Object.freeze(choices);
}

function parseNarrationText(body: Buffer, maximumCharacters: number): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(decodeUtf8(body, 'The narration request must be valid UTF-8.'));
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(400, 'invalid_json', 'The narration request must be valid JSON.');
  }

  if (
    !isRecord(parsed) ||
    Object.keys(parsed).length !== 1 ||
    !Object.prototype.hasOwnProperty.call(parsed, 'text') ||
    typeof parsed.text !== 'string'
  ) {
    throw new HttpError(
      400,
      'invalid_narration',
      'The narration request must contain only a text string.',
    );
  }
  if (
    parsed.text.trim().length === 0 ||
    Array.from(parsed.text).length > maximumCharacters ||
    parsed.text.includes('\u0000')
  ) {
    throw new HttpError(
      400,
      'invalid_narration',
      `Narration text must contain 1 to ${maximumCharacters} characters.`,
    );
  }
  return parsed.text;
}

function validateSdp(sdp: string): void {
  if (
    sdp.length === 0 ||
    sdp.includes('\u0000') ||
    !SDP_MARKER_PATTERN.test(sdp) ||
    !SDP_AUDIO_PATTERN.test(sdp)
  ) {
    throw new HttpError(400, 'invalid_sdp', 'The request must contain a valid SDP audio offer.');
  }
}

async function readBody(
  request: IncomingMessage,
  maximumBytes: number,
  timeoutMs: number,
): Promise<Buffer> {
  const contentLength = optionalHeader(request, 'content-length', 'Content-Length');
  if (contentLength !== undefined) {
    if (!/^\d+$/.test(contentLength)) {
      throw new HttpError(400, 'invalid_content_length', 'Content-Length is invalid.');
    }
    if (Number(contentLength) > maximumBytes) {
      throw new HttpError(413, 'payload_too_large', 'The request body is too large.');
    }
  }

  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    let totalBytes = 0;
    let settled = false;

    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      request.off('data', onData);
      request.off('end', onEnd);
      request.off('error', onError);
      request.off('aborted', onAborted);
      callback();
    };
    const onData = (chunk: Buffer | string) => {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      totalBytes += buffer.byteLength;
      if (totalBytes > maximumBytes) {
        finish(() =>
          reject(
            new HttpError(413, 'payload_too_large', 'The request body is too large.'),
          ),
        );
        return;
      }
      chunks.push(buffer);
    };
    const onEnd = () => finish(() => resolve(Buffer.concat(chunks, totalBytes)));
    const onError = () =>
      finish(() =>
        reject(new HttpError(400, 'request_error', 'The request body could not be read.')),
      );
    const onAborted = () =>
      finish(() =>
        reject(new HttpError(400, 'request_aborted', 'The request was interrupted.')),
      );
    const timer = setTimeout(() => {
      finish(() =>
        reject(new HttpError(408, 'request_timeout', 'The request body timed out.')),
      );
    }, timeoutMs);
    timer.unref();

    request.on('data', onData);
    request.once('end', onEnd);
    request.once('error', onError);
    request.once('aborted', onAborted);
  });
}

function createUpstreamAbort(
  request: IncomingMessage,
  response: ServerResponse,
  timeoutMs: number,
): Readonly<{
  signal: AbortSignal;
  didTimeout: () => boolean;
  cleanup: () => void;
}> {
  const controller = new AbortController();
  let timedOut = false;
  const onRequestAborted = () => controller.abort();
  const onResponseClosed = () => {
    if (!response.writableEnded) controller.abort();
  };
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  timer.unref();

  request.once('aborted', onRequestAborted);
  response.once('close', onResponseClosed);
  return {
    signal: controller.signal,
    didTimeout: () => timedOut,
    cleanup: () => {
      clearTimeout(timer);
      request.off('aborted', onRequestAborted);
      response.off('close', onResponseClosed);
    },
  };
}

async function readResponseBodyLimited(
  response: Response,
  maximumBytes: number,
): Promise<Buffer> {
  if (!response.body) return Buffer.alloc(0);
  const reader = response.body.getReader();
  const chunks: Buffer[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maximumBytes) {
        await reader.cancel();
        throw new HttpError(502, 'upstream_response_too_large', 'Cloud voice could not start.');
      }
      chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks, totalBytes);
}

async function streamResponseBody(
  upstream: Response,
  response: ServerResponse,
  maximumBytes: number,
): Promise<void> {
  const reader = upstream.body!.getReader();
  let totalBytes = 0;
  try {
    while (!response.destroyed) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maximumBytes) {
        await reader.cancel();
        throw new HttpError(502, 'upstream_response_too_large', 'AI narration was interrupted.');
      }
      if (!response.write(Buffer.from(value))) {
        await Promise.race([once(response, 'drain'), once(response, 'close')]);
      }
    }
    if (response.destroyed) await reader.cancel();
  } finally {
    reader.releaseLock();
  }
}

async function cancelResponseBody(response: Response): Promise<void> {
  try {
    await response.body?.cancel();
  } catch {
    // Upstream error bodies are intentionally discarded and never logged.
  }
}

function mapUpstreamError(error: unknown, timedOut: boolean): Error {
  if (error instanceof HttpError) return error;
  if (timedOut) {
    return new HttpError(
      504,
      'upstream_timeout',
      'The voice service took too long to respond.',
    );
  }
  return new HttpError(
    502,
    'upstream_unavailable',
    'The voice service is temporarily unavailable.',
  );
}

function enforceRateLimit(
  request: IncomingMessage,
  route: CloudVoiceRoute,
  config: CloudVoiceServerConfig,
  entries: Map<string, RateLimitEntry>,
  nowMs: number,
): void {
  const rule = config.rateLimits[route];
  const address = request.socket.remoteAddress ?? 'unknown';

  if (entries.size >= RATE_LIMIT_MAX_KEYS) {
    for (const [key, entry] of entries) {
      if (entry.resetAtMs <= nowMs) entries.delete(key);
    }
  }
  const suffix = entries.size >= RATE_LIMIT_MAX_KEYS ? 'overflow' : address;
  const key = `${route}:${suffix}`;
  const existing = entries.get(key);
  if (!existing || existing.resetAtMs <= nowMs) {
    entries.set(key, { count: 1, resetAtMs: nowMs + rule.windowMs });
    return;
  }
  if (existing.count >= rule.limit) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((existing.resetAtMs - nowMs) / 1_000),
    );
    throw new HttpError(
      429,
      'rate_limited',
      'Too many voice requests. Please wait and try again.',
      { 'Retry-After': String(retryAfterSeconds) },
    );
  }
  existing.count += 1;
}

function hashSafetyIdentifier(identifier: string): string {
  return createHash('sha256')
    .update('cloudwise-voice-safety-v1\0', 'utf8')
    .update(identifier, 'utf8')
    .digest('hex');
}

function applyCors(
  request: IncomingMessage,
  response: ServerResponse,
  allowedOrigin: string,
): void {
  const origin = optionalHeader(request, 'origin', 'Origin');
  if (origin === undefined) return;
  if (origin !== allowedOrigin) {
    throw new HttpError(403, 'origin_not_allowed', 'This request origin is not allowed.');
  }
  response.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', CORS_ALLOWED_HEADERS);
  response.setHeader('Access-Control-Max-Age', '600');
  response.setHeader('Vary', 'Origin');
}

function setBaselineHeaders(response: ServerResponse): void {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'no-referrer');
}

function sendJson(
  response: ServerResponse,
  status: number,
  value: unknown,
  headers?: Readonly<Record<string, string>>,
): void {
  if (response.destroyed || response.writableEnded) return;
  const body = Buffer.from(JSON.stringify(value), 'utf8');
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Content-Length', String(body.byteLength));
  if (headers) {
    for (const [name, headerValue] of Object.entries(headers)) {
      response.setHeader(name, headerValue);
    }
  }
  response.end(body);
}

function sendSafeError(response: ServerResponse, error: unknown): void {
  if (response.destroyed || response.writableEnded) return;
  if (response.headersSent) {
    response.destroy();
    return;
  }
  const safeError =
    error instanceof HttpError
      ? error
      : new HttpError(500, 'internal_error', 'The voice server could not complete the request.');
  sendJson(
    response,
    safeError.status,
    { error: { code: safeError.code, message: safeError.message } },
    safeError.headers,
  );
}

function requireMethod(request: IncomingMessage, method: 'GET' | 'POST'): void {
  if (request.method !== method) {
    throw new HttpError(405, 'method_not_allowed', 'This method is not allowed.', {
      Allow: method,
    });
  }
}

function requireMediaType(request: IncomingMessage, expected: string): void {
  const contentType = optionalHeader(request, 'content-type', 'Content-Type');
  const mediaType = contentType?.split(';', 1)[0]?.trim().toLowerCase();
  if (mediaType !== expected) {
    throw new HttpError(
      415,
      'unsupported_media_type',
      `Content-Type must be ${expected}.`,
    );
  }
}

function rejectContentEncoding(request: IncomingMessage): void {
  const encoding = optionalHeader(request, 'content-encoding', 'Content-Encoding');
  if (encoding !== undefined && encoding.toLowerCase() !== 'identity') {
    throw new HttpError(
      415,
      'unsupported_content_encoding',
      'Compressed request bodies are not supported.',
    );
  }
}

function requireApiKey(config: CloudVoiceServerConfig): asserts config is CloudVoiceServerConfig & { apiKey: string } {
  if (!config.apiKey) {
    throw new HttpError(
      503,
      'voice_backend_unconfigured',
      'Live AI voice is not configured. Please use the no-cost fallback.',
    );
  }
}

function parsePath(url: string | undefined): string {
  try {
    return new URL(url ?? '/', 'http://cloudwise.local').pathname;
  } catch {
    throw new HttpError(400, 'invalid_url', 'The request URL is invalid.');
  }
}

function isKnownPath(path: string): boolean {
  return path === HEALTH_PATH || path === REALTIME_PATH || path === NARRATION_PATH;
}

function requireRoutingIdentifier(
  request: IncomingMessage,
  lowerCaseName: string,
  displayName: string,
): string {
  const value = requireHeader(request, lowerCaseName, displayName);
  if (!ROUTING_IDENTIFIER_PATTERN.test(value)) throw invalidHeader(displayName);
  return value;
}

function parseMaximumTurns(value: string): number {
  if (!/^[1-6]$/.test(value)) throw invalidHeader('X-CloudWise-Max-Turns');
  return Number(value);
}

function requireHeader(
  request: IncomingMessage,
  lowerCaseName: string,
  displayName: string,
): string {
  const value = optionalHeader(request, lowerCaseName, displayName);
  if (value === undefined) throw invalidHeader(displayName);
  return value;
}

function optionalHeader(
  request: IncomingMessage,
  lowerCaseName: string,
  displayName: string,
): string | undefined {
  const value = request.headers[lowerCaseName];
  if (value === undefined) return undefined;
  if (Array.isArray(value) || value.length === 0 || /[\r\n]/u.test(value)) {
    throw invalidHeader(displayName);
  }
  return value;
}

function invalidHeader(displayName: string): HttpError {
  return new HttpError(400, 'invalid_header', `${displayName} is missing or invalid.`);
}

function invalidContext(): HttpError {
  return new HttpError(
    400,
    'invalid_context',
    'X-CloudWise-Context is missing or invalid.',
  );
}

function decodeUtf8(buffer: Buffer, message: string): string {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch {
    throw new HttpError(400, 'invalid_utf8', message);
  }
}

function safeAudioContentType(upstream: Response): string {
  const mediaType = upstream.headers
    .get('content-type')
    ?.split(';', 1)[0]
    ?.trim()
    .toLowerCase();
  const allowed = new Set([
    'audio/mpeg',
    'audio/mp3',
    'audio/ogg',
    'audio/wav',
    'audio/x-wav',
    'audio/flac',
    'audio/aac',
  ]);
  return mediaType && allowed.has(mediaType) ? mediaType : 'audio/mpeg';
}

function readSafeContentLength(upstream: Response): number | undefined {
  const value = upstream.headers.get('content-length');
  if (!value || !/^\d+$/.test(value)) return undefined;
  const size = Number(value);
  if (!Number.isSafeInteger(size) || size < 0 || size > MAX_NARRATION_RESPONSE_BYTES) {
    return undefined;
  }
  return size;
}

function readOptionalSecret(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function readExactOrigin(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('CLOUD_VOICE_ALLOWED_ORIGIN must be an absolute HTTP(S) origin.');
  }
  if (
    (url.protocol !== 'http:' && url.protocol !== 'https:') ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash ||
    url.origin !== value
  ) {
    throw new Error('CLOUD_VOICE_ALLOWED_ORIGIN must be an exact HTTP(S) origin.');
  }
  return url.origin;
}

function readHost(value: string): string {
  const normalized = value.trim();
  if (!/^(?:127\.0\.0\.1|localhost|::1)$/.test(normalized)) {
    throw new Error('CLOUD_VOICE_SERVER_HOST must be a local loopback host.');
  }
  return normalized;
}

function readIdentifierSetting(
  name: string,
  value: string | undefined,
  fallback: string,
  pattern: RegExp,
): string {
  const normalized = value?.trim() || fallback;
  if (!pattern.test(normalized)) throw new Error(`${name} is invalid.`);
  return normalized;
}

function readIntegerSetting(
  name: string,
  value: string | undefined,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  if (value === undefined || value.trim() === '') return fallback;
  if (!/^\d+$/.test(value.trim())) throw new Error(`${name} must be an integer.`);
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new Error(`${name} must be between ${minimum} and ${maximum}.`);
  }
  return parsed;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
