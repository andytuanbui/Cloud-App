import { CommonActions } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { JourneyListItem, JourneyPanel } from '../components/JourneyPanel';
import { getGlobalIdentity, getWisdomById, getWorldForWisdom } from '../services/wisdomService';
import { styles } from '../theme/styles';
import { WisdomJourneyParamList } from '../types/wisdom';

type CongratulationsScreenProps = NativeStackScreenProps<WisdomJourneyParamList, 'Congratulations'>;

export function CongratulationsScreen({ navigation, route }: CongratulationsScreenProps) {
  const wisdom = getWisdomById(route.params.wisdomId);
  const world = getWorldForWisdom(wisdom.id);
  const globalIdentity = getGlobalIdentity();

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
          <LinearGradient colors={['rgba(5,9,22,0.86)', 'rgba(5,9,22,0.38)', 'rgba(5,9,22,0)']} style={styles.congratsFade} />
          <View style={styles.congratsCopy}>
            <View style={styles.congratsIcon}>
              <Ionicons name="sparkles" size={26} color="#101827" />
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
          <LinearGradient colors={['#FFD166', '#FFB347']} style={styles.journeyPrimaryButton}>
            <Text style={styles.journeyPrimaryText}>Return Home</Text>
            <Ionicons name="home" size={20} color="#101827" />
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </LinearGradient>
  );
}
