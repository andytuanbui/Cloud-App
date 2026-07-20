import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';
import { colors } from '../theme';
import { styles } from '../theme/styles';
import { Wisdom } from '../types/wisdom';

const statusMeta: Record<Wisdom['status'], { icon: keyof typeof Ionicons.glyphMap; label: string }> = {
  completed: { icon: 'checkmark-circle', label: 'Completed' },
  available: { icon: 'play-circle-outline', label: 'Ready' },
  locked: { icon: 'time-outline', label: 'Coming up' },
};

// A compact row, not a hero card - a library is a scannable list, not a
// spotlight. Reuses the app's existing status vocabulary instead of coins,
// stars, or progress percentages.
export function WisdomListItem({
  wisdom,
  thumbnail,
  onPress,
}: {
  wisdom: Wisdom;
  thumbnail: Wisdom['coverImage'];
  onPress: () => void;
}) {
  const meta = statusMeta[wisdom.status];
  const isLocked = wisdom.status === 'locked';

  return (
    <Pressable style={styles.wisdomListItem} onPress={onPress}>
      <Image source={thumbnail} style={styles.wisdomListThumb} resizeMode="cover" />
      <View style={styles.wisdomListCopy}>
        <Text style={styles.wisdomListTitle} numberOfLines={1}>
          {wisdom.title}
        </Text>
        <Text style={styles.wisdomListSubtitle} numberOfLines={1}>
          {wisdom.subtitle}
        </Text>
        <View style={styles.wisdomListStatusRow}>
          <Ionicons
            name={meta.icon}
            size={14}
            color={isLocked ? colors.text.navMuted : colors.accent.gold}
          />
          <Text style={styles.wisdomListStatusText}>{meta.label}</Text>
          <View style={styles.metaDot} />
          <Text style={styles.wisdomListStatusText}>{wisdom.estimatedMinutes} min</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.text.navMuted} />
    </Pressable>
  );
}
