import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Image, StyleSheet, Text, View } from 'react-native';
import { CloudScreen } from '../screens/CloudScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { FamilyScreen } from '../screens/FamilyScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ProfileSetupScreen } from '../screens/setup/ProfileSetupScreen';
import { TodayScreen } from '../screens/TodayScreen';
import { WisdomFlowScreen } from '../screens/WisdomFlowScreen';
import { useAppState } from '../state/useAppState';
import { RootStackParamList } from '../types/wisdom';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isRestoring, profile, resetRevision, restoreError } = useAppState();

  if (isRestoring) {
    return (
      <View style={styles.loading}>
        <Image source={require('../../assets/cloud/cloud-avatar.png')} style={styles.cloud} />
        <Text style={styles.loadingText}>Getting CloudWise ready…</Text>
      </View>
    );
  }

  if (restoreError) {
    return (
      <View style={styles.loading}>
        <Image source={require('../../assets/cloud/cloud-avatar.png')} style={styles.cloud} />
        <Text accessibilityRole="header" style={styles.errorTitle}>CloudWise needs a moment</Text>
        <Text style={styles.errorText}>Close and reopen the app to try restoring this profile again.</Text>
      </View>
    );
  }

  if (!profile.setupCompleted) {
    return (
      <Stack.Navigator
        key={`setup-${resetRevision}`}
        initialRouteName="ProfileSetup"
        screenOptions={{ headerShown: false, animation: 'fade' }}
      >
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator
      key="production"
      initialRouteName="Today"
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="Today" component={TodayScreen} />
      <Stack.Screen name="WisdomFlow" component={WisdomFlowScreen} />
      <Stack.Screen name="Library" component={LibraryScreen} />
      <Stack.Screen name="Cloud" component={CloudScreen} />
      <Stack.Screen name="Family" component={FamilyScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: '#F5FAF8',
    flex: 1,
    justifyContent: 'center',
  },
  cloud: { height: 92, width: 92 },
  loadingText: { color: '#40534E', fontSize: 16, fontWeight: '700', marginTop: 12 },
  errorTitle: { color: '#172A43', fontSize: 22, fontWeight: '900', marginTop: 14 },
  errorText: { color: '#596A65', fontSize: 15, lineHeight: 22, marginTop: 7, maxWidth: 320, textAlign: 'center' },
});
