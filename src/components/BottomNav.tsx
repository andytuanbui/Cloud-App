import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RootStackParamList } from '../types/wisdom';

type ProductionRoute = 'Today' | 'Library' | 'Cloud' | 'Family' | 'Profile';
const items: { label: string; route: ProductionRoute; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'Today', route: 'Today', icon: 'sunny-outline' },
  { label: 'Wisdoms', route: 'Library', icon: 'book-outline' },
  { label: 'Cloud', route: 'Cloud', icon: 'cloud-outline' },
  { label: 'Family', route: 'Family', icon: 'people-outline' },
  { label: 'Profile', route: 'Profile', icon: 'person-outline' },
];

export function BottomNav({ active }: { active?: ProductionRoute | 'Home' }) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <View style={styles.wrap} accessibilityRole="tablist">
      {items.map((item) => {
        const selected = item.route === active;
        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            key={item.route}
            onPress={() => navigation.navigate(item.route)}
            style={styles.item}
          >
            <Ionicons name={item.icon} size={23} color={selected ? '#16386A' : '#758297'} />
            <Text style={[styles.label, selected && styles.labelActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderTopColor: '#E4ECE9',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 8,
    paddingTop: 10,
  },
  item: { alignItems: 'center', minHeight: 48, minWidth: 58, justifyContent: 'center' },
  label: { color: '#758297', fontSize: 11, fontWeight: '700', marginTop: 3 },
  labelActive: { color: '#16386A' },
});
