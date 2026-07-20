import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Animated, Image, ImageSourcePropType, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { BottomNav } from '../components/BottomNav';
import { LoadingState } from '../components/LoadingState';
import { useAsyncResource } from '../hooks/useAsyncResource';
import { getTodayCloudPresence } from '../services/cloudPresenceService';
import {
  getHomeBedroomImage,
  getHomeWisdomWorlds,
  getLockedStorybookImage,
  getNeedsWantsJarsImage,
} from '../services/wisdomService';
import { colors } from '../theme';
import { styles } from '../theme/styles';
import { RootStackParamList } from '../types/wisdom';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

type CloudRoomSceneProps = {
  bedroomImage: ImageSourcePropType;
  onStartStory: () => void;
  isOpeningStory: boolean;
  storybookProgress: Animated.Value;
  waveEnergy: number;
  heroHeight: number;
};

function CloudRoomScene({
  bedroomImage,
  isOpeningStory,
  onStartStory,
  storybookProgress,
  waveEnergy,
  heroHeight,
}: CloudRoomSceneProps) {
  const roomBreath = useRef(new Animated.Value(0)).current;
  const roomEntrance = useRef(new Animated.Value(0)).current;
  const waveWarmth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const breathingLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(roomBreath, {
          duration: 2600,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(roomBreath, {
          duration: 3000,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    breathingLoop.start();

    Animated.sequence([
      Animated.timing(roomEntrance, {
        duration: 900,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(waveWarmth, {
        duration: 420,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(waveWarmth, {
        duration: 620,
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();

    return () => breathingLoop.stop();
  }, [roomBreath, roomEntrance, waveWarmth]);

  const roomTranslateY = roomEntrance.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 0],
  });
  const roomScale = roomBreath.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.006],
  });
  const greetingScale = waveWarmth.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1 + 0.016 * waveEnergy],
  });
  const storybookScale = storybookProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.985],
  });

  return (
    <View style={[styles.cloudBedroomHero, { height: heroHeight }]}>
      <Animated.Image
        source={bedroomImage}
        resizeMode="cover"
        style={[
          styles.cloudBedroomImage,
          {
            transform: [{ translateY: roomTranslateY }, { scale: roomScale }],
          },
        ]}
      />
      <LinearGradient colors={colors.gradient.roomHeroFade} style={styles.cloudBedroomFade} />

      <Animated.View
        style={[styles.cloudGreetingCard, { top: heroHeight - 220, transform: [{ scale: greetingScale }] }]}
      >
        <View style={styles.cloudGreetingTail} />
        <Text style={styles.cloudGreetingText}>Hi Andy! 👋</Text>
        <Text style={styles.cloudGreetingSubtext}>I've been thinking about something interesting...</Text>
      </Animated.View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Start today's story from Cloud's desk"
        disabled={isOpeningStory}
        onPress={onStartStory}
        style={styles.heroStorybookTapTarget}
      >
        <Animated.View style={[styles.heroStorybookTapGlow, { transform: [{ scale: storybookScale }] }]} />
      </Pressable>
    </View>
  );
}

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { height } = useWindowDimensions();
  const heroHeight = Math.min(500, Math.max(388, Math.round(height * 0.55)));
  const homeContent = useAsyncResource(async () => {
    const [worlds, bedroomImage, jarsImage, lockedStorybookImage] = await Promise.all([
      getHomeWisdomWorlds(),
      getHomeBedroomImage(),
      getNeedsWantsJarsImage(),
      getLockedStorybookImage(),
    ]);

    return {
      bedroomImage,
      jarsImage,
      lockedStorybookImage,
      todayWorld: worlds[0],
    };
  }, []);
  const presence = useRef(getTodayCloudPresence()).current;
  const storybookPress = useRef(new Animated.Value(0)).current;
  const [isOpeningStory, setIsOpeningStory] = useState(false);

  if (homeContent.error) {
    throw homeContent.error;
  }

  if (!homeContent.data?.todayWorld) {
    return <LoadingState colors={colors.gradient.loading} />;
  }

  const { bedroomImage, jarsImage, lockedStorybookImage, todayWorld } = homeContent.data;

  const startTodayStory = () => {
    if (isOpeningStory) {
      return;
    }

    setIsOpeningStory(true);
    Animated.sequence([
      Animated.timing(storybookPress, {
        duration: 150,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(storybookPress, {
        duration: 170,
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.navigate('WisdomJourney', {
        screen: 'QuestionBeforeWisdom',
        params: { wisdomId: todayWorld.heroWisdomId },
      });
      setIsOpeningStory(false);
    });
  };

  return (
    <LinearGradient colors={colors.gradient.homeBackground} style={styles.phone}>
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        style={styles.cloudHomeScroll}
        contentContainerStyle={styles.cloudHomeContent}
      >
        <CloudRoomScene
          bedroomImage={bedroomImage}
          isOpeningStory={isOpeningStory}
          onStartStory={startTodayStory}
          storybookProgress={storybookPress}
          waveEnergy={presence.expression.waveEnergy}
          heroHeight={heroHeight}
        />

        <View style={styles.cloudHomeCards}>
          <LinearGradient colors={colors.gradient.homeTodayCard} style={styles.homeTodayCard}>
            <View style={styles.homeTodayCopy}>
              <View style={styles.homeStoryPill}>
                <Ionicons name="star" size={14} color={colors.accent.orange} />
                <Text style={styles.homeStoryPillText}>TODAY'S STORY</Text>
              </View>
              <Text style={styles.homeTodayTitle}>Needs vs Wants</Text>
              <Text style={styles.homeTodaySubtitle}>Making choices today for a better tomorrow.</Text>
              <View style={styles.homeTodayMetaRow}>
                <View style={styles.homeTodayMetaItem}>
                  <Ionicons name="time-outline" size={22} color={colors.text.brownMuted} />
                  <View>
                    <Text style={styles.homeTodayMetaValue}>{todayWorld.heroMinutes} min</Text>
                    <Text style={styles.homeTodayMetaLabel}>Reading Time</Text>
                  </View>
                </View>
                <View style={styles.homeTodayMetaItem}>
                  <Ionicons name="bulb-outline" size={24} color={colors.text.brownMuted} />
                  <View>
                    <Text style={styles.homeTodayMetaValue}>Builds</Text>
                    <Text style={styles.homeTodayMetaLabel}>Wise Choices</Text>
                  </View>
                </View>
              </View>
            </View>
            <Image source={jarsImage} resizeMode="contain" style={styles.homeNeedsWantsJars} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Start Story"
              disabled={isOpeningStory}
              onPress={startTodayStory}
              style={styles.startStoryButton}
            >
              <Ionicons name="book-outline" size={23} color={colors.accent.goldLight} />
              <Text style={styles.startStoryText}>Start Story</Text>
              <Ionicons name="chevron-forward" size={22} color={colors.accent.goldLight} />
            </Pressable>
          </LinearGradient>

          <LinearGradient colors={colors.gradient.homeLockedCard} style={styles.homeLockedCard}>
            <View style={styles.homeLockedIconWrap}>
              <Ionicons name="sparkles-outline" size={26} color={colors.text.soft} />
            </View>
            <View style={styles.homeLockedCopy}>
              <Text style={styles.homeLockedEyebrow}>UP NEXT</Text>
              <Text style={styles.homeLockedTitle}>Saving for Something Big</Text>
              <Text style={styles.homeLockedBody}>Keep going to unlock tomorrow's wisdom.</Text>
            </View>
            <Image source={lockedStorybookImage} resizeMode="contain" style={styles.homeLockedBook} />
            <Ionicons name="chevron-forward" size={26} color={colors.text.muted} style={styles.homeLockedChevron} />
          </LinearGradient>
        </View>
      </ScrollView>

      <BottomNav active="Home" />
    </LinearGradient>
  );
}
