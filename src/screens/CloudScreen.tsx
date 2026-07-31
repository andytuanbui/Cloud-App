import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet } from 'react-native';
import { BottomNav } from '../components/BottomNav';
import { AppText, Screen, SurfaceCard } from '../components/ui';
import { appColors, layout, radii, shadows, space } from '../theme';

export function CloudScreen() {
  return (
    <Screen
      bottomNavigation={<BottomNav active="Cloud" />}
      contentContainerStyle={styles.content}
    >
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

      <SurfaceCard elevated style={styles.copyCard}>
        <AppText accessibilityRole="header" style={styles.title} variant="cardTitle">
          Cloud is here to listen
        </AppText>
        <AppText style={styles.body} tone="secondary" variant="body">
          You can talk with Cloud inside today’s Wisdom. More guided conversations will be added later.
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
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: radii.hero,
    height: 300,
    justifyContent: 'flex-end',
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
