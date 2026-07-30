import { StyleSheet, Text, View } from 'react-native';

export function SetupProgress({ step }: { step: number }) {
  return (
    <View accessibilityLabel={`Step ${step} of 4`} style={styles.wrap}>
      <Text style={styles.text}>Step {step} of 4</Text>
      <View style={styles.marks}>
        {[1, 2, 3, 4].map((mark) => (
          <View key={mark} style={[styles.mark, mark <= step && styles.markActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginBottom: 24 },
  text: { color: '#657570', fontSize: 13, fontWeight: '700', marginBottom: 9 },
  marks: { flexDirection: 'row', gap: 7 },
  mark: { backgroundColor: '#D8E3DF', borderRadius: 3, height: 5, width: 36 },
  markActive: { backgroundColor: '#367565' },
});
