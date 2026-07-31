import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Image, StyleSheet, View } from 'react-native';
import { AppText, Screen, SurfaceCard } from '../components/ui';
import { CloudScreen } from '../screens/CloudScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { FamilyScreen } from '../screens/FamilyScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ProfileSetupScreen } from '../screens/setup/ProfileSetupScreen';
import { TodayScreen } from '../screens/TodayScreen';
import { WisdomFlowScreen } from '../screens/WisdomFlowScreen';
import { useAppState } from '../state/useAppState';
import { appColors, layout, radii, space } from '../theme';
import { RootStackParamList } from '../types/wisdom';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isRestoring, profile, resetRevision, restoreError } = useAppState();

  if (isRestoring) {
    return (
      <Screen contentContainerStyle={styles.stateScreen} scroll={false}>
        <View style={styles.avatarFrame}>
          <Image
            accessibilityIgnoresInvertColors
            accessible={false}
            source={require('../../assets/cloud/cloud-avatar.png')}
            style={styles.cloud}
          />
        </View>
        <AppText accessibilityLiveRegion="polite" style={styles.loadingText} tone="secondary">
          Getting CloudWise ready…
        </AppText>
      </Screen>
    );
  }

  if (restoreError) {
    return (
      <Screen contentContainerStyle={styles.stateScreen}>
        <SurfaceCard elevated style={styles.errorCard} tone="caution">
          <View style={styles.avatarFrame}>
            <Image
              accessibilityIgnoresInvertColors
              accessible={false}
              source={require('../../assets/cloud/cloud-avatar.png')}
              style={styles.cloud}
            />
          </View>
          <AppText accessibilityRole="header" style={styles.errorTitle} variant="cardTitle">
            CloudWise needs a moment
          </AppText>
          <AppText style={styles.errorText} tone="secondary" variant="supporting">
            Close and reopen the app to try restoring this profile again.
          </AppText>
        </SurfaceCard>
      </Screen>
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
  stateScreen: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingBottom: space.xl,
  },
  avatarFrame: {
    alignItems: 'center',
    backgroundColor: appColors.warmGoldSoft,
    borderColor: appColors.surface,
    borderRadius: radii.round,
    borderWidth: 4,
    height: 116,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 116,
  },
  cloud: {
    height: 108,
    width: 108,
  },
  loadingText: {
    marginTop: space.sm,
    textAlign: 'center',
  },
  errorCard: {
    alignItems: 'center',
    maxWidth: 380,
    padding: layout.cardPadding,
    width: '100%',
  },
  errorTitle: {
    marginTop: space.md,
    textAlign: 'center',
  },
  errorText: {
    marginTop: space.xs,
    textAlign: 'center',
  },
});
