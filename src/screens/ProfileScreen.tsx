import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, StyleSheet, View } from 'react-native';
import { BottomNav } from '../components/BottomNav';
import { AppText, Screen, SecondaryButton, SurfaceCard } from '../components/ui';
import { useAppState } from '../state/useAppState';
import { appColors, layout, radii, space } from '../theme';
import { RootStackParamList } from '../types/wisdom';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export function ProfileScreen({ navigation }: Props) {
  const { profile, wisdomProgress } = useAppState();
  const completed = Object.values(wisdomProgress).filter((item) => item.completed).length;

  return (
    <Screen
      bottomNavigation={<BottomNav active="Profile" />}
      contentContainerStyle={styles.content}
    >
      <AppText accessibilityRole="header" variant="screenTitle">
        Profile
      </AppText>

      <SurfaceCard elevated style={styles.profileHeader}>
        <View style={styles.avatarHalo}>
          <View style={styles.avatar}>
            <Image
              accessible={false}
              accessibilityIgnoresInvertColors
              source={require('../../assets/cloud/cloud-avatar.png')}
              style={styles.avatarImage}
            />
          </View>
        </View>
        <AppText style={styles.name} variant="cardTitle">
          {profile.name}
        </AppText>
        <View style={styles.identityPill}>
          <Ionicons color={appColors.warmGold} name="sparkles" size={16} />
          <AppText tone="brand" variant="label">
            {profile.currentIdentity}
          </AppText>
        </View>
      </SurfaceCard>

      <SurfaceCard elevated style={styles.card}>
        <ProfileRow label="Name" value={profile.name} />
        <View style={styles.divider} />
        <ProfileRow label="Age" value={profile.age === null ? 'Not set' : String(profile.age)} />
        <View style={styles.divider} />
        <ProfileRow label="Current Identity" value={profile.currentIdentity} />
        <View style={styles.divider} />
        <ProfileRow label="Wisdoms completed" value={String(completed)} />
      </SurfaceCard>

      <View style={styles.action}>
        <SecondaryButton
          icon="create-outline"
          label="Edit profile"
          onPress={() => navigation.navigate('EditProfile')}
        />
      </View>
    </Screen>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <AppText style={styles.label} tone="muted" variant="label">
        {label}
      </AppText>
      <AppText style={styles.value} variant="supporting">
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: space.xl,
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: appColors.warmGoldSoft,
    marginTop: space.lg,
    overflow: 'hidden',
    padding: layout.cardPadding,
  },
  avatarHalo: {
    alignItems: 'center',
    backgroundColor: appColors.surfaceOverlaySoft,
    borderRadius: radii.round,
    height: 116,
    justifyContent: 'center',
    width: 116,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: appColors.primarySoft,
    borderColor: appColors.surface,
    borderRadius: radii.round,
    borderWidth: 4,
    height: 100,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 100,
  },
  avatarImage: {
    height: 100,
    width: 100,
  },
  name: {
    marginTop: space.sm,
    textAlign: 'center',
  },
  identityPill: {
    alignItems: 'center',
    backgroundColor: appColors.surfaceOverlay,
    borderColor: appColors.border,
    borderRadius: radii.round,
    borderWidth: 1,
    columnGap: space.xs,
    flexDirection: 'row',
    marginTop: space.xs,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
  },
  card: {
    marginTop: space.lg,
    paddingHorizontal: layout.cardPadding,
  },
  row: {
    alignItems: 'center',
    columnGap: space.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 60,
    paddingVertical: space.sm,
  },
  label: {
    flexBasis: 128,
    flexGrow: 1,
  },
  value: {
    flexShrink: 1,
    fontWeight: '800',
    textAlign: 'right',
  },
  divider: {
    backgroundColor: appColors.border,
    height: 1,
  },
  action: {
    marginTop: space.lg,
  },
});
