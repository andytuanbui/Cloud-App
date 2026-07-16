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
import { ImageSourcePropType } from 'react-native';

async function resolveLocal<T>(value: T): Promise<T> {
  await Promise.resolve();
  return value;
}

function findRequired<T extends { id: string }>(items: T[], id: string, label: string): T {
  const item = items.find((candidate) => candidate.id === id);

  if (!item) {
    throw new Error(`${label} not found: ${id}`);
  }

  return item;
}

export async function getCategories(): Promise<Category[]> {
  return resolveLocal([...categories]);
}

export async function getCategory(id: string): Promise<Category> {
  return resolveLocal(findRequired(categories, id, 'Category'));
}

export async function getWisdom(id: string): Promise<Wisdom> {
  return resolveLocal(findRequired(wisdoms, id, 'Wisdom'));
}

export async function getWisdomsForCategory(categoryId: string): Promise<Wisdom[]> {
  await getCategory(categoryId);

  return resolveLocal(
    wisdoms
      .filter((wisdom) => wisdom.categoryId === categoryId)
      .sort((first, second) => first.order - second.order),
  );
}

export async function getStory(id: string): Promise<Story> {
  return resolveLocal(findRequired(stories, id, 'Story'));
}

export async function getChallenge(id: string): Promise<Challenge> {
  return resolveLocal(findRequired(challenges, id, 'Challenge'));
}

export async function getConversation(id: string): Promise<Conversation> {
  return resolveLocal(findRequired(conversations, id, 'Conversation'));
}

export async function getReward(id: string): Promise<Reward> {
  return resolveLocal(findRequired(rewards, id, 'Reward'));
}

export async function getGlobalIdentity(): Promise<GlobalIdentity> {
  return resolveLocal(globalIdentity);
}

export async function getCloudAvatar(): Promise<ImageSourcePropType> {
  return resolveLocal(assets.avatar);
}

export async function getCloudDeskImage(): Promise<ImageSourcePropType> {
  return resolveLocal(assets.threeJars);
}

export async function getHomeBedroomImage(): Promise<ImageSourcePropType> {
  return resolveLocal(assets.homeBedroom);
}

export async function getNeedsWantsJarsImage(): Promise<ImageSourcePropType> {
  return resolveLocal(assets.needsWantsJars);
}

export async function getLockedStorybookImage(): Promise<ImageSourcePropType> {
  return resolveLocal(assets.lockedStorybook);
}

export async function getRecommendedWisdomCards(): Promise<RecommendedWisdomCard[]> {
  return resolveLocal([...recommendedWisdoms]);
}
