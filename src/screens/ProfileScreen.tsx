import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BottomNav } from '../components/BottomNav';
import { WisdomButton } from '../components/mvp/WisdomButton';
import { useAppState } from '../state/useAppState';
import { RootStackParamList } from '../types/wisdom';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export function ProfileScreen({ navigation }: Props) {
  const { profile, wisdomProgress } = useAppState();
  const completed = Object.values(wisdomProgress).filter((item) => item.completed).length;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text accessibilityRole="header" style={styles.title}>Profile</Text>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Image
              accessible={false}
              source={require('../../assets/cloud/cloud-avatar.png')}
              style={styles.avatarImage}
            />
          </View>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.identity}>{profile.currentIdentity}</Text>
        </View>

        <View style={styles.card}>
          <ProfileRow label="Name" value={profile.name} />
          <View style={styles.divider} />
          <ProfileRow label="Age" value={profile.age === null ? 'Not set' : String(profile.age)} />
          <View style={styles.divider} />
          <ProfileRow label="Current Identity" value={profile.currentIdentity} />
          <View style={styles.divider} />
          <ProfileRow label="Wisdoms completed" value={String(completed)} />
        </View>

        <View style={styles.action}>
          <WisdomButton
            label="Edit profile"
            onPress={() => navigation.navigate('EditProfile')}
            secondary
          />
        </View>
      </ScrollView>
      <BottomNav active="Profile" />
    </View>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#F5FAF8', flex: 1 },
  content: { paddingBottom: 28, paddingHorizontal: 20 },
  title: { color: '#172A43', fontSize: 30, fontWeight: '900', marginTop: 12 },
  profileHeader: { alignItems: 'center', marginTop: 22 },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#DCEEF4',
    borderRadius: 48,
    height: 96,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 96,
  },
  avatarImage: { height: 90, width: 90 },
  name: { color: '#172A43', fontSize: 27, fontWeight: '900', marginTop: 12 },
  identity: { color: '#377565', fontSize: 15, fontWeight: '800', marginTop: 4 },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E1EAE7',
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 24,
    paddingHorizontal: 18,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 60,
  },
  label: { color: '#63736F', fontSize: 14, fontWeight: '700' },
  value: {
    color: '#172A43',
    flexShrink: 1,
    fontSize: 15,
    fontWeight: '900',
    marginLeft: 16,
    textAlign: 'right',
  },
  divider: { backgroundColor: '#E6ECEA', height: 1 },
  action: { marginTop: 18 },
});
