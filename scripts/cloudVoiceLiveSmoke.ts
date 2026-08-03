export {};

const serverUrl = (
  process.env.CLOUD_VOICE_SMOKE_SERVER_URL ?? 'http://localhost:8787'
).replace(/\/$/, '');

if (process.env.CLOUD_VOICE_ALLOW_PAID_SMOKE !== 'true') {
  throw new Error(
    'Live smoke test is locked. Set CLOUD_VOICE_ALLOW_PAID_SMOKE=true only after explicit approval for a paid API call.',
  );
}

const health = await fetch(`${serverUrl}/api/cloud-voice/health`);
if (!health.ok) throw new Error(`Voice backend health failed (${health.status}).`);
const healthBody = (await health.json()) as { configured?: boolean };
if (!healthBody.configured) {
  throw new Error('The voice backend reports that OPENAI_API_KEY is not configured.');
}

const narration = await fetch(`${serverUrl}/api/cloud-voice/narration`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: 'Cloud voice smoke test.' }),
});
if (!narration.ok) {
  throw new Error(`Live narration smoke test failed (${narration.status}).`);
}
const firstChunk = await narration.body?.getReader().read();
if (!firstChunk?.value?.byteLength) {
  throw new Error('Live narration returned no audio bytes.');
}

process.stdout.write('Live narration smoke test received audio.\n');
