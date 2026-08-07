import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import {
  Image,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { appColors, radii, shadows, space, spacing, typography } from '../../../theme';
import { AppText } from '../../ui';

/**
 * Shared visual language for the guided Wisdom.
 *
 * Every stage is composed from a `WisdomCanvas`: one full-bleed illustrated
 * surface with layered light, rather than a vertical stack of separate cards.
 */

export const wisdomNightGradient = [
  appColors.wisdomNight,
  appColors.wisdomNightDeep,
] as const;

export const wisdomWarmGradient = ['#6F4A2D', appColors.wisdomNight] as const;

/** Scrim that lets copy sit legibly on top of artwork. */
const scrimColors = [
  'rgba(7, 31, 40, 0)',
  'rgba(7, 31, 40, 0.55)',
  'rgba(7, 31, 40, 0.94)',
] as const;

/**
 * A full-bleed illustrated stage surface.
 *
 * `artwork` is drawn edge to edge and anchored so the character's face is never
 * cropped; `children` sit above the scrim.
 */
export function WisdomHeroCanvas({
  artwork,
  artworkAccessibilityLabel,
  artworkStyle,
  children,
  colors = wisdomNightGradient,
  glow = 'gold',
  height,
  style,
  testID,
}: {
  artwork?: ImageSourcePropType;
  artworkAccessibilityLabel?: string;
  artworkStyle?: StyleProp<ImageStyle>;
  children?: ReactNode;
  colors?: readonly [string, string, ...string[]];
  glow?: 'gold' | 'green' | 'none';
  height: number;
  style?: StyleProp<ViewStyle>;
  /** Layout-measurement hook. Never affects rendering. */
  testID?: string;
}) {
  return (
    <View
      accessibilityLabel={artworkAccessibilityLabel}
      accessible={Boolean(artworkAccessibilityLabel)}
      style={[styles.hero, { height }, style]}
      testID={testID}
    >
      <LinearGradient
        colors={colors}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      {glow !== 'none' ? (
        <>
          <View
            accessible={false}
            pointerEvents="none"
            style={[styles.glowLarge, glow === 'green' && styles.glowGreen]}
          />
          <View accessible={false} pointerEvents="none" style={styles.glowSmall} />
        </>
      ) : null}
      {artwork ? (
        <Image
          accessible={false}
          resizeMode="contain"
          source={artwork}
          style={[styles.artwork, artworkStyle]}
        />
      ) : null}
      <LinearGradient
        colors={scrimColors}
        locations={[0, 0.52, 1]}
        pointerEvents="none"
        style={styles.scrim}
      />
      <View pointerEvents="box-none" style={styles.heroContent}>
        {children}
      </View>
    </View>
  );
}

/** A floating glass prop that names a meaningful object in the Wisdom. */
export function WisdomObjectBadge({
  icon,
  label,
  style,
  tone = 'glass',
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  style?: StyleProp<ViewStyle>;
  tone?: 'glass' | 'solid';
  value?: string;
}) {
  return (
    <View
      accessibilityLabel={value ? `${label}: ${value}` : label}
      accessible
      style={[styles.badge, tone === 'solid' && styles.badgeSolid, style]}
    >
      <View accessible={false} style={styles.badgeIcon}>
        <Ionicons
          accessible={false}
          color={appColors.wisdomGoldBright}
          name={icon}
          size={spacing.s20}
        />
      </View>
      <View style={styles.badgeCopy}>
        <AppText numberOfLines={1} style={styles.badgeLabel} tone="inverse" variant="caption">
          {label}
        </AppText>
        {value ? (
          <AppText style={styles.badgeValue} tone="inverse" variant="label">
            {value}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

/** The three places money can go, shown as an object-led destination tile. */
export function WisdomDestinationTile({
  caption,
  icon,
  style,
  title,
}: {
  caption?: string;
  icon: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
  title: string;
}) {
  return (
    <View
      accessibilityLabel={caption ? `${title}. ${caption}` : title}
      accessible
      style={[styles.destination, style]}
    >
      <View accessible={false} style={styles.destinationArt}>
        <View accessible={false} style={styles.destinationGlow} />
        <Ionicons
          accessible={false}
          color={appColors.wisdomGoldBright}
          name={icon}
          size={spacing.s30}
        />
      </View>
      <AppText style={styles.destinationTitle} tone="inverse" variant="supporting">
        {title}
      </AppText>
    </View>
  );
}

/** Compact "Learned" marker used on canvases and Wisdom cards. */
export function LearnedBadge({
  label = 'Learned',
  style,
  tone = 'glass',
}: {
  label?: string;
  style?: StyleProp<ViewStyle>;
  tone?: 'glass' | 'light';
}) {
  return (
    <View
      accessibilityLabel={`This Wisdom is ${label.toLowerCase()}`}
      accessible
      style={[styles.learned, tone === 'light' && styles.learnedLight, style]}
    >
      <Ionicons
        accessible={false}
        color={tone === 'light' ? appColors.wisdomGreen : appColors.wisdomGoldBright}
        name="checkmark-circle"
        size={spacing.s15}
      />
      <AppText
        style={styles.learnedLabel}
        tone={tone === 'light' ? 'brand' : 'inverse'}
        variant="label"
      >
        {label}
      </AppText>
    </View>
  );
}

/** Eyebrow + title pair used at the top of every stage canvas. */
export function StageHeading({
  eyebrow,
  inverse = false,
  supporting,
  title,
}: {
  eyebrow: string;
  inverse?: boolean;
  supporting?: string;
  title: string;
}) {
  return (
    <View style={styles.stageHeading}>
      <AppText tone={inverse ? 'inverse' : 'brand'} variant="label">
        {eyebrow}
      </AppText>
      <AppText
        accessibilityRole="header"
        style={styles.stageTitle}
        tone={inverse ? 'inverse' : 'primary'}
        variant="sectionTitle"
      >
        {title}
      </AppText>
      {supporting ? (
        <AppText
          style={styles.stageSupporting}
          tone={inverse ? 'inverse' : 'secondary'}
          variant="body"
        >
          {supporting}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    ...shadows.card,
    borderColor: appColors.wisdomLine,
    borderRadius: radii.hero,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  glowLarge: {
    backgroundColor: appColors.wisdomGoldGlow,
    borderRadius: radii.round,
    height: 340,
    opacity: 0.55,
    position: 'absolute',
    right: -space.huge,
    top: -space.xxl,
    width: 340,
  },
  glowGreen: {
    backgroundColor: appColors.primary,
    opacity: 0.4,
  },
  glowSmall: {
    backgroundColor: appColors.wisdomGoldGlow,
    borderRadius: radii.round,
    bottom: -space.xxxl,
    height: 220,
    left: -space.xxxl,
    opacity: 0.45,
    position: 'absolute',
    width: 220,
  },
  artwork: {
    bottom: 0,
    height: '100%',
    position: 'absolute',
    right: 0,
    width: '100%',
  },
  scrim: {
    bottom: 0,
    height: '72%',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'space-between',
    padding: space.md,
  },
  badge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: appColors.wisdomGlassStrong,
    borderColor: appColors.wisdomLine,
    borderRadius: radii.round,
    borderWidth: 1,
    flexDirection: 'row',
    maxWidth: '100%',
    minHeight: spacing.s42,
    paddingHorizontal: space.xs,
    paddingRight: space.sm,
    paddingVertical: space.xxs,
  },
  badgeSolid: {
    backgroundColor: 'rgba(7, 31, 40, 0.78)',
  },
  badgeIcon: {
    alignItems: 'center',
    backgroundColor: appColors.wisdomGlass,
    borderRadius: radii.round,
    height: spacing.s34,
    justifyContent: 'center',
    marginRight: space.xs,
    width: spacing.s34,
  },
  badgeCopy: {
    flexShrink: 1,
    minWidth: 0,
  },
  badgeLabel: {
    opacity: 0.86,
  },
  badgeValue: {
    fontWeight: typography.weight.heavy,
  },
  destination: {
    alignItems: 'center',
    backgroundColor: appColors.wisdomGlass,
    borderColor: appColors.wisdomLine,
    borderRadius: radii.large,
    borderWidth: 1,
    flex: 1,
    minWidth: 0,
    paddingHorizontal: space.xxs,
    paddingVertical: space.sm,
  },
  destinationArt: {
    alignItems: 'center',
    backgroundColor: appColors.wisdomGlassStrong,
    borderColor: appColors.wisdomLine,
    borderRadius: radii.medium,
    borderWidth: 1,
    height: spacing.s52,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    width: spacing.s52,
  },
  destinationGlow: {
    backgroundColor: appColors.wisdomGoldGlow,
    borderRadius: radii.round,
    height: spacing.s42,
    position: 'absolute',
    width: spacing.s42,
  },
  destinationTitle: {
    fontWeight: typography.weight.bold,
    marginTop: space.xs,
    textAlign: 'center',
  },
  learned: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: appColors.wisdomGlassStrong,
    borderColor: appColors.wisdomLine,
    borderRadius: radii.round,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: space.xs,
    paddingVertical: space.xxs,
  },
  learnedLight: {
    backgroundColor: appColors.wisdomGreenSoft,
    borderColor: appColors.border,
  },
  learnedLabel: {
    marginLeft: space.xxs,
  },
  stageHeading: {
    marginBottom: space.md,
  },
  stageTitle: {
    marginTop: space.xxs,
  },
  stageSupporting: {
    marginTop: space.xs,
  },
});
