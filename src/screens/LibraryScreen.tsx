import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, Text, View } from 'react-native';
import { BottomNav } from '../components/BottomNav';
import { LoadingState } from '../components/LoadingState';
import { WisdomListItem } from '../components/WisdomListItem';
import { useAsyncResource } from '../hooks/useAsyncResource';
import { getCategories, getWisdomsForCategory } from '../services/contentService';
import { colors } from '../theme';
import { styles } from '../theme/styles';
import { Category, RootStackParamList, Wisdom } from '../types/wisdom';

type LibraryScreenProps = NativeStackScreenProps<RootStackParamList, 'Library'>;

type CategorySection = {
  category: Category;
  wisdoms: Wisdom[];
};

// Every wisdom stays here once it exists, whatever its status - the library
// is a growing personal reference, not a one-way progress bar.
export function LibraryScreen({ navigation }: LibraryScreenProps) {
  const content = useAsyncResource(async () => {
    const categories = await getCategories();
    const sections: CategorySection[] = await Promise.all(
      categories.map(async (category) => ({
        category,
        wisdoms: await getWisdomsForCategory(category.id),
      })),
    );

    return sections;
  }, []);

  if (content.error) {
    throw content.error;
  }

  if (!content.data) {
    return <LoadingState />;
  }

  return (
    <LinearGradient colors={colors.gradient.homeBackground} style={styles.phone}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Library</Text>
        </View>
        <Text style={styles.libraryIntro}>Every wisdom you've read stays here, ready whenever you want it again.</Text>

        {content.data.map(({ category, wisdoms }) => (
          <View key={category.id} style={styles.libraryCategoryBlock}>
            <Text style={styles.libraryCategoryTitle}>{category.title}</Text>
            {wisdoms.map((wisdom) => (
              <WisdomListItem
                key={wisdom.id}
                wisdom={wisdom}
                thumbnail={wisdom.coverImage}
                onPress={() => navigation.navigate('WisdomDetail', { wisdomId: wisdom.id })}
              />
            ))}
          </View>
        ))}
      </ScrollView>
      <BottomNav active="Library" />
    </LinearGradient>
  );
}
