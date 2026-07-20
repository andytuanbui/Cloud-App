import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, Text, View } from 'react-native';
import { BottomNav } from '../components/BottomNav';
import { JourneyListItem, JourneyPanel } from '../components/JourneyPanel';
import { LoadingState } from '../components/LoadingState';
import { useAsyncResource } from '../hooks/useAsyncResource';
import { getCategories, getWisdomsForCategory } from '../services/contentService';
import { getGlobalIdentity } from '../services/wisdomService';
import { colors } from '../theme';
import { styles } from '../theme/styles';

type JourneyScreenProps = NativeStackScreenProps<import('../types/wisdom').RootStackParamList, 'Journey'>;

type CategoryProgress = {
  id: string;
  title: string;
  completed: number;
  total: number;
};

// Progress reads as "how far into becoming someone you are," not a percent
// bar racing to 100 - one row per category, plain counts, no streaks.
export function JourneyScreen({ navigation: _navigation }: JourneyScreenProps) {
  const content = useAsyncResource(async () => {
    const [categories, globalIdentity] = await Promise.all([getCategories(), getGlobalIdentity()]);
    const progress: CategoryProgress[] = await Promise.all(
      categories.map(async (category) => {
        const wisdoms = await getWisdomsForCategory(category.id);

        return {
          id: category.id,
          title: category.title,
          completed: wisdoms.filter((wisdom) => wisdom.status === 'completed').length,
          total: wisdoms.length,
        };
      }),
    );

    return { globalIdentity, progress };
  }, []);

  if (content.error) {
    throw content.error;
  }

  if (!content.data) {
    return <LoadingState />;
  }

  const { globalIdentity, progress } = content.data;

  return (
    <LinearGradient colors={colors.gradient.homeBackground} style={styles.phone}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Journey</Text>
        </View>

        <JourneyPanel title="Who you're becoming">
          <JourneyListItem icon="sparkles-outline" title="Right now" body={globalIdentity.current} />
          <JourneyListItem icon="star-outline" title="Growing toward" body={globalIdentity.next} />
        </JourneyPanel>

        <View style={styles.journeyProgressBlock}>
          <Text style={styles.libraryCategoryTitle}>Progress by world</Text>
          {progress.map((item) => {
            const ratio = item.total > 0 ? item.completed / item.total : 0;

            return (
              <View key={item.id} style={styles.journeyProgressRow}>
                <View style={styles.journeyProgressLabelRow}>
                  <Text style={styles.journeyProgressTitle}>{item.title}</Text>
                  <Text style={styles.journeyProgressCount}>
                    {item.completed}/{item.total}
                  </Text>
                </View>
                <View style={styles.journeyProgressTrack}>
                  <View style={[styles.journeyProgressFill, { width: `${Math.round(ratio * 100)}%` }]} />
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
      <BottomNav active="Journey" />
    </LinearGradient>
  );
}
