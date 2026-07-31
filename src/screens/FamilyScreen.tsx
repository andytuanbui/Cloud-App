import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, View } from 'react-native';
import { BottomNav } from '../components/BottomNav';
import { AppText, Screen, SurfaceCard } from '../components/ui';
import { appColors, layout, radii, shadows, space } from '../theme';

export function FamilyScreen() {
  return (
    <Screen
      bottomNavigation={<BottomNav active="Family" />}
      contentContainerStyle={styles.content}
    >
      <View style={styles.hero}>
        <Image
          accessibilityIgnoresInvertColors
          accessible={false}
          resizeMode="cover"
          source={require('../../assets/cloud/cloud-neighborhood-home.png')}
          style={styles.heroImage}
        />
        <LinearGradient
          colors={[appColors.transparent, appColors.overlay]}
          style={styles.heroFade}
        />
        <View style={styles.icon}>
          <Ionicons color={appColors.primary} name="people" size={26} />
        </View>
      </View>

      <SurfaceCard elevated style={styles.copyCard}>
        <AppText accessibilityRole="header" style={styles.title} variant="cardTitle">
          Family
        </AppText>
        <AppText style={styles.body} tone="secondary" variant="body">
          A quiet place for families to support Habits, Confidence, and Growth is coming later.
        </AppText>
      </SurfaceCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: space.xl,
  },
  hero: {
    alignSelf: 'center',
    borderRadius: radii.hero,
    height: 280,
    maxWidth: 440,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
    ...shadows.card,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
    width: '100%',
  },
  heroFade: {
    ...StyleSheet.absoluteFillObject,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: appColors.warmGoldSoft,
    borderColor: appColors.surfaceOverlay,
    borderRadius: radii.round,
    borderWidth: 3,
    bottom: space.md,
    height: 52,
    justifyContent: 'center',
    left: space.md,
    position: 'absolute',
    width: 52,
  },
  copyCard: {
    alignSelf: 'center',
    marginTop: -space.lg,
    maxWidth: 440,
    padding: layout.cardPadding,
    width: '92%',
    zIndex: 1,
  },
  title: {
    textAlign: 'center',
  },
  body: {
    marginTop: space.xs,
    textAlign: 'center',
  },
});
