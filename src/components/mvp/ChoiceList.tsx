import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Choice } from '../../content/wisdoms';
import {
  appColors,
  radii,
  shadows,
  space,
  spacing,
  typography,
} from '../../theme';
import { AppText } from '../ui';

type SelectionTone = 'default' | 'correct' | 'wrong';

export function ChoiceList({
  choices,
  selectedId,
  onSelect,
  disabled,
  accessibilityLabel = 'Choose one option',
  selectionTone = 'default',
}: {
  choices: Choice[];
  selectedId?: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  selectionTone?: SelectionTone;
}) {
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="radiogroup"
      accessibilityState={{ disabled: Boolean(disabled) }}
      style={styles.list}
    >
      {choices.map((choice) => {
        const selected = choice.id === selectedId;
        return (
          <ChoiceItem
            choice={choice}
            disabled={disabled}
            key={choice.id}
            onPress={() => onSelect(choice.id)}
            selected={selected}
            selectionTone={selectionTone}
          />
        );
      })}
    </View>
  );
}

function ChoiceItem({
  choice,
  disabled,
  onPress,
  selected,
  selectionTone,
}: {
  choice: Choice;
  disabled?: boolean;
  onPress: () => void;
  selected: boolean;
  selectionTone: SelectionTone;
}) {
  const [focused, setFocused] = useState(false);
  const isCorrect = selected && selectionTone === 'correct';
  const isWrong = selected && selectionTone === 'wrong';

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled: Boolean(disabled) }}
      disabled={disabled}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onPress={onPress}
      style={({ pressed }) => [
        styles.choice,
        selected && styles.selected,
        isCorrect && styles.selectedCorrect,
        isWrong && styles.selectedWrong,
        focused && styles.focused,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <View
        accessibilityElementsHidden
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        style={[
          styles.radio,
          selected && styles.radioSelected,
          isCorrect && styles.radioCorrect,
          isWrong && styles.radioWrong,
        ]}
      >
        {isCorrect ? (
          <Ionicons
            accessible={false}
            color={appColors.onPrimary}
            name="checkmark"
            size={spacing.s15}
          />
        ) : isWrong ? (
          <Ionicons
            accessible={false}
            color={appColors.onPrimary}
            name="refresh"
            size={spacing.s13}
          />
        ) : selected ? (
          <View style={styles.radioDot} />
        ) : null}
      </View>
      <AppText style={styles.label} variant="body">
        {choice.label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: space.sm,
  },
  choice: {
    alignItems: 'center',
    backgroundColor: appColors.surfaceElevated,
    borderColor: appColors.border,
    borderRadius: radii.medium,
    borderWidth: spacing.xxs,
    flexDirection: 'row',
    minHeight: spacing.s62,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    ...shadows.subtle,
  },
  selected: {
    backgroundColor: appColors.primarySoft,
    borderColor: appColors.primary,
  },
  selectedCorrect: {
    backgroundColor: appColors.successSoft,
    borderColor: appColors.success,
  },
  selectedWrong: {
    backgroundColor: appColors.cautionSoft,
    borderColor: appColors.caution,
  },
  focused: {
    borderColor: appColors.focus,
    ...shadows.focus,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.995 }],
  },
  disabled: {
    opacity: 0.82,
  },
  radio: {
    alignItems: 'center',
    borderColor: appColors.borderStrong,
    borderRadius: radii.round,
    borderWidth: spacing.xxs,
    height: spacing.s22,
    justifyContent: 'center',
    marginRight: space.sm,
    width: spacing.s22,
  },
  radioSelected: {
    backgroundColor: appColors.primary,
    borderColor: appColors.primary,
  },
  radioCorrect: {
    backgroundColor: appColors.success,
    borderColor: appColors.success,
  },
  radioWrong: {
    backgroundColor: appColors.caution,
    borderColor: appColors.caution,
  },
  radioDot: {
    backgroundColor: appColors.onPrimary,
    borderRadius: radii.round,
    height: space.xs,
    width: space.xs,
  },
  label: {
    flex: 1,
    fontWeight: typography.weight.bold,
  },
});
