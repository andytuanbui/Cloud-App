import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { ActionButton } from '../components/ActionButton';
import { BottomNav } from '../components/BottomNav';
import { DetailSection } from '../components/DetailSection';
import { EarnItem } from '../components/EarnItem';
import { RecommendedCard } from '../components/RecommendedCard';
import { globalIdentity, recommendedWisdoms, worlds } from '../content/wisdom';
import { styles } from '../theme/styles';
import { RootStackParamList } from '../types/wisdom';

type WisdomDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'WisdomDetail'>;

export function WisdomDetailScreen({ navigation, route }: WisdomDetailScreenProps) {
  const world = worlds.find((item) => item.key === route.params.worldKey) ?? worlds[0];
  const isHero = route.params.source === 'hero';
  const title = isHero ? world.heroTitle.replace('\n', ' ') : world.lockedTitle;
  const description = isHero ? world.heroDescription : world.lockedDescription;
  const minutes = isHero ? world.heroMinutes : world.lockedMinutes;
  const image = isHero ? world.heroImage : world.lockedImage;
  const cardColors = isHero ? world.heroColors : world.lockedColors;

  return (
    <LinearGradient colors={world.background} style={styles.phone}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.detailContent} showsVerticalScrollIndicator={false}>
        <View style={styles.detailTopBar}>
          <Pressable style={styles.detailRoundButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </Pressable>
          <Pressable style={styles.favoriteButton}>
            <Ionicons name="heart-outline" size={22} color="#FFD166" />
          </Pressable>
        </View>

        <LinearGradient colors={cardColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.detailHero}>
          <Image source={image} style={styles.detailHeroImage} resizeMode="cover" />
          <LinearGradient
            colors={['rgba(5,9,22,0.82)', 'rgba(5,9,22,0.35)', 'rgba(5,9,22,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.detailHeroGradient}
          />
          <View style={styles.detailHeroCopy}>
            <View style={styles.detailBadge}>
              <Ionicons name={world.icon} size={14} color="#101827" />
              <Text style={styles.detailBadgeText}>{world.label} Wisdom</Text>
            </View>
            <Text style={styles.detailTitle}>{title}</Text>
            <View style={styles.detailMetaRow}>
              <Ionicons name="time-outline" size={15} color="#FFFFFF" />
              <Text style={styles.metaText}>{minutes} min</Text>
            </View>
          </View>
        </LinearGradient>

        <DetailSection title="What you'll learn">
          <Text style={styles.detailBodyText}>{description}</Text>
          <Text style={styles.detailBodyText}>
            Cloud will help you notice the choice, name what matters, and pick the wiser next step.
          </Text>
        </DetailSection>

        <View style={styles.actionGrid}>
          <ActionButton icon="book-outline" label="Read Myself" highlighted />
          <ActionButton icon="volume-medium-outline" label="Read to Me" />
          <ActionButton icon="chatbubble-ellipses-outline" label="Talk with Cloud" />
          <ActionButton icon="trophy-outline" label="Start Challenge" />
        </View>

        <DetailSection title="What you'll earn">
          <View style={styles.earnGrid}>
            <EarnItem icon="sparkles" label="Wisdom Gained" value={title} />
            <EarnItem icon="map-outline" label="Journey Progress" value={globalIdentity.completed} />
            <EarnItem icon="star-outline" label="Next Identity" value={globalIdentity.next} />
          </View>
        </DetailSection>

        <DetailSection title="Continue Learning">
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
