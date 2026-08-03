import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, View } from 'react-native';
import { BottomNav } from '../components/BottomNav';
import {
  AppText,
  PrimaryButton,
  Screen,
  SecondaryButton,
  SurfaceCard,
} from '../components/ui';
import { useAppState } from '../state/useAppState';
import { appColors, radii, shadows, space } from '../theme';

export function FamilyScreen() {
  const { profile, setVoiceFeaturesApprovedByParent } = useAppState();

  return (
    <Screen
      bottomNavigation={<BottomNav active="Family" />}
      contentContainerStyle={styles.content}
    >
      <AppText accessibilityRole="header" variant="screenTitle">
        Family
      </AppText>
      <AppText style={styles.intro} tone="secondary" variant="body">
        CloudWise grows stronger with support from the people who care for you.
      </AppText>

      <View style={styles.hero}>
        <Image
          accessibilityIgnoresInvertColors
          accessible={false}
          resizeMode="cover"
          source={require('../../assets/cloud/cloud-neighborhood-home.png')}
          style={styles.heroImage}
        />
      </View>

      <View style={styles.comingLater}>
        <View style={styles.icon}>
          <Ionicons color={appColors.primary} name="people" size={24} />
        </View>
        <View style={styles.message}>
          <AppText variant="label">Coming later</AppText>
          <AppText style={styles.body} tone="secondary" variant="supporting">
            A family space for supporting Habits, Confidence, and Growth is
            planned for a later release.
          </AppText>
        </View>
      </View>

      {__DEV__ ? (
        <SurfaceCard style={styles.voiceSettings} tone="soft">
          <View style={styles.voiceSettingsHeader}>
            <View style={styles.icon}>
              <Ionicons color={appColors.primary} name="mic-outline" size={24} />
            </View>
            <View style={styles.message}>
              <AppText variant="label">Cloud voice preview</AppText>
              <AppText style={styles.body} tone="secondary" variant="supporting">
                Cloud is an AI guide with an AI-made voice. Parent approval is
                required before a child can start the microphone. Conversations are
                not saved; only a short reflection can be kept.
              </AppText>
            </View>
          </View>
          <View style={styles.voiceAction}>
            {profile.voiceFeaturesApprovedByParent ? (
              <SecondaryButton
                icon="close-circle-outline"
                label="Remove Approval"
                onPress={() => setVoiceFeaturesApprovedByParent(false)}
              />
            ) : (
              <PrimaryButton
                icon="shield-checkmark-outline"
                label="Approve Voice Preview"
                onPress={() => setVoiceFeaturesApprovedByParent(true)}
              />
            )}
          </View>
          <AppText
            accessibilityLiveRegion="polite"
            style={styles.voiceStatus}
            tone={profile.voiceFeaturesApprovedByParent ? 'brand' : 'muted'}
            variant="caption"
          >
            {profile.voiceFeaturesApprovedByParent
              ? 'Approved on this device.'
              : 'Not approved on this device.'}
          </AppText>
        </SurfaceCard>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: space.xl,
  },
  intro: {
    marginTop: space.xs,
    maxWidth: 440,
  },
  hero: {
    alignSelf: 'center',
    borderRadius: radii.hero,
    height: 260,
    marginTop: space.lg,
    maxWidth: 440,
    overflow: 'hidden',
    width: '100%',
    ...shadows.card,
  },
  heroImage: {
    height: '100%',
    width: '100%',
  },
  comingLater: {
    alignItems: 'flex-start',
    alignSelf: 'center',
    flexDirection: 'row',
    marginTop: space.lg,
    maxWidth: 440,
    width: '100%',
  },
  icon: {
    alignItems: 'center',
    backgroundColor: appColors.primarySoft,
    borderRadius: radii.round,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  message: {
    flex: 1,
    marginLeft: space.sm,
  },
  body: {
    marginTop: space.xxs,
  },
  voiceSettings: {
    alignSelf: 'center',
    marginTop: space.lg,
    maxWidth: 440,
    padding: space.md,
    width: '100%',
  },
  voiceSettingsHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  voiceAction: {
    marginTop: space.md,
  },
  voiceStatus: {
    marginTop: space.xs,
    textAlign: 'center',
  },
});
