import {
  getCategories,
  getCategory,
  getCloudAvatar as getContentCloudAvatar,
  getCloudDeskImage as getContentCloudDeskImage,
  getGlobalIdentity as getContentGlobalIdentity,
  getRecommendedWisdomCards as getContentRecommendedWisdomCards,
  getWisdom,
  getWisdomsForCategory,
} from './contentService';
import { RecommendedWisdomCard, Wisdom, WisdomWorld } from '../types/wisdom';

export function getCloudAvatar() {
  return getContentCloudAvatar();
}

export function getCloudDeskImage() {
  return getContentCloudDeskImage();
}

export function getGlobalIdentity() {
  return getContentGlobalIdentity();
}

export function getHomeWisdomWorlds(): WisdomWorld[] {
  return getCategories().map((category) => {
    const categoryWisdoms = getWisdomsForCategory(category.id);
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
  });
}

export function getWisdomById(wisdomId: string): Wisdom {
  return getWisdom(wisdomId);
}

export function getWorldForWisdom(wisdomId: string): WisdomWorld {
  const wisdom = getWisdomById(wisdomId);
  getCategory(wisdom.categoryId);

  const world = getHomeWisdomWorlds().find((item) => item.key === wisdom.categoryId);

  if (!world) {
    throw new Error(`World not found for category: ${wisdom.categoryId}`);
  }

  return world;
}

export function getRecommendedWisdomCards(): RecommendedWisdomCard[] {
  return getContentRecommendedWisdomCards();
}
