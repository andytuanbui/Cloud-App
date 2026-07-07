import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  ImageSourcePropType,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Category = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  colors: [string, string];
  image: ImageSourcePropType;
};

type WisdomWorld = Category & {
  background: [string, string];
  heroTitle: string;
  heroDescription: string;
  heroMinutes: number;
  heroImage: ImageSourcePropType;
  heroColors: [string, string];
  lockedTitle: string;
  lockedDescription: string;
  lockedMinutes: number;
  lockedImage: ImageSourcePropType;
  lockedColors: [string, string];
};

type ActiveScreen = 'home' | 'detail';
type DetailSource = 'hero' | 'locked';

const globalIdentity = {
  current: 'Young Investor',
  completed: '12 total wisdoms completed',
  next: 'Money Builder',
};

type CardState = 'active' | 'locked' | 'completed' | 'soon';

type WisdomCardData = {
  title: string;
  description: string;
  minutes: number;
  state: CardState;
  image: ImageSourcePropType;
  colors: [string, string];
};

const assets = {
  hero: require('./assets/cloud/cloud-full-body.png'),
  next: require('./assets/cloud/cloud-thinking.png'),
  threeJars: require('./assets/cloud/cloud-reading.png'),
  piggy: require('./assets/cloud/cat-money.png'),
  completed: require('./assets/cloud/cloud-helps-friend.png'),
  investing: require('./assets/cloud/cloud-thinking.png'),
  avatar: require('./assets/cloud/cloud-avatar.png'),
  money: require('./assets/cloud/cat-money.png'),
  street: require('./assets/cloud/cat-street.png'),
  people: require('./assets/cloud/cat-people.png'),
  thinking: require('./assets/cloud/cat-thinking.png'),
  communication: require('./assets/cloud/cat-communication.png'),
  modern: require('./assets/cloud/cat-modern.png'),
};

const categories: Category[] = [
  { key: 'money', label: 'Money', icon: 'cash-outline', colors: ['#66BB39', '#12763F'], image: assets.money },
  { key: 'street', label: 'Street', icon: 'shield-checkmark-outline', colors: ['#3BA3FF', '#224B9C'], image: assets.street },
  { key: 'people', label: 'People', icon: 'heart', colors: ['#FB5FA5', '#9D2D74'], image: assets.people },
  { key: 'thinking', label: 'Thinking', icon: 'bulb', colors: ['#7A5CFF', '#3D2BA3'], image: assets.thinking },
  { key: 'comm', label: 'Comm.', icon: 'chatbubble-ellipses', colors: ['#2DD4D4', '#0D7186'], image: assets.communication },
  { key: 'modern', label: 'Modern', icon: 'globe-outline', colors: ['#2E9CF2', '#154C95'], image: assets.modern },
];

