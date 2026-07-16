import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, Text, View } from 'react-native';
import { styles } from '../theme/styles';
import { Category } from '../types/wisdom';

export function CategoryTile({ category, active, onSelect }: { category: Category; active?: boolean; onSelect: () => void }) {
  return (
    <Pressable onPress={onSelect}>
      <LinearGradient colors={category.color} style={[styles.categoryTile, active && styles.categoryTileActive]}>
        <Image source={category.image} style={styles.categoryArt} resizeMode="cover" />
        <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.48)']} style={styles.categoryFade} />
        <View style={styles.categoryIcon}>
          <Ionicons name={category.icon} size={24} color="#FFFFFF" />
        </View>
        <Text style={[styles.categoryText, active && styles.categoryTextActive]}>{category.shortTitle}</Text>
      </LinearGradient>
    </Pressable>
  );
}
