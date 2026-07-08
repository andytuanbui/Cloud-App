import { Text, View } from 'react-native';
import { globalIdentity } from '../content/wisdom';
import { styles } from '../theme/styles';
import { WisdomWorld } from '../types/wisdom';

export function IdentityPanel({ world }: { world: WisdomWorld }) {
  return (
    <View style={styles.identityPanel}>
      <View style={styles.identityTopRow}>
        <Text style={styles.identityLabel}>Current Identity</Text>
        <Text style={styles.identityValue}>{globalIdentity.current}</Text>
      </View>
      <View style={styles.identityDivider} />
      <View style={styles.identityGrid}>
        <View style={styles.identityColumn}>
          <Text style={styles.identityLabel}>Luma Journey</Text>
          <Text style={styles.identityFocus}>{globalIdentity.completed}</Text>
        </View>
        <View style={styles.identityColumn}>
          <Text style={styles.identityLabel}>Next Identity</Text>
          <Text style={styles.identityNext}>{globalIdentity.next}</Text>
        </View>
      </View>
      <View style={styles.identityDivider} />
      <View style={styles.identityTopRow}>
        <Text style={styles.identityLabel}>Currently Exploring</Text>
        <Text style={styles.identityValue}>{world.label} Wisdom</Text>
      </View>
    </View>
  );
}
