import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { appColors, layout, radii, shadows, space, spacing } from '../../../theme';
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
        {selected ? <View style={styles.indicatorDot} /> : null}
      </View>
      <View style={styles.copy}>
        <AppText variant="body">{label}</AppText>
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
    borderRadius: radii.medium,
    borderWidth: 2,
    flexDirection: 'row',
    minHeight: spacing.s58,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
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
    borderColor: appColors.borderStrong,
    borderRadius: radii.round,
    borderWidth: 2,
    height: layout.minimumTouchTarget / 2,
    justifyContent: 'center',
    marginRight: space.sm,
    width: layout.minimumTouchTarget / 2,
  },
  indicatorSelected: {
    backgroundColor: appColors.primary,
    borderColor: appColors.primary,
  },
  indicatorDot: {
    backgroundColor: appColors.onPrimary,
    borderRadius: radii.round,
    height: space.xs,
    width: space.xs,
  },
  copy: {
    flex: 1,
  },
  supporting: {
    marginTop: space.xxs,
  },
});
