import { StyleSheet, View } from 'react-native';
import { space } from '../../theme';
import { ProgressSteps } from '../ui';

export function SetupProgress({ step }: { step: number }) {
  return (
    <View style={styles.wrap}>
      <ProgressSteps current={step} total={4} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
    marginBottom: space.lg,
    maxWidth: 280,
    width: '100%',
  },
});
