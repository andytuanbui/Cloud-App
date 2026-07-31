import { Image, StyleSheet, View } from 'react-native';
import type { WisdomContent } from '../../content/wisdoms';
import { appColors, radii } from '../../theme';

const artworkBackgrounds: Record<string, string> = {
  'needs-vs-wants': appColors.warmGoldSoft,
  'pause-before-you-answer': appColors.primarySoft,
  'three-ways-to-use-money': appColors.canvasSoft,
};

export function WisdomArtworkStage({
  mode = 'feature',
  wisdom,
}: {
  mode?: 'feature' | 'compact';
  wisdom: WisdomContent;
}) {
  return (
    <View
      accessible={false}
      style={[
        styles.stage,
        mode === 'compact' && styles.compactStage,
        { backgroundColor: artworkBackgrounds[wisdom.id] ?? appColors.surfaceSoft },
      ]}
    >
      <View style={[styles.orb, mode === 'compact' && styles.compactOrb]} />
      <Image
        accessible={false}
        resizeMode="contain"
        source={wisdom.artwork}
        style={[styles.image, mode === 'compact' && styles.compactImage]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    alignItems: 'center',
    height: 208,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  compactStage: {
    borderRadius: radii.medium,
    flexShrink: 0,
    height: 142,
    width: 104,
  },
  orb: {
    backgroundColor: appColors.surfaceOverlaySoft,
    borderRadius: radii.round,
    height: 176,
    position: 'absolute',
    right: -20,
    top: 18,
    width: 176,
  },
  compactOrb: {
    height: 94,
    right: -28,
    top: 24,
    width: 94,
  },
  image: {
    height: '94%',
    width: '94%',
  },
  compactImage: {
    height: '92%',
    width: '92%',
  },
});
