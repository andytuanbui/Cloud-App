import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  BackHandler,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { AgeSelector } from '../../components/profile/AgeSelector';
import { ProfileNameField } from '../../components/profile/ProfileNameField';
import { SetupProgress } from '../../components/profile/SetupProgress';
import {
  AppText,
  IconButton,
  PrimaryButton,
  Screen,
  SecondaryButton,
  StatusPanel,
  SurfaceCard,
} from '../../components/ui';
import {
  getProfileNameError,
  isValidProfileAge,
  normalizeProfileName,
  validateProfileDetails,
} from '../../state/profileValidation';
import { useAppState } from '../../state/useAppState';
import { appColors, layout, radii, shadows, space } from '../../theme';

type SetupStep = 'welcome' | 'name' | 'age' | 'ready';
const stepNumber: Record<SetupStep, number> = {
  welcome: 1,
  name: 2,
  age: 3,
  ready: 4,
};

export function ProfileSetupScreen() {
  const { profile, updateProfileDraft, completeProfileSetup } = useAppState();
  const [step, setStep] = useState<SetupStep>('welcome');
  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState<number | null>(profile.age);
  const [showNameError, setShowNameError] = useState(false);
  const nameError = showNameError ? getProfileNameError(name) : undefined;

  const goBack = () => {
    if (step === 'name') setStep('welcome');
    if (step === 'age') setStep('name');
    if (step === 'ready') setStep('age');
  };

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (step === 'welcome') return false;
      goBack();
      return true;
    });
    return () => subscription.remove();
  }, [step]);

  const advanceName = () => {
    const error = getProfileNameError(name);
    setShowNameError(true);
    if (error) return;
    const normalized = normalizeProfileName(name);
    setName(normalized);
    updateProfileDraft({ name: normalized });
    setStep('age');
  };

  const openCloudWise = () => {
    const validation = validateProfileDetails(name, age);
    if (!validation.valid) {
      setShowNameError(Boolean(validation.nameError));
      setStep(validation.nameError ? 'name' : 'age');
      return;
    }
    completeProfileSetup(validation.value);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardArea}
    >
      <Screen
        contentContainerStyle={styles.screenContent}
        scrollProps={{
          keyboardDismissMode: Platform.OS === 'ios' ? 'interactive' : 'on-drag',
          keyboardShouldPersistTaps: 'handled',
        }}
      >
        <View style={styles.container}>
          <SetupProgress step={stepNumber[step]} />

          {step !== 'welcome' && (
            <View style={styles.backRow}>
              <IconButton accessibilityLabel="Go back" icon="arrow-back" onPress={goBack} />
            </View>
          )}

          {step === 'welcome' && (
            <View style={styles.step}>
              <LinearGradient
                colors={[appColors.warmGoldSoft, appColors.primarySoft]}
                style={styles.hero}
              >
                <Image
                  accessibilityIgnoresInvertColors
                  accessible={false}
                  resizeMode="contain"
                  source={require('../../../assets/cloud/cloud-hero-wave.png')}
                  style={styles.heroImage}
                />
              </LinearGradient>
              <AppText accessibilityRole="header" style={styles.title} variant="display">
                Welcome to CloudWise
              </AppText>
              <AppText style={styles.body} tone="secondary" variant="body">
                Cloud helps children practice thoughtful choices, useful habits, and everyday confidence.
              </AppText>
              <View style={styles.statusWrap}>
                <StatusPanel
                  icon="people-outline"
                  title="A parent or trusted grown-up can help younger children set up this profile."
                />
              </View>
              <View style={styles.action}>
                <PrimaryButton
                  label="Set up profile"
                  onPress={() => setStep('name')}
                  testID="setup-cta-begin"
                />
              </View>
            </View>
          )}

          {step === 'name' && (
            <View style={styles.step}>
              <AppText
                accessibilityLiveRegion="polite"
                accessibilityRole="header"
                style={styles.title}
                variant="screenTitle"
              >
                What should Cloud call you?
              </AppText>
              <AppText style={styles.body} tone="secondary" variant="body">
                Use a first name or nickname.
              </AppText>
              <SurfaceCard elevated style={styles.formCard}>
                <ProfileNameField
                  error={nameError}
                  onChangeText={(value) => {
                    setName(value);
                    updateProfileDraft({ name: value });
                    if (showNameError) setShowNameError(true);
                  }}
                  onSubmitEditing={advanceName}
                  value={name}
                />
              </SurfaceCard>
              <View style={styles.action}>
                <PrimaryButton
                  label="Continue"
                  onPress={advanceName}
                  testID="setup-cta-name-continue"
                />
              </View>
            </View>
          )}

          {step === 'age' && (
            <View style={styles.step}>
              <AppText
                accessibilityLiveRegion="polite"
                accessibilityRole="header"
                style={styles.title}
                variant="screenTitle"
              >
                How old are you?
              </AppText>
              <AppText style={styles.body} tone="secondary" variant="body">
                This helps CloudWise keep future explanations suitable for you.
              </AppText>
              <SurfaceCard elevated style={styles.formCard}>
                <AgeSelector
                  selectedAge={age}
                  onSelect={(selectedAge) => {
                    setAge(selectedAge);
                    updateProfileDraft({ age: selectedAge });
                  }}
                />
              </SurfaceCard>
              <View style={styles.action}>
                <PrimaryButton
                  disabled={!isValidProfileAge(age)}
                  label="Continue"
                  onPress={() => setStep('ready')}
                  testID="setup-cta-age-continue"
                />
              </View>
            </View>
          )}

          {step === 'ready' && (
            <View style={styles.step}>
              <View style={styles.readyIcon}>
                <Ionicons name="checkmark" size={34} color={appColors.onPrimary} />
              </View>
              <AppText
                accessibilityLiveRegion="polite"
                accessibilityRole="header"
                style={styles.title}
                variant="screenTitle"
              >
                Your profile is ready
              </AppText>
              <AppText style={styles.body} tone="secondary" variant="body">
                {normalizeProfileName(name)}, your first Wisdom is waiting.
              </AppText>
              <SurfaceCard elevated style={styles.summaryCard}>
                <SummaryRow label="Name" value={normalizeProfileName(name)} />
                <View style={styles.divider} />
                <SummaryRow label="Age" value={age === null ? 'Not selected' : String(age)} />
              </SurfaceCard>
              <View style={styles.privacyWrap}>
                <StatusPanel
                  icon="lock-closed-outline"
                  title="Your profile and progress are stored on this device for now."
                />
              </View>
              <View style={styles.action}>
                <PrimaryButton
                  label="Open CloudWise"
                  onPress={openCloudWise}
                  testID="setup-cta-open"
                />
                <View style={styles.secondaryAction}>
                  <SecondaryButton label="Change details" onPress={() => setStep('name')} />
                </View>
              </View>
            </View>
          )}
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <AppText tone="muted" variant="label">
        {label}
      </AppText>
      <AppText style={styles.summaryValue} variant="body">
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  keyboardArea: {
    backgroundColor: appColors.canvas,
    flex: 1,
  },
  screenContent: {
    flexGrow: 1,
    paddingBottom: space.xl,
    paddingTop: space.md,
  },
  container: {
    alignSelf: 'center',
    flex: 1,
    maxWidth: layout.maxContentWidth,
    width: '100%',
  },
  step: {
    alignItems: 'center',
    width: '100%',
  },
  backRow: {
    alignSelf: 'stretch',
    marginBottom: space.md,
  },
  hero: {
    alignItems: 'center',
    borderRadius: radii.hero,
    height: 190,
    justifyContent: 'flex-end',
    marginBottom: space.lg,
    maxWidth: 420,
    overflow: 'hidden',
    width: '100%',
    ...shadows.card,
  },
  heroImage: {
    bottom: -68,
    height: 270,
    position: 'absolute',
    width: 180,
  },
  title: {
    maxWidth: 440,
    textAlign: 'center',
  },
  body: {
    marginTop: space.sm,
    maxWidth: 440,
    textAlign: 'center',
  },
  statusWrap: {
    marginTop: space.xl,
    width: '100%',
  },
  formCard: {
    marginTop: space.xl,
    padding: layout.cardPadding,
    width: '100%',
  },
  action: {
    marginTop: space.xl,
    width: '100%',
  },
  secondaryAction: {
    marginTop: space.sm,
  },
  readyIcon: {
    alignItems: 'center',
    backgroundColor: appColors.primary,
    borderColor: appColors.warmGoldSoft,
    borderRadius: radii.round,
    borderWidth: 5,
    height: 74,
    justifyContent: 'center',
    marginBottom: space.md,
    width: 74,
    ...shadows.subtle,
  },
  summaryCard: {
    marginTop: space.xl,
    paddingHorizontal: layout.cardPadding,
    width: '100%',
  },
  summaryRow: {
    alignItems: 'center',
    columnGap: space.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 60,
    paddingVertical: space.xs,
  },
  summaryValue: {
    flexShrink: 1,
    fontWeight: '700',
    textAlign: 'right',
  },
  divider: {
    backgroundColor: appColors.border,
    height: 1,
  },
  privacyWrap: {
    marginTop: space.md,
    width: '100%',
  },
});
