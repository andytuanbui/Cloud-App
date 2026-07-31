import { PropsWithChildren } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextProps,
  TextStyle,
} from 'react-native';
import { appColors, typeStyles } from '../../theme';

export type AppTextVariant = keyof typeof typeStyles;
type Tone = 'primary' | 'secondary' | 'muted' | 'brand' | 'gold' | 'error' | 'inverse';

const toneColors: Record<Tone, string> = {
  primary: appColors.textPrimary,
  secondary: appColors.textSecondary,
  muted: appColors.textMuted,
  brand: appColors.primary,
  gold: appColors.warmGold,
  error: appColors.error,
  inverse: appColors.onPrimary,
};

export function AppText({
  children,
  variant = 'body',
  tone = 'primary',
  style,
  ...props
}: PropsWithChildren<
  TextProps & {
    variant?: AppTextVariant;
    tone?: Tone;
    style?: StyleProp<TextStyle>;
  }
>) {
  return (
    <Text
      {...props}
      style={[styles.base, typeStyles[variant], { color: toneColors[tone] }, style]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
});
