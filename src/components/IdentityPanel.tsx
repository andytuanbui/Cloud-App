import { Text, View } from 'react-native';
import { getGlobalIdentity } from '../services/wisdomService';
import { styles } from '../theme/styles';
import { WisdomWorld } from '../types/wisdom';

export function IdentityPanel({ world }: { world: WisdomWorld }) {
  const globalIdentity = getGlobalIdentity();

  return (
    <View style={styles.identityPanel}>
      <View style={styles.identityTopRow}>
        <Text style={styles.identityLabel}>You are becoming...</Text>
        <Text style={styles.identityValue}>{globalIdentity.current}</Text>
      </View>
      <View style={styles.identityDivider} />
      <View style={styles.identityGrid}>
        <View style={styles.identityColumn}>
          <Text style={styles.identityLabel}>Wisdom practiced</Text>
          <Text style={styles.identityFocus}>{globalIdentity.completed}</Text>
        </View>
        <View style={styles.identityColumn}>
          <Text style={styles.identityLabel}>Growing toward</Text>
          <Text style={styles.identityNext}>{globalIdentity.next}</Text>
        </View>
      </View>
      <View style={styles.identityDivider} />
      <View style={styles.identityTopRow}>
        <Text style={styles.identityLabel}>Becoming through</Text>
        <Text style={styles.identityValue}>{world.label} Wisdom</Text>
      </View>
    </View>
  );
}
