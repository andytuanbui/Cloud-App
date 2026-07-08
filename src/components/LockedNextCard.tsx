import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, Text, View } from 'react-native';
import { styles } from '../theme/styles';
import { WisdomWorld } from '../types/wisdom';

export function LockedNextCard({ world, onOpen }: { world: WisdomWorld; onOpen: () => void }) {
  return (
    <Pressable onPress={onOpen}>
      <LinearGradient colors={world.lockedColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.lockedCard}>
        <Image source={world.lockedImage} style={[styles.lockedArt, styles.lockedIllustrationFade]} resizeMode="cover" />
        <LinearGradient
          colors={['rgba(7,10,28,0.82)', 'rgba(7,10,28,0.42)', 'rgba(7,10,28,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.lockedGradient}
        />
        <View style={styles.lockedCopy}>
          <View style={styles.lockedTop}>
            <Ionicons name="lock-closed" size={13} color="#E8ECF6" />
            <Text style={styles.lockedStatus}>Unlocks Tomorrow</Text>
          </View>
          <Text style={styles.lockedTitle}>{world.lockedTitle}</Text>
          <Text style={styles.lockedDescription}>{world.lockedDescription}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={14} color="#FFFFFF" />
            <Text style={styles.metaText}>{world.lockedMinutes} min</Text>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}
