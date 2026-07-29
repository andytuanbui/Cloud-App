import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Image, ImageSourcePropType, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { BottomNav } from '../components/BottomNav';
import { RootStackParamList } from '../types/wisdom';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

type MotionLayerKey = 'leaves' | 'bus' | 'bird' | 'bike' | 'football';

const neighborhoodImage = require('../../assets/cloud/cloud-neighborhood-home.png');
const needsWantsImage = require('../../assets/cloud/needs-wants-jars.png');
const friendshipImage = require('../../assets/cloud/cat-people.png');
const yesterdayImage = require('../../assets/cloud/cloud-helps-friend.png');

const homeColors = {
  background: '#FFFDF8',
  card: '#FFF9EA',
  ink: '#0B1730',
  copy: '#273247',
  muted: '#7E8998',
  cream: 'rgba(255, 255, 255, 0.84)',
  creamSolid: '#FFF6E3',
  gold: '#FFB347',
  line: 'rgba(12, 23, 48, 0.08)',
  navy: '#08152F',
  softBlue: '#EAF6F8',
} as const;

const futureMotionLayers: MotionLayerKey[] = ['leaves', 'bus', 'bird', 'bike', 'football'];

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { height } = useWindowDimensions();
  const [isOpeningWisdom, setIsOpeningWisdom] = useState(false);
  const worldHeight = Math.min(680, Math.max(570, Math.round(height * 0.72)));

  const startWisdom = () => {
    if (isOpeningWisdom) {
      return;
    }

    setIsOpeningWisdom(true);
    navigation.navigate('WisdomJourney', {
      screen: 'QuestionBeforeWisdom',
      params: { wisdomId: 'needs-vs-wants' },
    });
    setIsOpeningWisdom(false);
  };

  return (
    <View style={homeStyles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={homeStyles.content}>
        <CloudWorldScene
          height={worldHeight}
          isOpeningWisdom={isOpeningWisdom}
          onStartWisdom={startWisdom}
          wisdomImage={needsWantsImage}
          worldImage={neighborhoodImage}
        />
        <TomorrowTeaser image={friendshipImage} />
        <YesterdayWisdom image={yesterdayImage} />
      </ScrollView>
      <BottomNav active="Home" />
    </View>
  );
}

function CloudWorldScene({
  height,
  isOpeningWisdom,
  onStartWisdom,
  wisdomImage,
  worldImage,
}: {
  height: number;
  isOpeningWisdom: boolean;
  onStartWisdom: () => void;
  wisdomImage: ImageSourcePropType;
  worldImage: ImageSourcePropType;
}) {
  return (
    <View style={[homeStyles.worldStage, { height }]}>
      <Image source={worldImage} resizeMode="cover" style={homeStyles.worldImage} />
      <LinearGradient colors={['rgba(255,255,255,0)', 'rgba(255,253,248,0.1)', homeColors.background]} style={homeStyles.worldFade} />
      <SpeechBubble />
      <View pointerEvents="none" style={homeStyles.motionLayerRoot}>
        {futureMotionLayers.map((layer) => (
          <View key={layer} accessibilityLabel={`Future animation layer: ${layer}`} style={homeStyles.motionLayerAnchor} />
        ))}
      </View>
      <EmbeddedWisdomCard disabled={isOpeningWisdom} image={wisdomImage} onStart={onStartWisdom} />
    </View>
  );
}

function SpeechBubble() {
  return (
    <View style={homeStyles.speechBubble}>
      <Text style={homeStyles.speechTitle}>Hi Andy.</Text>
      <Text style={homeStyles.speechText}>I just noticed something interesting today.</Text>
      <View style={homeStyles.speechTail} />
    </View>
  );
}

function EmbeddedWisdomCard({
  disabled,
  image,
  onStart,
}: {
  disabled: boolean;
  image: ImageSourcePropType;
  onStart: () => void;
}) {
  return (
    <LinearGradient colors={['rgba(255, 251, 236, 0.96)', 'rgba(255, 235, 178, 0.94)']} style={homeStyles.wisdomCard}>
      <View style={homeStyles.cardCopy}>
        <Text style={homeStyles.cardEyebrow}>TODAY'S WISDOM</Text>
        <Text style={homeStyles.cardTitle}>Smart Choices</Text>
        <Text style={homeStyles.cardBody}>Small choices today can shape what happens next.</Text>
        <View style={homeStyles.metaRow}>
          <View style={homeStyles.metaItem}>
            <Ionicons name="time-outline" size={22} color={homeColors.muted} />
            <Text style={homeStyles.metaText}>8 min</Text>
          </View>
          <View style={homeStyles.metaItem}>
            <Ionicons name="sparkles-outline" size={21} color={homeColors.muted} />
            <Text style={homeStyles.metaText}>Wise choices</Text>
          </View>
        </View>
        <Pressable accessibilityRole="button" disabled={disabled} onPress={onStart} style={homeStyles.startButton}>
          <Text style={homeStyles.startText}>Start Wisdom</Text>
          <Ionicons name="arrow-forward" size={19} color="#FFFFFF" />
        </Pressable>
      </View>
      <View style={homeStyles.cardImageWrap}>
        <View style={homeStyles.cardImageGlow} />
        <Image source={image} resizeMode="contain" style={homeStyles.cardImage} />
      </View>
    </LinearGradient>
  );
}

