import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, StyleSheet, View } from 'react-native';
import { BottomNav } from '../components/BottomNav';
import {
  CloudGreetingHero,
  TodayWisdomCard,
} from '../components/wisdom';
import {
  AppText,
  Screen,
  SectionHeader,
  StatusPanel,
  SurfaceCard,
} from '../components/ui';
import { getProfileGreeting } from '../state/profileValidation';
import { useAppState } from '../state/useAppState';
import { useDailyWisdoms } from '../state/useDailyWisdoms';
import { radii, space } from '../theme';
import { RootStackParamList } from '../types/wisdom';

type Props = NativeStackScreenProps<RootStackParamList, 'Today'>;

const loadingCloud = require('../../assets/cloud/cloud-avatar.png');
const caughtUpCloud = require('../../assets/cloud/cloud-avatar.png');

export function TodayScreen({ navigation }: Props) {
  const { profile, isRestoring } = useAppState();
  const { todayWisdom, todayProgress, tomorrowWisdomExists } = useDailyWisdoms();
  const greeting = getProfileGreeting(profile.name);

  if (isRestoring) {
    return (
      <Screen
        contentContainerStyle={styles.loading}
        scroll={false}
      >
        <Image
          accessible={false}
          resizeMode="contain"
          source={loadingCloud}
          style={styles.loadingCloud}
        />
        <AppText style={styles.loadingText} tone="secondary" variant="supporting">
          {'Getting today ready\u2026'}
        </AppText>
      </Screen>
    );
  }

  return (
    <Screen bottomNavigation={<BottomNav active="Today" />}>
      <CloudGreetingHero greeting={greeting} />

      <View>
        <SectionHeader title={'Today\u2019s Wisdom'} />
        {todayWisdom ? (
          <TodayWisdomCard
            onOpen={() =>
              navigation.navigate('WisdomFlow', { wisdomId: todayWisdom.id })
            }
            onReview={() =>
              navigation.navigate('WisdomFlow', {
                wisdomId: todayWisdom.id,
                review: true,
              })
            }
            progress={todayProgress}
            wisdom={todayWisdom}
          />
        ) : (
          <SurfaceCard elevated style={styles.caughtUpCard}>
            <View style={styles.caughtUpArt}>
              <Image
                accessible={false}
                resizeMode="contain"
                source={caughtUpCloud}
                style={styles.caughtUpCloud}
              />
            </View>
            <AppText
              accessibilityRole="header"
              style={styles.caughtUpTitle}
              variant="cardTitle"
            >
              {'You\u2019re all caught up'}
            </AppText>
            <AppText
              style={styles.caughtUpText}
              tone="secondary"
              variant="supporting"
            >
              {
                'You\u2019ve practiced every available Wisdom. More thinking and practice will be added soon.'
              }
            </AppText>
          </SurfaceCard>
        )}
      </View>

      <View>
        <SectionHeader title="Tomorrow" />
        <StatusPanel
          body={
            tomorrowWisdomExists
              ? 'A new Wisdom will be ready when you return.'
              : 'New thinking and practice will be added soon.'
          }
          icon="lock-closed"
          title={
            tomorrowWisdomExists
              ? 'Cloud is preparing this for tomorrow'
              : 'More Wisdom is being prepared'
          }
          tone={tomorrowWisdomExists ? 'gold' : 'soft'}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingCloud: {
    height: 92,
    width: 92,
  },
  loadingText: {
    marginTop: space.sm,
  },
  caughtUpCard: {
    alignItems: 'center',
    marginBottom: space.lg,
    padding: space.lg,
  },
  caughtUpArt: {
    borderRadius: radii.round,
    height: 104,
    overflow: 'hidden',
    width: 104,
  },
  caughtUpCloud: {
    height: '100%',
    width: '100%',
  },
  caughtUpTitle: {
    marginTop: space.sm,
    textAlign: 'center',
  },
  caughtUpText: {
    marginTop: space.xs,
    maxWidth: 360,
    textAlign: 'center',
  },
});
