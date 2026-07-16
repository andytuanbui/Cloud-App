export type CloudEmotion = 'curious' | 'happy' | 'thoughtful' | 'proud';

export type CloudPresenceProfile = {
  emotion: CloudEmotion;
  greeting: {
    line: string;
    subtext: string;
  };
  expression: {
    browOpacity: number;
    browTilt: number;
    blinkTop: number;
    eyeWidth: number;
    smileOpacity: number;
    smileScale: number;
    waveEnergy: number;
  };
};

type CloudGreeting = {
  emotion: CloudEmotion;
  line: string;
  subtext: string;
};

const cloudGreetings: CloudGreeting[] = [
  {
    emotion: 'curious',
    line: 'Hi Andy! I saved you a seat.',
    subtext: 'I have a question I cannot stop thinking about.',
  },
  {
    emotion: 'happy',
    line: 'Andy, you made it.',
    subtext: 'I was hoping we could read something together today.',
  },
  {
    emotion: 'thoughtful',
    line: 'Hey Andy. I was just wondering...',
    subtext: 'How do we know which choices matter most?',
  },
  {
    emotion: 'proud',
    line: 'There you are, Andy.',
    subtext: 'I remembered how carefully you thought last time.',
  },
  {
    emotion: 'curious',
    line: 'Andy, come look at this.',
    subtext: 'I found a little question hiding in today.',
  },
  {
    emotion: 'happy',
    line: 'Hi Andy! I am glad you are here.',
    subtext: 'The room feels better when we wonder together.',
  },
  {
    emotion: 'thoughtful',
    line: 'I have been sitting with a thought.',
    subtext: 'Maybe we can untangle it together.',
  },
  {
    emotion: 'proud',
    line: 'Andy, I saved today for us.',
    subtext: 'I think your wiser self is going to like this one.',
  },
  {
    emotion: 'curious',
    line: 'Psst, Andy. I noticed something.',
    subtext: 'Small choices can tell big stories.',
  },
  {
    emotion: 'happy',
    line: 'Hi Andy! Welcome back.',
    subtext: 'I have been waiting to open this story with you.',
  },
  {
    emotion: 'thoughtful',
    line: 'Andy, can I ask you something?',
    subtext: 'It is the kind of question that grows if we sit with it.',
  },
  {
    emotion: 'proud',
    line: 'I am glad it is you today.',
    subtext: 'You notice things other people rush past.',
  },
  {
    emotion: 'curious',
    line: 'Andy, I found a maybe.',
    subtext: 'Maybe today we learn why wanting and needing feel different.',
  },
  {
    emotion: 'happy',
    line: 'There is my reading buddy.',
    subtext: 'I kept the story right here on the desk.',
  },
  {
    emotion: 'thoughtful',
    line: 'I was looking at the storybook.',
    subtext: 'It made me wonder what future-you would choose.',
  },
  {
    emotion: 'proud',
    line: 'You came back to think with me.',
    subtext: 'That already feels like a wise beginning.',
  },
  {
    emotion: 'curious',
    line: 'Andy, what do you think?',
    subtext: 'Can a tiny choice change the whole day?',
  },
  {
    emotion: 'happy',
    line: 'Hi Andy. I missed this.',
    subtext: 'Quiet room, warm light, one good question.',
  },
  {
    emotion: 'thoughtful',
    line: 'Something has been on my mind.',
    subtext: 'What makes a choice feel right tomorrow too?',
  },
  {
    emotion: 'proud',
    line: 'I am proud you showed up.',
    subtext: 'Not because you have to. Because you are becoming you.',
  },
  {
    emotion: 'curious',
    line: 'Andy, I found today’s wonder.',
    subtext: 'It starts with twenty dollars and a choice.',
  },
  {
    emotion: 'happy',
    line: 'Pull up a chair, Andy.',
    subtext: 'Today feels like a good day for a story.',
  },
  {
    emotion: 'thoughtful',
    line: 'I kept thinking about wants.',
    subtext: 'Some are fun. Some can wait. How do we tell?',
  },
  {
    emotion: 'proud',
    line: 'You are here, and that matters.',
    subtext: 'Let us take one careful thought together.',
  },
];

const expressionByEmotion: Record<CloudEmotion, CloudPresenceProfile['expression']> = {
  curious: {
    browOpacity: 0.22,
    browTilt: -5,
    blinkTop: 12,
    eyeWidth: 18,
    smileOpacity: 0.16,
    smileScale: 0.92,
    waveEnergy: 1,
  },
  happy: {
    browOpacity: 0.14,
    browTilt: 4,
    blinkTop: 14,
    eyeWidth: 21,
    smileOpacity: 0.3,
    smileScale: 1.08,
    waveEnergy: 1.12,
  },
  thoughtful: {
    browOpacity: 0.28,
    browTilt: -10,
    blinkTop: 15,
    eyeWidth: 16,
    smileOpacity: 0.11,
    smileScale: 0.86,
    waveEnergy: 0.78,
  },
  proud: {
    browOpacity: 0.2,
    browTilt: 8,
    blinkTop: 13,
    eyeWidth: 19,
    smileOpacity: 0.22,
    smileScale: 1,
    waveEnergy: 0.9,
  },
};

function getDateSeed(date: Date) {
  const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

  return key.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export function getTodayCloudPresence(date = new Date()): CloudPresenceProfile {
  const seed = getDateSeed(date);
  const greeting = cloudGreetings[seed % cloudGreetings.length];

  return {
    emotion: greeting.emotion,
    greeting: {
      line: greeting.line,
      subtext: greeting.subtext,
    },
    expression: expressionByEmotion[greeting.emotion],
  };
}
