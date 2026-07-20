import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Text, View } from 'react-native';
import { BottomNav } from '../components/BottomNav';
import { LoadingState } from '../components/LoadingState';
import { useAsyncResource } from '../hooks/useAsyncResource';
import { getCloudAvatar } from '../services/wisdomService';
import { colors } from '../theme';
import { styles } from '../theme/styles';
import { RootStackParamList } from '../types/wisdom';

type CloudScreenProps = NativeStackScreenProps<RootStackParamList, 'Cloud'>;

// The always-on companion isn't built yet - this is a real, honest landing
// spot rather than a dead tap, and the natural place to attach open
// conversation once that work starts.
export function CloudScreen({ navigation: _navigation }: CloudScreenProps) {
  const content = useAsyncResource(async () => ({ avatar: await getCloudAvatar() }), []);

  if (content.error) {
    throw content.error;
  }

  if (!content.data) {
    return <LoadingState />;
  }

  return (
    <LinearGradient colors={colors.gradient.homeBackground} style={styles.phone}>
      <View style={styles.cloudComingSoonWrap}>
        <Image source={content.data.avatar} style={styles.cloudComingSoonAvatar} resizeMode="contain" />
        <Text style={styles.cloudComingSoonTitle}>Cloud is getting ready</Text>
        <Text style={styles.cloudComingSoonBody}>
          Soon you'll be able to talk with Cloud any time, not just inside a story. For now, start with today's
          wisdom on Home.
        </Text>
      </View>
      <BottomNav active="Cloud" />
    </LinearGradient>
  );
}
