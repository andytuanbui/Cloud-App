# Cloud Voice AI prototype

Cloud Voice is an optional, voice-tutor-style path inside the existing guided Wisdom experience. A separate Story narrator can read the current story scene, while Talk with Cloud lets a child speak naturally with Cloud and returns a short structured reflection to the normal Wisdom flow. Suggested answers and typed answers remain available at all times.

This is a development prototype, not a production release for children. No OpenAI key is committed, and live paid API tests require a real server-side key plus explicit permission.

## Product boundaries

- Cloud is the CloudWise AI guide. Cloud is not Leo; Leo remains the child in the "Three Ways to Use Money" story.
- The unseen Story narrator reads authored Wisdom stories and is not Cloud or a visible character.
- Cloud uses a synthetic built-in voice. It does not imitate or clone a real child, the app user, or another identifiable person.
- The target conversation is three to five short Cloud turns, with a hard maximum of six turns and three minutes.
- Only one voice session can be active. Starting another, leaving the screen, timing out, or unmounting the provider closes media tracks and the peer connection.
- Voice is optional. Disabling every AI flag leaves the authored suggested-answer and typed-answer flow usable.

## Architecture

| Layer | Responsibility |
| --- | --- |
| `CloudVoiceProvider` | Owns the active session, explicit state machine, duration, temporary transcript, safety event, and structured reflection. |
| Platform service factory | Uses deterministic mock mode in development, the WebRTC adapter on web in live mode, and an unavailable adapter on unsupported platforms. |
| WebRTC transport | Requests microphone access from a user gesture, creates the peer connection and `oai-events` data channel, sends the SDP offer to the local backend, plays the remote audio stream, and consumes Realtime events. |
| Cloud voice core | Centralizes the prompt, tool schema, limits, safety categories, transcript minimization, structured-reflection validation, and state transitions. |
| Local backend | Keeps `OPENAI_API_KEY` off the client, validates requests, applies exact-origin CORS and per-address limits, initializes Realtime sessions, and streams Speech API responses. |
| Narration service | Requests OpenAI narration when enabled, caches generated audio only in memory, and falls back to browser `speechSynthesis`. |
| Guided Wisdom integration | Maps a validated voice reflection into the existing session as `source: "voice"`; it does not persist the voice transcript or audio. |

The local backend exposes:

| Endpoint | Input | Result |
| --- | --- | --- |
| `GET /api/cloud-voice/health` | None | Readiness and whether live OpenAI access is configured; never returns the key or model secrets. |
| `POST /api/cloud-voice/realtime-session` | `application/sdp` plus validated, allowlisted CloudWise headers | SDP answer from the unified Realtime WebRTC session endpoint. |
| `POST /api/cloud-voice/narration` | JSON containing only `{ "text": "..." }` | Streamed `audio/mpeg` response from the Speech API. |

The backend accepts only the configured origin, defaults to `127.0.0.1:8787`, rejects malformed or oversized input, never returns upstream error bodies, and rate-limits each remote address to 120 health, 10 Realtime, and 30 narration requests per minute. SDP is capped at 64 KiB and narration at 4,096 characters. It is a local-development server, not an internet-ready authenticated service.

## OpenAI models and voice

These prototype defaults were checked against the official OpenAI documentation on 2026-08-11:

| Use | Default | Configuration |
| --- | --- | --- |
| Live speech-to-speech | `gpt-realtime-2.1` | `OPENAI_REALTIME_MODEL` |
| Cloud conversation voice | `cedar` | `OPENAI_REALTIME_VOICE` |
| Live transcript helper | `gpt-4o-mini-transcribe` | `OPENAI_REALTIME_TRANSCRIPTION_MODEL` |
| Story narration | `gpt-4o-mini-tts` | `OPENAI_TTS_MODEL` |
| Story narrator voice | `ash` | `OPENAI_TTS_VOICE` |

