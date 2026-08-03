export const CLOUD_VOICE_SESSION_STATES = [
  'idle',
  'requestingPermission',
  'connecting',
  'listening',
  'childSpeaking',
  'thinking',
  'cloudSpeaking',
  'muted',
  'ending',
  'ended',
  'error',
  'unavailable',
] as const;

export type CloudVoiceSessionStatus =
  (typeof CLOUD_VOICE_SESSION_STATES)[number];

export const CLOUD_VOICE_SAFETY_CATEGORIES = [
  'safe',
  'personal_data',
  'bullying',
  'fear',
  'abuse_or_danger',
  'self_harm',
  'threats',
  'sexual_content',
  'secrets',
  'adult_or_illegal',
] as const;

export type CloudVoiceSafetyCategory =
  (typeof CLOUD_VOICE_SAFETY_CATEGORIES)[number];

export type CloudVoiceEndReason =
  | 'child_finished'
  | 'turn_limit'
  | 'duration_limit'
  | 'safety'
  | 'screen_exit'
  | 'service_replaced'
  | 'cleanup'
  | 'connection_closed';

export type CloudVoiceErrorCode =
  | 'permission_denied'
  | 'connection_failed'
  | 'speech_failed'
  | 'session_failed'
  | 'unavailable';

export type CloudVoiceError = {
  code: CloudVoiceErrorCode;
  message: string;
  recoverable: boolean;
};

export const DEFAULT_CLOUD_VOICE_MAX_TURNS = 6;
export const DEFAULT_CLOUD_VOICE_MAX_DURATION_MS = 3 * 60 * 1000;

export type CloudVoiceLimits = {
  maxCloudTurns: number;
  maxDurationMs: number;
};

export type CloudVoiceResumableStatus =
  | 'listening'
  | 'childSpeaking'
  | 'thinking'
  | 'cloudSpeaking';

export type CloudVoiceMachineState = {
  status: CloudVoiceSessionStatus;
  cloudTurns: number;
  limits: CloudVoiceLimits;
  startedAtMs?: number;
  lastTransitionAtMs: number;
  mutedFrom?: CloudVoiceResumableStatus;
  endReason?: CloudVoiceEndReason;
  safetyStatus: CloudVoiceSafetyCategory;
  error?: CloudVoiceError;
};

export type CloudVoiceMachineEvent =
  | { type: 'PERMISSION_REQUESTED'; atMs: number }
  | { type: 'PERMISSION_GRANTED'; atMs: number }
  | { type: 'PERMISSION_DENIED'; atMs: number; message?: string }
  | { type: 'CONNECTED'; atMs: number }
  | { type: 'CHILD_SPEECH_STARTED'; atMs: number }
  | { type: 'CHILD_SPEECH_ENDED'; atMs: number }
  | { type: 'CLOUD_RESPONSE_STARTED'; atMs: number }
  | { type: 'CLOUD_RESPONSE_ENDED'; atMs: number }
  | { type: 'MUTED'; atMs: number }
  | { type: 'UNMUTED'; atMs: number }
  | {
      type: 'END_REQUESTED';
      atMs: number;
      reason: CloudVoiceEndReason;
    }
  | { type: 'TURN_LIMIT_REACHED'; atMs: number }
  | { type: 'DURATION_LIMIT_REACHED'; atMs: number }
  | {
      type: 'SAFETY_ESCALATED';
      atMs: number;
      category: Exclude<CloudVoiceSafetyCategory, 'safe'>;
    }
  | { type: 'ENDED'; atMs: number }
  | { type: 'FAILED'; atMs: number; error: CloudVoiceError }
  | { type: 'MARKED_UNAVAILABLE'; atMs: number; message: string }
  | { type: 'RESET'; atMs: number };

export type CloudVoiceTranscriptRole = 'child' | 'cloud';

export type CloudVoiceTranscriptEntry = {
  id: string;
  role: CloudVoiceTranscriptRole;
  text: string;
  createdAtMs: number;
  final: boolean;
  safetyStatus: CloudVoiceSafetyCategory;
};

export type EphemeralCloudVoiceTranscript = {
  entries: CloudVoiceTranscriptEntry[];
  nextSequence: number;
  maxEntries: number;
  maxCharacters: number;
  maxEntryCharacters: number;
};

export type CloudVoiceSafetyAssessment = {
  category: CloudVoiceSafetyCategory;
  shouldEndConversation: boolean;
  shouldMinimizeTranscript: boolean;
  childSafeResponse?: string;
};

export type CloudVoiceWisdomContext = {
  wisdomId: string;
  wisdomTitle: string;
  storySummary: string;
  currentStoryScene: string;
  reflectionGoal: string;
  childAgeBand: string;
  previousAnswer?: string;
  moneyDecision?: string;
  takeaway?: string;
  authoredChoiceIds?: string[];
  maximumConversationTurns?: number;
  maximumDurationSeconds?: number;
};

export type CloudVoiceReflection = {
  summary: string;
  childExample: string;
  cloudInsight: string;
  confidence: number;
  safetyStatus: CloudVoiceSafetyCategory;
  authoredChoiceId?: string;
};

export type CloudVoiceReflectionParseResult =
  | { ok: true; value: CloudVoiceReflection }
  | { ok: false; issues: string[] };

export type CloudVoiceSessionSnapshot = {
  state: CloudVoiceMachineState;
  transcript: CloudVoiceTranscriptEntry[];
  reflection?: CloudVoiceReflection;
};

export type CloudVoiceSessionCallbacks = {
  onStateChange?: (
    state: CloudVoiceMachineState,
    event: CloudVoiceMachineEvent,
  ) => void;
  onTranscriptChange?: (entries: CloudVoiceTranscriptEntry[]) => void;
  onReflection?: (reflection: CloudVoiceReflection) => void;
  onSafety?: (assessment: CloudVoiceSafetyAssessment) => void;
  onError?: (error: CloudVoiceError) => void;
};

export type CloudVoiceSessionOptions = {
  sessionId: string;
  privacyPreservingSafetyId: string;
  context: CloudVoiceWisdomContext;
  limits?: Partial<CloudVoiceLimits>;
  callbacks?: CloudVoiceSessionCallbacks;
};

export interface CloudVoiceSession {
  readonly id: string;
  start(): Promise<void>;
  setMuted(muted: boolean): void;
  finish(): Promise<CloudVoiceReflection>;
  close(reason?: CloudVoiceEndReason): Promise<void>;
  getSnapshot(): CloudVoiceSessionSnapshot;
}

export interface CloudVoiceService {
  readonly mode: 'realtime' | 'mock' | 'unavailable';
  readonly supported: boolean;
  createSession(options: CloudVoiceSessionOptions): CloudVoiceSession;
  dispose(): Promise<void>;
}

export type CloudVoiceTimerHandle = unknown;

export interface CloudVoiceClock {
  now(): number;
  setTimeout(callback: () => void, delayMs: number): CloudVoiceTimerHandle;
  clearTimeout(handle: CloudVoiceTimerHandle): void;
}

export type CloudVoiceSpeechCallbacks = {
  onStart: () => void;
  onComplete: () => void;
  onError: (message: string) => void;
};

/**
 * A tiny adapter that lets mock mode use browser speech synthesis without
 * importing browser globals into the domain layer.
 */
export interface CloudVoiceSpeechOutput {
  speak(
    text: string,
    callbacks: CloudVoiceSpeechCallbacks,
  ): void | (() => void);
  cancel?(): void;
}
