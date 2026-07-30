import { Image, StyleSheet, Text, View } from 'react-native';
import { BottomNav } from '../components/BottomNav';

export function CloudScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <Image source={require('../../assets/cloud/cloud-avatar.png')} style={styles.cloud} />
        <Text style={styles.title}>Cloud is here to listen</Text>
        <Text style={styles.body}>You can talk with Cloud inside today’s Wisdom. More guided conversations will be added later.</Text>
      </View>
      <BottomNav active="Cloud" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#F5FAF8', flex: 1 },
  content: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 32 },
  cloud: { height: 150, width: 150 },
  title: { color: '#172A43', fontSize: 27, fontWeight: '900', marginTop: 12, textAlign: 'center' },
  body: { color: '#596A65', fontSize: 16, lineHeight: 24, marginTop: 10, textAlign: 'center' },
});
