import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { loadCloudVoiceConfig } from '../../../../server/cloudVoiceServer';
import { defaultVoiceRoleConfig } from './voiceRoles';

describe('CloudWise voice roles', () => {
  it('assigns Ash to the story narrator and Cedar to Cloud conversation', () => {
    const config = loadCloudVoiceConfig({});

    assert.equal(defaultVoiceRoleConfig.storyNarratorVoice, 'ash');
    assert.equal(defaultVoiceRoleConfig.cloudConversationVoice, 'cedar');
    assert.equal(config.storyNarratorVoice, 'ash');
    assert.equal(config.cloudConversationVoice, 'cedar');
    assert.notEqual(
      config.storyNarratorVoice,
      config.cloudConversationVoice,
      'the story narrator and Cloud must not share one voice setting',
    );
  });

  it('configures the narrator and Cloud conversation independently', () => {
    const narratorOverride = loadCloudVoiceConfig({ OPENAI_TTS_VOICE: 'nova' });
    assert.equal(narratorOverride.storyNarratorVoice, 'nova');
    assert.equal(narratorOverride.cloudConversationVoice, 'cedar');

    const conversationOverride = loadCloudVoiceConfig({
      OPENAI_REALTIME_VOICE: 'marin',
    });
    assert.equal(conversationOverride.storyNarratorVoice, 'ash');
    assert.equal(conversationOverride.cloudConversationVoice, 'marin');
  });
});
