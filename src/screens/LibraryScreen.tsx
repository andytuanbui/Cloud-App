import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BottomNav } from '../components/BottomNav';
import { WisdomButton } from '../components/mvp/WisdomButton';
import { todayWisdom } from '../content/wisdoms';
import { useAppState } from '../state/useAppState';
import { RootStackParamList } from '../types/wisdom';

type Props = NativeStackScreenProps<RootStackParamList, 'Library'>;

export function LibraryScreen({ navigation }: Props) {
  const { getProgress } = useAppState();
  const progress = getProgress(todayWisdom.id);
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Wisdoms</Text>
        <Text style={styles.intro}>Return to ideas you have practiced and build your Understanding over time.</Text>
        <View style={styles.card}>
          <Image source={todayWisdom.artwork} style={styles.image} />
          <View style={styles.body}>
            <Text style={styles.category}>{todayWisdom.category}</Text>
            <Text style={styles.cardTitle}>{todayWisdom.title}</Text>
            <Text style={styles.summary}>{todayWisdom.summary}</Text>
            <WisdomButton
              label={progress?.completed ? 'View Completion' : progress ? 'Continue Wisdom' : 'Start Wisdom'}
              onPress={() => navigation.navigate('WisdomFlow', { wisdomId: todayWisdom.id })}
            />
          </View>
        </View>
      </ScrollView>
      <BottomNav active="Library" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#F5FAF8', flex: 1 },
  content: { padding: 20 },
  title: { color: '#172A43', fontSize: 30, fontWeight: '900', marginTop: 12 },
  intro: { color: '#596A65', fontSize: 16, lineHeight: 23, marginBottom: 24, marginTop: 8 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, overflow: 'hidden' },
  image: { height: 190, width: '100%' },
  body: { padding: 18 },
  category: { color: '#347665', fontSize: 13, fontWeight: '800' },
  cardTitle: { color: '#172A43', fontSize: 24, fontWeight: '900', marginTop: 5 },
  summary: { color: '#586965', fontSize: 15, lineHeight: 22, marginBottom: 18, marginTop: 7 },
});
