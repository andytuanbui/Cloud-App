import { forwardRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { MAX_PROFILE_NAME_LENGTH } from '../../state/profileValidation';
import { appColors, radii, shadows, space, typeStyles } from '../../theme';
import { AppText } from '../ui';

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
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      <AppText nativeID="profile-name-label" style={styles.label} variant="label">
        Name or nickname
      </AppText>
      <TextInput
        ref={ref}
        accessibilityLabel="Name or nickname"
        accessibilityLabelledBy="profile-name-label"
        accessibilityHint={error ?? 'Use a first name or nickname, up to 24 characters.'}
        autoCapitalize="words"
        autoComplete="name"
        autoCorrect={false}
        autoFocus={autoFocus}
        maxLength={MAX_PROFILE_NAME_LENGTH}
        onBlur={() => setFocused(false)}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onSubmitEditing={onSubmitEditing}
        placeholder="Name or nickname"
        placeholderTextColor={appColors.textMuted}
        returnKeyType="next"
        selectionColor={appColors.primary}
        style={[
          styles.input,
          focused && styles.inputFocused,
          error && styles.inputError,
        ]}
        value={value}
      />
      {error ? (
        <AppText
          accessibilityLiveRegion="polite"
          style={styles.message}
          tone="error"
          variant="caption"
        >
          {error}
        </AppText>
      ) : (
        <AppText style={styles.message} tone="muted" variant="caption">
          Use a first name or nickname.
        </AppText>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  field: { width: '100%' },
  label: {
    marginBottom: space.xs,
  },
  input: {
    ...typeStyles.body,
    backgroundColor: appColors.surfaceElevated,
    borderColor: appColors.borderStrong,
    borderRadius: radii.medium,
    borderWidth: 2,
    color: appColors.textPrimary,
    fontSize: 18,
    minHeight: 56,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  inputFocused: {
    borderColor: appColors.focus,
    ...shadows.focus,
  },
  inputError: {
    borderColor: appColors.error,
  },
  message: {
    marginTop: space.xs,
  },
});
