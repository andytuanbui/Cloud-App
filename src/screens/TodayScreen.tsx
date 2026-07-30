import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BottomNav } from '../components/BottomNav';
import { WisdomButton } from '../components/mvp/WisdomButton';
import { getProfileGreeting } from '../state/profileValidation';
import { useAppState } from '../state/useAppState';
import { useDailyWisdoms } from '../state/useDailyWisdoms';
import { RootStackParamList } from '../types/wisdom';

type Props = NativeStackScreenProps<RootStackParamList, 'Today'>;
const cloud = require('../../assets/cloud/cloud-home-garden.png');

export function TodayScreen({ navigation }: Props) {
  const { profile, isRestoring } = useAppState();
  const { todayWisdom, todayProgress, tomorrowWisdomExists } = useDailyWisdoms();
  const started = Boolean(todayProgress);
  const completed = Boolean(todayProgress?.completed);
  const greeting = getProfileGreeting(profile.name);

  if (isRestoring) {
    return (
      <View style={styles.loading}>
        <Image source={require('../../assets/cloud/cloud-avatar.png')} style={styles.loadingCloud} />
        <Text style={styles.loadingText}>Getting today ready…</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Image source={cloud} resizeMode="cover" style={styles.heroImage} />
          <View style={styles.greeting}>
            <Text style={styles.greetingTitle}>{greeting}</Text>
            <Text style={styles.greetingText}>Let’s take a calm moment to think together.</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Today’s Wisdom</Text>
        {todayWisdom ? (
          <View style={styles.card}>
            <Image source={todayWisdom.artwork} resizeMode="cover" style={styles.cardImage} />
            <View style={styles.cardBody}>
              <View style={styles.metaRow}>
                <Text style={styles.category}>{todayWisdom.category}</Text>
                <Text style={styles.minutes}>{todayWisdom.estimatedMinutes} min</Text>
              </View>
              <Text style={styles.cardTitle}>{todayWisdom.title}</Text>
              <Text style={styles.summary}>{todayWisdom.summary}</Text>
              {completed && (
                <View style={styles.completedPanel}>
                  <View style={styles.completedHeader}>
                    <Ionicons name="checkmark-circle" size={22} color="#25735F" />
                    <Text style={styles.completeText}>Completed today</Text>
                  </View>
                  <Text style={styles.completedReinforcement}>{todayWisdom.skillOutcome}.</Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                      navigation.navigate('WisdomFlow', {
                        wisdomId: todayWisdom.id,
                        review: true,
                      })
                    }
                    style={({ pressed }) => [styles.reviewAction, pressed && styles.reviewActionPressed]}
                  >
                    <Text style={styles.reviewActionText}>Review Wisdom</Text>
                    <Ionicons name="arrow-forward" size={17} color="#245F53" />
                  </Pressable>
                </View>
              )}
              {!completed && (
                <WisdomButton
                  label={started ? 'Continue Wisdom' : 'Start Wisdom'}
                  onPress={() => navigation.navigate('WisdomFlow', { wisdomId: todayWisdom.id })}
                />
              )}
            </View>
          </View>
        ) : (
          <View style={[styles.card, styles.caughtUpCard]}>
            <Image source={require('../../assets/cloud/cloud-reading.png')} style={styles.caughtUpCloud} />
            <Text style={styles.cardTitle}>You’re all caught up</Text>
            <Text style={styles.caughtUpText}>
              You’ve practiced every available Wisdom. More thinking and practice will be added soon.
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Tomorrow</Text>
        <View style={styles.lockedCard}>
          <View style={styles.lockIcon}><Ionicons name="lock-closed" size={20} color="#65736F" /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.lockedTitle}>
              {tomorrowWisdomExists
                ? 'Cloud is preparing this for tomorrow'
                : 'More Wisdom is being prepared'}
            </Text>
            <Text style={styles.lockedBody}>
              {tomorrowWisdomExists
                ? 'A new Wisdom will be ready when you return.'
                : 'New thinking and practice will be added soon.'}
            </Text>
          </View>
        </View>
      </ScrollView>
      <BottomNav active="Today" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#F5FAF8', flex: 1 },
  content: { paddingBottom: 24, paddingHorizontal: 18 },
  loading: { alignItems: 'center', backgroundColor: '#F5FAF8', flex: 1, justifyContent: 'center' },
  loadingCloud: { height: 88, width: 88 },
  loadingText: { color: '#40534E', fontSize: 16, fontWeight: '700', marginTop: 12 },
  hero: { borderRadius: 26, height: 230, marginBottom: 16, marginTop: 8, overflow: 'hidden' },
  heroImage: { height: '100%', width: '100%' },
  greeting: { backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 18, bottom: 13, left: 13, paddingHorizontal: 14, paddingVertical: 11, position: 'absolute', width: '54%' },
  greetingTitle: { color: '#162A43', fontSize: 17, fontWeight: '900', lineHeight: 21 },
  greetingText: { color: '#52645F', fontSize: 13, lineHeight: 17, marginTop: 3 },
  sectionTitle: { color: '#172A43', fontSize: 20, fontWeight: '900', marginBottom: 10, marginTop: 0 },
  card: { backgroundColor: '#FFFFFF', borderColor: '#E3EBE8', borderRadius: 22, borderWidth: 1, elevation: 2, marginBottom: 18, overflow: 'hidden' },
  cardImage: { height: 154, width: '100%' },
  cardBody: { padding: 17 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  category: { color: '#2E7967', fontSize: 13, fontWeight: '800' },
  minutes: { color: '#667771', fontSize: 13, fontWeight: '700' },
  cardTitle: { color: '#142942', fontSize: 26, fontWeight: '900', marginTop: 7 },
  summary: { color: '#52625F', fontSize: 16, lineHeight: 23, marginBottom: 16, marginTop: 7 },
  completedPanel: { backgroundColor: '#E8F6F1', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12 },
  completedHeader: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  completeText: { color: '#205E50', fontSize: 15, fontWeight: '800' },
  completedReinforcement: { color: '#3F625A', fontSize: 13, lineHeight: 18, marginLeft: 30, marginTop: 3 },
  reviewAction: { alignItems: 'center', alignSelf: 'flex-start', flexDirection: 'row', gap: 5, marginLeft: 30, marginTop: 9, minHeight: 34 },
  reviewActionPressed: { opacity: 0.65 },
  reviewActionText: { color: '#245F53', fontSize: 14, fontWeight: '900' },
  lockedCard: { alignItems: 'center', backgroundColor: '#EEF2F1', borderRadius: 18, flexDirection: 'row', gap: 12, marginBottom: 8, paddingHorizontal: 15, paddingVertical: 13 },
  lockIcon: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  lockedTitle: { color: '#31433F', fontSize: 15, fontWeight: '800', lineHeight: 19 },
  lockedBody: { color: '#6A7874', fontSize: 13, lineHeight: 18, marginTop: 2 },
  caughtUpCard: { alignItems: 'center', padding: 22 },
  caughtUpCloud: { height: 108, marginBottom: 8, width: 108 },
  caughtUpText: { color: '#52625F', fontSize: 15, lineHeight: 22, marginTop: 7, textAlign: 'center' },
});
