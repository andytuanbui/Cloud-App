import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { appColors, radii, shadows } from '../../theme';

type Tone = 'default' | 'soft' | 'gold' | 'success' | 'caution';

export function SurfaceCard({
  children,
  elevated = false,
  style,
  tone = 'default',
}: PropsWithChildren<{
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
  tone?: Tone;
}>) {
  return (
    <View
      style={[
        styles.card,
        tone === 'soft' && styles.soft,
        tone === 'gold' && styles.gold,
        tone === 'success' && styles.success,
        tone === 'caution' && styles.caution,
        elevated && shadows.card,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: appColors.surface,
    borderColor: appColors.border,
    borderRadius: radii.card,
    borderWidth: 1,
  },
  soft: {
    backgroundColor: appColors.surfaceSoft,
  },
  gold: {
    backgroundColor: appColors.warmGoldSoft,
  },
  success: {
    backgroundColor: appColors.successSoft,
  },
  caution: {
    backgroundColor: appColors.cautionSoft,
  },
});
