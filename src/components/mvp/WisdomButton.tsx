import { Pressable, StyleSheet, Text } from 'react-native';

export function WisdomButton({
  label,
  onPress,
  disabled,
  secondary,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={[styles.label, secondary && styles.secondaryLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '#102B55',
    borderRadius: 18,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 22,
  },
  label: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  secondary: { backgroundColor: '#FFFFFF', borderColor: '#CAD8D4', borderWidth: 1 },
  secondaryLabel: { color: '#18304F' },
  disabled: { opacity: 0.42 },
  pressed: { opacity: 0.84, transform: [{ scale: 0.99 }] },
});
