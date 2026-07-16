import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, shadows, spacing, typography } from '../theme/tokens';

// One shared primitive for the "image + gradient scrim + floating copy" pattern
// that used to be hand-rolled three separate times (TodayCard, LockedNextCard,
// RecommendedCard). New card treatments should extend this, not copy it.

export type GradientMediaCardMeta = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

export type GradientMediaCardProps = {
  variant: 'active' | 'locked';
  eyebrow: string;
  title: string;
  description: string;
  image: ImageSourcePropType;
  meta?: GradientMediaCardMeta[];
  ctaLabel?: string;
  onPress?: () => void;
};

export function GradientMediaCard({
  variant,
  eyebrow,
  title,
  description,
  image,
  meta,
  ctaLabel,
  onPress,
}: GradientMediaCardProps) {
  const isLocked = variant === 'locked';

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [styles.card, pressed && onPress ? styles.cardPressed : null]}
    >
      <Image source={image} resizeMode="cover" style={styles.image} />
      <LinearGradient colors={colors.gradient.heroFade} style={StyleSheet.absoluteFill} />

      <View style={styles.copy}>
        <View style={[styles.eyebrowPill, isLocked && styles.eyebrowPillLocked]}>
          <Ionicons
            name={isLocked ? 'sparkles-outline' : 'book-outline'}
            size={13}
            color={isLocked ? colors.text.onDark : colors.text.onLight}
          />
          <Text style={[styles.eyebrowText, isLocked && styles.eyebrowTextLocked]}>{eyebrow}</Text>
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        {meta && meta.length > 0 ? (
          <View style={styles.metaRow}>
            {meta.map((item) => (
              <View key={item.label} style={styles.metaItem}>
                <Ionicons name={item.icon} size={16} color={colors.text.onDarkMuted} />
                <Text style={styles.metaLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {ctaLabel ? (
          <View style={[styles.cta, isLocked && styles.ctaLocked]}>
            <Text style={[styles.ctaText, isLocked && styles.ctaTextLocked]}>{ctaLabel}</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={isLocked ? colors.text.onDark : colors.text.onLight}
            />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    minHeight: 220,
    backgroundColor: colors.background.surface,
    ...shadows.medium,
  },
  cardPressed: {
    opacity: 0.92,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  copy: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.lg,
    gap: spacing.xs,
  },
  eyebrowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    backgroundColor: colors.brand.gold,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
  },
  eyebrowPillLocked: {
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  eyebrowText: {
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
    color: colors.text.onLight,
    letterSpacing: 0.4,
  },
  eyebrowTextLocked: {
    color: colors.text.onDark,
  },
  title: {
    fontSize: typography.size.heading,
    fontWeight: typography.weight.bold,
    color: colors.text.onDark,
  },
  description: {
    fontSize: typography.size.bodySmall,
    lineHeight: typography.size.bodySmall * typography.lineHeight.normal,
    color: colors.text.onDarkMuted,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaLabel: {
    fontSize: typography.size.caption,
    color: colors.text.onDarkMuted,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    backgroundColor: colors.brand.gold,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  ctaLocked: {
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  ctaText: {
    fontSize: typography.size.bodySmall,
    fontWeight: typography.weight.semibold,
    color: colors.text.onLight,
  },
  ctaTextLocked: {
    color: colors.text.onDark,
  },
});
