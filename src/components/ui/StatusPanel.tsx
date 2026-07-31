import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { appColors, radii, space } from '../../theme';
import { AppText } from './AppText';

type Tone = 'soft' | 'success' | 'gold' | 'caution';

const backgrounds: Record<Tone, string> = {
  soft: appColors.surfaceSoft,
  success: appColors.successSoft,
  gold: appColors.warmGoldSoft,
  caution: appColors.cautionSoft,
};

export function StatusPanel({
  icon,
  title,
  body,
  tone = 'soft',
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body?: string;
  tone?: Tone;
}) {
  return (
    <View style={[styles.panel, { backgroundColor: backgrounds[tone] }]}>
      <View style={styles.iconWrap}>
        <Ionicons color={appColors.primary} name={icon} size={20} />
      </View>
      <View style={styles.copy}>
        <AppText variant="label">{title}</AppText>
        {body ? (
          <AppText style={styles.body} tone="secondary" variant="supporting">
            {body}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    alignItems: 'center',
    borderRadius: radii.medium,
    flexDirection: 'row',
    padding: space.md,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: appColors.surfaceOverlaySoft,
    borderRadius: radii.round,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  copy: {
    flex: 1,
    marginLeft: space.sm,
  },
  body: {
    marginTop: 2,
  },
});
