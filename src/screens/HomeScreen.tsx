import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef } from 'react';
import { Image, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { BottomNav } from '../components/BottomNav';
import { GradientMediaCard } from '../components/GradientMediaCard';
import { getTodayCloudPresence } from '../services/cloudPresenceService';
import { getCloudBedroomImage, getHomeWisdomWorlds, getLockedStorybookImage } from '../services/wisdomService';
import { colors, spacing, typography } from '../theme/tokens';
import { RootStackParamList } from '../types/wisdom';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

// Home answers one question: "what should I learn today?" — a doorway into
// Cloud's room, not a dashboard. One story to start, one to look forward to.
export function HomeScreen({ navigation }: HomeScreenProps) {
  const { height } = useWindowDimensions();
  const heroHeight = Math.min(560, Math.max(420, Math.round(height * 0.56)));
  const presence = useRef(getTodayCloudPresence()).current;
  const worlds = getHomeWisdomWorlds();
  const todayWorld = worlds[0];
  const bedroomImage = getCloudBedroomImage();
  const lockedStorybookImage = getLockedStorybookImage();

  const startTodayStory = () => {
    navigation.navigate('WisdomJourney', {
      screen: 'QuestionBeforeWisdom',
      params: { wisdomId: todayWorld.heroWisdomId },
    });
  };

  return (
    <View style={styles.screen}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.hero, { height: heroHeight }]}>
          <Image source={bedroomImage} resizeMode="cover" style={StyleSheet.absoluteFillObject} />
          <LinearGradient colors={colors.gradient.heroFade} style={StyleSheet.absoluteFillObject} />

          <View style={styles.heroCopy}>
            <Text style={styles.greetingLine}>{presence.greeting.line}</Text>
            <Text style={styles.greetingSubtext}>{presence.greeting.subtext}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <GradientMediaCard
            variant="active"
            eyebrow="TODAY'S STORY"
            title={todayWorld.heroTitle}
            description={todayWorld.heroDescription}
            image={todayWorld.heroImage}
            meta={[{ icon: 'time-outline', label: `${todayWorld.heroMinutes} min` }]}
            ctaLabel="Start Story"
            onPress={startTodayStory}
          />

          <GradientMediaCard
            variant="locked"
            eyebrow="UP NEXT"
            title={todayWorld.lockedTitle}
            description="Cloud is preparing this one for when you're ready."
            image={lockedStorybookImage}
          />
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background.app,
  },
  scrollContent: {
    paddingBottom: spacing.huge,
  },
  hero: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  heroCopy: {
    padding: spacing.xl,
    gap: spacing.xs,
  },
  greetingLine: {
    fontSize: typography.size.display,
    fontWeight: typography.weight.bold,
    color: colors.text.onDark,
    lineHeight: typography.size.display * typography.lineHeight.tight,
  },
  greetingSubtext: {
    fontSize: typography.size.subheading,
    color: colors.text.onDarkMuted,
    lineHeight: typography.size.subheading * typography.lineHeight.relaxed,
    maxWidth: '86%',
  },
  content: {
    padding: spacing.xl,
    gap: spacing.xl,
  },
});
