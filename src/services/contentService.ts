import {
  assets,
  categories,
  challenges,
  conversations,
  globalIdentity,
  recommendedWisdoms,
  rewards,
  stories,
  wisdoms,
} from '../content/wisdom';
import {
  Category,
  Challenge,
  Conversation,
  GlobalIdentity,
  RecommendedWisdomCard,
  Reward,
  Story,
  Wisdom,
} from '../types/wisdom';

function findRequired<T extends { id: string }>(items: T[], id: string, label: string): T {
  const item = items.find((candidate) => candidate.id === id);

  if (!item) {
    throw new Error(`${label} not found: ${id}`);
  }

  return item;
}

export function getCategories(): Category[] {
  return [...categories];
}

export function getCategory(id: string): Category {
  return findRequired(categories, id, 'Category');
}

export function getWisdom(id: string): Wisdom {
  return findRequired(wisdoms, id, 'Wisdom');
}

export function getWisdomsForCategory(categoryId: string): Wisdom[] {
  getCategory(categoryId);

  return wisdoms
    .filter((wisdom) => wisdom.categoryId === categoryId)
    .sort((first, second) => first.order - second.order);
}

export function getStory(id: string): Story {
  return findRequired(stories, id, 'Story');
}

export function getChallenge(id: string): Challenge {
  return findRequired(challenges, id, 'Challenge');
}

export function getConversation(id: string): Conversation {
  return findRequired(conversations, id, 'Conversation');
}

export function getReward(id: string): Reward {
  return findRequired(rewards, id, 'Reward');
}

export function getGlobalIdentity(): GlobalIdentity {
  return globalIdentity;
}

export function getCloudAvatar() {
  return assets.avatar;
}

export function getCloudDeskImage() {
  return assets.threeJars;
}

export function getRecommendedWisdomCards(): RecommendedWisdomCard[] {
  return [...recommendedWisdoms];
}
