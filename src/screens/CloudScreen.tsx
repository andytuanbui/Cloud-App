import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, View } from 'react-native';
import { BottomNav } from '../components/BottomNav';
import { AppText, PrimaryButton, Screen, SurfaceCard } from '../components/ui';
import { useDailyWisdoms } from '../state/useDailyWisdoms';
import { appColors, layout, radii, shadows, space } from '../theme';
import { RootStackParamList } from '../types/wisdom';

type Props = NativeStackScreenProps<RootStackParamList, 'Cloud'>;

export function CloudScreen({ navigation }: Props) {
  const { todayProgress, todayWisdom } = useDailyWisdoms();
  const canOpenToday = todayWisdom && !todayProgress?.completed;

  return (
    <Screen
      bottomNavigation={<BottomNav active="Cloud" />}
      contentContainerStyle={styles.content}
    >
      <AppText accessibilityRole="header" variant="screenTitle">
        Cloud
      </AppText>
      <AppText style={styles.intro} tone="secondary" variant="body">
        A calm guide for thinking through real choices, one Wisdom at a time.
      </AppText>

      <LinearGradient
        colors={[appColors.warmGoldSoft, appColors.primarySoft]}
        style={styles.hero}
      >
        <Image
          accessibilityIgnoresInvertColors
          accessible={false}
          resizeMode="contain"
          source={require('../../assets/cloud/cloud-hero-wave.png')}
          style={styles.cloud}
        />
      </LinearGradient>

      <SurfaceCard style={styles.copyCard} tone="soft">
        <AppText accessibilityRole="header" variant="cardTitle">
          Guided conversations with Cloud
        </AppText>
        <AppText style={styles.body} tone="secondary" variant="supporting">
          Cloud responds through the choices and prompts built into each Wisdom.
          More guided conversations will be added later.
        </AppText>

        {canOpenToday ? (
          <View style={styles.action}>
            <PrimaryButton
              icon={todayProgress ? 'play-forward' : 'play'}
              label={'Talk with Cloud in today\u2019s Wisdom'}
              onPress={() =>
                navigation.navigate('WisdomFlow', { wisdomId: todayWisdom.id })
              }
            />
          </View>
        ) : null}
      </SurfaceCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: space.xl,
  },
  intro: {
    marginTop: space.xs,
    maxWidth: 440,
  },
  hero: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: radii.hero,
    height: 280,
    justifyContent: 'flex-end',
    marginTop: space.lg,
    maxWidth: 440,
    overflow: 'hidden',
    width: '100%',
    ...shadows.card,
  },
  cloud: {
    bottom: -88,
    height: 390,
    position: 'absolute',
    width: 260,
  },
  copyCard: {
    alignSelf: 'center',
    marginTop: space.md,
    maxWidth: 440,
    padding: layout.cardPadding,
    width: '100%',
  },
  body: {
    marginTop: space.xs,
  },
  action: {
    marginTop: space.md,
  },
});
