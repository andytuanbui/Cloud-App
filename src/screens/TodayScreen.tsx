import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BottomNav } from '../components/BottomNav';
import { WisdomButton } from '../components/mvp/WisdomButton';
import { todayWisdom } from '../content/wisdoms';
import { useAppState } from '../state/useAppState';
import { RootStackParamList } from '../types/wisdom';

type Props = NativeStackScreenProps<RootStackParamList, 'Today'>;
const cloud = require('../../assets/cloud/cloud-home-garden.png');

export function TodayScreen({ navigation }: Props) {
  const { profile, getProgress, isRestoring } = useAppState();
  const progress = getProgress(todayWisdom.id);
  const started = Boolean(progress && (progress.openingAnswer || progress.completedSteps.length));
  const completed = Boolean(progress?.completed);

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
            <Text style={styles.greetingTitle}>Good morning, {profile.name}.</Text>
            <Text style={styles.greetingText}>Let’s take a calm moment to think together.</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Today’s Wisdom</Text>
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
              <View style={styles.completeLine}>
                <Ionicons name="checkmark-circle" size={21} color="#25735F" />
                <Text style={styles.completeText}>Completed today</Text>
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

        <Text style={styles.sectionTitle}>Tomorrow</Text>
        <View style={styles.lockedCard}>
          <View style={styles.lockIcon}><Ionicons name="lock-closed" size={20} color="#65736F" /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.lockedTitle}>A new Wisdom is waiting</Text>
            <Text style={styles.lockedBody}>Come back tomorrow for another moment of Practice.</Text>
          </View>
        </View>

        {completed && (
          <>
            <Text style={styles.sectionTitle}>Completed Wisdoms</Text>
            <View style={styles.completedCard}>
              <Ionicons name="checkmark-circle" size={28} color="#25735F" />
              <View style={{ flex: 1 }}>
                <Text style={styles.completedTitle}>{todayWisdom.title}</Text>
                <Text style={styles.completedBody}>{todayWisdom.skillOutcome}</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
      <BottomNav active="Today" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#F5FAF8', flex: 1 },
  content: { paddingBottom: 28, paddingHorizontal: 18 },
  loading: { alignItems: 'center', backgroundColor: '#F5FAF8', flex: 1, justifyContent: 'center' },
  loadingCloud: { height: 88, width: 88 },
  loadingText: { color: '#40534E', fontSize: 16, fontWeight: '700', marginTop: 12 },
  hero: { borderRadius: 28, height: 260, marginBottom: 28, marginTop: 10, overflow: 'hidden' },
  heroImage: { height: '100%', width: '100%' },
  greeting: { backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, left: 15, padding: 15, position: 'absolute', top: 15, width: '58%' },
  greetingTitle: { color: '#162A43', fontSize: 19, fontWeight: '900', lineHeight: 24 },
  greetingText: { color: '#52645F', fontSize: 14, lineHeight: 19, marginTop: 5 },
  sectionTitle: { color: '#172A43', fontSize: 20, fontWeight: '900', marginBottom: 12, marginTop: 2 },
  card: { backgroundColor: '#FFFFFF', borderColor: '#E3EBE8', borderRadius: 24, borderWidth: 1, elevation: 2, marginBottom: 26, overflow: 'hidden' },
  cardImage: { height: 170, width: '100%' },
  cardBody: { padding: 18 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  category: { color: '#2E7967', fontSize: 13, fontWeight: '800' },
  minutes: { color: '#667771', fontSize: 13, fontWeight: '700' },
  cardTitle: { color: '#142942', fontSize: 26, fontWeight: '900', marginTop: 7 },
  summary: { color: '#52625F', fontSize: 16, lineHeight: 23, marginBottom: 18, marginTop: 7 },
  completeLine: { alignItems: 'center', backgroundColor: '#E8F6F1', borderRadius: 14, flexDirection: 'row', gap: 8, padding: 13 },
  completeText: { color: '#205E50', fontSize: 15, fontWeight: '800' },
  lockedCard: { alignItems: 'center', backgroundColor: '#EEF2F1', borderRadius: 20, flexDirection: 'row', gap: 14, marginBottom: 26, padding: 17 },
  lockIcon: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 22, height: 44, justifyContent: 'center', width: 44 },
  lockedTitle: { color: '#31433F', fontSize: 16, fontWeight: '800' },
  lockedBody: { color: '#6A7874', fontSize: 14, lineHeight: 19, marginTop: 3 },
  completedCard: { alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#D9E8E3', borderRadius: 18, borderWidth: 1, flexDirection: 'row', gap: 13, padding: 16 },
  completedTitle: { color: '#20354D', fontSize: 16, fontWeight: '800' },
  completedBody: { color: '#65746F', fontSize: 13, marginTop: 3 },
});
