import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { styles } from '../theme/styles';

export function EarnItem({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.earnItem}>
      <View style={styles.earnIcon}>
        <Ionicons name={icon} size={18} color="#FFD166" />
      </View>
      <Text style={styles.earnLabel}>{label}</Text>
      <Text style={styles.earnValue}>{value}</Text>
    </View>
  );
}
