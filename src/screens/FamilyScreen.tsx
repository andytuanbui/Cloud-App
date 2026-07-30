import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { BottomNav } from '../components/BottomNav';

export function FamilyScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.icon}><Ionicons name="people" size={42} color="#695A8C" /></View>
        <Text style={styles.title}>Family</Text>
        <Text style={styles.body}>A quiet place for families to support Habits, Confidence, and Growth is coming later.</Text>
      </View>
      <BottomNav active="Family" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#F5FAF8', flex: 1 },
  content: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 32 },
  icon: { alignItems: 'center', backgroundColor: '#EEE8F8', borderRadius: 45, height: 90, justifyContent: 'center', width: 90 },
  title: { color: '#172A43', fontSize: 28, fontWeight: '900', marginTop: 18 },
  body: { color: '#596A65', fontSize: 16, lineHeight: 24, marginTop: 10, textAlign: 'center' },
});
