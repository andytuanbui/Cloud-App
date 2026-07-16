import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text } from 'react-native';
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
        colors={highlighted ? ['#FFD166', '#FFB347'] : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.06)']}
        style={[styles.actionButton, highlighted && styles.actionButtonHighlighted]}
      >
        <Ionicons name={icon} size={22} color={highlighted ? '#101827' : '#FFFFFF'} />
        <Text style={[styles.actionButtonText, highlighted && styles.actionButtonTextHighlighted]}>{label}</Text>
        <Ionicons name="chevron-forward" size={20} color={highlighted ? '#101827' : '#AEBBD0'} />
      </LinearGradient>
    </Pressable>
  );
}
