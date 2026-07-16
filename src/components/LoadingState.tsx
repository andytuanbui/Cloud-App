import { LinearGradient } from 'expo-linear-gradient';
import { ColorValue, Text, View } from 'react-native';
import { colors as themeColors } from '../theme';
import { styles } from '../theme/styles';

type GradientColors = readonly [ColorValue, ColorValue, ...ColorValue[]];

export function LoadingState({ colors = themeColors.gradient.loading }: { colors?: GradientColors }) {
  return (
    <LinearGradient colors={colors} style={styles.phone}>
      <View style={styles.loadingState}>
        <Text style={styles.loadingText}>Loading CloudWise...</Text>
      </View>
    </LinearGradient>
  );
}
