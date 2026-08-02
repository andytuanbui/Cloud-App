import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, StyleSheet, View } from 'react-native';
import { BottomNav } from '../components/BottomNav';
import { AppText, Screen, SurfaceCard, TextButton } from '../components/ui';
import { useAppState } from '../state/useAppState';
import { appColors, layout, radii, space } from '../theme';
import { RootStackParamList } from '../types/wisdom';
import { isWisdomLearned } from '../state/useDailyWisdoms';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export function ProfileScreen({ navigation }: Props) {
  const { profile, wisdomProgress } = useAppState();
  const learned = Object.values(wisdomProgress).filter(isWisdomLearned).length;

  return (
    <Screen
      bottomNavigation={<BottomNav active="Profile" />}
      contentContainerStyle={styles.content}
    >
      <View style={styles.heading}>
        <AppText accessibilityRole="header" variant="screenTitle">
          Profile
        </AppText>
        <TextButton
          icon="create-outline"
          label="Edit"
          onPress={() => navigation.navigate('EditProfile')}
          style={styles.editButton}
        />
      </View>

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
        <View style={styles.heroCopy}>
          <AppText style={styles.name} variant="cardTitle">
            {profile.name}
          </AppText>
          <AppText style={styles.identityLabel} tone="muted" variant="caption">
            Current Identity
          </AppText>
          <View style={styles.identity}>
            <Ionicons color={appColors.warmGold} name="sparkles" size={16} />
            <AppText tone="brand" variant="label">
              {profile.currentIdentity}
            </AppText>
          </View>
        </View>
      </SurfaceCard>

      <View style={styles.stats}>
        <SurfaceCard style={styles.statCard} tone="soft">
          <View style={styles.statIcon}>
            <Ionicons
              color={appColors.primary}
              name="calendar-outline"
              size={19}
            />
          </View>
          <AppText tone="muted" variant="caption">
            Age
          </AppText>
          <AppText style={styles.statValue} variant="sectionTitle">
            {profile.age === null ? 'Not set' : profile.age}
          </AppText>
        </SurfaceCard>

        <SurfaceCard style={styles.statCard} tone="soft">
          <View style={styles.statIcon}>
            <Ionicons
              color={appColors.primary}
              name="checkmark-circle-outline"
              size={20}
            />
          </View>
          <AppText tone="muted" variant="caption">
            Wisdoms learned
          </AppText>
          <AppText style={styles.statValue} variant="sectionTitle">
            {learned}
          </AppText>
        </SurfaceCard>
      </View>

      <View style={styles.growth}>
        <View style={styles.growthIcon}>
          <Ionicons color={appColors.wisdomGreen} name="leaf-outline" size={21} />
        </View>
        <View style={styles.growthCopy}>
          <AppText variant="label">Growth</AppText>
          <AppText tone="secondary" variant="supporting">
            Every Wisdom you practice helps your thinking grow.
          </AppText>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: space.lg,
  },
  heading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    paddingHorizontal: space.sm,
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: appColors.warmGoldSoft,
    flexDirection: 'row',
    marginTop: space.lg,
    overflow: 'hidden',
    padding: layout.cardPadding,
  },
  avatarHalo: {
    alignItems: 'center',
    backgroundColor: appColors.surfaceOverlaySoft,
    borderRadius: radii.round,
    flexShrink: 0,
    height: 104,
    justifyContent: 'center',
    width: 104,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: appColors.primarySoft,
    borderColor: appColors.surface,
    borderRadius: radii.round,
    borderWidth: 4,
    height: 90,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 90,
  },
  avatarImage: {
    height: 90,
    width: 90,
  },
  heroCopy: {
    flex: 1,
    marginLeft: space.md,
  },
  name: {
    flexShrink: 1,
  },
  identityLabel: {
    marginTop: space.xs,
  },
  identity: {
    alignItems: 'center',
    columnGap: space.xs,
    flexDirection: 'row',
    marginTop: space.xxs,
  },
  stats: {
    columnGap: space.sm,
    flexDirection: 'row',
    marginTop: space.md,
  },
  statCard: {
    flex: 1,
    minHeight: 132,
    padding: space.md,
  },
  statIcon: {
    alignItems: 'center',
    backgroundColor: appColors.surfaceOverlay,
    borderRadius: radii.round,
    height: 36,
    justifyContent: 'center',
    marginBottom: space.sm,
    width: 36,
  },
  statValue: {
    marginTop: space.xxs,
  },
  growth: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: space.lg,
  },
  growthIcon: {
    alignItems: 'center',
    backgroundColor: appColors.wisdomGreenSoft,
    borderRadius: radii.round,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  growthCopy: {
    flex: 1,
    marginLeft: space.sm,
  },
});
