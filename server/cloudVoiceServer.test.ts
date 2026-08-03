import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import { describe, it } from 'node:test';
import type { Server } from 'node:http';
import {
  createCloudVoiceServer,
  loadCloudVoiceConfig,
  type CloudVoiceServerConfig,
  type FetchLike,
} from './cloudVoiceServer';

const SAFETY_IDENTIFIER = 'session_safety_0123456789abcdef';
const SDP_OFFER = [
  'v=0',
  'o=- 1 1 IN IP4 127.0.0.1',
  's=-',
  't=0 0',
  'm=audio 9 UDP/TLS/RTP/SAVPF 111',
  '',
].join('\r\n');

const WISDOM_CONTEXT = Object.freeze({
  wisdomTitle: 'Three Ways to Use Money',
  storySummary: 'Leo can spend now, save for later, or give to help.',
  currentStoryScene: 'Leo has 90 kr and pauses before choosing.',
  reflectionGoal: 'Connect waiting and balance to one personal example.',
  childAgeBand: '8-10',
  previousAnswer: 'Waiting for a game item felt difficult.',
  moneyDecision: '30 kr spend, 40 kr save, 20 kr give.',
  takeaway: 'Balance depends on what matters.',
  maximumConversationTurns: 6,
  maximumDurationSeconds: 180,
  authoredChoiceIds: ['yes-many-times', 'sometimes', 'no', 'not-sure'],
});

function encodeContext(value: unknown = WISDOM_CONTEXT): string {
  return Buffer.from(JSON.stringify(value), 'utf8').toString('base64url');
}

function realtimeHeaders(
  overrides: Readonly<Record<string, string>> = {},
): Record<string, string> {
  return {
    'Content-Type': 'application/sdp',
    Origin: 'http://localhost:8083',
    'X-CloudWise-Safety-Identifier': SAFETY_IDENTIFIER,
    'X-CloudWise-Wisdom-Id': 'three-ways-to-use-money',
    'X-CloudWise-Scene-Id': 'leo-pauses',
    'X-CloudWise-Age-Band': '8-10',
    'X-CloudWise-Max-Turns': '6',
    'X-CloudWise-Context': encodeContext(),
    ...overrides,
  };
}

function createConfig(
  overrides: Partial<CloudVoiceServerConfig> = {},
): CloudVoiceServerConfig {
  return {
    ...loadCloudVoiceConfig({ OPENAI_API_KEY: 'test-only-key' }),
    ...overrides,
  };
}

async function startServer(
  fetchImpl: FetchLike,
  config: CloudVoiceServerConfig = createConfig(),
): Promise<Readonly<{ server: Server; baseUrl: string }>> {
  const server = createCloudVoiceServer(config, { fetchImpl });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address() as AddressInfo;
  return { server, baseUrl: `http://127.0.0.1:${address.port}` };
}

async function closeServer(server: Server): Promise<void> {
  if (!server.listening) return;
  server.close();
  await once(server, 'close');
}

function expectedSafetyHash(): string {
  return createHash('sha256')
    .update('cloudwise-voice-safety-v1\0', 'utf8')
    .update(SAFETY_IDENTIFIER, 'utf8')
    .digest('hex');
}

