import { StyleSheet } from 'react-native';
import { AppText, SurfaceCard } from '../../../components/ui';
import { space } from '../../../theme';
import { CLOUD_VOICE_CHILD_DISCLOSURE } from '../core/prompt';

export function CloudVoicePermissionCard({
  parentApproved,
}: {
  parentApproved: boolean;
}) {
  return (
    <SurfaceCard style={styles.card} tone={parentApproved ? 'soft' : 'caution'}>
      <AppText variant="label">
        {parentApproved ? 'Before you talk' : 'A parent needs to approve voice first'}
      </AppText>
      <AppText style={styles.body} tone="secondary" variant="supporting">
        {parentApproved
          ? CLOUD_VOICE_CHILD_DISCLOSURE
          : 'Voice stays off until a parent enables the development preview in Family. You can keep using the answers below.'}
      </AppText>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: space.sm,
  },
  body: {
    marginTop: space.xs,
  },
});
