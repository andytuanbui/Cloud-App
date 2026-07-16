import { CommonActions } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { JourneyListItem, JourneyPanel } from '../components/JourneyPanel';
import { LoadingState } from '../components/LoadingState';
import { useAsyncResource } from '../hooks/useAsyncResource';
import { getGlobalIdentity, getWisdomById, getWorldForWisdom } from '../services/wisdomService';
import { colors } from '../theme';
import { styles } from '../theme/styles';
import { WisdomJourneyParamList } from '../types/wisdom';

type CongratulationsScreenProps = NativeStackScreenProps<WisdomJourneyParamList, 'Congratulations'>;

export function CongratulationsScreen({ navigation, route }: CongratulationsScreenProps) {
  const content = useAsyncResource(async () => {
    const wisdom = await getWisdomById(route.params.wisdomId);
    const [world, globalIdentity] = await Promise.all([getWorldForWisdom(wisdom.id), getGlobalIdentity()]);

    return { globalIdentity, wisdom, world };
  }, [route.params.wisdomId]);

  if (content.error) {
    throw content.error;
  }

  if (!content.data) {
    return <LoadingState />;
  }

  const { globalIdentity, wisdom, world } = content.data;

  const returnHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Home' as never }],
      }),
    );
  };

  return (
    <LinearGradient colors={world.background} style={styles.phone}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.journeyContent} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={world.heroColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.congratsHero}>
          <Image source={world.heroImage} style={styles.congratsHeroImage} resizeMode="cover" />
          <LinearGradient colors={colors.gradient.congratsFade} style={styles.congratsFade} />
          <View style={styles.congratsCopy}>
            <View style={styles.congratsIcon}>
              <Ionicons name="sparkles" size={26} color={colors.text.inverse} />
            </View>
            <Text style={styles.congratsTitle}>You are becoming wiser</Text>
            <Text style={styles.congratsBody}>You practiced {wisdom.title} with Cloud.</Text>
          </View>
        </LinearGradient>

        <JourneyPanel title="Who you're becoming">
          <JourneyListItem icon="sparkles-outline" title="Wiser at" body={wisdom.title} />
          <JourneyListItem icon="person-circle-outline" title="You are becoming..." body={globalIdentity.current} />
          <JourneyListItem icon="star-outline" title="Growing toward" body={globalIdentity.next} />
        </JourneyPanel>

        <Pressable onPress={returnHome}>
          <LinearGradient colors={colors.gradient.goldCta} style={styles.journeyPrimaryButton}>
            <Text style={styles.journeyPrimaryText}>Return Home</Text>
            <Ionicons name="home" size={20} color={colors.text.inverse} />
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </LinearGradient>
  );
}