describe('Cloud Voice backend', () => {
  it('reports readiness without exposing configuration and applies exact-origin CORS', async () => {
    const unusedFetch: FetchLike = async () => {
      throw new Error('The health route must not call OpenAI.');
    };
    const config = createConfig({ apiKey: undefined });
    const { server, baseUrl } = await startServer(unusedFetch, config);

    try {
      const health = await fetch(`${baseUrl}/api/cloud-voice/health`, {
        headers: { Origin: 'http://localhost:8083' },
      });
      assert.equal(health.status, 200);
      assert.equal(
        health.headers.get('access-control-allow-origin'),
        'http://localhost:8083',
      );
      assert.equal(health.headers.get('cache-control'), 'no-store');
      assert.deepEqual(await health.json(), {
        status: 'ok',
        service: 'cloud-voice',
        configured: false,
        liveAvailable: false,
      });

      const options = await fetch(
        `${baseUrl}/api/cloud-voice/realtime-session`,
        {
          method: 'OPTIONS',
          headers: { Origin: 'http://localhost:8083' },
        },
      );
      assert.equal(options.status, 204);
      assert.match(
        options.headers.get('access-control-allow-headers') ?? '',
        /X-CloudWise-Context/,
      );

      const denied = await fetch(`${baseUrl}/api/cloud-voice/health`, {
        headers: { Origin: 'http://localhost:8084' },
      });
      assert.equal(denied.status, 403);
      assert.equal(denied.headers.get('access-control-allow-origin'), null);
      assert.deepEqual(await denied.json(), {
        error: {
          code: 'origin_not_allowed',
          message: 'This request origin is not allowed.',
        },
      });
    } finally {
      await closeServer(server);
    }
  });

  it('rejects malformed or over-privileged context before contacting OpenAI', async () => {
    let calls = 0;
    const unusedFetch: FetchLike = async () => {
      calls += 1;
      return new Response(SDP_OFFER, {
        status: 201,
        headers: { 'Content-Type': 'application/sdp' },
      });
    };
    const { server, baseUrl } = await startServer(unusedFetch);

    try {
      const contextWithChildName = encodeContext({
        ...WISDOM_CONTEXT,
        childFirstName: 'Must not be accepted',
      });
      const invalidContext = await fetch(
        `${baseUrl}/api/cloud-voice/realtime-session`,
        {
          method: 'POST',
          headers: realtimeHeaders({
            'X-CloudWise-Context': contextWithChildName,
          }),
          body: SDP_OFFER,
        },
      );
      assert.equal(invalidContext.status, 400);
      assert.equal(
        ((await invalidContext.json()) as { error: { code: string } }).error.code,
        'invalid_context',
      );

      const invalidSafetyId = await fetch(
        `${baseUrl}/api/cloud-voice/realtime-session`,
        {
          method: 'POST',
          headers: realtimeHeaders({
            'X-CloudWise-Safety-Identifier': 'an email@example.com',
          }),
          body: SDP_OFFER,
        },
      );
      assert.equal(invalidSafetyId.status, 400);

      const wrongMediaType = await fetch(
        `${baseUrl}/api/cloud-voice/realtime-session`,
        {
          method: 'POST',
          headers: realtimeHeaders({ 'Content-Type': 'text/plain' }),
          body: SDP_OFFER,
        },
      );
      assert.equal(wrongMediaType.status, 415);
      assert.equal(calls, 0);
    } finally {
      await closeServer(server);
    }
  });

  it('builds the official multipart Realtime call with one controlled tool', async () => {
    let inspected = false;
    const mockFetch: FetchLike = async (input, init) => {
      assert.equal(String(input), 'https://api.openai.com/v1/realtime/calls');
      assert.equal(init?.method, 'POST');
      const headers = new Headers(init?.headers);
      assert.equal(headers.get('authorization'), 'Bearer test-only-key');
      assert.equal(headers.get('openai-safety-identifier'), expectedSafetyHash());
      assert.notEqual(
        headers.get('openai-safety-identifier'),
        SAFETY_IDENTIFIER,
      );
      assert.ok(init?.body instanceof FormData);
      assert.equal(init.body.get('sdp'), SDP_OFFER);

      const sessionField = init.body.get('session');
      assert.equal(typeof sessionField, 'string');
      const session = JSON.parse(sessionField as string) as {
        model: string;
        output_modalities: string[];
        parallel_tool_calls: boolean;
        instructions: string;
        audio: {
          input: {
            transcription: { model: string };
            turn_detection: {
              type: string;
              create_response: boolean;
              interrupt_response: boolean;
            };
          };
          output: { voice: string };
        };
        tools: Array<{
          name: string;
          parameters: {
            additionalProperties: boolean;
            properties: Record<string, unknown>;
          };
        }>;
      };
      assert.equal(session.model, 'gpt-realtime-2.1');
      assert.deepEqual(session.output_modalities, ['audio']);
      assert.equal(session.audio.output.voice, 'cedar');
      assert.equal(
        session.audio.input.transcription.model,
        'gpt-4o-mini-transcribe',
      );
      assert.deepEqual(session.audio.input.turn_detection, {
        type: 'semantic_vad',
        eagerness: 'low',
        create_response: true,
        interrupt_response: true,
      });
      assert.equal(session.parallel_tool_calls, false);
      assert.equal(session.tools.length, 1);
      assert.equal(session.tools[0]?.name, 'save_wisdom_reflection');
      assert.equal(session.tools[0]?.parameters.additionalProperties, false);
      assert.ok(session.tools[0]?.parameters.properties.childExample);
      assert.ok(session.tools[0]?.parameters.properties.summary);
      assert.ok(session.tools[0]?.parameters.properties.safetyStatus);
      assert.match(session.instructions, /Three Ways to Use Money/);
      assert.match(session.instructions, /Cloud is not Leo/);
      assert.doesNotMatch(session.instructions, new RegExp(SAFETY_IDENTIFIER));
      inspected = true;

      return new Response('v=0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\n', {
        status: 201,
        headers: { 'Content-Type': 'application/sdp' },
      });
    };
    const { server, baseUrl } = await startServer(mockFetch);

    try {
      const response = await fetch(
        `${baseUrl}/api/cloud-voice/realtime-session`,
        {
          method: 'POST',
          headers: realtimeHeaders(),
          body: SDP_OFFER,
        },
      );
      assert.equal(response.status, 201);
      assert.equal(response.headers.get('content-type'), 'application/sdp');
      assert.match(await response.text(), /^v=0/);
      assert.equal(inspected, true);
    } finally {
      await closeServer(server);
    }
  });

  it('streams exact narration text without waiting for the complete upstream audio', async () => {
    let releaseSecondChunk: (() => void) | undefined;
    const secondChunkGate = new Promise<void>((resolve) => {
      releaseSecondChunk = resolve;
    });
    const firstChunk = new Uint8Array([1, 2, 3]);
    const secondChunk = new Uint8Array([4, 5]);

    const mockFetch: FetchLike = async (input, init) => {
      assert.equal(String(input), 'https://api.openai.com/v1/audio/speech');
      assert.equal(init?.method, 'POST');
      const headers = new Headers(init?.headers);
      assert.equal(headers.get('openai-safety-identifier'), expectedSafetyHash());
      const body = JSON.parse(String(init?.body)) as {
        model: string;
        voice: string;
        input: string;
        instructions: string;
        response_format: string;
        stream_format: string;
      };
      assert.equal(body.model, 'gpt-4o-mini-tts');
      assert.equal(body.voice, 'cedar');
      assert.equal(body.input, 'Line one.\nLine two.');
      assert.match(body.instructions, /exactly as written/i);
      assert.equal(body.response_format, 'mp3');
      assert.equal(body.stream_format, 'audio');

      const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
          controller.enqueue(firstChunk);
          await secondChunkGate;
          controller.enqueue(secondChunk);
          controller.close();
        },
      });
      return new Response(stream, {
        status: 200,
        headers: { 'Content-Type': 'audio/mpeg' },
      });
    };
    const { server, baseUrl } = await startServer(mockFetch);

    try {
      const response = await fetch(`${baseUrl}/api/cloud-voice/narration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: 'http://localhost:8083',
          'X-CloudWise-Safety-Identifier': SAFETY_IDENTIFIER,
        },
        body: JSON.stringify({ text: 'Line one.\nLine two.' }),
      });
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('content-type'), 'audio/mpeg');

      const reader = response.body!.getReader();
      const first = await reader.read();
      assert.equal(first.done, false);
      assert.deepEqual(first.value, firstChunk);
      releaseSecondChunk?.();
      const second = await reader.read();
      assert.equal(second.done, false);
      assert.deepEqual(second.value, secondChunk);
      assert.equal((await reader.read()).done, true);
    } finally {
      releaseSecondChunk?.();
      await closeServer(server);
    }
  });

  it('rate-limits by remote address and never returns upstream error bodies', async () => {
    let calls = 0;
    const rejectedFetch: FetchLike = async () => {
      calls += 1;
      return new Response('provider detail: test-only-key and private body', {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    };
    const baseConfig = createConfig();
    const config = createConfig({
      rateLimits: {
        ...baseConfig.rateLimits,
        realtime: { limit: 1, windowMs: 60_000 },
      },
    });
    const { server, baseUrl } = await startServer(rejectedFetch, config);

    try {
      const first = await fetch(`${baseUrl}/api/cloud-voice/realtime-session`, {
        method: 'POST',
        headers: realtimeHeaders(),
        body: SDP_OFFER,
      });
      assert.equal(first.status, 502);
      const firstBody = await first.text();
      assert.match(firstBody, /realtime_upstream_error/);
      assert.doesNotMatch(firstBody, /test-only-key|private body|provider detail/);

      const second = await fetch(`${baseUrl}/api/cloud-voice/realtime-session`, {
        method: 'POST',
        headers: realtimeHeaders(),
        body: SDP_OFFER,
      });
      assert.equal(second.status, 429);
      assert.equal(second.headers.get('retry-after'), '60');
      assert.equal(calls, 1);
    } finally {
      await closeServer(server);
    }
  });
});
