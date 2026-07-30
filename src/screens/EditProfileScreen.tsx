import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WisdomButton } from '../components/mvp/WisdomButton';
import { AgeSelector } from '../components/profile/AgeSelector';
import { ProfileNameField } from '../components/profile/ProfileNameField';
import {
  getProfileNameError,
  validateProfileDetails,
} from '../state/profileValidation';
import { useAppState } from '../state/useAppState';
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
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable
              accessibilityLabel="Cancel editing"
              accessibilityRole="button"
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [styles.back, pressed && styles.pressed]}
            >
              <Ionicons name="close" size={23} color="#24405F" />
            </Pressable>
            <Text accessibilityRole="header" style={styles.title}>Edit profile</Text>
            <View style={styles.headerSpacer} />
          </View>

          <Text style={styles.intro}>
            Update the name Cloud uses and the child’s age.
          </Text>

          <View style={styles.card}>
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
          </View>

          <View style={styles.actions}>
            <WisdomButton
              disabled={!validation.valid || unchanged}
              label="Save changes"
              onPress={save}
            />
            <View style={styles.cancel}>
              <WisdomButton label="Cancel" onPress={() => navigation.goBack()} secondary />
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#F5FAF8', flex: 1 },
  content: { flexGrow: 1, paddingBottom: 28, paddingHorizontal: 20, paddingTop: 14 },
  container: { alignSelf: 'center', flex: 1, maxWidth: 500, width: '100%' },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  back: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D7E3DF',
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  pressed: { opacity: 0.7 },
  title: { color: '#172A43', fontSize: 25, fontWeight: '900' },
  headerSpacer: { width: 44 },
  intro: { color: '#596A65', fontSize: 15, lineHeight: 22, marginTop: 22, textAlign: 'center' },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E1EAE7',
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 24,
    padding: 18,
  },
  ageField: { marginTop: 24 },
  actions: { marginTop: 'auto', paddingTop: 24 },
  cancel: { marginTop: 10 },
});
