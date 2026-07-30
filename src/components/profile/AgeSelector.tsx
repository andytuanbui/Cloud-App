import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MAX_PROFILE_AGE, MIN_PROFILE_AGE } from '../../state/profileValidation';

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
      <Text style={styles.label}>Age</Text>
      <View accessibilityLabel="Choose age" accessibilityRole="radiogroup" style={styles.grid}>
        {ages.map((age) => {
          const selected = selectedAge === age;
          return (
            <Pressable
              accessibilityLabel={`Age ${age}`}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected, selected }}
              key={age}
              onPress={() => onSelect(age)}
              style={({ pressed }) => [
                styles.option,
                selected && styles.optionSelected,
                pressed && styles.optionPressed,
              ]}
            >
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{age}</Text>
            </Pressable>
          );
        })}
      </View>
      {error && (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { width: '100%' },
  label: { color: '#253B55', fontSize: 14, fontWeight: '800', marginBottom: 8 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  option: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#C9D8D3',
    borderRadius: 15,
    borderWidth: 1,
    flexBasis: '21%',
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: 52,
    minWidth: 58,
  },
  optionSelected: { backgroundColor: '#173A61', borderColor: '#173A61' },
  optionPressed: { opacity: 0.78 },
  optionText: { color: '#263D58', fontSize: 17, fontWeight: '800' },
  optionTextSelected: { color: '#FFFFFF' },
  error: { color: '#914141', fontSize: 13, fontWeight: '700', lineHeight: 18, marginTop: 8 },
});
