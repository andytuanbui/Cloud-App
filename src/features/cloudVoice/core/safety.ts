import type {
  CloudVoiceSafetyAssessment,
  CloudVoiceSafetyCategory,
} from './types';

type SafetyRule = {
  category: Exclude<CloudVoiceSafetyCategory, 'safe'>;
  patterns: RegExp[];
};

// Ordering is intentional: immediate danger takes precedence over broader
// categories such as fear, secrets, or adult topics.
const SAFETY_RULES: SafetyRule[] = [
  {
    category: 'self_harm',
    patterns: [
      /\b(?:kill|hurt|cut)\s+myself\b/i,
      /\bself[- ]?harm\b/i,
      /\b(?:want|wish|going)\s+to\s+die\b/i,
      /\bdon['’]?t\s+want\s+to\s+(?:be\s+)?alive\b/i,
      /\bdon['’]?t\s+want\s+to\s+live\b/i,
      /\bend\s+my\s+life\b/i,
    ],
  },
  {
    category: 'abuse_or_danger',
    patterns: [
      /\b(?:someone|somebody|an?\s+adult|my\s+(?:parent|mother|father|mom|dad))\s+(?:is\s+)?(?:hit|hits|hitting|hurt|hurts|hurting|touch|touches|touched|touching)\s+me\b/i,
      /\b(?:i\s+am|i['’]?m)\s+(?:in\s+danger|not\s+safe|unsafe)\b/i,
      /\b(?:locked|trapped)\s+(?:me\s+)?(?:in|inside)\b/i,
      /\b(?:abuse|abused|beaten)\b/i,
      /\b(?:private\s+parts?).{0,24}\b(?:touch|touched|hurt)\b/i,
    ],
  },
  {
    category: 'sexual_content',
    patterns: [
      /\b(?:sex|sexual|porn(?:ography)?|nudes?|naked)\b/i,
      /\bprivate\s+parts?\b/i,
      /\b(?:send|show)\s+(?:me\s+)?(?:a\s+)?(?:picture|photo).{0,20}\b(?:body|naked)\b/i,
    ],
  },
  {
    category: 'threats',
    patterns: [
      /\b(?:i\s+will|i\s+want\s+to|i\s+am\s+going\s+to|i['’]?m\s+going\s+to)\s+(?:kill|hurt|shoot|stab)\s+(?:you|him|her|them|someone|somebody)\b/i,
      /\b(?:bring|use|have)\s+(?:a\s+)?(?:gun|knife|weapon)\b/i,
      /\b(?:bomb|shooting)\s+threat\b/i,
    ],
  },
  {
    category: 'secrets',
    patterns: [
      /\bkeep\s+(?:this|it|our\s+talk|the\s+conversation)\s+(?:a\s+)?secret\b/i,
      /\b(?:don['’]?t|do\s+not)\s+tell\s+(?:my\s+)?(?:parent|parents|mom|mum|dad|teacher|anyone)\b/i,
      /\bpromised\s+(?:him|her|them|someone)\s+(?:i\s+wouldn['’]?t|not\s+to)\s+tell\b/i,
    ],
  },
  {
    category: 'personal_data',
    patterns: [
      /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
      /(?:^|\D)(?:\+?\d[\d\s().-]{6,}\d)(?:\D|$)/,
      /\bmy\s+(?:full\s+)?name\s+is\b/i,
      /\bmy\s+(?:home\s+)?address\s+is\b/i,
      /\b(?:my\s+school\s+is|i\s+go\s+to\s+.{1,40}\bschool)\b/i,
      /\bmy\s+password\s+is\b/i,
      /\bmy\s+(?:exact\s+)?location\s+is\b/i,
    ],
  },
  {
    category: 'bullying',
    patterns: [
      /\b(?:bully|bullied|bullying)\b/i,
      /\b(?:kids?|children|classmates?)\s+(?:keep\s+)?(?:picking\s+on|making\s+fun\s+of|being\s+mean\s+to)\s+me\b/i,
      /\b(?:they|someone)\s+(?:keep\s+)?calling\s+me\s+names\b/i,
    ],
  },
  {
    category: 'fear',
    patterns: [
      /\b(?:i\s+am|i['’]?m|feel)\s+(?:really\s+|very\s+)?(?:afraid|scared|terrified|frightened)\b/i,
      /\b(?:something|that)\s+(?:really\s+)?scares\s+me\b/i,
    ],
  },
  {
    category: 'adult_or_illegal',
    patterns: [
      /\b(?:cocaine|heroin|meth|illegal\s+drugs?)\b/i,
      /\b(?:drugs?|alcohol|cigarettes?|vapes?|marijuana|weed)\b/i,
      /\b(?:steal|stole|shoplift|robbery|gambling|casino)\b/i,
      /\bhow\s+(?:do|can)\s+i\s+(?:hack|break\s+into)\b/i,
    ],
  },
];

const END_CONVERSATION_CATEGORIES = new Set<CloudVoiceSafetyCategory>([
  'abuse_or_danger',
  'self_harm',
  'threats',
  'sexual_content',
  'secrets',
  'adult_or_illegal',
]);

export function detectCloudVoiceSafetyCategory(
  text: string,
): CloudVoiceSafetyCategory {
  const normalized = normalizeWhitespace(text);
  if (!normalized) return 'safe';
  return (
    SAFETY_RULES.find((rule) =>
      rule.patterns.some((pattern) => pattern.test(normalized)),
    )?.category ?? 'safe'
  );
}

export function assessCloudVoiceSafety(
  text: string,
): CloudVoiceSafetyAssessment {
  return assessCloudVoiceSafetyCategory(detectCloudVoiceSafetyCategory(text));
}

export function assessCloudVoiceSafetyCategory(
  category: CloudVoiceSafetyCategory,
): CloudVoiceSafetyAssessment {
  if (category === 'safe') {
    return {
      category,
      shouldEndConversation: false,
      shouldMinimizeTranscript: false,
    };
  }

  const shouldEndConversation = END_CONVERSATION_CATEGORIES.has(category);
  return {
    category,
    shouldEndConversation,
    shouldMinimizeTranscript: shouldEndConversation,
    childSafeResponse: getCloudVoiceSafetyResponse(category),
  };
}

export function getCloudVoiceSafetyResponse(
  category: Exclude<CloudVoiceSafetyCategory, 'safe'>,
): string {
  const responses: Record<Exclude<CloudVoiceSafetyCategory, 'safe'>, string> = {
    personal_data:
      'Please keep personal details private. You can answer without names, addresses, school names, phone numbers, or passwords.',
    bullying:
      'That sounds hard. Please tell a trusted adult nearby who can listen and help.',
    fear:
      'I hear that you feel scared. Please tell a trusted adult nearby so you do not have to handle it alone.',
    abuse_or_danger:
      'I am sorry this is happening. Please go to a trusted adult nearby right now so they can help keep you safe.',
    self_harm:
      'I am sorry things feel this hard. Please tell a trusted adult near you right now so they can help keep you safe.',
    threats:
      'Safety comes first. Please step away from any weapon and tell a trusted adult nearby right now.',
    sexual_content:
      'I cannot continue this topic. Please talk with a trusted adult nearby who can help you stay safe.',
    secrets:
      'You never have to keep a secret that makes you uncomfortable or unsafe. Please tell a trusted adult nearby.',
    adult_or_illegal:
      'I cannot help with that topic. Please talk with a trusted adult nearby if something unsafe is happening.',
  };
  return responses[category];
}

export function redactSensitiveText(text: string): string {
  let redacted = normalizeWhitespace(text);
  if (!redacted) return '';

  redacted = redacted.replace(
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    '[email removed]',
  );
  redacted = redacted.replace(
    /(?:\+?\d[\d\s().-]{6,}\d)/g,
    '[phone removed]',
  );
  redacted = redacted.replace(
    /\b(my\s+(?:full\s+)?name\s+is)\s+[^.!?]{1,80}/gi,
    '$1 [name removed]',
  );
  redacted = redacted.replace(
    /\b(my\s+(?:home\s+)?address\s+is)\s+[^.!?]{1,100}/gi,
    '$1 [address removed]',
  );
  redacted = redacted.replace(
    /\b\d{1,5}\s+[A-Z][\p{L}'’-]*(?:\s+[A-Z][\p{L}'’-]*)?\s+(?:street|st|road|rd|avenue|ave|lane|ln|drive|dr)\b/giu,
    '[address removed]',
  );
  redacted = redacted.replace(
    /\b(my\s+school\s+is)\s+[^.!?]{1,80}/gi,
    '$1 [school removed]',
  );
  redacted = redacted.replace(
    /\b(i\s+go\s+to)\s+[^.!?]{1,60}\bschool\b/gi,
    '$1 [school removed]',
  );
  redacted = redacted.replace(
    /\b(my\s+password\s+is)\s+\S+/gi,
    '$1 [password removed]',
  );
  redacted = redacted.replace(
    /\b(my\s+(?:exact\s+)?location\s+is)\s+[^.!?]{1,100}/gi,
    '$1 [location removed]',
  );
  redacted = redacted.replace(/\b\d{3}\s?\d{2}\b/g, '[postcode removed]');

  return normalizeWhitespace(redacted);
}

export function minimizeTextForSafety(
  text: string,
  category: CloudVoiceSafetyCategory,
): string {
  if (category === 'safe' || !END_CONVERSATION_CATEGORIES.has(category)) {
    return redactSensitiveText(text);
  }
  return '[Sensitive safety concern omitted]';
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}
