import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MAX_PROFILE_AGE, MIN_PROFILE_AGE } from '../../state/profileValidation';
import { appColors, layout, radii, shadows, space } from '../../theme';
import { AppText } from '../ui';

const ages = Array.from(
  { length: MAX_PROFILE_AGE - MIN_PROFILE_AGE + 1 },
  (_, index) => MIN_PROFILE_AGE + index,
);

export function AgeSelector({
  selectedAge,
  onSelect,
  error,
}: {
  selectedAge: number | null;
  onSelect: (age: number) => void;
  error?: string;
}) {
  return (
    <View style={styles.field}>
      <AppText style={styles.label} variant="label">
        Age
      </AppText>
      <View accessibilityLabel="Choose age" accessibilityRole="radiogroup" style={styles.grid}>
        {ages.map((age) => (
          <AgeOption
            age={age}
            key={age}
            onSelect={onSelect}
            selected={selectedAge === age}
          />
        ))}
      </View>
      {error && (
        <AppText
          accessibilityLiveRegion="polite"
          style={styles.error}
          tone="error"
          variant="caption"
        >
          {error}
        </AppText>
      )}
    </View>
  );
}

function AgeOption({
  age,
  onSelect,
  selected,
}: {
  age: number;
  onSelect: (age: number) => void;
  selected: boolean;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      accessibilityLabel={`Age ${age}`}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onPress={() => onSelect(age)}
      style={({ pressed }) => [
        styles.option,
        selected && styles.optionSelected,
        focused && styles.optionFocused,
        pressed && styles.optionPressed,
      ]}
    >
      <AppText
        style={styles.optionText}
        tone={selected ? 'inverse' : 'primary'}
        variant="body"
      >
        {age}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: { width: '100%' },
  label: {
    marginBottom: space.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  option: {
    alignItems: 'center',
    backgroundColor: appColors.surfaceElevated,
    borderColor: appColors.borderStrong,
    borderRadius: radii.medium,
    borderWidth: 2,
    flexBasis: '21%',
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: 54,
    minWidth: layout.minimumTouchTarget,
  },
  optionSelected: {
    backgroundColor: appColors.primary,
    borderColor: appColors.primary,
  },
  optionFocused: {
    borderColor: appColors.focus,
    ...shadows.focus,
  },
  optionPressed: { opacity: 0.78 },
  optionText: {
    fontWeight: '700',
  },
  error: {
    marginTop: space.xs,
  },
});
