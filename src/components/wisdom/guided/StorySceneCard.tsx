import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { appColors, space, spacing } from '../../../theme';
import { AppText, SurfaceCard } from '../../ui';

export function StorySceneCard({
  illustration,
  illustrationAccessibilityLabel,
  illustrationContainerStyle,
  sceneCount,
  sceneNumber,
  text,
}: {
  illustration: ReactNode;
  illustrationAccessibilityLabel?: string;
  illustrationContainerStyle?: StyleProp<ViewStyle>;
  sceneCount: number;
  sceneNumber: number;
  text: string;
}) {
  return (
    <SurfaceCard elevated style={styles.card}>
      <View
        accessibilityLabel={illustrationAccessibilityLabel}
        accessible={Boolean(illustrationAccessibilityLabel)}
        style={[styles.illustration, illustrationContainerStyle]}
      >
        {illustration}
      </View>
      <View style={styles.body}>
        <AppText tone="brand" variant="label">
          Scene {sceneNumber} of {sceneCount}
        </AppText>
        <AppText accessibilityRole="header" style={styles.sceneText} variant="sectionTitle">
          {text}
        </AppText>
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  illustration: {
    alignItems: 'center',
    backgroundColor: appColors.surfaceSoft,
    borderBottomColor: appColors.border,
    borderBottomWidth: 1,
    justifyContent: 'center',
    minHeight: spacing.s116,
    overflow: 'hidden',
    width: '100%',
  },
  body: {
    backgroundColor: appColors.surface,
    padding: space.lg,
  },
  sceneText: {
    marginTop: space.xs,
  },
});
