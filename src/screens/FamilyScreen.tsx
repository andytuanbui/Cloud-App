import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, View } from 'react-native';
import { BottomNav } from '../components/BottomNav';
import { AppText, Screen } from '../components/ui';
import { appColors, radii, shadows, space } from '../theme';

export function FamilyScreen() {
  return (
    <Screen
      bottomNavigation={<BottomNav active="Family" />}
      contentContainerStyle={styles.content}
    >
      <AppText accessibilityRole="header" variant="screenTitle">
        Family
      </AppText>
      <AppText style={styles.intro} tone="secondary" variant="body">
        CloudWise grows stronger with support from the people who care for you.
      </AppText>

      <View style={styles.hero}>
        <Image
          accessibilityIgnoresInvertColors
          accessible={false}
          resizeMode="cover"
          source={require('../../assets/cloud/cloud-neighborhood-home.png')}
          style={styles.heroImage}
        />
      </View>

      <View style={styles.comingLater}>
        <View style={styles.icon}>
          <Ionicons color={appColors.primary} name="people" size={24} />
        </View>
        <View style={styles.message}>
          <AppText variant="label">Coming later</AppText>
          <AppText style={styles.body} tone="secondary" variant="supporting">
            A family space for supporting Habits, Confidence, and Growth is
            planned for a later release.
          </AppText>
        </View>
      </View>
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
    alignSelf: 'center',
    borderRadius: radii.hero,
    height: 260,
    marginTop: space.lg,
    maxWidth: 440,
    overflow: 'hidden',
    width: '100%',
    ...shadows.card,
  },
  heroImage: {
    height: '100%',
    width: '100%',
  },
  comingLater: {
    alignItems: 'flex-start',
    alignSelf: 'center',
    flexDirection: 'row',
    marginTop: space.lg,
    maxWidth: 440,
    width: '100%',
  },
  icon: {
    alignItems: 'center',
    backgroundColor: appColors.primarySoft,
    borderRadius: radii.round,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  message: {
    flex: 1,
    marginLeft: space.sm,
  },
  body: {
    marginTop: space.xxs,
  },
});