`gpt-realtime-2.1` supports audio input/output and tool use. The current Speech guide lists `ash` for `gpt-4o-mini-tts`, and the Realtime conversations guide lists `cedar` as a current Realtime voice. CloudWise intentionally keeps these identities separate: `storyNarratorVoice: ash` and `cloudConversationVoice: cedar`. The defaults live in `src/features/cloudVoice/config/voiceRoles.ts`; the backend resolves the two environment overrides into separate role-specific fields. See the official [GPT-Realtime-2.1 model page](https://developers.openai.com/api/docs/models/gpt-realtime-2.1), [WebRTC guide](https://developers.openai.com/api/docs/guides/realtime-webrtc), [Realtime conversations guide](https://developers.openai.com/api/docs/guides/realtime-conversations), and [text-to-speech guide](https://developers.openai.com/api/docs/guides/text-to-speech).

Model and voice identifiers are server-owned. Never expose them together with a secret in an `EXPO_PUBLIC_` variable, and never put `OPENAI_API_KEY` in browser or Expo code.

## Realtime conversation flow

1. The Talk with Cloud surface checks the feature flag and persisted `voiceFeaturesApprovedByParent` value. It shows the child disclosure before the microphone can start.
2. A press on **Talk to Cloud** calls `getUserMedia`. The app never requests or activates the microphone silently.
3. The browser adds the microphone track to an `RTCPeerConnection`, creates the `oai-events` data channel, and creates an SDP offer.
4. The browser posts that offer to `/api/cloud-voice/realtime-session`. The request carries only allowlisted Wisdom context and a random local safety identifier.
5. The backend validates the SDP and context, hashes the opaque safety identifier, builds the single reusable Cloud prompt plus `save_wisdom_reflection` tool, and posts multipart `sdp` and `session` fields to `https://api.openai.com/v1/realtime/calls` with the server-side API key.
6. The browser applies the returned SDP answer. Cloud audio arrives on the remote WebRTC media stream; the data channel carries state, transcript, and tool events.
7. Semantic VAD with low eagerness automatically creates responses and supports interruption while leaving more room for a slowly speaking child. The state machine drives the child-facing listening, thinking, speaking, muted, ending, and fallback UI.
8. Cloud calls `save_wisdom_reflection`. The client validates and minimizes the result before mapping it into the guided Wisdom session. **Finish Talking** explicitly requests that tool and uses a small local fallback result if it does not arrive within eight seconds.
9. Cleanup aborts requests, cancels timers, closes the data channel and peer connection, stops local and remote tracks, detaches audio, and clears transport-only transcript assembly.

The explicit application states are:

`idle`, `requestingPermission`, `connecting`, `listening`, `childSpeaking`, `thinking`, `cloudSpeaking`, `muted`, `ending`, `ended`, `error`, and `unavailable`.

The implementation consumes these current Realtime server events:

- `input_audio_buffer.speech_started` and `input_audio_buffer.speech_stopped`
- `conversation.item.input_audio_transcription.delta`, `.completed`, and `.failed`
- `response.created`
- `response.output_audio_transcript.delta` and `.done`
- `output_audio_buffer.started`, `.stopped`, and `.cleared`
- `response.function_call_arguments.done`
- `response.done`
- `error`

It can send `response.create`, `response.cancel`, `output_audio_buffer.clear`, and `conversation.item.create` with a `function_call_output`. The complete function call is also available on `response.done`; event handling should be rechecked whenever the Realtime API version changes. See OpenAI's [voice activity detection guide](https://developers.openai.com/api/docs/guides/realtime-vad) for the current VAD contract.

### Interruption caveat

The session requests `interrupt_response: true`, and the transport can explicitly send `response.cancel` followed by `output_audio_buffer.clear`. WebRTC is the preferred browser transport because OpenAI can account for audio actually played when a child interrupts. Real-world barge-in behavior still depends on browser audio routing, microphone echo cancellation, and headset/speaker conditions; it has not been validated by this no-key test run and must be checked in an approved live smoke session.

The application also finishes after 45 seconds in the listening state, at six Cloud turns, or at three minutes. A development-only indicator shows mode, elapsed duration, Cloud turns, and state; it never shows token prices to the child.

## Structured reflection

`save_wisdom_reflection` accepts only short fields:

- `summary` (maximum 240 characters)
- `childExample` (maximum 180 characters)
- `cloudInsight` (maximum 180 characters)
- `confidence` from 0 through 1
- `safetyStatus` from the controlled non-diagnostic categories
- optional `authoredChoiceId`, constrained to the current Wisdom's authored choices

The guided flow persists the compact reflection, a `voice` personal-response source, the mapped authored choice, and Cloud's short insight. It does not persist raw audio or the complete transcript.

## Story narration flow

1. **Listen to the Story** passes only the scene's exact authored `narrationText` and a stable `wisdomId:sceneId` cache key.
2. When AI narration is enabled, the browser posts that text to `/api/cloud-voice/narration`.
3. The backend asks `gpt-4o-mini-tts` and the Ash Story narrator to read the text exactly as written with warm, thoughtful storyteller instructions, then streams the upstream bytes without first buffering the complete response.
4. The web client reads the response into an in-memory Blob for broad browser compatibility, then plays it and reuses the Blob URL for that scene during the current mounted session.
5. If the backend is absent, unconfigured, or fails, the service immediately tries browser `speechSynthesis`. Unsupported native platforms keep the existing unavailable state.

Pause, resume, replay, scene changes, and cancellation are preserved. Narration stops when the scene changes, the screen unmounts, or a voice conversation starts. Cached generated audio is revoked on cleanup and is never written to persistent storage. The current web client buffers the streamed response before playback; true progressive playback through `MediaSource`, PCM, or WAV is a future latency improvement.

## Authored story and currency

**Three Ways to Use Money** contains eight authored scenes and 458 spoken words, with 55–63 words per scene. At a warm child-facing pace of roughly 130–150 words per minute, it runs for about 3–4 minutes. The display copy and spoken copy are authored separately only where currency pronunciation differs; narration still reads the complete authored `narrationText` without rewriting it.

`src/config/currency.ts` is the single currency configuration. The default is USD with a leading `$`, and its shared helpers render display text (`$90`), narration text (`ninety dollars`), and accessibility text (`90 dollars`). Guided totals and increments continue to come from `wisdom.decision.totalAmount` and `wisdom.decision.increment`.

## Voice identities and personality

The unseen Story narrator uses Ash for authored Wisdom stories. Its instructions call for a warm, calm, deep, reassuring, thoughtful natural storyteller with moderate pacing, meaningful pauses, and expression that never becomes theatrical. It never introduces itself as Cloud and must not sound like a lecturer, announcer, cartoon character, or sales voice.

Cloud uses Cedar only for direct Realtime conversation. The reusable prompt describes Cloud as youthful, warm, curious, calm, friendly, clear, and natural, with the energy of a thoughtful ten-year-old. Cloud uses moderate speed, short pauses, breathing room, clear pronunciation, and gentle emotion. Cloud must never sound babyish, exaggerated, like a cartoon announcer, or like an adult lecturer.

Cloud asks at most one short question at a time and normally speaks one or two short sentences. After every meaningful answer, Cloud's first sentence must acknowledge a concrete decision, reason, object, or goal from what the child actually said before asking the next question. Generic praise-only replies are explicitly rejected; for example, a child saving 30 dollars for headphones because they can wait receives a response grounded in the amount, headphones, or reason. Safety and privacy responses override normal grounding. Cloud also avoids long lectures, offers one concrete example for "I don't know," and never marks a personal feeling correct or incorrect. Cloud never claims to be human, Leo, a real friend, sibling, teacher, parent, therapist, or a real child. The MVP deliberately does not send the child's name to the voice prompt.

## Disclosure and parent approval

Child-facing disclosure:

> Cloud is an AI guide with an AI-made voice. Do not share your full name, address, school, phone number, or passwords.

The Story control separately discloses that its narrator voice is AI-generated. The Cloud AI-voice disclosure also appears inside the development Family settings. `voiceFeaturesApprovedByParent` defaults to `false`, is persisted locally in schema v6, and must be true before a microphone session can start.

In development, open **Family** and press **Approve Voice Preview**. The browser console helper `globalThis.__cloudwiseApproveVoice(true)` is also available in development; pass `false` to remove approval. This is a test control only. It is not authenticated parent identity, production consent, or final onboarding.

## Child safety

The prompt, local transcript inspection, reflection validator, and UI fallback form layered safeguards. Categories are stable and non-diagnostic:

| Category | MVP behavior |
| --- | --- |
| `personal_data` | Remind the child not to share details and redact detected names, email, phone, address, school, password, location, and postcode patterns. |
| `bullying`, `fear` | Give a short supportive response and encourage a trusted adult nearby. |
| `abuse_or_danger`, `self_harm`, `threats`, `sexual_content`, `secrets`, `adult_or_illegal` | Interrupt normal Wisdom talk, omit sensitive detail from the temporary transcript/result, give a brief fixed safety response, encourage a trusted adult nearby, mark `safetyStatus`, and end or tightly limit the session. |

Cloud does not diagnose, investigate deeply, provide therapy, promise secrecy, encourage dependence, or send parent notifications. The safety callback is an interface seam for a separately reviewed future notification system. Local pattern matching is defense in depth, not a complete child-safety classifier or crisis service.

## Data handling

- Raw microphone audio travels from the browser to OpenAI over the WebRTC media connection. The CloudWise backend does not proxy or store it, and the app does not record it.
- Generated narration is streamed through the backend and cached only in page memory. It is not permanently stored.
- The visible transcript is temporary React/session state, capped at 12 entries, 1,200 total characters, and 320 characters per entry. Detected identifiers are redacted; high-risk detail becomes a fixed omission marker.
- Complete transcripts are not part of persisted application state. Only the compact structured reflection is saved for the Wisdom flow.
- The local profile contains a random opaque `voiceSafetyIdentifier`, not the child's name or email. The backend hashes it before sending `OpenAI-Safety-Identifier`.
- Request bodies, audio, transcripts, API keys, and upstream error bodies are not logged by the voice server.

These rules describe CloudWise storage, not OpenAI API retention. Confirm the organization's OpenAI data controls before any production use.

### Under-18 and Zero Data Retention gate

OpenAI's [Under 18 API Guidance](https://developers.openai.com/api/docs/guides/safety-checks/under-18-api-guidance) says organizations serving minors must meet applicable child-safety and privacy law, and that personal data of children under 13 (or the applicable digital-consent age) must not be processed without Zero Data Retention configured for the API. Do not enable this prototype for production child traffic until the organization has completed legal/privacy review, age-appropriate safety review, parental-consent design, and any required OpenAI Zero Data Retention approval/configuration. The local approval toggle and transcript minimization do not satisfy that production gate by themselves.

## Environment variables

Copy `.env.example` to the ignored `.env` file. Keep secrets out of source control, screenshots, logs, and all `EXPO_PUBLIC_` variables.

### Server-only variables

| Variable | Default/example purpose |
| --- | --- |
| `OPENAI_API_KEY` | Blank placeholder. Required only for live OpenAI calls. |
| `OPENAI_REALTIME_MODEL` | `gpt-realtime-2.1` |
| `OPENAI_REALTIME_VOICE` | `cedar`; Cloud's Realtime conversation voice. |
| `OPENAI_REALTIME_TRANSCRIPTION_MODEL` | `gpt-4o-mini-transcribe` |
| `OPENAI_TTS_MODEL` | `gpt-4o-mini-tts` |
| `OPENAI_TTS_VOICE` | `ash`; the separate Story narrator voice. |
| `CLOUD_VOICE_SERVER_HOST` | `127.0.0.1` |
| `CLOUD_VOICE_SERVER_PORT` | `8787` |
| `CLOUD_VOICE_ALLOWED_ORIGIN` | `http://localhost:8083` (exactly one origin) |
| `CLOUD_VOICE_BODY_TIMEOUT_MS` | `5000` |
| `CLOUD_VOICE_UPSTREAM_TIMEOUT_MS` | `60000` |
| `CLOUD_VOICE_ALLOW_PAID_SMOKE` | `false`; the optional live narration smoke script requires an explicit temporary `true`. |

### Expo public feature controls

These values are safe browser configuration, not secrets. Restart Expo after changing them.

| Variable | Default | Effect |
| --- | --- | --- |
| `EXPO_PUBLIC_CLOUD_VOICE_ENABLED` | `true` | Master voice UI/service switch. |
| `EXPO_PUBLIC_CLOUD_REALTIME_CONVERSATION_ENABLED` | `true` | Allows the live web adapter when mock mode is off. |
| `EXPO_PUBLIC_CLOUD_AI_NARRATION_ENABLED` | `true` | Tries backend narration before browser speech. |
| `EXPO_PUBLIC_CLOUD_VOICE_MOCK_MODE` | `true` in development, otherwise `false` | Selects the deterministic, no-cost conversation service. |
| `EXPO_PUBLIC_CLOUD_VOICE_SERVER_URL` | Code fallback: `http://localhost:8787`; `.env.example`: `http://127.0.0.1:8787` | Backend base URL used by web voice and narration. |

## Local setup: no-cost mock mode

From the repository root:

```powershell
npm install
Copy-Item .env.example .env
```

In `.env`, leave `OPENAI_API_KEY` blank and set these client controls explicitly:

```dotenv
EXPO_PUBLIC_CLOUD_VOICE_ENABLED=true
EXPO_PUBLIC_CLOUD_REALTIME_CONVERSATION_ENABLED=true
EXPO_PUBLIC_CLOUD_AI_NARRATION_ENABLED=false
EXPO_PUBLIC_CLOUD_VOICE_MOCK_MODE=true
EXPO_PUBLIC_CLOUD_VOICE_SERVER_URL=http://127.0.0.1:8787
```

Then start Expo web:

```powershell
npm run web:voice
```

Equivalent command: `npm run web -- --port 8083`.

Complete the normal local profile setup, open **Family**, approve the voice preview, then enter **Three Ways to Use Money** and reach **Talk with Cloud**. With AI narration disabled, story read-aloud uses browser speech synthesis without contacting the backend.

### Mock scenarios

Append one query parameter to the Expo URL and reload:

| URL | Result |
| --- | --- |
| `http://localhost:8083/?cloudVoiceMockScenario=success` | Deterministic listening, thinking, browser-synthesized Cloud speech, transcript events, and structured completion. |
| `http://localhost:8083/?cloudVoiceMockScenario=permission-denied` | Simulated microphone denial and typed/suggested fallback. |
| `http://localhost:8083/?cloudVoiceMockScenario=network-failure` | Simulated recoverable connection failure and fallback. |
| `http://localhost:8083/?cloudVoiceMockScenario=safety-trigger` | Deterministic high-risk escalation, minimized transcript, trusted-adult response, and safe end. |

Unknown values use `success`. These scenarios make no OpenAI request and use no fake human recording; mock speech uses the browser's local speech engine when available.

## Local backend and live web setup

Only do this with an existing authorized key. Never paste the key into source code or an `EXPO_PUBLIC_` setting.

1. Put the key only in ignored `.env` as `OPENAI_API_KEY=...`.
2. Set `EXPO_PUBLIC_CLOUD_VOICE_MOCK_MODE=false` and keep the live conversation and server URL flags enabled.
3. Start the backend in terminal 1:

   ```powershell
   npm run voice:server
   ```

4. Optionally check the non-paid health endpoint:

   ```powershell
   Invoke-RestMethod http://localhost:8787/api/cloud-voice/health
   ```

5. Start Expo in terminal 2:

   ```powershell
   npm run web:voice
   ```

6. Open `http://localhost:8083`, approve voice in the development Family screen, and start the real Wisdom flow. Microphone access requires the user press and a browser secure context; `localhost` is accepted by modern browsers.

The backend can run with a blank key: health reports `configured: false`, live endpoints return a safe `503`, and the authored/browser fallbacks remain available.

### Optional paid smoke test

`voice:smoke` checks health and requests one short live narration. It does not test a Realtime call. It is locked unless paid testing has been explicitly approved:

```powershell
$env:CLOUD_VOICE_ALLOW_PAID_SMOKE='true'
npm run voice:smoke
Remove-Item Env:CLOUD_VOICE_ALLOW_PAID_SMOKE
```

`CLOUD_VOICE_SMOKE_SERVER_URL` can override the default `http://localhost:8787`. Do not run the command merely because a key exists; obtain explicit permission first. A full live WebRTC validation through the UI is also paid.

## Tests

All automated Cloud Voice tests are deterministic and make no paid or external API calls. They use injected clocks, speech providers, and fetch responses.

```powershell
npm run typecheck
npm run test:cloud-voice
npm run validate:cloud-voice
git diff --check
```

Coverage includes the state machine, permission and connection failures, cleanup, one-session ownership, turn and duration limits, prompt/context composition, structured-reflection validation and saving, typed/suggested fallbacks, narration provider ordering, local safety categories, personal-data redaction, high-risk minimization, backend validation/CORS/rate limits/streaming, parent approval, and the absence of transcript/audio fields from persisted state. The rendered browser validation additionally exercises the actual `speechSynthesis` fallback, narration cancellation on scene change, and the complete mock UI flow.

## Platform support

| Platform | Prototype status |
| --- | --- |
| Expo web | Required target. Deterministic mock mode works without a key; live microphone/WebRTC is implemented for compatible browsers; AI narration falls back to browser speech. |
| Expo Go on iOS/Android | The existing Wisdom and deterministic mock state flow remain available. Live WebRTC and OpenAI narration are unavailable; no native WebRTC dependency was added. |
| Future native development build | Add a native `CloudVoiceService` transport behind the current interface using an evaluated native WebRTC stack, device microphone permissions, remote audio routing, and identical cleanup/safety contracts. This requires a custom development build, not Expo Go. |

## Known limitations

- No real OpenAI key is included, and the live Realtime/TTS paths were not exercised by the no-cost automated run.
- Parent approval is a local development toggle, not authenticated consent or production parental controls.
- Only the Three Ways to Use Money guided flow is wired to voice, although the provider and context contracts are reusable.
- Local regex safety checks are intentionally conservative and incomplete; there is no reviewed crisis protocol, mandatory-reporting workflow, human escalation, or external parent notification.
- The web narration client buffers streamed MP3 chunks before playback; it does not yet begin playback from the first chunk.
- Realtime transcript accuracy, interruption behavior, acoustic echo, and latency vary by browser and device and need approved live testing.
- The server allows one configured CORS origin and has development-grade in-memory rate limits; it needs authentication, distributed limits, observability that excludes child content, and deployment hardening before remote use.
- Voice configuration is read at process/bundle startup. Restart the backend after server-variable changes and restart Expo after public-variable changes.
- No sentence-highlighting system existed in the story view, so none was introduced by this prototype.

## Native implementation path

Keep `CloudVoiceProvider`, the core state machine, prompt/tool schema, safety layer, structured-reflection mapper, backend endpoints, and mock contract unchanged. Add a native-specific service file that implements the same `CloudVoiceService` interface, then validate microphone permission timing, audio focus, Bluetooth/headset routing, interruption, background/foreground cleanup, screen exit, and app termination in a custom Expo development build. Do not add a native WebRTC package to Expo Go.

## Future custom Cloud voice path

OpenAI documents [custom voices](https://developers.openai.com/api/docs/guides/text-to-speech#custom-voices) for eligible organizations and requires matching consent and sample recordings from the voice actor. A future Cloud brand voice could replace the configured built-in voice ID behind the existing server variables after eligibility, policy, legal, quality, accessibility, and child-safety review. Use an adult professional voice actor or another fully authorized source with explicit consent. Never use the user's child, an app user's voice, or another identifiable child, and keep the AI-generated voice disclosure.
