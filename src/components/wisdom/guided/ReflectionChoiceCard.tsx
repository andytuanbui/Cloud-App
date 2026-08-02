import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { appColors, radii, shadows, space, spacing, typography } from '../../../theme';
import { AppText } from '../../ui';

export function ReflectionChoiceCard({
  accessibilityLabel,
  disabled = false,
  label,
  onPress,
  selected,
  supportingText,
}: {
  accessibilityLabel?: string;
  disabled?: boolean;
  label: string;
  onPress: () => void;
  selected: boolean;
  supportingText?: string;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.selected,
        focused && styles.focused,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <View style={[styles.indicator, selected && styles.indicatorSelected]}>
        <Ionicons
          accessible={false}
          color={selected ? appColors.onPrimary : appColors.primary}
          name={selected ? 'checkmark' : 'chatbubble-outline'}
          size={spacing.s18}
        />
      </View>
      <View style={styles.copy}>
        <AppText
          style={styles.label}
          tone={selected ? 'brand' : 'primary'}
          variant="body"
        >
          {label}
        </AppText>
        {supportingText ? (
          <AppText style={styles.supporting} tone="secondary" variant="supporting">
            {supportingText}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: appColors.surfaceElevated,
    borderColor: appColors.border,
    borderRadius: radii.large,
    borderWidth: 1,
    flexDirection: 'row',
    minWidth: 0,
    minHeight: spacing.s62,
    paddingHorizontal: space.xs,
    paddingVertical: space.sm,
    ...shadows.subtle,
  },
  selected: {
    backgroundColor: appColors.primarySoft,
    borderColor: appColors.primary,
  },
  focused: {
    borderColor: appColors.focus,
    ...shadows.focus,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.995 }],
  },
  disabled: {
    opacity: 0.42,
  },
  indicator: {
    alignItems: 'center',
    backgroundColor: appColors.primarySoft,
    borderColor: appColors.border,
    borderRadius: radii.round,
    borderWidth: 1,
    height: spacing.s30,
    justifyContent: 'center',
    marginRight: space.xs,
    width: spacing.s30,
  },
  indicatorSelected: {
    backgroundColor: appColors.primary,
    borderColor: appColors.primary,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontWeight: typography.weight.bold,
  },
  supporting: {
    marginTop: space.xxs,
  },
});
