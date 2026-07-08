import React from 'react';
import { Text, View } from 'react-native';
import { styles } from '../theme/styles';

export function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.detailSection}>
      <Text style={styles.detailSectionTitle}>{title}</Text>
      {children}
    </View>
  );
}
