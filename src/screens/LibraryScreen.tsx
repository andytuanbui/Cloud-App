import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BottomNav } from '../components/BottomNav';
import { WisdomButton } from '../components/mvp/WisdomButton';
import { ScheduledWisdom, useDailyWisdoms } from '../state/useDailyWisdoms';
import { RootStackParamList } from '../types/wisdom';

type Props = NativeStackScreenProps<RootStackParamList, 'Library'>;

function formatCompletionDate(dateKey?: string) {
  if (!dateKey) return 'Completed';
  const [year, month, day] = dateKey.split('-').map(Number);
  return `Completed ${new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, day, 12))}`;
}

function WisdomCard({
  item,
  onOpen,
}: {
  item: ScheduledWisdom;
  onOpen: () => void;
}) {
  const completed = Boolean(item.progress?.completed);
  return (
    <View style={styles.card}>
      <Image source={item.wisdom.artwork} style={styles.image} />
      <View style={styles.body}>
        <View style={styles.metaRow}>
          <Text style={styles.category}>{item.wisdom.category}</Text>
          <Text style={styles.minutes}>{item.wisdom.estimatedMinutes} min</Text>
        </View>
        <Text style={styles.cardTitle}>{item.wisdom.title}</Text>
        <Text style={styles.summary}>{item.wisdom.summary}</Text>
        {completed && (
          <Text style={styles.completedDate}>{formatCompletionDate(item.completionDateKey)}</Text>
        )}
        <WisdomButton
          label={completed ? 'Review Wisdom' : item.progress ? 'Continue Wisdom' : 'Start Wisdom'}
          onPress={onOpen}
        />
      </View>
    </View>
  );
}

export function LibraryScreen({ navigation }: Props) {
  const { availableWisdoms, inProgressWisdoms, completedWisdoms } = useDailyWisdoms();
  const sections = [
    { title: 'Available', items: availableWisdoms },
    { title: 'In Progress', items: inProgressWisdoms },
    { title: 'Completed', items: completedWisdoms },
  ].filter((section) => section.items.length > 0);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Wisdoms</Text>
        <Text style={styles.intro}>Return to ideas you have practiced and build your Understanding over time.</Text>
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item) => (
              <WisdomCard
                key={item.wisdom.id}
                item={item}
                onOpen={() =>
                  navigation.navigate('WisdomFlow', {
                    wisdomId: item.wisdom.id,
                    review: Boolean(item.progress?.completed),
                  })
                }
              />
            ))}
          </View>
        ))}
      </ScrollView>
      <BottomNav active="Library" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#F5FAF8', flex: 1 },
  content: { paddingBottom: 28, paddingHorizontal: 20 },
  title: { color: '#172A43', fontSize: 30, fontWeight: '900', marginTop: 12 },
  intro: { color: '#596A65', fontSize: 16, lineHeight: 23, marginBottom: 18, marginTop: 8 },
  section: { marginBottom: 4 },
  sectionTitle: { color: '#172A43', fontSize: 20, fontWeight: '900', marginBottom: 10, marginTop: 4 },
  card: { backgroundColor: '#FFFFFF', borderColor: '#E3EBE8', borderRadius: 24, borderWidth: 1, marginBottom: 18, overflow: 'hidden' },
  image: { height: 164, width: '100%' },
  body: { padding: 18 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  category: { color: '#347665', fontSize: 13, fontWeight: '800' },
  minutes: { color: '#667771', fontSize: 13, fontWeight: '700' },
  cardTitle: { color: '#172A43', fontSize: 24, fontWeight: '900', marginTop: 5 },
  summary: { color: '#586965', fontSize: 15, lineHeight: 22, marginBottom: 14, marginTop: 7 },
  completedDate: { color: '#347665', fontSize: 13, fontWeight: '800', marginBottom: 12, marginTop: -4 },
});
