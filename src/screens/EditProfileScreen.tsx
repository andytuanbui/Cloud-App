import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { AgeSelector } from '../components/profile/AgeSelector';
import { ProfileNameField } from '../components/profile/ProfileNameField';
import {
  AppText,
  IconButton,
  PrimaryButton,
  Screen,
  SecondaryButton,
  SurfaceCard,
} from '../components/ui';
import {
  getProfileNameError,
  validateProfileDetails,
} from '../state/profileValidation';
import { useAppState } from '../state/useAppState';
import { appColors, layout, space } from '../theme';
import { RootStackParamList } from '../types/wisdom';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

export function EditProfileScreen({ navigation }: Props) {
  const { profile, updateProfile } = useAppState();
  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState<number | null>(profile.age);
  const validation = validateProfileDetails(name, age);
  const normalizedName = name.trim();
  const unchanged = normalizedName === profile.name && age === profile.age;

  const save = () => {
    if (!validation.valid) return;
    if (updateProfile(validation.value)) navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardArea}
    >
      <Screen
        contentContainerStyle={styles.content}
        scrollProps={{
          keyboardDismissMode: Platform.OS === 'ios' ? 'interactive' : 'on-drag',
          keyboardShouldPersistTaps: 'handled',
        }}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <IconButton
              accessibilityLabel="Cancel editing"
              icon="close"
              onPress={() => navigation.goBack()}
            />
            <AppText accessibilityRole="header" variant="sectionTitle">
              Edit profile
            </AppText>
            <View style={styles.headerSpacer} />
          </View>

          <AppText style={styles.intro} tone="secondary" variant="body">
            Update the name Cloud uses and the child’s age.
          </AppText>

          <SurfaceCard elevated style={styles.card}>
            <ProfileNameField
              error={getProfileNameError(name)}
              onChangeText={setName}
              value={name}
            />
            <View style={styles.ageField}>
              <AgeSelector
                error={!validation.valid ? validation.ageError : undefined}
                onSelect={setAge}
                selectedAge={age}
              />
            </View>
          </SurfaceCard>

          <View style={styles.actions}>
            <PrimaryButton
              disabled={!validation.valid || unchanged}
              label="Save changes"
              onPress={save}
            />
            <View style={styles.cancel}>
              <SecondaryButton label="Cancel" onPress={() => navigation.goBack()} />
            </View>
          </View>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardArea: {
    backgroundColor: appColors.canvas,
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingBottom: space.xl,
    paddingTop: space.sm,
  },
  container: {
    alignSelf: 'center',
    flex: 1,
    maxWidth: layout.maxContentWidth,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerSpacer: {
    width: layout.minimumTouchTarget,
  },
  intro: {
    marginTop: space.lg,
    textAlign: 'center',
  },
  card: {
    marginTop: space.xl,
    padding: layout.cardPadding,
  },
  ageField: {
    marginTop: space.xl,
  },
  actions: {
    marginTop: space.xl,
  },
  cancel: {
    marginTop: space.sm,
  },
});
