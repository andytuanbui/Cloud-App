import { LinearGradient } from 'expo-linear-gradient';
import { Image, ImageSourcePropType, Text } from 'react-native';
import { styles } from '../theme/styles';

export function RecommendedCard({
  title,
  image,
  colors,
}: {
  title: string;
  image: ImageSourcePropType;
  colors: [string, string];
}) {
  return (
    <LinearGradient colors={colors} style={styles.recommendedCard}>
      <Image source={image} style={styles.recommendedImage} resizeMode="cover" />
      <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.68)']} style={styles.recommendedFade} />
      <Text style={styles.recommendedTitle}>{title}</Text>
    </LinearGradient>
  );
}
