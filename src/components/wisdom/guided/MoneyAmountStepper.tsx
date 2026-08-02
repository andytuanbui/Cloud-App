import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { appColors, layout, radii, shadows, space, spacing, typography } from '../../../theme';
import { AppText, SurfaceCard } from '../../ui';

export const MONEY_AMOUNT_STEP = 10;

type MoneyDestinationTone = 'spend' | 'save' | 'give';

export function MoneyAmountStepper({
  amount,
  disabled = false,
  icon,
  label,
  maxAmount = 90,
  onChange,
  supportingText,
  tone = 'save',
  totalAmount = 90,
}: {
  amount: number;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  maxAmount?: number;
  onChange: (amount: number) => void;
  supportingText?: string;
  tone?: MoneyDestinationTone;
  totalAmount?: number;
}) {
  const [focusedControl, setFocusedControl] = useState<'decrease' | 'increase'>();
  const safeMaximum = Math.max(0, maxAmount);
  const safeTotal = Math.max(MONEY_AMOUNT_STEP, totalAmount);
  const finiteAmount = Number.isFinite(amount) ? amount : 0;
  const safeAmount = Math.min(safeMaximum, Math.max(0, finiteAmount));
  const canDecrease = !disabled && safeAmount >= MONEY_AMOUNT_STEP;
  const canIncrease = !disabled && safeAmount + MONEY_AMOUNT_STEP <= safeMaximum;
  const progressWidth = `${Math.min(100, Math.max(0, (safeAmount / safeTotal) * 100))}%` as const;

  return (
    <SurfaceCard
      elevated
      style={[
        styles.card,
        tone === 'spend' && styles.spendCard,
        tone === 'save' && styles.saveCard,
        tone === 'give' && styles.giveCard,
      ]}
    >
      <View style={styles.heading}>
        {icon ? (
          <View
            accessible={false}
            style={[
              styles.categoryIcon,
              tone === 'spend' && styles.spendIcon,
              tone === 'give' && styles.giveIcon,
            ]}
          >
            <Ionicons
              accessible={false}
              color={tone === 'spend' ? appColors.warmGold : appColors.primary}
              name={icon}
              size={spacing.s24}
            />
          </View>
        ) : null}
        <View style={styles.headingCopy}>
          {supportingText ? (
            <>
              <AppText tone="brand" variant="caption">
                {label}
              </AppText>
              <AppText accessibilityRole="header" style={styles.objectName} variant="cardTitle">
                {supportingText}
              </AppText>
            </>
          ) : (
            <AppText accessibilityRole="header" variant="cardTitle">
              {label}
            </AppText>
          )}
        </View>
        <AppText accessibilityLiveRegion="polite" style={styles.amountText} variant="sectionTitle">
          {safeAmount} kr
        </AppText>
      </View>

      <View accessibilityLabel={`${label}: ${safeAmount} kr`} style={styles.controls}>
        <Pressable
          accessibilityLabel={`Remove ${MONEY_AMOUNT_STEP} kr from ${label}`}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canDecrease }}
          disabled={!canDecrease}
          onBlur={() => setFocusedControl(undefined)}
          onFocus={() => setFocusedControl('decrease')}
          onPress={() => onChange(Math.max(0, safeAmount - MONEY_AMOUNT_STEP))}
          style={({ pressed }) => [
            styles.stepButton,
            focusedControl === 'decrease' && styles.stepButtonFocused,
            pressed && canDecrease && styles.stepButtonPressed,
            !canDecrease && styles.stepButtonDisabled,
          ]}
        >
          <Ionicons color={appColors.primary} name="remove" size={spacing.s20} />
        </Pressable>

        <View accessible={false} style={styles.track}>
          <View style={[styles.trackFill, { width: progressWidth }]} />
          <View style={[styles.trackKnob, { left: progressWidth }]} />
        </View>

        <Pressable
          accessibilityLabel={`Add ${MONEY_AMOUNT_STEP} kr to ${label}`}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canIncrease }}
          disabled={!canIncrease}
          onBlur={() => setFocusedControl(undefined)}
          onFocus={() => setFocusedControl('increase')}
          onPress={() => onChange(Math.min(safeMaximum, safeAmount + MONEY_AMOUNT_STEP))}
          style={({ pressed }) => [
            styles.stepButton,
            focusedControl === 'increase' && styles.stepButtonFocused,
            pressed && canIncrease && styles.stepButtonPressed,
            !canIncrease && styles.stepButtonDisabled,
          ]}
        >
          <Ionicons color={appColors.primary} name="add" size={spacing.s20} />
        </Pressable>
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    borderColor: appColors.borderStrong,
    padding: space.md,
  },
  spendCard: {
    backgroundColor: appColors.wisdomCream,
  },
  saveCard: {
    backgroundColor: appColors.surfaceSoft,
  },
  giveCard: {
    backgroundColor: appColors.cautionSoft,
  },
  heading: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  categoryIcon: {
    alignItems: 'center',
    backgroundColor: appColors.primarySoft,
    borderColor: appColors.border,
    borderRadius: radii.large,
    borderWidth: 1,
    height: spacing.s58,
    justifyContent: 'center',
    marginRight: space.sm,
    width: spacing.s58,
  },
  spendIcon: {
    backgroundColor: appColors.warmGoldSoft,
  },
  giveIcon: {
    backgroundColor: appColors.surfaceElevated,
  },
  headingCopy: {
    flex: 1,
    minWidth: 0,
  },
  objectName: {
    marginTop: space.xxs,
  },
  amountText: {
    fontWeight: typography.weight.heavy,
    marginLeft: space.xs,
  },
  controls: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: space.sm,
    marginLeft: spacing.s58 + space.sm,
    marginTop: space.sm,
  },
  stepButton: {
    alignItems: 'center',
    backgroundColor: appColors.surfaceOverlay,
    borderColor: appColors.primary,
    borderRadius: radii.round,
    borderWidth: 1,
    height: layout.minimumTouchTarget,
    justifyContent: 'center',
    width: layout.minimumTouchTarget,
  },
  stepButtonFocused: {
    borderColor: appColors.focus,
    ...shadows.focus,
  },
  stepButtonPressed: {
    backgroundColor: appColors.primarySoft,
    transform: [{ scale: 0.96 }],
  },
  stepButtonDisabled: {
    opacity: 0.38,
  },
  track: {
    backgroundColor: appColors.borderStrong,
    borderRadius: radii.round,
    flex: 1,
    height: spacing.sm,
    position: 'relative',
  },
  trackFill: {
    backgroundColor: appColors.primary,
    borderRadius: radii.round,
    height: '100%',
  },
  trackKnob: {
    backgroundColor: appColors.primary,
    borderColor: appColors.surfaceElevated,
    borderRadius: radii.round,
    borderWidth: 2,
    height: spacing.s18,
    marginLeft: -spacing.s10,
    marginTop: -spacing.s10 + spacing.sm / 2,
    position: 'absolute',
    top: 0,
    width: spacing.s18,
  },
});
