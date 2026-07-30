import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { BottomNav } from '../components/BottomNav';
import { useAppState } from '../state/useAppState';

export function ProfileScreen() {
  const { profile, wisdomProgress } = useAppState();
  const completed = Object.values(wisdomProgress).filter((item) => item.completed).length;
  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.avatar}><Ionicons name="person" size={40} color="#245A7A" /></View>
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.identity}>{profile.currentIdentity}</Text>
        <View style={styles.card}>
          <Text style={styles.value}>{completed}</Text>
          <Text style={styles.label}>Wisdoms completed</Text>
          <Text style={styles.note}>Every thoughtful choice is Practice for the next one.</Text>
        </View>
      </View>
      <BottomNav active="Profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#F5FAF8', flex: 1 },
  content: { alignItems: 'center', flex: 1, padding: 24, paddingTop: 60 },
  avatar: { alignItems: 'center', backgroundColor: '#DCEEF4', borderRadius: 45, height: 90, justifyContent: 'center', width: 90 },
  name: { color: '#172A43', fontSize: 28, fontWeight: '900', marginTop: 16 },
  identity: { color: '#377565', fontSize: 16, fontWeight: '800', marginTop: 4 },
  card: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 22, marginTop: 30, padding: 24, width: '100%' },
  value: { color: '#173A61', fontSize: 35, fontWeight: '900' },
  label: { color: '#324B47', fontSize: 16, fontWeight: '800' },
  note: { color: '#687873', fontSize: 14, lineHeight: 21, marginTop: 16, textAlign: 'center' },
});
