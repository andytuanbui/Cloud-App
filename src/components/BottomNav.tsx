import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { colors } from '../theme';
import { styles } from '../theme/styles';

export function BottomNav() {
  const items: { label: string; icon: keyof typeof Ionicons.glyphMap; active?: boolean }[] = [
    { label: 'Home', icon: 'home', active: true },
    { label: 'Library', icon: 'library-outline' },
    { label: 'Journey', icon: 'trail-sign-outline' },
    { label: 'Cloud', icon: 'cloud-outline' },
    { label: 'Profile', icon: 'person-outline' },
  ];

  return (
    <View style={styles.bottomNav}>
      {items.map((item) => (
        <View key={item.label} style={styles.navItem}>
          <Ionicons name={item.icon} size={23} color={item.active ? colors.accent.gold : colors.text.navMuted} />
          <Text style={[styles.navLabel, item.active && styles.navLabelActive]}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}
