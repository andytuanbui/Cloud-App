import { LinearGradient } from 'expo-linear-gradient';
import { Image, ImageSourcePropType, Text } from 'react-native';
import { colors as themeColors } from '../theme';
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
      <LinearGradient colors={themeColors.gradient.recommendedFade} style={styles.recommendedFade} />
      <Text style={styles.recommendedTitle}>{title}</Text>
    </LinearGradient>
  );
}
