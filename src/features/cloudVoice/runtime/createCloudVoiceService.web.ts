import { cloudVoiceFlags } from '../config/cloudVoiceFlags';
import type {
  CloudVoiceService,
  CloudVoiceSpeechOutput,
} from '../core/types';
import {
  MockCloudVoiceService,
  type MockCloudVoiceScenario,
} from '../mock/MockCloudVoiceService';
import { WebCloudVoiceService } from '../web/WebCloudVoiceService';
import { UnavailableCloudVoiceService } from './UnavailableCloudVoiceService';

export function createCloudVoiceService(): CloudVoiceService {
  if (!cloudVoiceFlags.cloudVoiceEnabled) {
    return new UnavailableCloudVoiceService();
  }
  if (cloudVoiceFlags.cloudVoiceMockMode) {
    return new MockCloudVoiceService({
      scenario: readMockScenario(),
      speechOutput: createBrowserMockSpeechOutput(),
    });
  }
  if (cloudVoiceFlags.cloudRealtimeConversationEnabled) {
    return new WebCloudVoiceService(cloudVoiceFlags.serverUrl);
  }
  return new UnavailableCloudVoiceService();
}
function readMockScenario(): MockCloudVoiceScenario {
  if (typeof window === 'undefined') return 'success';
  const value = new URLSearchParams(window.location.search).get(
    'cloudVoiceMockScenario',
  );
  return value === 'permission-denied' ||
    value === 'network-failure' ||
    value === 'safety-trigger'
    ? value
    : 'success';
}

function createBrowserMockSpeechOutput(): CloudVoiceSpeechOutput | undefined {
  if (
    typeof window === 'undefined' ||
    !window.speechSynthesis ||
    typeof SpeechSynthesisUtterance === 'undefined'
  ) {
    return undefined;
  }

  let active: SpeechSynthesisUtterance | undefined;
  return {
    speak: (text, callbacks) => {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.94;
      active = utterance;
      utterance.onstart = callbacks.onStart;
      utterance.onend = () => {
        if (active !== utterance) return;
        active = undefined;
        callbacks.onComplete();
      };
      utterance.onerror = (event) => {
        if (active !== utterance) return;
        active = undefined;
        callbacks.onError(
          event.error
            ? `Mock speech stopped: ${event.error}.`
            : 'Mock speech stopped unexpectedly.',
        );
      };
      window.speechSynthesis.speak(utterance);
      return () => {
        if (active !== utterance) return;
        active = undefined;
        window.speechSynthesis.cancel();
      };
    },
    cancel: () => {
      active = undefined;
      window.speechSynthesis.cancel();
    },
  };
}
