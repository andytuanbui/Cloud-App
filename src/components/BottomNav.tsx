import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/wisdom';
import { BottomNavigation, BottomNavigationItem } from './ui';

type ProductionRoute = 'Today' | 'Library' | 'Cloud' | 'Family' | 'Profile';
const items: BottomNavigationItem<ProductionRoute>[] = [
  { label: 'Today', route: 'Today', icon: 'sunny-outline', activeIcon: 'sunny' },
  { label: 'Wisdoms', route: 'Library', icon: 'book-outline', activeIcon: 'book' },
  { label: 'Cloud', route: 'Cloud', icon: 'cloud-outline', activeIcon: 'cloud' },
  { label: 'Family', route: 'Family', icon: 'people-outline', activeIcon: 'people' },
  { label: 'Profile', route: 'Profile', icon: 'person-outline', activeIcon: 'person' },
];

export function BottomNav({ active }: { active?: ProductionRoute | 'Home' }) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <BottomNavigation
      active={active === 'Home' ? undefined : active}
      items={items}
      onSelect={(route) => navigation.navigate(route)}
    />
  );
}
