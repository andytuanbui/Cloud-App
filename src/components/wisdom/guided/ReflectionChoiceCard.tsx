import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { appColors, radii, shadows, space, spacing, typography } from '../../../theme';
import { AppText } from '../../ui';

export function ReflectionChoiceCard({
  accessibilityLabel,
  disabled = false,
  icon = 'chatbubble-outline',
  label,
  onPress,
  selected,
  supportingText,
}: {
  accessibilityLabel?: string;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
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
          color={selected ? appColors.wisdomNightDeep : appColors.primary}
          name={selected ? 'checkmark' : icon}
          size={spacing.s20}
        />
      </View>
      <View style={styles.copy}>
        <AppText
          style={[styles.label, selected && styles.labelSelected]}
          tone={selected ? 'inverse' : 'primary'}
          variant="body"
        >
          {label}
        </AppText>
        {supportingText ? (
          <AppText style={styles.supporting} tone={selected ? 'inverse' : 'secondary'} variant="supporting">
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
    borderBottomLeftRadius: radii.large,
    borderBottomRightRadius: spacing.md,
    borderColor: appColors.borderStrong,
    borderTopLeftRadius: radii.large,
    borderTopRightRadius: radii.large,
    borderWidth: 2,
    flexDirection: 'row',
    minHeight: spacing.s68,
    minWidth: 0,
    paddingHorizontal: space.sm,
    paddingVertical: space.sm,
    ...shadows.subtle,
  },
  selected: {
    backgroundColor: appColors.primary,
    borderBottomLeftRadius: spacing.md,
    borderBottomRightRadius: radii.large,
    borderColor: appColors.wisdomGoldBright,
    ...shadows.card,
  },
  focused: {
    borderColor: appColors.focus,
    ...shadows.focus,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
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
    height: spacing.s38,
    justifyContent: 'center',
    marginRight: space.sm,
    width: spacing.s38,
  },
  indicatorSelected: {
    backgroundColor: appColors.wisdomGoldBright,
    borderColor: appColors.wisdomGoldBright,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontWeight: typography.weight.bold,
  },
  labelSelected: {
    fontWeight: typography.weight.heavy,
  },
  supporting: {
    marginTop: space.xxs,
  },
});