const worlds: WisdomWorld[] = [
  {
    ...categories[0],
    background: ['#081326', '#0B1E24'],
    heroTitle: 'Needs vs\nWants',
    heroDescription: 'Learn how to choose what truly matters before spending your resources.',
    heroMinutes: 8,
    heroImage: assets.hero,
    heroColors: ['#F7B733', '#E88A1A'],
    lockedTitle: 'Three Jars Method',
    lockedDescription: 'Cloud is preparing this for tomorrow.',
    lockedMinutes: 7,
    lockedImage: assets.threeJars,
    lockedColors: ['#39235E', '#171C4C'],
  },
  {
    ...categories[1],
    background: ['#071326', '#0F2F57'],
    heroTitle: 'Trust Your\nInstincts',
    heroDescription: 'Notice what feels wrong, pause, and choose the safer next step.',
    heroMinutes: 7,
    heroImage: assets.street,
    heroColors: ['#2257B8', '#1B2E72'],
    lockedTitle: 'Reading People',
    lockedDescription: 'Cloud is preparing this for tomorrow.',
    lockedMinutes: 8,
    lockedImage: assets.street,
    lockedColors: ['#263B76', '#171C4C'],
  },
  {
    ...categories[2],
    background: ['#170B22', '#3E1739'],
    heroTitle: 'Kind\nBoundaries',
    heroDescription: 'Learn how to be warm and still say no when something is not right.',
    heroMinutes: 8,
    heroImage: assets.people,
    heroColors: ['#FB5FA5', '#8F2E65'],
    lockedTitle: 'Reading Feelings',
    lockedDescription: 'Cloud is preparing this for tomorrow.',
    lockedMinutes: 7,
    lockedImage: assets.people,
    lockedColors: ['#64304C', '#251B3F'],
  },
  {
    ...categories[3],
    background: ['#100F2B', '#2C1E5F'],
    heroTitle: 'Pause Before\nReacting',
    heroDescription: 'Give your wiser self one breath to arrive before you choose.',
    heroMinutes: 5,
    heroImage: assets.thinking,
    heroColors: ['#7A5CFF', '#3D2BA3'],
    lockedTitle: 'Puzzle Thinking',
    lockedDescription: 'Cloud is preparing this for tomorrow.',
    lockedMinutes: 6,
    lockedImage: assets.thinking,
    lockedColors: ['#4A347D', '#191B4C'],
  },
  {
    ...categories[4],
    background: ['#071A24', '#0C3F4B'],
    heroTitle: 'Use Clear\nWords',
    heroDescription: 'Say what you mean with courage, kindness, and simple words.',
    heroMinutes: 6,
    heroImage: assets.communication,
    heroColors: ['#2DD4D4', '#0D7186'],
    lockedTitle: 'Ask Better Questions',
    lockedDescription: 'Cloud is preparing this for tomorrow.',
    lockedMinutes: 8,
    lockedImage: assets.communication,
    lockedColors: ['#1E5B72', '#122A45'],
  },
  {
    ...categories[5],
    background: ['#071326', '#0D3564'],
    heroTitle: 'Digital\nFootprints',
    heroDescription: 'Learn why online choices can travel farther than you expect.',
    heroMinutes: 9,
    heroImage: assets.modern,
    heroColors: ['#2E9CF2', '#154C95'],
    lockedTitle: 'Online Safety',
    lockedDescription: 'Cloud is preparing this for tomorrow.',
    lockedMinutes: 7,
    lockedImage: assets.modern,
    lockedColors: ['#174B82', '#14214A'],
  },
];

const stateCards: WisdomCardData[] = [
  {
    title: 'Save Before\nYou Spend',
    description: '',
    minutes: 6,
    state: 'active',
    image: assets.piggy,
    colors: ['#14532D', '#073B3A'],
  },
  {
    title: 'Opportunity\nCost',
    description: '',
    minutes: 7,
    state: 'completed',
    image: assets.completed,
    colors: ['#1E2E86', '#071C4A'],
  },
  {
    title: 'Compound\nGrowth',
    description: 'Cloud is preparing this\nfor tomorrow.',
    minutes: 8,
    state: 'locked',
    image: assets.next,
    colors: ['#51366F', '#1F244B'],
  },
  {
    title: 'Investing Basics',
    description: 'Cloud is gathering something\nawesome for you.',
    minutes: 9,
    state: 'soon',
    image: assets.investing,
    colors: ['#7B4725', '#342243'],
  },
];

