import { forwardRef } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  onSubmitEditing?: () => void;
  autoFocus?: boolean;
};

export const ProfileNameField = forwardRef<TextInput, Props>(function ProfileNameField(
  { value, onChangeText, error, onSubmitEditing, autoFocus },
  ref,
) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>Name or nickname</Text>
      <TextInput
        ref={ref}
        accessibilityLabel="Name or nickname"
        accessibilityHint={error ?? 'Use a first name or nickname, up to 24 characters.'}
        autoCapitalize="words"
        autoComplete="name"
        autoCorrect={false}
        autoFocus={autoFocus}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        placeholder="Name or nickname"
        placeholderTextColor="#7B8985"
        returnKeyType="next"
        style={[styles.input, error && styles.inputError]}
        value={value}
      />
      {error ? (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {error}
        </Text>
      ) : (
        <Text style={styles.help}>Use a first name or nickname.</Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  field: { width: '100%' },
  label: { color: '#253B55', fontSize: 14, fontWeight: '800', marginBottom: 8 },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#C9D8D3',
    borderRadius: 16,
    borderWidth: 1,
    color: '#172A43',
    fontSize: 18,
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputError: { borderColor: '#A64B4B', borderWidth: 2 },
  help: { color: '#687873', fontSize: 13, lineHeight: 18, marginTop: 7 },
  error: { color: '#914141', fontSize: 13, fontWeight: '700', lineHeight: 18, marginTop: 7 },
});
