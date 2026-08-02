import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { appColors, radii, shadows, space, spacing } from '../../../theme';
import { AppText, PrimaryButton } from '../../ui';

export const PERSONAL_RESPONSE_MAX_LENGTH = 120;

export type PersonalResponseSuggestion = {
  id: string;
  label: string;
};

export function PersonalResponseInput({
  disabled = false,
  inputLabel = 'Or write your own',
  maxLength = PERSONAL_RESPONSE_MAX_LENGTH,
  onChangeText,
  onSelectSuggestion,
  onSubmit,
  placeholder = 'Write a short response…',
  selectedSuggestionId,
  submitLabel = 'Share with Cloud',
  suggestionsLabel = 'You could say',
  suggestions,
  value,
}: {
  disabled?: boolean;
  inputLabel?: string;
  maxLength?: number;
  onChangeText: (value: string) => void;
  onSelectSuggestion: (suggestion: PersonalResponseSuggestion) => void;
  onSubmit: (value: string) => void;
  placeholder?: string;
  selectedSuggestionId?: string;
  submitLabel?: string;
  suggestionsLabel?: string;
  suggestions: readonly PersonalResponseSuggestion[];
  value: string;
}) {
  const [focused, setFocused] = useState(false);
  const trimmedValue = value.trim();
  const safeMaxLength = Math.max(1, Math.floor(maxLength));
  const canSubmit = Boolean(trimmedValue || selectedSuggestionId);

  return (
    <View style={styles.wrap}>
      <AppText tone="secondary" variant="label">
        {suggestionsLabel}
      </AppText>
      <View accessibilityLabel="Suggested responses" accessibilityRole="radiogroup" style={styles.suggestions}>
        {suggestions.map((suggestion) => {
          const selected = selectedSuggestionId === suggestion.id;
          return (
            <Pressable
              accessibilityLabel={suggestion.label}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected, disabled }}
              disabled={disabled}
              key={suggestion.id}
              onPress={() => onSelectSuggestion(suggestion)}
              style={({ pressed }) => [
                styles.suggestion,
                selected && styles.suggestionSelected,
                pressed && !disabled && styles.suggestionPressed,
                disabled && styles.disabled,
              ]}
            >
              <Ionicons
                accessible={false}
                color={selected ? appColors.onPrimary : appColors.primary}
                name={selected ? 'chatbubble' : 'chatbubble-outline'}
                size={spacing.s20}
              />
              <AppText
                style={styles.suggestionText}
                tone={selected ? 'inverse' : 'primary'}
                variant="supporting"
              >
                {suggestion.label}
              </AppText>
              {selected ? (
                <Ionicons
                  accessible={false}
                  color={appColors.onPrimary}
                  name="checkmark-circle"
                  size={spacing.s20}
                />
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <AppText style={styles.inputLabel} tone="secondary" variant="label">
        {inputLabel}
      </AppText>
      <TextInput
        accessibilityHint={`Enter up to ${safeMaxLength} characters`}
        accessibilityLabel="Type a personal response"
        editable={!disabled}
        maxLength={safeMaxLength}
        multiline
        onBlur={() => setFocused(false)}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        placeholder={placeholder}
        placeholderTextColor={appColors.textMuted}
        selectionColor={appColors.primary}
        style={[styles.input, focused && styles.inputFocused, disabled && styles.disabled]}
        textAlignVertical="top"
        value={value}
      />
      <AppText style={styles.count} tone="muted" variant="caption">
        {value.length} / {safeMaxLength}
      </AppText>
      <PrimaryButton
        disabled={disabled || !canSubmit}
        label={submitLabel}
        onPress={() => onSubmit(trimmedValue)}
        style={styles.submit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  suggestions: {
    gap: space.xs,
    marginTop: space.xs,
  },
  suggestion: {
    alignItems: 'center',
    backgroundColor: appColors.surfaceElevated,
    borderColor: appColors.borderStrong,
    borderRadius: radii.large,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: spacing.s48,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  suggestionSelected: {
    backgroundColor: appColors.primary,
    borderColor: appColors.primary,
  },
  suggestionPressed: {
    backgroundColor: appColors.primarySoft,
  },
  suggestionText: {
    flex: 1,
    fontWeight: '700',
    marginHorizontal: space.sm,
  },
  inputLabel: {
    marginTop: space.lg,
  },
  input: {
    backgroundColor: appColors.surfaceElevated,
    borderColor: appColors.borderStrong,
    borderRadius: radii.medium,
    borderWidth: 2,
    color: appColors.textPrimary,
    marginTop: space.xs,
    minHeight: spacing.s92,
    padding: space.md,
  },
  inputFocused: {
    borderColor: appColors.focus,
    ...shadows.focus,
  },
  disabled: {
    opacity: 0.42,
  },
  count: {
    alignSelf: 'flex-end',
    marginTop: space.xxs,
  },
  submit: {
    marginTop: space.sm,
  },
});
