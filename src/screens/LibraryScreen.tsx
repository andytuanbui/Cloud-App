import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';
import { BottomNav } from '../components/BottomNav';
import { AppText, Screen, SectionHeader } from '../components/ui';
import { LibraryWisdomCard } from '../components/wisdom';
import { useDailyWisdoms } from '../state/useDailyWisdoms';
import { space } from '../theme';
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

export function LibraryScreen({ navigation }: Props) {
  const { availableWisdoms, inProgressWisdoms, completedWisdoms } =
    useDailyWisdoms();
  const sections = [
    { title: 'Available', items: availableWisdoms },
    { title: 'In Progress', items: inProgressWisdoms },
    { title: 'Completed', items: completedWisdoms },
  ].filter((section) => section.items.length > 0);

  return (
    <Screen bottomNavigation={<BottomNav active="Library" />}>
      <AppText accessibilityRole="header" variant="screenTitle">
        Wisdoms
      </AppText>
      <AppText style={styles.intro} tone="secondary">
        Return to ideas you have practiced and build your Understanding over time.
      </AppText>

      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <SectionHeader title={section.title} />
          <View style={styles.cards}>
            {section.items.map((item) => (
              <LibraryWisdomCard
                completionLabel={
                  item.progress?.completed
                    ? formatCompletionDate(item.completionDateKey)
                    : undefined
                }
                item={item}
                key={item.wisdom.id}
                onOpen={() =>
                  navigation.navigate('WisdomFlow', {
                    wisdomId: item.wisdom.id,
                    review: Boolean(item.progress?.completed),
                  })
                }
              />
            ))}
          </View>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    marginBottom: space.lg,
    marginTop: space.xs,
  },
  section: {
    marginBottom: space.lg,
  },
  cards: {
    gap: space.sm,
  },
});
