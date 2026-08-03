import type { CloudVoiceService } from '../core/types';
import { MockCloudVoiceService } from '../mock/MockCloudVoiceService';
import { cloudVoiceFlags } from '../config/cloudVoiceFlags';
import { UnavailableCloudVoiceService } from './UnavailableCloudVoiceService';

/** Native/Expo Go factory. Mock mode remains available; live WebRTC is web-only. */
export function createCloudVoiceService(): CloudVoiceService {
  if (cloudVoiceFlags.cloudVoiceEnabled && cloudVoiceFlags.cloudVoiceMockMode) {
    return new MockCloudVoiceService();
  }
  return new UnavailableCloudVoiceService();
}