function TomorrowTeaser({ image }: { image: ImageSourcePropType }) {
  return (
    <View style={homeStyles.tomorrowTeaser}>
      <View>
        <Text style={homeStyles.teaserLabel}>Tomorrow</Text>
        <Text style={homeStyles.teaserTitle}>Understanding Friendship</Text>
      </View>
      <Image source={image} resizeMode="contain" style={homeStyles.teaserImage} />
    </View>
  );
}

function YesterdayWisdom({ image }: { image: ImageSourcePropType }) {
  return (
    <View style={homeStyles.yesterdayCard}>
      <View style={homeStyles.yesterdayCopy}>
        <Text style={homeStyles.yesterdayLabel}>Yesterday</Text>
        <Text style={homeStyles.yesterdayTitle}>Helping a Friend</Text>
        <Text style={homeStyles.yesterdayBody}>You can come back to a wisdom whenever it feels useful.</Text>
      </View>
      <Image source={image} resizeMode="cover" style={homeStyles.yesterdayImage} />
    </View>
  );
}

const homeStyles = StyleSheet.create({
  screen: {
    alignSelf: 'center',
    backgroundColor: homeColors.background,
    flex: 1,
    maxWidth: 430,
    overflow: 'hidden',
    width: '100%',
  },
  content: {
    paddingBottom: 124,
  },
  worldStage: {
    marginBottom: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  worldImage: {
    height: '100%',
    position: 'absolute',
    width: '100%',
  },
  worldFade: {
    bottom: 0,
    height: 170,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  speechBubble: {
    backgroundColor: homeColors.cream,
    borderColor: 'rgba(255,255,255,0.92)',
    borderRadius: 24,
    borderWidth: 1,
    left: 20,
    paddingHorizontal: 17,
    paddingVertical: 15,
    position: 'absolute',
    top: 34,
    width: 186,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
  },
  speechTail: {
    backgroundColor: homeColors.cream,
    borderBottomRightRadius: 7,
    bottom: -7,
    height: 17,
    position: 'absolute',
    right: 26,
    transform: [{ rotate: '45deg' }],
    width: 17,
  },
  speechTitle: {
    color: homeColors.ink,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 25,
  },
  speechText: {
    color: homeColors.copy,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: 7,
  },
  motionLayerRoot: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  motionLayerAnchor: {
    height: 0,
    opacity: 0,
    width: 0,
  },
  wisdomCard: {
    borderColor: 'rgba(255,255,255,0.86)',
    borderRadius: 30,
    borderWidth: 2,
    bottom: 20,
    left: 18,
    minHeight: 232,
    overflow: 'hidden',
    padding: 22,
    position: 'absolute',
    right: 18,
    shadowColor: '#593B10',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.18,
    shadowRadius: 26,
  },
  cardCopy: {
    width: 210,
    zIndex: 2,
  },
  cardEyebrow: {
    color: homeColors.ink,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  cardTitle: {
    color: homeColors.ink,
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 38,
    marginTop: 17,
  },
  cardBody: {
    color: homeColors.copy,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
    marginTop: 10,
    width: 192,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 15,
  },
  metaItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  metaText: {
    color: homeColors.copy,
    fontSize: 12,
    fontWeight: '800',
  },
  startButton: {
    alignItems: 'center',
    backgroundColor: homeColors.navy,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 9,
    height: 50,
    justifyContent: 'center',
    marginTop: 16,
    width: 174,
  },
  startText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  cardImageWrap: {
    bottom: 30,
    height: 142,
    position: 'absolute',
    right: 10,
    width: 154,
  },
  cardImageGlow: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 82,
    height: 130,
    position: 'absolute',
    right: 8,
    top: 14,
    width: 130,
  },
  cardImage: {
    height: 140,
    position: 'absolute',
    right: 0,
    width: 154,
  },
  tomorrowTeaser: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderColor: homeColors.line,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 0,
    minHeight: 88,
    paddingHorizontal: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
  },
  teaserLabel: {
    color: homeColors.muted,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  teaserTitle: {
    color: homeColors.ink,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 24,
    marginTop: 7,
    maxWidth: 230,
  },
  teaserImage: {
    height: 76,
    opacity: 0.54,
    width: 78,
  },
  yesterdayCard: {
    backgroundColor: '#FFF2F8',
    borderColor: 'rgba(255,255,255,0.86)',
    borderRadius: 28,
    borderWidth: 2,
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 140,
    minHeight: 150,
    overflow: 'hidden',
    padding: 20,
  },
  yesterdayCopy: {
    flex: 1,
    paddingRight: 12,
  },
  yesterdayLabel: {
    color: homeColors.ink,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  yesterdayTitle: {
    color: homeColors.ink,
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 31,
    marginTop: 14,
  },
  yesterdayBody: {
    color: homeColors.copy,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: 8,
  },
  yesterdayImage: {
    borderRadius: 18,
    height: 118,
    width: 118,
  },
});
