import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text } from 'react-native';
import { colors } from '../theme';
import { styles } from '../theme/styles';

export function ActionButton({
  icon,
  label,
  highlighted,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  highlighted?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <LinearGradient
        colors={highlighted ? colors.gradient.goldCta : colors.gradient.actionMuted}
        style={[styles.actionButton, highlighted && styles.actionButtonHighlighted]}
      >
        <Ionicons name={icon} size={22} color={highlighted ? colors.text.inverse : colors.text.primary} />
        <Text style={[styles.actionButtonText, highlighted && styles.actionButtonTextHighlighted]}>{label}</Text>
        <Ionicons name="chevron-forward" size={20} color={highlighted ? colors.text.inverse : colors.text.muted} />
      </LinearGradient>
    </Pressable>
  );
}
