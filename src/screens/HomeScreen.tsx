import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Animated, Image, ImageSourcePropType, Pressable, Text, View } from 'react-native';
import { CloudPresenceProfile, getTodayCloudPresence } from '../services/cloudPresenceService';
import { getCloudDeskImage, getHomeWisdomWorlds } from '../services/wisdomService';
import { styles } from '../theme/styles';
import { RootStackParamList } from '../types/wisdom';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
type CloudPresenceProps = {
  presence: CloudPresenceProfile;
  reachProgress: Animated.Value;
  cloudImage: ImageSourcePropType;
};

function CloudPresence({ presence, reachProgress, cloudImage }: CloudPresenceProps) {
  const breath = useRef(new Animated.Value(0)).current;
  const lookUp = useRef(new Animated.Value(0)).current;
  const blink = useRef(new Animated.Value(0)).current;
  const wave = useRef(new Animated.Value(0)).current;
  const smile = useRef(new Animated.Value(0)).current;
  const { expression } = presence;

  useEffect(() => {
    const breathingLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, {
          duration: 2300,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(breath, {
          duration: 2600,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    breathingLoop.start();

    Animated.timing(lookUp, {
      delay: 240,
      duration: 900,
      toValue: 1,
      useNativeDriver: true,
    }).start();

    Animated.sequence([
      Animated.delay(1050),
      Animated.parallel([
        Animated.sequence([
          Animated.timing(wave, {
            duration: 260,
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.timing(wave, {
            duration: 380,
            toValue: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(smile, {
            duration: 240,
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.delay(760),
          Animated.timing(smile, {
            duration: 520,
            toValue: 0,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();

    const blinkTimers: ReturnType<typeof setTimeout>[] = [];
    let isMounted = true;

    const queueBlink = (delay: number) => {
      const timer = setTimeout(() => {
        if (!isMounted) {
          return;
        }

        Animated.sequence([
          Animated.timing(blink, {
            duration: 70,
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.timing(blink, {
            duration: 90,
            toValue: 0,
            useNativeDriver: true,
          }),
        ]).start(() => queueBlink(3200 + Math.round(Math.random() * 2400)));
      }, delay);

      blinkTimers.push(timer);
    };

    queueBlink(1800);

    return () => {
      isMounted = false;
      breathingLoop.stop();
      blinkTimers.forEach(clearTimeout);
    };
  }, [blink, breath, lookUp, smile, wave]);

  const breathingTranslateY = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -3],
  });
  const breathingScale = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.014],
  });
  const lookUpTranslateY = lookUp.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 0],
  });
  const lookUpRotate = lookUp.interpolate({
    inputRange: [0, 1],
    outputRange: ['1.2deg', '0deg'],
  });
  const reachTranslateX = reachProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -26],
  });
  const reachTranslateY = reachProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 12],
  });
  const reachRotate = reachProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-3deg'],
  });
  const waveRotate = wave.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [
      `${-10 * expression.waveEnergy}deg`,
      `${15 * expression.waveEnergy}deg`,
      `${-6 * expression.waveEnergy}deg`,
    ],
  });
  const smileOpacity = smile.interpolate({
    inputRange: [0, 1],
    outputRange: [expression.smileOpacity, Math.min(expression.smileOpacity + 0.22, 0.48)],
  });

  return (
    <Animated.View
      style={[
        styles.deskCloudStage,
        {
          transform: [
            { translateX: reachTranslateX },
            { translateY: Animated.add(Animated.add(breathingTranslateY, lookUpTranslateY), reachTranslateY) },
            { rotate: reachRotate },
            { rotate: lookUpRotate },
            { scale: breathingScale },
          ],
        },
      ]}
    >
      <Animated.Image source={cloudImage} style={styles.deskCloudImage} resizeMode="cover" />
      <View style={[styles.cloudEyeExpressionLayer, { opacity: expression.browOpacity }]}>
        <View
          style={[
            styles.cloudExpressionBrowLeft,
            {
              transform: [{ rotate: `${expression.browTilt}deg` }],
              width: expression.eyeWidth + 3,
            },
          ]}
        />
        <View
          style={[
            styles.cloudExpressionBrowRight,
            {
              transform: [{ rotate: `${-expression.browTilt}deg` }],
              width: expression.eyeWidth + 3,
            },
          ]}
        />
      </View>
      <Animated.View style={[styles.cloudBlinkLayer, { opacity: blink }]}>
        <View
          style={[
            styles.cloudBlinkEyeLeft,
            {
              top: expression.blinkTop,
              width: expression.eyeWidth,
            },
          ]}
        />
        <View
          style={[
            styles.cloudBlinkEyeRight,
            {
              top: expression.blinkTop,
              width: expression.eyeWidth,
            },
          ]}
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.cloudSmileGlow,
          {
            opacity: smileOpacity,
            transform: [{ scale: expression.smileScale }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.cloudWaveHand,
          {
            opacity: wave,
            transform: [{ rotate: waveRotate }],
          },
        ]}
      >
        <View style={styles.cloudWaveFingerOne} />
        <View style={styles.cloudWaveFingerTwo} />
        <View style={styles.cloudWavePalm} />
      </Animated.View>
    </Animated.View>
  );
}

