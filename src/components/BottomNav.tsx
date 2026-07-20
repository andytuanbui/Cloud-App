import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, Text, View } from 'react-native';
import { colors } from '../theme';
import { styles } from '../theme/styles';
import { RootStackParamList } from '../types/wisdom';

export type BottomNavRoute = 'Home' | 'Library' | 'Journey' | 'Cloud' | 'Profile';

type NavItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: BottomNavRoute;
};

const items: NavItem[] = [
  { label: 'Home', icon: 'home', route: 'Home' },
  { label: 'Library', icon: 'library-outline', route: 'Library' },
  { label: 'Journey', icon: 'trail-sign-outline', route: 'Journey' },
  { label: 'Cloud', icon: 'cloud-outline', route: 'Cloud' },
  { label: 'Profile', icon: 'person-outline', route: 'Profile' },
];

// `active` is optional so screens reached outside the five tab destinations
// (like WisdomDetail) can render the bar without falsely highlighting a tab.
export function BottomNav({ active }: { active?: BottomNavRoute }) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.bottomNav}>
      {items.map((item) => {
        const isActive = item.route === active;

        return (
          <Pressable
            key={item.label}
            style={styles.navItem}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            onPress={() => {
              if (!isActive) {
                navigation.navigate(item.route);
              }
            }}
          >
            <Ionicons name={item.icon} size={23} color={isActive ? colors.accent.gold : colors.text.navMuted} />
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
