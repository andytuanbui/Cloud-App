export type CloudWiseVoiceRoleConfig = Readonly<{
  storyNarratorVoice: string;
  cloudConversationVoice: string;
}>;

/**
 * Product-level voice identities. Environment overrides are resolved only by
 * the backend, where each API route keeps its role-specific field.
 */
export const defaultVoiceRoleConfig: CloudWiseVoiceRoleConfig = Object.freeze({
  storyNarratorVoice: 'ash',
  cloudConversationVoice: 'cedar',
});
