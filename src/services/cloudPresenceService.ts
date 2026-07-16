export type CloudEmotion = 'curious' | 'happy' | 'thoughtful' | 'proud';

export type CloudGreeting = {
  emotion: CloudEmotion;
  line: string;
  subtext: string;
};

// Name-agnostic on purpose: this rotates through Cloud's voice, not a
// specific child's name. Personalizing this for real belongs to a future
// profile system, not a hardcoded string here.
const cloudGreetings: CloudGreeting[] = [
  { emotion: 'curious', line: 'I saved you a seat.', subtext: 'I have a question I cannot stop thinking about.' },
  { emotion: 'happy', line: 'You made it.', subtext: 'I was hoping we could read something together today.' },
  { emotion: 'thoughtful', line: 'Hey, I was just wondering...', subtext: 'How do we know which choices matter most?' },
  { emotion: 'proud', line: 'There you are.', subtext: 'I remembered how carefully you thought last time.' },
  { emotion: 'curious', line: 'Come look at this.', subtext: 'I found a little question hiding in today.' },
  { emotion: 'happy', line: 'I am glad you are here.', subtext: 'The room feels better when we wonder together.' },
  { emotion: 'thoughtful', line: 'I have been sitting with a thought.', subtext: 'Maybe we can untangle it together.' },
  { emotion: 'proud', line: 'I saved today for us.', subtext: 'I think your wiser self is going to like this one.' },
  { emotion: 'curious', line: 'Psst. I noticed something.', subtext: 'Small choices can tell big stories.' },
  { emotion: 'happy', line: 'Welcome back.', subtext: 'I have been waiting to open this story with you.' },
];

const expressionByEmotion: Record<CloudEmotion, { waveEnergy: number }> = {
  curious: { waveEnergy: 1 },
  happy: { waveEnergy: 1.12 },
  thoughtful: { waveEnergy: 0.78 },
  proud: { waveEnergy: 0.9 },
};

function getDateSeed(date: Date) {
  const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

  return key.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export type CloudPresenceProfile = {
  emotion: CloudEmotion;
  greeting: { line: string; subtext: string };
  waveEnergy: number;
};

export function getTodayCloudPresence(date = new Date()): CloudPresenceProfile {
  const seed = getDateSeed(date);
  const greeting = cloudGreetings[seed % cloudGreetings.length];

  return {
    emotion: greeting.emotion,
    greeting: { line: greeting.line, subtext: greeting.subtext },
    waveEnergy: expressionByEmotion[greeting.emotion].waveEnergy,
  };
}
