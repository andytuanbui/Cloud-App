import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import {
  Animated,
  Image,
  ImageSourcePropType,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '../theme';
import { RootStackParamList } from '../types/wisdom';

type TimelineProps = NativeStackScreenProps<RootStackParamList, 'TodayTimelinePrototype'>;

type TimelineWisdom = {
  id: string;
  title: string;
  todayBody: string;
  upcomingBody: string;
  pastBody: string;
  image: ImageSourcePropType;
  palette: readonly [string, string, string];
  skill?: string;
};

type DisplayWisdom = TimelineWisdom & {
  body: string;
  label: string;
};

const cloudHero = require('../../assets/cloud/cloud-hero-wave.png');
const cloudThinking = require('../../assets/cloud/cloud-thinking.png');
const cloudFriend = require('../../assets/cloud/cloud-helps-friend.png');
const needsWants = require('../../assets/cloud/needs-wants-jars.png');
const peopleWorld = require('../../assets/cloud/cat-people.png');
const thinkingWorld = require('../../assets/cloud/cat-thinking.png');

const prototypeColors = {
  background: '#FFFFFF',
  copy: '#273247',
  ink: '#0B1730',
  meta: '#7E8998',
  muted: '#677186',
  navInactive: '#7A7F88',
} as const;

const timelineSeeds: TimelineWisdom[] = [
  {
    id: 'helping-a-friend',
    title: 'Helping a Friend',
    todayBody: 'Kindness gets easier when you notice what someone needs.',
    upcomingBody: 'Available soon',
    pastBody: 'You practiced noticing when someone needs kindness.',
    image: cloudFriend,
    palette: ['#FDEFF5', '#F9DFEC', '#FFFFFF'],
    skill: 'Kindness in action',
  },
  {
    id: 'smart-choices',
    title: 'Smart Choices',
    todayBody: 'Small choices today can shape what happens next.',
    upcomingBody: 'Available soon',
    pastBody: 'You explored how one thoughtful choice can change tomorrow.',
    image: needsWants,
    palette: ['#EAF8F7', '#FFF6D9', '#F8D9A8'],
    skill: 'Builds wise choices',
  },
  {
    id: 'understanding-friendship',
    title: 'Understanding Friendship',
    todayBody: 'Friendship grows when you notice how someone feels.',
    upcomingBody: 'Available tomorrow',
    pastBody: 'You practiced seeing friendship with more care.',
    image: peopleWorld,
    palette: ['#FFF2F8', '#F9DFEC', '#FFFFFF'],
    skill: 'Builds kind attention',
  },
  {
    id: 'learning-from-mistakes',
    title: 'Learning From Mistakes',
    todayBody: 'Mistakes can become clues when you slow down and learn.',
    upcomingBody: 'Available in 2 days',
    pastBody: 'You practiced turning mistakes into learning.',
    image: thinkingWorld,
    palette: ['#EEF4FF', '#E6EEFF', '#FFFFFF'],
    skill: 'Builds thoughtful repair',
  },
];

export function TodayTimelinePrototypeScreen({ navigation }: TimelineProps) {
  const [dayIndex, setDayIndex] = useState(0);
  const [isTomorrowOpen, setIsTomorrowOpen] = useState(false);
  const transition = useRef(new Animated.Value(1)).current;
  const scrollRef = useRef<ScrollView>(null);

  const previousWisdoms: DisplayWisdom[] = timelineSeeds.slice(0, dayIndex + 1).reverse().map((wisdom, index) => ({
    ...wisdom,
    body: wisdom.pastBody,
    label: index === 0 ? 'Yesterday' : 'Earlier',
  }));
  const todaySource = timelineSeeds[dayIndex + 1] ?? timelineSeeds[1];
  const tomorrowSource = timelineSeeds[dayIndex + 2] ?? timelineSeeds[timelineSeeds.length - 1];
  const todayWisdom: DisplayWisdom = {
    ...todaySource,
    body: todaySource.todayBody,
    label: "Today's Wisdom",
  };
  const tomorrowWisdom: DisplayWisdom = {
    ...tomorrowSource,
    body: tomorrowSource.upcomingBody,
    label: dayIndex === 0 ? 'Tomorrow' : 'Later',
  };

  const simulateNextDay = () => {
    if (dayIndex >= timelineSeeds.length - 2) {
      return;
    }

    Animated.sequence([
      Animated.timing(transition, {
        duration: 180,
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.timing(transition, {
        duration: 320,
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      setDayIndex((current) => Math.min(current + 1, timelineSeeds.length - 2));
      scrollRef.current?.scrollTo({ animated: true, y: 214 });
    }, 190);
  };

  const startWisdom = () => {
    navigation.navigate('WisdomJourney', {
      screen: 'QuestionBeforeWisdom',
      params: { wisdomId: 'needs-vs-wants' },
    });
  };

  return (
    <View style={timelineStyles.screen}>
      <StatusBar style="dark" />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={timelineStyles.content}
        onContentSizeChange={() => scrollRef.current?.scrollTo({ animated: false, y: 214 })}
      >
        <TopEnvironment />
        <Pressable onPress={() => setIsTomorrowOpen(true)}>
          <TimelineCard isUpcoming wisdom={tomorrowWisdom} />
        </Pressable>
        <Animated.View
          style={{
            opacity: transition,
            transform: [
              {
                translateY: transition.interpolate({
                  inputRange: [0, 1],
                  outputRange: [12, 0],
                }),
              },
            ],
          }}
        >
          <TodayCard wisdom={todayWisdom} onStart={startWisdom} />
          <View style={timelineStyles.previousStack}>
            {previousWisdoms.map((wisdom, index) => (
              <TimelineCard key={wisdom.id} isPast isSoft={index > 0} wisdom={wisdom} />
            ))}
          </View>
        </Animated.View>
        <Pressable accessibilityRole="button" onPress={simulateNextDay} style={timelineStyles.devButton}>
          <Text style={timelineStyles.devButtonText}>Simulate Next Day</Text>
        </Pressable>
      </ScrollView>
      <PrototypeBottomNav />
      <TomorrowModal onClose={() => setIsTomorrowOpen(false)} visible={isTomorrowOpen} />
    </View>
  );
}

function TopEnvironment() {
  return (
    <View style={timelineStyles.hero}>
      <View style={timelineStyles.heroLight} />
      <View style={timelineStyles.window}>
        <LinearGradient colors={['#BFE9FF', '#FFE6B7']} style={timelineStyles.windowSky}>
          <View style={timelineStyles.sun} />
          <View style={timelineStyles.hillBack} />
          <View style={timelineStyles.hillFront} />
        </LinearGradient>
      </View>
      <View style={timelineStyles.shelf}>
        <View style={timelineStyles.bookTall} />
        <View style={timelineStyles.bookShort} />
        <View style={timelineStyles.plantPot}>
          <Ionicons name="leaf" size={22} color="#4DAA67" />
        </View>
      </View>
      <Image source={cloudHero} resizeMode="contain" style={timelineStyles.heroCloud} />
      <View style={timelineStyles.heroBubble}>
        <Text style={timelineStyles.heroGreeting}>Good morning, Alex.</Text>
        <Text style={timelineStyles.heroLine}>Cloud is watering the flowers today.</Text>
      </View>
      <View style={timelineStyles.desk}>
        <Ionicons name="flower-outline" size={28} color="#5CA875" />
        <View style={timelineStyles.storybook}>
          <Text style={timelineStyles.storybookText}>today</Text>
        </View>
      </View>
    </View>
  );
}

function TodayCard({ onStart, wisdom }: { onStart: () => void; wisdom: DisplayWisdom }) {
  return (
    <LinearGradient colors={wisdom.palette} style={timelineStyles.todayCard}>
      <View style={timelineStyles.todayText}>
        <Text style={timelineStyles.eyebrow}>{wisdom.label}</Text>
        <Text style={timelineStyles.todayTitle}>{wisdom.title}</Text>
        <Text style={timelineStyles.todayBody}>{wisdom.body}</Text>
        <View style={timelineStyles.metaRow}>
          <View style={timelineStyles.metaItem}>
            <Ionicons name="time-outline" size={25} color={prototypeColors.meta} />
            <View>
              <Text style={timelineStyles.metaValue}>8 min</Text>
              <Text style={timelineStyles.metaLabel}>Reading Time</Text>
            </View>
          </View>
          <View style={timelineStyles.metaItem}>
            <Ionicons name="sparkles-outline" size={24} color={prototypeColors.meta} />
            <View>
              <Text style={timelineStyles.metaValue}>Builds</Text>
              <Text style={timelineStyles.metaLabel}>{wisdom.skill?.replace('Builds ', '') ?? 'Wise Choices'}</Text>
            </View>
          </View>
        </View>
        <Pressable accessibilityRole="button" onPress={onStart} style={timelineStyles.startButton}>
          <Text style={timelineStyles.startText}>Start Wisdom</Text>
          <View style={timelineStyles.playCircle}>
            <Ionicons name="play" size={17} color={colors.text.primary} />
          </View>
        </Pressable>
      </View>
      <View style={timelineStyles.todayArtwork}>
        <View style={timelineStyles.artGlow} />
        <Image source={wisdom.image} resizeMode="contain" style={timelineStyles.todayImage} />
      </View>
    </LinearGradient>
  );
}

function TimelineCard({
  isPast,
  isSoft,
  isUpcoming,
  wisdom,
}: {
  isPast?: boolean;
  isSoft?: boolean;
  isUpcoming?: boolean;
  wisdom: DisplayWisdom;
}) {
  return (
    <LinearGradient
      colors={isUpcoming ? ['#F7F8FA', '#ECEFF3', '#FFFFFF'] : wisdom.palette}
      style={[timelineStyles.timelineCard, isPast && timelineStyles.pastCard, isSoft && timelineStyles.softPastCard]}
    >
      <View style={timelineStyles.timelineCopy}>
        <Text style={[timelineStyles.timelineLabel, isUpcoming && timelineStyles.mutedText]}>{wisdom.label}</Text>
        <Text style={[timelineStyles.timelineTitle, isUpcoming && timelineStyles.mutedText]}>{wisdom.title}</Text>
        <Text style={[timelineStyles.timelineBody, isUpcoming && timelineStyles.mutedText]}>{wisdom.body}</Text>
        {isPast ? <Text style={timelineStyles.revisitText}>Open again anytime</Text> : null}
      </View>
      <View style={timelineStyles.timelineImageWrap}>
        <Image source={wisdom.image} resizeMode="contain" style={[timelineStyles.timelineImage, isUpcoming && timelineStyles.upcomingImage]} />
        {isUpcoming ? <View style={timelineStyles.greyWash} /> : null}
      </View>
    </LinearGradient>
  );
}

function TomorrowModal({ onClose, visible }: { onClose: () => void; visible: boolean }) {
  return (
    <Modal animationType="fade" transparent visible={visible}>
      <Pressable onPress={onClose} style={timelineStyles.modalScrim}>
        <Pressable style={timelineStyles.sheet}>
          <Image source={cloudThinking} resizeMode="contain" style={timelineStyles.sheetCloud} />
          <Text style={timelineStyles.sheetTitle}>We'll talk about this tomorrow.</Text>
          <Text style={timelineStyles.sheetBody}>Cloud is keeping it nearby so today can stay simple.</Text>
          <Pressable accessibilityRole="button" onPress={onClose} style={timelineStyles.sheetButton}>
            <Text style={timelineStyles.sheetButtonText}>Okay</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function PrototypeBottomNav() {
  const items = [
    { icon: 'home' as const, label: 'Home' },
    { icon: 'book-outline' as const, label: 'Wisdoms' },
    { icon: 'people-outline' as const, label: 'Family' },
    { icon: 'person-outline' as const, label: 'Profile' },
  ];

  return (
    <View style={timelineStyles.bottomNav}>
      {items.map((item, index) => (
        <View key={item.label} style={timelineStyles.navItem}>
          <Ionicons name={item.icon} size={26} color={index === 0 ? prototypeColors.ink : prototypeColors.navInactive} />
          <Text style={[timelineStyles.navText, index === 0 && timelineStyles.navTextActive]}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const timelineStyles = StyleSheet.create({
  screen: {
    backgroundColor: prototypeColors.background,
    flex: 1,
  },
  content: {
    paddingBottom: 126,
    paddingHorizontal: 22,
    paddingTop: 20,
  },
  hero: {
    backgroundColor: '#F8FCFB',
    borderRadius: 34,
    height: 330,
    marginBottom: 18,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: colors.shadow.black,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.08,
    shadowRadius: 28,
  },
  heroLight: {
    backgroundColor: '#FFF2CD',
    borderRadius: 160,
    height: 260,
    left: -70,
    opacity: 0.82,
    position: 'absolute',
    top: -48,
    width: 260,
  },
  window: {
    borderColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 5,
    height: 138,
    left: 22,
    overflow: 'hidden',
    position: 'absolute',
    top: 24,
    width: 112,
  },
  windowSky: {
    flex: 1,
  },
  sun: {
    backgroundColor: '#FFD37A',
    borderRadius: 18,
    height: 36,
    position: 'absolute',
    right: 14,
    top: 22,
    width: 36,
  },
  hillBack: {
    backgroundColor: '#9DDC93',
    borderRadius: 70,
    bottom: -28,
    height: 78,
    left: -24,
    position: 'absolute',
    width: 130,
  },
  hillFront: {
    backgroundColor: '#67B779',
    borderRadius: 56,
    bottom: -22,
    height: 64,
    right: -32,
    position: 'absolute',
    width: 116,
  },
  shelf: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 8,
    position: 'absolute',
    right: 24,
    top: 38,
  },
  bookTall: {
    backgroundColor: '#F0B24F',
    borderRadius: 7,
    height: 58,
    width: 18,
  },
  bookShort: {
    backgroundColor: '#80BEE8',
    borderRadius: 7,
    height: 44,
    width: 18,
  },
  plantPot: {
    alignItems: 'center',
    backgroundColor: '#FFE4B3',
    borderRadius: 12,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  heroCloud: {
    bottom: 20,
    height: 260,
    left: 178,
    position: 'absolute',
    width: 150,
    zIndex: 4,
  },
  heroBubble: {
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderColor: 'rgba(255,255,255,0.96)',
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 15,
    position: 'absolute',
    left: 24,
    top: 174,
    width: 186,
    zIndex: 5,
  },
  heroGreeting: {
    color: prototypeColors.ink,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 24,
  },
  heroLine: {
    color: prototypeColors.copy,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 6,
  },
  desk: {
    alignItems: 'center',
    backgroundColor: '#D99A55',
    borderTopLeftRadius: 120,
    borderTopRightRadius: 120,
    bottom: -24,
    flexDirection: 'row',
    gap: 20,
    height: 94,
    justifyContent: 'center',
    left: -30,
    position: 'absolute',
    right: -30,
  },
  storybook: {
    alignItems: 'center',
    backgroundColor: '#0B1730',
    borderRadius: 14,
    height: 46,
    justifyContent: 'center',
    width: 82,
  },
  storybookText: {
    color: '#FFE7A4',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  todayCard: {
    borderColor: '#FFFFFF',
    borderRadius: 34,
    borderWidth: 3,
    height: 392,
    marginBottom: 18,
    overflow: 'hidden',
    padding: 26,
    position: 'relative',
    shadowColor: colors.shadow.black,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
  },
  todayText: {
    width: 210,
    zIndex: 4,
  },
  eyebrow: {
    color: prototypeColors.ink,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  todayTitle: {
    color: prototypeColors.ink,
    fontSize: 35,
    fontWeight: '900',
    lineHeight: 40,
    marginTop: 26,
  },
  todayBody: {
    color: prototypeColors.copy,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 23,
    marginTop: 16,
    width: 186,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 22,
  },
  metaItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  metaValue: {
    color: prototypeColors.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  metaLabel: {
    color: prototypeColors.copy,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    maxWidth: 76,
  },
  startButton: {
    alignItems: 'center',
    backgroundColor: prototypeColors.ink,
    borderRadius: 999,
    flexDirection: 'row',
    height: 58,
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: colors.shadow.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    width: 210,
  },
  startText: {
    color: colors.text.primary,
    fontSize: 17,
    fontWeight: '900',
    marginRight: 14,
  },
  playCircle: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 999,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  todayArtwork: {
    bottom: 74,
    height: 138,
    position: 'absolute',
    right: 14,
    width: 154,
  },
  artGlow: {
    backgroundColor: 'rgba(255,255,255,0.52)',
    borderRadius: 90,
    height: 132,
    position: 'absolute',
    right: 8,
    top: 18,
    width: 132,
  },
  todayImage: {
    height: 136,
    position: 'absolute',
    right: 0,
    top: 8,
    width: 152,
  },
  timelineCard: {
    borderColor: '#FFFFFF',
    borderRadius: 30,
    borderWidth: 3,
    height: 154,
    marginBottom: 18,
    overflow: 'hidden',
    padding: 22,
    position: 'relative',
    shadowColor: colors.shadow.black,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.07,
    shadowRadius: 22,
  },
  pastCard: {
    height: 142,
  },
  softPastCard: {
    opacity: 0.78,
  },
  timelineCopy: {
    width: '58%',
    zIndex: 3,
  },
  timelineLabel: {
    color: prototypeColors.ink,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  timelineTitle: {
    color: prototypeColors.ink,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 29,
    marginTop: 12,
  },
  timelineBody: {
    color: prototypeColors.copy,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 8,
  },
  mutedText: {
    color: '#8A929E',
  },
  revisitText: {
    color: prototypeColors.muted,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 9,
  },
  timelineImageWrap: {
    bottom: 2,
    height: 132,
    position: 'absolute',
    right: 12,
    width: 150,
  },
  timelineImage: {
    height: 132,
    width: 150,
  },
  upcomingImage: {
    opacity: 0.46,
  },
  greyWash: {
    backgroundColor: 'rgba(230,234,239,0.38)',
    borderRadius: 30,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  previousStack: {
    marginBottom: 4,
  },
  devButton: {
    alignSelf: 'center',
    backgroundColor: '#F3F6FA',
    borderRadius: 999,
    marginBottom: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  devButtonText: {
    color: prototypeColors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  bottomNav: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderColor: 'rgba(12,23,48,0.08)',
    borderRadius: 34,
    borderWidth: 1,
    bottom: 18,
    flexDirection: 'row',
    height: 82,
    justifyContent: 'space-around',
    left: 24,
    position: 'absolute',
    right: 24,
    shadowColor: colors.shadow.black,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
  },
  navItem: {
    alignItems: 'center',
    gap: 6,
  },
  navText: {
    color: prototypeColors.navInactive,
    fontSize: 12,
    fontWeight: '800',
  },
  navTextActive: {
    color: prototypeColors.ink,
  },
  modalScrim: {
    backgroundColor: 'rgba(11,23,48,0.22)',
    flex: 1,
    justifyContent: 'flex-end',
    padding: 22,
  },
  sheet: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 34,
    padding: 24,
    shadowColor: colors.shadow.black,
    shadowOffset: { width: 0, height: 22 },
    shadowOpacity: 0.16,
    shadowRadius: 30,
  },
  sheetCloud: {
    height: 116,
    marginBottom: 8,
    width: 116,
  },
  sheetTitle: {
    color: prototypeColors.ink,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
    textAlign: 'center',
  },
  sheetBody: {
    color: prototypeColors.copy,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
    marginTop: 10,
    textAlign: 'center',
  },
  sheetButton: {
    alignItems: 'center',
    backgroundColor: prototypeColors.ink,
    borderRadius: 999,
    height: 52,
    justifyContent: 'center',
    marginTop: 22,
    width: '100%',
  },
  sheetButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '900',
  },
});

