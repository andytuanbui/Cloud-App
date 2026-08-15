import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { appColors, layout, radii, shadows, space, typeStyles } from '../../theme';

type IconName = keyof typeof Ionicons.glyphMap;
type ButtonVariant = 'primary' | 'secondary' | 'text';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
  /**
   * Stable hook for automated layout measurement. Renders as `data-testid` on
   * web and is inert on native; it changes nothing a child sees.
   */
  testID?: string;
};

function AppButton({
  label,
  onPress,
  disabled,
  loading,
  accessibilityLabel,
  icon,
  style,
  testID,
  variant,
}: Props & { variant: ButtonVariant }) {
  const [focused, setFocused] = useState(false);
  const isDisabled = disabled || loading;
  const inverse = variant === 'primary';

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: isDisabled }}
      disabled={isDisabled}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'text' && styles.textButton,
        focused && styles.focused,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator color={inverse ? appColors.onPrimary : appColors.primary} />
      ) : (
        <>
          {icon ? (
            <Ionicons
              color={inverse ? appColors.onPrimary : appColors.primary}
              name={icon}
              size={18}
              style={styles.icon}
            />
          ) : null}
          <Text
            style={[
              styles.label,
              inverse ? styles.primaryLabel : styles.secondaryLabel,
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

export function PrimaryButton(props: Props) {
  return <AppButton {...props} variant="primary" />;
}

export function SecondaryButton(props: Props) {
  return <AppButton {...props} variant="secondary" />;
}

export function TextButton(props: Props) {
  return <AppButton {...props} variant="text" />;
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderColor: appColors.transparent,
    borderRadius: radii.medium,
    borderWidth: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: space.lg,
  },
  primary: {
    backgroundColor: appColors.primary,
    ...shadows.subtle,
  },
  secondary: {
    backgroundColor: appColors.surfaceElevated,
    borderColor: appColors.borderStrong,
  },
  textButton: {
    backgroundColor: appColors.transparent,
    minHeight: layout.minimumTouchTarget,
  },
  focused: {
    borderColor: appColors.focus,
    ...shadows.focus,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.42,
  },
  label: {
    ...typeStyles.button,
  },
  primaryLabel: {
    color: appColors.onPrimary,
  },
  secondaryLabel: {
    color: appColors.primary,
  },
  icon: {
    marginRight: space.xs,
  },
});
