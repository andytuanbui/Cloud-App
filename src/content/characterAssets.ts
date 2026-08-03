import type { ImageSourcePropType } from 'react-native';

/**
 * Character and object artwork, separated by role.
 *
 * The distinction matters: Cloud is the CloudWise guide (see
 * docs/CLOUD_CHARACTER.md) — a ten-year-old boy in a navy hoodie with a glowing
 * cloud logo, with a small cloud companion called Nimbus. Story characters are
 * the children who appear *inside* a Wisdom's narrative, such as Leo in "Three
 * Ways to Use Money".
 *
 * Cloud artwork must never be used to depict a story character. Doing so blurs
 * the guide's identity, which is the one constant a child is meant to trust
 * across every Wisdom.
 */

/**
 * Cloud, the CloudWise guide.
 *
 * Use only where Cloud is speaking, guiding, encouraging, reflecting, or
 * recognising the child's work — never as a stand-in for a story character.
 */
export const cloudGuideAssets = {
  /** Head-and-shoulders portrait. Speech cards and small avatars. */
  avatar: require('../../assets/cloud/cloud-avatar.png') as ImageSourcePropType,
  /** Full body, waving, transparent background. Hero and canvas compositions. */
  hero: require('../../assets/cloud/cloud-hero-wave.png') as ImageSourcePropType,
  /** Full body on a night street. Larger guidance moments. */
  fullBody: require('../../assets/cloud/cloud-full-body.png') as ImageSourcePropType,
  /** Cloud thinking at a desk, warm lamplight. Reflection moments. */
  thinking: require('../../assets/cloud/cloud-thinking.png') as ImageSourcePropType,
  /** Cloud helping another child. Encouragement about others. */
  helping: require('../../assets/cloud/cloud-helps-friend.png') as ImageSourcePropType,
} as const;

/**
 * Children who appear inside a Wisdom story.
 *
 * ASSET GAP — there is currently no dedicated artwork for Leo, the child in
 * "Three Ways to Use Money". Until it is commissioned, his scenes are composed
 * object-led: the meaningful objects of the story carry the illustration, and
 * Leo is implied rather than shown. Cloud's artwork is deliberately NOT reused
 * here.
 *
 * FUTURE ASSET REQUIREMENT: create dedicated Leo artwork — a distinct child,
 * clearly not Cloud, in scene poses matching the six story beats.
 */
export const storyCharacterAssets = {
  /** Leo has no artwork yet. See the note above before adding anything here. */
  leo: undefined,
} as const;

/**
 * Meaningful objects belonging to a Wisdom's subject matter.
 *
 * These carry the illustration weight in object-led scenes.
 */
export const wisdomObjectAssets = {
  /**
   * Two labelled glass jars. Belongs to the "Needs vs Wants" Wisdom — the
   * printed labels make it unsuitable for other Wisdoms.
   */
  needsWantsJars: require('../../assets/cloud/needs-wants-jars.png') as ImageSourcePropType,
} as const;
