import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { colors } from '../theme';
import { styles } from '../theme/styles';

export function JourneyPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.journeyPanel}>
      <Text style={styles.journeyPanelTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function JourneyListItem({
  icon,
  title,
  body,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
}) {
  return (
    <View style={styles.journeyListItem}>
      <View style={styles.journeyListIcon}>
        <Ionicons name={icon} size={18} color={colors.accent.gold} />
      </View>
      <View style={styles.journeyListCopy}>
        <Text style={styles.journeyListTitle}>{title}</Text>
        <Text style={styles.journeyListBody}>{body}</Text>
      </View>
    </View>
  );
}
