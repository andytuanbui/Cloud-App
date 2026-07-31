import { StyleSheet, View } from 'react-native';
import { space } from '../../theme';
import { AppText } from './AppText';

export function SectionHeader({
  title,
  supporting,
}: {
  title: string;
  supporting?: string;
}) {
  return (
    <View style={styles.wrap}>
      <AppText accessibilityRole="header" variant="sectionTitle">
        {title}
      </AppText>
      {supporting ? (
        <AppText style={styles.supporting} tone="secondary" variant="supporting">
          {supporting}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: space.sm,
  },
  supporting: {
    marginTop: space.xxs,
  },
});
