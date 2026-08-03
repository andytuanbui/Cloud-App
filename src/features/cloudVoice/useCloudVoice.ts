import { useContext } from 'react';
import { CloudVoiceContext } from './CloudVoiceProvider';

export function useCloudVoice() {
  const context = useContext(CloudVoiceContext);
  if (!context) {
    throw new Error('useCloudVoice must be used inside CloudVoiceProvider.');
  }
  return context;
}
