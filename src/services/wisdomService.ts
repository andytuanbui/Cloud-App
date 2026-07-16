import {
  getCategories,
  getCategory,
  getCloudAvatar as getContentCloudAvatar,
  getCloudDeskImage as getContentCloudDeskImage,
  getGlobalIdentity as getContentGlobalIdentity,
  getHomeBedroomImage as getContentHomeBedroomImage,
  getLockedStorybookImage as getContentLockedStorybookImage,
  getNeedsWantsJarsImage as getContentNeedsWantsJarsImage,
  getRecommendedWisdomCards as getContentRecommendedWisdomCards,
  getWisdom,
  getWisdomsForCategory,
} from './contentService';
import { ImageSourcePropType } from 'react-native';
import { GlobalIdentity, RecommendedWisdomCard, Wisdom, WisdomWorld } from '../types/wisdom';

export async function getCloudAvatar(): Promise<ImageSourcePropType> {
  return getContentCloudAvatar();
}

export async function getCloudDeskImage(): Promise<ImageSourcePropType> {
  return getContentCloudDeskImage();
}

export async function getHomeBedroomImage(): Promise<ImageSourcePropType> {
  return getContentHomeBedroomImage();
}

export async function getNeedsWantsJarsImage(): Promise<ImageSourcePropType> {
  return getContentNeedsWantsJarsImage();
}

export async function getLockedStorybookImage(): Promise<ImageSourcePropType> {
  return getContentLockedStorybookImage();
}

export async function getGlobalIdentity(): Promise<GlobalIdentity> {
  return getContentGlobalIdentity();
}

export async function getHomeWisdomWorlds(): Promise<WisdomWorld[]> {
  const categories = await getCategories();
  const worlds = await Promise.all(
    categories.map(async (category) => {
      const categoryWisdoms = await getWisdomsForCategory(category.id);
    const heroWisdom = categoryWisdoms.find((wisdom) => wisdom.status !== 'locked') ?? categoryWisdoms[0];
    const lockedWisdom = categoryWisdoms.find((wisdom) => wisdom.status === 'locked') ?? categoryWisdoms[1] ?? heroWisdom;

    if (!heroWisdom || !lockedWisdom) {
      throw new Error(`Category has no wisdoms: ${category.id}`);
    }

      return {
        key: category.id,
        label: category.shortTitle,
        icon: category.icon,
        colors: category.color,
        image: category.image,
        background: category.background,
        heroTitle: heroWisdom.displayTitle,
        heroDescription: heroWisdom.subtitle,
        heroMinutes: heroWisdom.estimatedMinutes,
        heroImage: heroWisdom.coverImage,
        heroColors: category.heroColors,
        lockedTitle: lockedWisdom.title,
        lockedDescription: lockedWisdom.subtitle,
        lockedMinutes: lockedWisdom.estimatedMinutes,
        lockedImage: lockedWisdom.coverImage,
        lockedColors: category.lockedColors,
        heroWisdomId: heroWisdom.id,
        lockedWisdomId: lockedWisdom.id,
      };
    }),
  );

  return worlds;
}

export async function getWisdomById(wisdomId: string): Promise<Wisdom> {
  return getWisdom(wisdomId);
}

export async function getWorldForWisdom(wisdomId: string): Promise<WisdomWorld> {
  const wisdom = await getWisdomById(wisdomId);
  await getCategory(wisdom.categoryId);

  const world = (await getHomeWisdomWorlds()).find((item) => item.key === wisdom.categoryId);

  if (!world) {
    throw new Error(`World not found for category: ${wisdom.categoryId}`);
  }

  return world;
}

export async function getRecommendedWisdomCards(): Promise<RecommendedWisdomCard[]> {
  return getContentRecommendedWisdomCards();
}
