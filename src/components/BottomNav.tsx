import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { styles } from '../theme/styles';

export function BottomNav() {
  const items: { label: string; icon: keyof typeof Ionicons.glyphMap; active?: boolean }[] = [
    { label: 'Home', icon: 'home', active: true },
    { label: 'Wisdoms', icon: 'sparkles-outline' },
    { label: 'Favorites', icon: 'heart-outline' },
    { label: 'Growth', icon: 'leaf-outline' },
    { label: 'Profile', icon: 'person-outline' },
  ];

  return (
    <View style={styles.bottomNav}>
      {items.map((item) => (
        <View key={item.label} style={styles.navItem}>
          <Ionicons name={item.icon} size={23} color={item.active ? '#FFD166' : '#9AA6BC'} />
          <Text style={[styles.navLabel, item.active && styles.navLabelActive]}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}
