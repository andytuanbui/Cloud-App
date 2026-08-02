import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { appColors, radii, space, spacing } from '../../../theme';
import { AppText, SecondaryButton, SurfaceCard } from '../../ui';

export const MONEY_AMOUNT_STEP = 10;

export function MoneyAmountStepper({
  amount,
  disabled = false,
  icon,
  label,
  maxAmount = 90,
  onChange,
  supportingText,
}: {
  amount: number;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  maxAmount?: number;
  onChange: (amount: number) => void;
  supportingText?: string;
}) {
  const safeMaximum = Math.max(0, maxAmount);
  const finiteAmount = Number.isFinite(amount) ? amount : 0;
  const safeAmount = Math.min(safeMaximum, Math.max(0, finiteAmount));
  const canDecrease = !disabled && safeAmount >= MONEY_AMOUNT_STEP;
  const canIncrease = !disabled && safeAmount + MONEY_AMOUNT_STEP <= safeMaximum;

  return (
    <SurfaceCard elevated style={styles.card}>
      <View style={styles.heading}>
        {icon ? (
          <View accessible={false} style={styles.categoryIcon}>
            <Ionicons
              accessible={false}
              color={appColors.primary}
              name={icon}
              size={spacing.s22}
            />
          </View>
        ) : null}
        <View style={styles.headingCopy}>
          {supportingText ? (
            <>
              <AppText tone="brand" variant="label">
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
      </View>
      <View accessibilityLabel={`${label}: ${safeAmount} kr`} style={styles.controls}>
        <SecondaryButton
          accessibilityLabel={`Remove ${MONEY_AMOUNT_STEP} kr from ${label}`}
          disabled={!canDecrease}
          label={`− ${MONEY_AMOUNT_STEP}`}
          onPress={() => onChange(Math.max(0, safeAmount - MONEY_AMOUNT_STEP))}
          style={styles.button}
        />
        <View accessibilityLiveRegion="polite" style={styles.amount}>
          <AppText tone="inverse" variant="cardTitle">{safeAmount} kr</AppText>
        </View>
        <SecondaryButton
          accessibilityLabel={`Add ${MONEY_AMOUNT_STEP} kr to ${label}`}
          disabled={!canIncrease}
          label={`+ ${MONEY_AMOUNT_STEP}`}
          onPress={() => onChange(Math.min(safeMaximum, safeAmount + MONEY_AMOUNT_STEP))}
          style={styles.button}
        />
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    borderColor: appColors.borderStrong,
    padding: space.md,
  },
  heading: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: space.md,
  },
  categoryIcon: {
    alignItems: 'center',
    backgroundColor: appColors.primarySoft,
    borderColor: appColors.border,
    borderRadius: radii.large,
    borderWidth: 1,
    height: spacing.s48,
    justifyContent: 'center',
    marginRight: space.sm,
    width: spacing.s48,
  },
  headingCopy: {
    flex: 1,
    minWidth: 0,
  },
  objectName: {
    marginTop: space.xxs,
  },
  controls: {
    alignItems: 'center',
    backgroundColor: appColors.canvasSoft,
    borderRadius: radii.large,
    flexDirection: 'row',
    gap: space.xxs,
    padding: space.xxs,
  },
  button: {
    flex: 1,
    minWidth: spacing.s58,
    paddingHorizontal: space.xs,
  },
  amount: {
    alignItems: 'center',
    backgroundColor: appColors.primary,
    borderColor: appColors.primary,
    borderRadius: radii.large,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: spacing.s62,
    minWidth: spacing.s76,
    paddingHorizontal: space.sm,
  },
});
