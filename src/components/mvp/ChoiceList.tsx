import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Choice } from '../../content/wisdoms';

export function ChoiceList({
  choices,
  selectedId,
  onSelect,
  disabled,
}: {
  choices: Choice[];
  selectedId?: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.list}>
      {choices.map((choice) => {
        const selected = choice.id === selectedId;
        return (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            disabled={disabled}
            key={choice.id}
            onPress={() => onSelect(choice.id)}
            style={[styles.choice, selected && styles.selected]}
          >
            <View style={[styles.radio, selected && styles.radioSelected]} />
            <Text style={styles.label}>{choice.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  choice: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E4E0',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 56,
    paddingHorizontal: 16,
  },
  selected: { backgroundColor: '#E8F6F1', borderColor: '#287A68', borderWidth: 2 },
  radio: { borderColor: '#87958F', borderRadius: 8, borderWidth: 2, height: 17, marginRight: 13, width: 17 },
  radioSelected: { backgroundColor: '#287A68', borderColor: '#287A68' },
  label: { color: '#172942', flex: 1, fontSize: 16, fontWeight: '700', lineHeight: 22 },
});
