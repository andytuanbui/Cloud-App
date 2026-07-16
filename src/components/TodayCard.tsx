import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, Text, View } from 'react-native';
import { colors } from '../theme';
import { styles } from '../theme/styles';
import { WisdomWorld } from '../types/wisdom';

export function TodayCard({ world, onOpen }: { world: WisdomWorld; onOpen: () => void }) {
  return (
    <Pressable style={styles.todayShadow} onPress={onOpen}>
      <LinearGradient colors={world.heroColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.todayCard}>
        <Image source={world.heroImage} style={styles.todayArt} resizeMode="cover" />
        <LinearGradient
          colors={colors.gradient.todayTextFade}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.todayTextGradient}
        />
        <View style={styles.todayCopy}>
          <View style={styles.todayPill}>
            <Text style={styles.todayPillText}>TODAY'S GROWTH</Text>
          </View>
          <Text style={styles.todayTitle}>{world.heroTitle}</Text>
          <Text style={styles.todayDescription}>{world.heroDescription}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={15} color={colors.text.primary} />
            <Text style={styles.metaText}>{world.heroMinutes} min</Text>
            <View style={styles.metaDot} />
            <Text style={styles.metaText}>Growing</Text>
          </View>
          <View style={styles.continueButton}>
            <Text style={styles.continueText}>Continue</Text>
            <View style={styles.playButton}>
              <Ionicons name="play" size={16} color={colors.text.navyDeep} />
            </View>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}
