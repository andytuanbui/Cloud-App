import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AgeSelector } from '../../components/profile/AgeSelector';
import { ProfileNameField } from '../../components/profile/ProfileNameField';
import { SetupProgress } from '../../components/profile/SetupProgress';
import { WisdomButton } from '../../components/mvp/WisdomButton';
import {
  getProfileNameError,
  isValidProfileAge,
  normalizeProfileName,
  validateProfileDetails,
} from '../../state/profileValidation';
import { useAppState } from '../../state/useAppState';

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
  const nameInput = useRef<TextInput>(null);
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
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <SetupProgress step={stepNumber[step]} />

          {step !== 'welcome' && (
            <Pressable
              accessibilityLabel="Go back"
              accessibilityRole="button"
              onPress={goBack}
              style={({ pressed }) => [styles.back, pressed && styles.pressed]}
            >
              <Ionicons name="arrow-back" size={22} color="#24405F" />
            </Pressable>
          )}

          {step === 'welcome' && (
            <View style={styles.step}>
              <Image
                accessibilityIgnoresInvertColors
                accessible={false}
                source={require('../../../assets/cloud/cloud-avatar.png')}
                style={styles.cloud}
              />
              <Text accessibilityRole="header" style={styles.title}>Welcome to CloudWise</Text>
              <Text style={styles.body}>
                Cloud helps children practice thoughtful choices, useful habits, and everyday confidence.
              </Text>
              <View style={styles.supportCard}>
                <Ionicons name="people-outline" size={22} color="#357262" />
                <Text style={styles.supportText}>
                  A parent or trusted grown-up can help younger children set up this profile.
                </Text>
              </View>
              <View style={styles.action}>
                <WisdomButton label="Set up profile" onPress={() => setStep('name')} />
              </View>
            </View>
          )}

          {step === 'name' && (
            <View style={styles.step}>
              <Text accessibilityLiveRegion="polite" accessibilityRole="header" style={styles.title}>
                What should Cloud call you?
              </Text>
              <Text style={styles.body}>Use a first name or nickname.</Text>
              <View style={styles.form}>
                <ProfileNameField
                  ref={nameInput}
                  autoFocus
                  error={nameError}
                  onChangeText={(value) => {
                    setName(value);
                    updateProfileDraft({ name: value });
                    if (showNameError) setShowNameError(true);
                  }}
                  onSubmitEditing={advanceName}
                  value={name}
                />
              </View>
              <View style={styles.action}>
                <WisdomButton
                  label="Continue"
                  onPress={advanceName}
                />
              </View>
            </View>
          )}

          {step === 'age' && (
            <View style={styles.step}>
              <Text accessibilityLiveRegion="polite" accessibilityRole="header" style={styles.title}>
                How old are you?
              </Text>
              <Text style={styles.body}>
                This helps CloudWise keep future explanations suitable for you.
              </Text>
              <View style={styles.form}>
                <AgeSelector
                  selectedAge={age}
                  onSelect={(selectedAge) => {
                    setAge(selectedAge);
                    updateProfileDraft({ age: selectedAge });
                  }}
                />
              </View>
              <View style={styles.action}>
                <WisdomButton
                  disabled={!isValidProfileAge(age)}
                  label="Continue"
                  onPress={() => setStep('ready')}
                />
              </View>
            </View>
          )}

          {step === 'ready' && (
            <View style={styles.step}>
              <View style={styles.readyIcon}>
                <Ionicons name="checkmark" size={34} color="#FFFFFF" />
              </View>
              <Text accessibilityLiveRegion="polite" accessibilityRole="header" style={styles.title}>
                Your profile is ready
              </Text>
              <Text style={styles.body}>
                {normalizeProfileName(name)}, your first Wisdom is waiting.
              </Text>
              <View style={styles.summaryCard}>
                <SummaryRow label="Name" value={normalizeProfileName(name)} />
                <View style={styles.divider} />
                <SummaryRow label="Age" value={age === null ? 'Not selected' : String(age)} />
              </View>
              <View style={styles.privacy}>
                <Ionicons name="lock-closed-outline" size={19} color="#4A6961" />
                <Text style={styles.privacyText}>
                  Your profile and progress are stored on this device for now.
                </Text>
              </View>
              <View style={styles.action}>
                <WisdomButton label="Open CloudWise" onPress={openCloudWise} />
                <View style={styles.secondaryAction}>
                  <WisdomButton
                    label="Change details"
                    onPress={() => setStep('name')}
                    secondary
                  />
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#F5FAF8', flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 28, paddingHorizontal: 20, paddingTop: 18 },
  container: { alignSelf: 'center', flex: 1, maxWidth: 500, width: '100%' },
  step: { alignItems: 'center', flex: 1 },
  back: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderColor: '#D7E3DF',
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    marginBottom: 16,
    width: 44,
  },
  pressed: { opacity: 0.7 },
  cloud: { height: 148, marginBottom: 14, width: 148 },
  title: { color: '#172A43', fontSize: 29, fontWeight: '900', lineHeight: 35, textAlign: 'center' },
  body: { color: '#546762', fontSize: 16, lineHeight: 24, marginTop: 10, maxWidth: 420, textAlign: 'center' },
  supportCard: {
    alignItems: 'center',
    backgroundColor: '#E9F5F1',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 11,
    marginTop: 24,
    padding: 16,
    width: '100%',
  },
  supportText: { color: '#36564E', flex: 1, fontSize: 14, lineHeight: 21 },
  form: { marginTop: 28, width: '100%' },
  action: { marginTop: 'auto', paddingTop: 28, width: '100%' },
  secondaryAction: { marginTop: 10 },
  readyIcon: {
    alignItems: 'center',
    backgroundColor: '#347564',
    borderRadius: 35,
    height: 70,
    justifyContent: 'center',
    marginBottom: 16,
    width: 70,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0EAE7',
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 24,
    paddingHorizontal: 18,
    width: '100%',
  },
  summaryRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', minHeight: 58 },
  summaryLabel: { color: '#657570', fontSize: 14, fontWeight: '700' },
  summaryValue: { color: '#172A43', flexShrink: 1, fontSize: 16, fontWeight: '900', textAlign: 'right' },
  divider: { backgroundColor: '#E5ECEA', height: 1 },
  privacy: {
    alignItems: 'flex-start',
    backgroundColor: '#EDF4F2',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 9,
    marginTop: 16,
    padding: 14,
    width: '100%',
  },
  privacyText: { color: '#4A625C', flex: 1, fontSize: 13, lineHeight: 19 },
});
