import { Image, StyleSheet, View } from 'react-native';
import { appColors, radii, shadows, space, spacing } from '../../../theme';
import { AppText, SurfaceCard } from '../../ui';

const cloudAvatar = require('../../../../assets/cloud/cloud-avatar.png');

export function CloudResponseCard({
  accessibilityLive = true,
  text,
}: {
  accessibilityLive?: boolean;
  text: string;
}) {
  return (
    <SurfaceCard style={styles.card} tone="soft">
      <View
        accessibilityLabel={`Cloud says: ${text}`}
        accessibilityLiveRegion={accessibilityLive ? 'polite' : 'none'}
        accessible
        style={styles.row}
      >
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={styles.avatarFrame}
        >
          <Image accessible={false} resizeMode="contain" source={cloudAvatar} style={styles.avatar} />
        </View>
        <View style={styles.copy}>
          <AppText tone="brand" variant="label">
            Cloud
          </AppText>
          <AppText style={styles.text} variant="body">
            {text}
          </AppText>
        </View>
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    borderColor: appColors.borderStrong,
    borderLeftColor: appColors.primary,
    borderLeftWidth: space.xxs,
    padding: space.md,
    ...shadows.subtle,
  },
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  avatarFrame: {
    backgroundColor: appColors.surfaceElevated,
    borderColor: appColors.border,
    borderRadius: radii.round,
    borderWidth: 1,
    height: spacing.s58,
    marginRight: space.sm,
    overflow: 'hidden',
    width: spacing.s58,
    ...shadows.subtle,
  },
  avatar: {
    height: '100%',
    width: '100%',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    paddingTop: space.xs,
  },
  text: {
    marginTop: space.xs,
  },
});
