import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { ActionButton } from '../components/ActionButton';
import { BottomNav } from '../components/BottomNav';
import { DetailSection } from '../components/DetailSection';
import { EarnItem } from '../components/EarnItem';
import { LoadingState } from '../components/LoadingState';
import { RecommendedCard } from '../components/RecommendedCard';
import { useAsyncResource } from '../hooks/useAsyncResource';
import {
  getGlobalIdentity,
  getRecommendedWisdomCards,
  getWisdomById,
  getWorldForWisdom,
} from '../services/wisdomService';
import { colors } from '../theme';
import { styles } from '../theme/styles';
import { RootStackParamList } from '../types/wisdom';

type WisdomDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'WisdomDetail'>;

export function WisdomDetailScreen({ navigation, route }: WisdomDetailScreenProps) {
  const content = useAsyncResource(async () => {
    const wisdom = await getWisdomById(route.params.wisdomId);
    const [world, globalIdentity, recommendedWisdoms] = await Promise.all([
      getWorldForWisdom(wisdom.id),
      getGlobalIdentity(),
      getRecommendedWisdomCards(),
    ]);

    return {
      globalIdentity,
      recommendedWisdoms,
      wisdom,
      world,
    };
  }, [route.params.wisdomId]);

  if (content.error) {
    throw content.error;
  }

  if (!content.data) {
    return <LoadingState />;
  }

  const { globalIdentity, recommendedWisdoms, wisdom, world } = content.data;
  const isHero = wisdom.id === world.heroWisdomId;
  const title = wisdom.title;
  const description = wisdom.subtitle;
  const minutes = wisdom.estimatedMinutes;
  const image = isHero ? world.heroImage : world.lockedImage;
  const cardColors = isHero ? world.heroColors : world.lockedColors;

  return (
    <LinearGradient colors={world.background} style={styles.phone}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.detailContent} showsVerticalScrollIndicator={false}>
        <View style={styles.detailTopBar}>
          <Pressable style={styles.detailRoundButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
          </Pressable>
          <Pressable style={styles.favoriteButton}>
            <Ionicons name="heart-outline" size={22} color={colors.accent.gold} />
          </Pressable>
        </View>

        <LinearGradient colors={cardColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.detailHero}>
          <Image source={image} style={styles.detailHeroImage} resizeMode="cover" />
          <LinearGradient
            colors={colors.gradient.mediaFade}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.detailHeroGradient}
          />
          <View style={styles.detailHeroCopy}>
            <View style={styles.detailBadge}>
              <Ionicons name={world.icon} size={14} color={colors.text.inverse} />
              <Text style={styles.detailBadgeText}>{world.label} Wisdom</Text>
            </View>
            <Text style={styles.detailTitle}>{title}</Text>
            <View style={styles.detailMetaRow}>
              <Ionicons name="time-outline" size={15} color={colors.text.primary} />
              <Text style={styles.metaText}>{minutes} min</Text>
            </View>
          </View>
        </LinearGradient>

        <DetailSection title="How you'll grow">
          <Text style={styles.detailBodyText}>{description}</Text>
          <Text style={styles.detailBodyText}>
            Cloud will help you become someone who notices the choice, names what matters, and takes the wiser next step.
          </Text>
        </DetailSection>

        <View style={styles.actionGrid}>
          <ActionButton
            icon="book-outline"
            label="Read Myself"
            highlighted
            onPress={() =>
              navigation.navigate('WisdomJourney', {
                screen: 'Reading',
                params: { wisdomId: wisdom.id },
              })
            }
          />
          <ActionButton
            icon="volume-medium-outline"
            label="Read to Me"
            onPress={() =>
              navigation.navigate('WisdomJourney', {
                screen: 'Reading',
                params: { wisdomId: wisdom.id },
              })
            }
          />
          <ActionButton
            icon="chatbubble-ellipses-outline"
            label="Talk with Cloud"
            onPress={() =>
              navigation.navigate('WisdomJourney', {
                screen: 'TalkWithCloud',
                params: { wisdomId: wisdom.id },
              })
            }
          />
          <ActionButton
            icon="trophy-outline"
            label="Start Challenge"
            onPress={() =>
              navigation.navigate('WisdomJourney', {
                screen: 'Challenge',
                params: { wisdomId: wisdom.id },
              })
            }
          />
        </View>

        <DetailSection title="Who you'll become">
          <View style={styles.earnGrid}>
            <EarnItem icon="sparkles" label="Wiser at" value={title} />
            <EarnItem icon="person-circle-outline" label="You are becoming..." value={globalIdentity.current} />
            <EarnItem icon="star-outline" label="Growing toward" value={globalIdentity.next} />
          </View>
        </DetailSection>

        <DetailSection title="Keep becoming wiser">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recommendationRow}>
            {recommendedWisdoms.map((wisdom) => (
              <RecommendedCard key={wisdom.title} title={wisdom.title} image={wisdom.image} colors={wisdom.colors} />
            ))}
          </ScrollView>
        </DetailSection>
      </ScrollView>
      <BottomNav />
    </LinearGradient>
  );
}
