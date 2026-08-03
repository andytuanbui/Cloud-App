export type CloudVoiceAvailability =
  | { allowed: true }
  | { allowed: false; message: string };

export function getCloudVoiceAvailability(input: {
  featureEnabled: boolean;
  parentApproved: boolean;
  serviceSupported: boolean;
}): CloudVoiceAvailability {
  if (!input.featureEnabled) {
    return {
      allowed: false,
      message: 'Voice is turned off. Continue by typing.',
    };
  }
  if (!input.parentApproved) {
    return {
      allowed: false,
      message: 'A parent needs to approve voice first. Continue by typing.',
    };
  }
  if (!input.serviceSupported) {
    return {
      allowed: false,
      message: 'Voice is unavailable here. Continue by typing.',
    };
  }
  return { allowed: true };
}
