import { Image, StyleSheet, View } from 'react-native';
import { appColors, radii, shadows, space } from '../../theme';
import { AppText } from '../ui';

const heroArtwork = require('../../../assets/cloud/cloud-home-garden.png');

export function CloudGreetingHero({
  greeting,
}: {
  greeting: string;
}) {
  return (
    <View style={styles.shadow}>
      <View style={styles.hero}>
        <Image
          accessible={false}
          resizeMode="cover"
          source={heroArtwork}
          style={styles.image}
        />
        <View style={styles.copyPanel}>
          <AppText accessibilityRole="header" variant="sectionTitle">
            {greeting}
          </AppText>
          <AppText style={styles.body} tone="secondary" variant="supporting">
            {'Let\u2019s take a calm moment to think together.'}
          </AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: radii.hero,
    marginBottom: space.xl,
    ...shadows.card,
  },
  hero: {
    borderRadius: radii.hero,
    justifyContent: 'flex-end',
    minHeight: 220,
    overflow: 'hidden',
    padding: space.md,
    position: 'relative',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
    width: '100%',
  },
  copyPanel: {
    backgroundColor: appColors.surfaceOverlay,
    borderColor: appColors.surfaceElevated,
    borderRadius: radii.medium,
    borderWidth: 1,
    maxWidth: 310,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    width: '82%',
  },
  body: {
    marginTop: space.xxs,
  },
});