export default function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [screen, setScreen] = useState<ActiveScreen>('home');
  const [detailSource, setDetailSource] = useState<DetailSource>('hero');
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const activeWorld = worlds[activeIndex];

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      duration: 260,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [activeIndex, fadeAnim]);

  const handleJourneyScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.max(0, Math.min(worlds.length - 1, Math.round(event.nativeEvent.contentOffset.x / 326)));

    if (nextIndex !== activeIndex) {
      setActiveIndex(nextIndex);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <LinearGradient colors={activeWorld.background} style={styles.phone}>
        {screen === 'home' ? (
          <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.greeting}>Good morning, Andy!</Text>
                <Text style={styles.heroQuestion}>What should I{'\n'}learn today?</Text>
              </View>
              <View style={styles.profileStack}>
                <View style={styles.headerAvatar}>
                  <Image source={assets.avatar} style={styles.headerAvatarImage} resizeMode="contain" />
                </View>
                <Text style={styles.profileName}>Andy</Text>
              </View>
            </View>

            <IdentityPanel world={activeWorld} />

            <Animated.View
              style={[
                styles.worldContent,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [8, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TodayCard
                world={activeWorld}
                onOpen={() => {
                  setDetailSource('hero');
                  setScreen('detail');
                }}
              />
              <LockedNextCard
                world={activeWorld}
                onOpen={() => {
                  setDetailSource('locked');
                  setScreen('detail');
                }}
              />
            </Animated.View>

            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Your Journey</Text>
              <Text style={[styles.seeAll, { color: activeWorld.colors[0] }]}>Swipe</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={326}
              decelerationRate="fast"
              contentContainerStyle={styles.categoryRow}
              onMomentumScrollEnd={handleJourneyScroll}
            >
              {worlds.map((world, index) => (
                <CategoryTile
                  key={world.key}
                  category={world}
                  active={index === activeIndex}
                  onSelect={() => setActiveIndex(index)}
                />
              ))}
            </ScrollView>

            <View style={styles.homeEndSpacer} />
          </ScrollView>
        ) : (
          <WisdomDetailScreen
            source={detailSource}
            world={activeWorld}
            onBack={() => setScreen('home')}
          />
        )}
        <BottomNav />
      </LinearGradient>
    </SafeAreaView>
  );
}

function IdentityPanel({ world }: { world: WisdomWorld }) {
  return (
    <View style={styles.identityPanel}>
      <View style={styles.identityTopRow}>
        <Text style={styles.identityLabel}>Current Identity</Text>
        <Text style={styles.identityValue}>{globalIdentity.current}</Text>
      </View>
      <View style={styles.identityDivider} />
      <View style={styles.identityGrid}>
        <View style={styles.identityColumn}>
          <Text style={styles.identityLabel}>Luma Journey</Text>
          <Text style={styles.identityFocus}>{globalIdentity.completed}</Text>
        </View>
        <View style={styles.identityColumn}>
          <Text style={styles.identityLabel}>Next Identity</Text>
          <Text style={styles.identityNext}>{globalIdentity.next}</Text>
        </View>
      </View>
      <View style={styles.identityDivider} />
      <View style={styles.identityTopRow}>
        <Text style={styles.identityLabel}>Currently Exploring</Text>
        <Text style={styles.identityValue}>{world.label} Wisdom</Text>
      </View>
    </View>
  );
}

function TodayCard({ world, onOpen }: { world: WisdomWorld; onOpen: () => void }) {
  return (
    <Pressable style={styles.todayShadow} onPress={onOpen}>
      <LinearGradient colors={world.heroColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.todayCard}>
        <Image source={world.heroImage} style={styles.todayArt} resizeMode="cover" />
        <LinearGradient
          colors={['rgba(20,8,0,0.52)', 'rgba(20,8,0,0.2)', 'rgba(20,8,0,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.todayTextGradient}
        />
        <View style={styles.todayCopy}>
          <View style={styles.todayPill}>
            <Text style={styles.todayPillText}>TODAY'S WISDOM</Text>
          </View>
          <Text style={styles.todayTitle}>{world.heroTitle}</Text>
          <Text style={styles.todayDescription}>{world.heroDescription}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={15} color="#FFFFFF" />
            <Text style={styles.metaText}>{world.heroMinutes} min</Text>
            <View style={styles.metaDot} />
            <Text style={styles.metaText}>Active</Text>
          </View>
          <View style={styles.continueButton}>
            <Text style={styles.continueText}>Continue</Text>
            <View style={styles.playButton}>
              <Ionicons name="play" size={16} color="#23180B" />
            </View>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

function LockedNextCard({ world, onOpen }: { world: WisdomWorld; onOpen: () => void }) {
  return (
    <Pressable onPress={onOpen}>
      <LinearGradient colors={world.lockedColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.lockedCard}>
      <Image source={world.lockedImage} style={[styles.lockedArt, styles.lockedIllustrationFade]} resizeMode="cover" />
      <LinearGradient
        colors={['rgba(7,10,28,0.82)', 'rgba(7,10,28,0.42)', 'rgba(7,10,28,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.lockedGradient}
      />
      <View style={styles.lockedCopy}>
        <View style={styles.lockedTop}>
          <Ionicons name="lock-closed" size={13} color="#E8ECF6" />
          <Text style={styles.lockedStatus}>Unlocks Tomorrow</Text>
        </View>
        <Text style={styles.lockedTitle}>{world.lockedTitle}</Text>
        <Text style={styles.lockedDescription}>{world.lockedDescription}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={14} color="#FFFFFF" />
          <Text style={styles.metaText}>{world.lockedMinutes} min</Text>
        </View>
      </View>
      </LinearGradient>
    </Pressable>
  );
}

function WisdomDetailScreen({
  source,
  world,
  onBack,
}: {
  source: DetailSource;
  world: WisdomWorld;
  onBack: () => void;
}) {
  const isHero = source === 'hero';
  const title = isHero ? world.heroTitle.replace('\n', ' ') : world.lockedTitle;
  const description = isHero ? world.heroDescription : world.lockedDescription;
  const minutes = isHero ? world.heroMinutes : world.lockedMinutes;
  const image = isHero ? world.heroImage : world.lockedImage;
  const cardColors = isHero ? world.heroColors : world.lockedColors;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.detailContent} showsVerticalScrollIndicator={false}>
      <View style={styles.detailTopBar}>
        <Pressable style={styles.detailRoundButton} onPress={onBack}>
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
          <RecommendedCard title="Three Jars Method" image={assets.threeJars} colors={['#39235E', '#171C4C']} />
          <RecommendedCard title="Save Before You Spend" image={assets.piggy} colors={['#14532D', '#073B3A']} />
          <RecommendedCard title="Opportunity Cost" image={assets.completed} colors={['#1E2E86', '#071C4A']} />
        </ScrollView>
      </DetailSection>
    </ScrollView>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.detailSection}>
      <Text style={styles.detailSectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function ActionButton({
  icon,
  label,
  highlighted,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  highlighted?: boolean;
}) {
  return (
    <LinearGradient
      colors={highlighted ? ['#FFD166', '#FFB347'] : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.06)']}
      style={[styles.actionButton, highlighted && styles.actionButtonHighlighted]}
    >
      <Ionicons name={icon} size={22} color={highlighted ? '#101827' : '#FFFFFF'} />
      <Text style={[styles.actionButtonText, highlighted && styles.actionButtonTextHighlighted]}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color={highlighted ? '#101827' : '#AEBBD0'} />
    </LinearGradient>
  );
}

function EarnItem({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.earnItem}>
      <View style={styles.earnIcon}>
        <Ionicons name={icon} size={18} color="#FFD166" />
      </View>
      <Text style={styles.earnLabel}>{label}</Text>
      <Text style={styles.earnValue}>{value}</Text>
    </View>
  );
}

function RecommendedCard({
  title,
  image,
  colors,
}: {
  title: string;
  image: ImageSourcePropType;
  colors: [string, string];
}) {
  return (
    <LinearGradient colors={colors} style={styles.recommendedCard}>
      <Image source={image} style={styles.recommendedImage} resizeMode="cover" />
      <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.68)']} style={styles.recommendedFade} />
      <Text style={styles.recommendedTitle}>{title}</Text>
    </LinearGradient>
  );
}

function CategoryTile({ category, active, onSelect }: { category: Category; active?: boolean; onSelect: () => void }) {
  return (
    <Pressable onPress={onSelect}>
      <LinearGradient colors={category.colors} style={[styles.categoryTile, active && styles.categoryTileActive]}>
        <Image source={category.image} style={styles.categoryArt} resizeMode="cover" />
        <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.48)']} style={styles.categoryFade} />
        <View style={styles.categoryIcon}>
          <Ionicons name={category.icon} size={24} color="#FFFFFF" />
        </View>
        <Text style={[styles.categoryText, active && styles.categoryTextActive]}>{category.label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

function SmallWisdomCard({ card }: { card: WisdomCardData }) {
  const completed = card.state === 'completed';
  const locked = card.state === 'locked' || card.state === 'soon';
  const label = card.state === 'active' ? 'Active' : completed ? 'Completed' : card.state === 'soon' ? 'Unlocks in 2 Days' : 'Unlocks Tomorrow';
  const icon = card.state === 'active' || completed ? 'checkmark-circle' : 'lock-closed';

  return (
    <LinearGradient colors={card.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.smallCard}>
      <Image source={card.image} style={[styles.smallArt, locked && styles.smallArtLocked]} resizeMode="cover" />
      <LinearGradient
        colors={['rgba(4,8,20,0.78)', 'rgba(4,8,20,0.35)', 'rgba(4,8,20,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.smallGradient}
      />
      <View style={styles.smallCopy}>
        <View style={styles.smallState}>
          <Ionicons name={icon} size={16} color={card.state === 'soon' ? '#FFD166' : '#C7E3FF'} />
          <Text style={[styles.smallStateText, card.state === 'soon' && styles.soonText]}>{label}</Text>
        </View>
        <Text style={styles.smallTitle}>{card.title}</Text>
        {card.description ? <Text style={styles.smallDescription}>{card.description}</Text> : null}
        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={14} color="#FFFFFF" />
          <Text style={styles.metaText}>{card.minutes} min</Text>
        </View>
      </View>
      {locked ? (
        <View style={styles.smallLock}>
          <Ionicons name="lock-closed" size={17} color="#FFFFFF" />
        </View>
      ) : null}
    </LinearGradient>
  );
}

function BottomNav() {
  const items: { label: string; icon: keyof typeof Ionicons.glyphMap; active?: boolean }[] = [
    { label: 'Home', icon: 'home', active: true },
    { label: 'Wisdoms', icon: 'sparkles-outline' },
    { label: 'Favorites', icon: 'heart-outline' },
    { label: 'Growth', icon: 'leaf-outline' },
    { label: 'Profile', icon: 'person-outline' },
  ];

  return (
    <View style={styles.bottomNav}>
      {items.map((item) => (
        <View key={item.label} style={styles.navItem}>
          <Ionicons name={item.icon} size={23} color={item.active ? '#FFD166' : '#9AA6BC'} />
          <Text style={[styles.navLabel, item.active && styles.navLabelActive]}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#07111F',
  },
  phone: {
    alignSelf: 'center',
    flex: 1,
    maxWidth: 430,
    width: '100%',
  },
  screen: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  content: {
    paddingBottom: 116,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  greeting: {
    color: '#C9D1E2',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 10,
  },
  heroQuestion: {
    color: '#FFFFFF',
    fontSize: 31,
    fontWeight: '900',
    letterSpacing: -0.2,
    lineHeight: 37,
  },
  profileStack: {
    alignItems: 'center',
    gap: 5,
  },
  profileName: {
    color: '#D9E2F2',
    fontSize: 11,
    fontWeight: '900',
  },
  headerAvatar: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 27,
    borderWidth: 1,
    height: 68,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 68,
  },
  headerAvatarImage: {
    height: 76,
    width: 76,
  },
  identityPanel: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 14,
    padding: 14,
  },
  identityTopRow: {
    gap: 5,
  },
  identityLabel: {
    color: '#AEBBD0',
    fontSize: 11,
    fontWeight: '800',
  },
  identityValue: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
  },
  identityDivider: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    height: 1,
    marginVertical: 11,
  },
  identityGrid: {
    flexDirection: 'row',
    gap: 14,
  },
  identityColumn: {
    flex: 1,
  },
  identityFocus: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 5,
  },
  identityNext: {
    color: '#FFD166',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 5,
  },
  identityDistance: {
    color: '#AEBBD0',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 3,
  },
  worldContent: {
    marginTop: 0,
  },
  todayShadow: {
    borderRadius: 24,
    marginTop: 6,
    shadowColor: '#FFB347',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 22,
    elevation: 10,
  },
  todayCard: {
    borderColor: 'rgba(255, 209, 102, 0.76)',
    borderRadius: 24,
    borderWidth: 1.4,
    height: 286,
    overflow: 'hidden',
  },
  todayArt: {
    bottom: 0,
    height: '100%',
    position: 'absolute',
    right: 0,
    width: '100%',
  },
  todayTextGradient: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
    width: '56%',
  },
  todayCopy: {
    left: 24,
    position: 'absolute',
    top: 22,
    width: 222,
  },
  todayPill: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 235, 160, 0.96)',
    borderRadius: 999,
    justifyContent: 'center',
    marginBottom: 13,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  todayPillText: {
    color: '#30220A',
    fontSize: 11,
    fontWeight: '900',
  },
  todayTitle: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '900',
    lineHeight: 30,
  },
  todayDescription: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    marginTop: 10,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  metaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  metaDot: {
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
    height: 5,
    opacity: 0.62,
    width: 5,
  },
  continueButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 243, 188, 0.97)',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    width: 142,
  },
  continueText: {
    color: '#23180B',
    fontSize: 14,
    fontWeight: '900',
  },
  playButton: {
    alignItems: 'center',
    backgroundColor: '#FFD166',
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  lockedCard: {
    borderColor: 'rgba(148, 120, 255, 0.24)',
    borderRadius: 22,
    borderWidth: 1,
    height: 156,
    marginTop: 14,
    overflow: 'hidden',
  },
  lockedArt: {
    bottom: -2,
    height: 150,
    position: 'absolute',
    right: 6,
    width: 148,
  },
  lockedIllustrationFade: {
    opacity: 0.58,
  },
  lockedGradient: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
    width: '82%',
  },
  lockedCopy: {
    left: 18,
    position: 'absolute',
    top: 18,
    width: 230,
  },
  lockedTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
    marginBottom: 13,
  },
  lockedStatus: {
    color: '#E8ECF6',
    fontSize: 12,
    fontWeight: '900',
  },
  lockedTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 26,
  },
  lockedDescription: {
    color: '#C9D1E2',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
    marginTop: 8,
  },
  sectionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
  },
  seeAll: {
    color: '#AEBBD0',
    fontSize: 12,
    fontWeight: '900',
  },
  categoryRow: {
    gap: 14,
    paddingRight: 24,
  },
  categoryTile: {
    borderColor: 'rgba(255,255,255,0.16)',
    borderRadius: 24,
    borderWidth: 1,
    height: 152,
    overflow: 'hidden',
    padding: 16,
    width: 326,
  },
  categoryTileActive: {
    borderColor: 'rgba(255,255,255,0.62)',
  },
  categoryArt: {
    bottom: 0,
    height: 150,
    opacity: 0.82,
    position: 'absolute',
    right: 0,
    width: 152,
  },
  categoryFade: {
    bottom: 0,
    height: 92,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  categoryIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 17,
    height: 42,
    justifyContent: 'center',
    width: 42,
    zIndex: 2,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 32,
    marginTop: 38,
    zIndex: 2,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  homeEndSpacer: {
    height: 22,
  },
  detailContent: {
    paddingBottom: 116,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  detailTopBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  detailRoundButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 17,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  favoriteButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 17,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  detailHero: {
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 28,
    borderWidth: 1,
    height: 330,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.32,
    shadowRadius: 24,
  },
  detailHeroImage: {
    height: '100%',
    position: 'absolute',
    right: 0,
    top: 0,
    width: '100%',
  },
  detailHeroGradient: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
    width: '72%',
  },
  detailHeroCopy: {
    bottom: 24,
    left: 22,
    position: 'absolute',
    width: 260,
  },
  detailBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 235, 160, 0.96)',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 7,
    marginBottom: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  detailBadgeText: {
    color: '#101827',
    fontSize: 12,
    fontWeight: '900',
  },
  detailTitle: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 38,
  },
  detailMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
    marginTop: 12,
  },
  detailSection: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 16,
    padding: 18,
  },
  detailSectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 12,
  },
  detailBodyText: {
    color: '#C9D1E2',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
    marginTop: 7,
  },
  actionGrid: {
    gap: 10,
    marginTop: 16,
  },
  actionButton: {
    alignItems: 'center',
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 62,
    paddingHorizontal: 16,
  },
  actionButtonHighlighted: {
    borderColor: 'rgba(255, 209, 102, 0.62)',
  },
  actionButtonText: {
    color: '#FFFFFF',
    flex: 1,
    fontSize: 16,
    fontWeight: '900',
  },
  actionButtonTextHighlighted: {
    color: '#101827',
  },
  earnGrid: {
    gap: 10,
  },
  earnItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 17,
    flexDirection: 'row',
    gap: 12,
    padding: 13,
  },
  earnIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 209, 102, 0.14)',
    borderRadius: 14,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  earnLabel: {
    color: '#AEBBD0',
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
  },
  earnValue: {
    color: '#FFFFFF',
    flex: 1,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'right',
  },
  recommendationRow: {
    gap: 12,
    paddingRight: 12,
  },
  recommendedCard: {
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 20,
    borderWidth: 1,
    height: 150,
    overflow: 'hidden',
    width: 150,
  },
  recommendedImage: {
    height: '100%',
    position: 'absolute',
    right: 0,
    top: 0,
    width: '100%',
  },
  recommendedFade: {
    bottom: 0,
    height: 90,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  recommendedTitle: {
    bottom: 13,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    left: 13,
    lineHeight: 18,
    position: 'absolute',
    right: 13,
  },
  smallCard: {
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    borderWidth: 1,
    height: 130,
    marginTop: 13,
    overflow: 'hidden',
  },
  smallArt: {
    bottom: -10,
    height: 138,
    position: 'absolute',
    right: 0,
    width: 154,
  },
  smallArtLocked: {
    opacity: 0.48,
  },
  smallGradient: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
    width: '80%',
  },
  smallCopy: {
    left: 20,
    position: 'absolute',
    top: 17,
    width: 220,
  },
  smallState: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  smallStateText: {
    color: '#DDE8FF',
    fontSize: 12,
    fontWeight: '900',
  },
  soonText: {
    color: '#FFD166',
  },
  smallTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 25,
  },
  smallDescription: {
    color: '#CED7E8',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 6,
  },
  smallLock: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderColor: 'rgba(255,255,255,0.24)',
    borderRadius: 13,
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
    position: 'absolute',
    right: 14,
    top: 14,
    width: 28,
  },
  bottomNav: {
    alignItems: 'center',
    backgroundColor: 'rgba(8, 15, 31, 0.96)',
    borderColor: 'rgba(148, 120, 255, 0.36)',
    borderRadius: 24,
    borderWidth: 1,
    bottom: 15,
    flexDirection: 'row',
    height: 66,
    justifyContent: 'space-around',
    left: 24,
    position: 'absolute',
    right: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.36,
    shadowRadius: 18,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
    justifyContent: 'center',
    width: 60,
  },
  navLabel: {
    color: '#9AA6BC',
    fontSize: 10,
    fontWeight: '800',
  },
  navLabelActive: {
    color: '#FFD166',
  },
});