export function HomeScreen({ navigation }: HomeScreenProps) {
  const todayWorld = getHomeWisdomWorlds()[0];
  const cloudDeskImage = getCloudDeskImage();
  const presence = useRef(getTodayCloudPresence()).current;
  const storybookPress = useRef(new Animated.Value(0)).current;
  const cloudReach = useRef(new Animated.Value(0)).current;
  const [isOpeningStory, setIsOpeningStory] = useState(false);

  const startTodayStory = () => {
    if (isOpeningStory) {
      return;
    }

    setIsOpeningStory(true);
    Animated.parallel([
      Animated.sequence([
        Animated.timing(storybookPress, {
          duration: 160,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(storybookPress, {
          duration: 180,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(cloudReach, {
          duration: 280,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.delay(120),
        Animated.timing(cloudReach, {
          duration: 180,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      navigation.navigate('WisdomJourney', {
        screen: 'Reading',
        params: { wisdomId: todayWorld.heroWisdomId },
      });
      setIsOpeningStory(false);
    });
  };

  const storybookScale = storybookPress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.96],
  });
  const storybookRotate = storybookPress.interpolate({
    inputRange: [0, 1],
    outputRange: ['-8deg', '-5deg'],
  });

  return (
    <LinearGradient colors={['#FFE6B8', '#F7B56A', '#6F462E']} style={styles.phone}>
      <View style={styles.cloudHome}>
        <View style={styles.morningGlow} />
        <View style={styles.sunBeamOne} />
        <View style={styles.sunBeamTwo} />

        <View style={styles.bedroomWall}>
          <View style={styles.bedroomWindow}>
            <LinearGradient colors={['#BCE7FF', '#FFE0A8']} style={styles.windowSky}>
              <View style={styles.windowSun} />
              <View style={styles.windowHillBack} />
              <View style={styles.windowHillFront} />
            </LinearGradient>
            <View style={styles.windowFrameVertical} />
            <View style={styles.windowFrameHorizontal} />
          </View>

          <View style={styles.bookshelf}>
            <View style={[styles.bookSpine, styles.bookSpineGold]} />
            <View style={[styles.bookSpine, styles.bookSpineNavy]} />
            <View style={[styles.bookSpine, styles.bookSpineCream]} />
            <View style={[styles.bookSpine, styles.bookSpineGreen]} />
            <View style={styles.shelfBoard} />
          </View>

          <View style={styles.backpackHook} />
          <View style={styles.backpack}>
            <View style={styles.backpackPocket} />
          </View>
        </View>

        <View style={styles.cloudGreetingCard}>
          <View style={styles.cloudGreetingTail} />
          <Text style={styles.cloudGreetingText}>{presence.greeting.line}</Text>
          <Text style={styles.cloudGreetingSubtext}>{presence.greeting.subtext}</Text>
        </View>

        <CloudPresence presence={presence} reachProgress={cloudReach} cloudImage={cloudDeskImage} />

        <View style={styles.woodenDesk}>
          <View style={styles.deskTop}>
            <Pressable disabled={isOpeningStory} style={styles.storybookPressable} onPress={startTodayStory}>
              <Animated.View
                style={[
                  styles.storybookAnimatedSurface,
                  {
                    transform: [{ rotate: storybookRotate }, { scale: storybookScale }],
                  },
                ]}
              >
                <LinearGradient colors={['#F8D66D', '#D98A2B']} style={styles.storybookCover}>
                  <View style={styles.storybookGlow} />
                  <Text style={styles.storybookEyebrow}>Today's Story</Text>
                  <Text style={styles.storybookTitle}>Needs vs Wants</Text>
                  <View style={styles.storybookLine} />
                  <Text style={styles.storybookHint}>Tap to open</Text>
                </LinearGradient>
              </Animated.View>
            </Pressable>

            <View style={styles.deskLamp}>
              <View style={styles.lampShade} />
              <View style={styles.lampStem} />
              <View style={styles.lampBase} />
            </View>
          </View>
          <View style={styles.deskFront}>
            <View style={styles.deskDrawer} />
            <View style={styles.deskKnob} />
          </View>
        </View>

        <View style={styles.bedroomFloor} />
      </View>
    </LinearGradient>
  );
}
