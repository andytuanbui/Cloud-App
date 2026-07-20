import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, Text, View } from 'react-native';
import { BottomNav } from '../components/BottomNav';
import { LoadingState } from '../components/LoadingState';
import { useAsyncResource } from '../hooks/useAsyncResource';
import { getCategories, getWisdomsForCategory } from '../services/contentService';
import { getCloudAvatar, getGlobalIdentity } from '../services/wisdomService';
import { colors } from '../theme';
import { styles } from '../theme/styles';
import { RootStackParamList } from '../types/wisdom';

type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'Profile'>;

// The app celebrates identity, not scores - so the one number on this screen
// is "wisdoms practiced," not points, coins, or a streak count.
export function ProfileScreen({ navigation: _navigation }: ProfileScreenProps) {
  const content = useAsyncResource(async () => {
    const [avatar, globalIdentity, categories] = await Promise.all([
      getCloudAvatar(),
      getGlobalIdentity(),
      getCategories(),
    ]);
    const wisdomsByCategory = await Promise.all(categories.map((category) => getWisdomsForCategory(category.id)));
    const allWisdoms = wisdomsByCategory.flat();
    const completedCount = allWisdoms.filter((wisdom) => wisdom.status === 'completed').length;
    const worldsStarted = wisdomsByCategory.filter((wisdoms) =>
      wisdoms.some((wisdom) => wisdom.status === 'completed' || wisdom.status === 'available'),
    ).length;

    return { avatar, completedCount, globalIdentity, worldsStarted };
  }, []);

  if (content.error) {
    throw content.error;
  }

  if (!content.data) {
    return <LoadingState />;
  }

  const { completedCount, globalIdentity, worldsStarted } = content.data;

  return (
    <LinearGradient colors={colors.gradient.homeBackground} style={styles.phone}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Profile</Text>
        </View>

        <View style={styles.profileIdentityCard}>
          <View style={styles.profileIdentityIcon}>
            <Ionicons name="person-circle-outline" size={32} color={colors.accent.gold} />
          </View>
          <Text style={styles.profileIdentityLabel}>You're becoming</Text>
          <Text style={styles.profileIdentityValue}>{globalIdentity.current}</Text>
        </View>

        <View style={styles.profileStatRow}>
          <View style={styles.profileStatCard}>
            <Text style={styles.profileStatValue}>{completedCount}</Text>
            <Text style={styles.profileStatLabel}>Wisdoms practiced</Text>
          </View>
          <View style={styles.profileStatCard}>
            <Text style={styles.profileStatValue}>{worldsStarted}</Text>
            <Text style={styles.profileStatLabel}>Worlds explored</Text>
          </View>
        </View>
      </ScrollView>
      <BottomNav active="Profile" />
    </LinearGradient>
  );
}
