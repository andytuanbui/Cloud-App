import { Ionicons } from '@expo/vector-icons';
import { PropsWithChildren, useEffect, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { appColors, layout, radii, shadows, space, spacing } from '../../../theme';
import { AppText, IconButton, ProgressSteps } from '../../ui';

export const guidedWisdomStages = [
  'welcome',
  'story',
  'talk',
  'choice',
  'takeaway',
  'practice',
] as const;

export type GuidedWisdomProgressStage = (typeof guidedWisdomStages)[number];
export type GuidedWisdomStage = GuidedWisdomProgressStage | 'completion';

const stageTitles: Record<GuidedWisdomStage, string> = {
  welcome: 'Welcome',
  story: 'Story',
  talk: 'Talk with Cloud',
  choice: 'Your Choice',
  takeaway: 'Takeaway',
  practice: 'Practice',
  completion: 'Learned',
};

export function GuidedWisdomScaffold({
  children,
  completionLabel = 'Learned',
  contentContainerStyle,
  learned = false,
  onBack,
  stage,
  wisdomTitle,
}: PropsWithChildren<{
  completionLabel?: 'Learned' | 'Reviewed again';
  contentContainerStyle?: StyleProp<ViewStyle>;
  learned?: boolean;
  onBack?: () => void;
  stage: GuidedWisdomStage;
  wisdomTitle: string;
}>) {
  const scrollRef = useRef<ScrollView>(null);
  const isComplete = stage === 'completion';
  const stageIndex = isComplete
    ? guidedWisdomStages.length - 1
    : guidedWisdomStages.indexOf(stage);
  const stageTitle = stageTitles[stage];

  useEffect(() => {
    // Reset twice: once immediately, and once after the new stage has laid out.
    // Without the second pass a taller stage (Completion) can keep the previous
    // scroll offset and open with its status badge already scrolled off screen.
    scrollRef.current?.scrollTo({ animated: false, y: 0 });
    const frame = requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ animated: false, y: 0 });
    });
    return () => cancelAnimationFrame(frame);
  }, [stage]);

  return (
    // `guided-stage-<stage>` is the ground truth an automated measurement run
    // checks before it records anything, so a Home card can never be recorded
    // as Story, or Story as Talk.
    <SafeAreaView
      edges={['top', 'bottom', 'left', 'right']}
      style={styles.screen}
      testID={`guided-stage-${stage}`}
    >
      <View style={styles.headerShell}>
        <View style={styles.header}>
          <View style={styles.headerSlot}>
            {onBack ? (
              <IconButton accessibilityLabel="Go back" icon="arrow-back" onPress={onBack} />
            ) : null}
          </View>
          <View accessibilityLiveRegion="polite" style={styles.progressWrap}>
            <View style={styles.metaRow}>
              <AppText
                accessibilityRole="header"
                numberOfLines={1}
                style={styles.wisdomTitle}
                tone="secondary"
                variant="caption"
              >
                {wisdomTitle}
              </AppText>
              {learned && !isComplete ? (
                <View accessibilityLabel="This Wisdom is learned" style={styles.learnedBadge}>
                  <Ionicons
                    accessible={false}
                    color={appColors.wisdomGreen}
                    name="checkmark-circle"
                    size={spacing.s15}
                  />
                  <AppText style={styles.learnedLabel} tone="brand" variant="label">
                    Learned
                  </AppText>
                </View>
              ) : null}
            </View>
            <ProgressSteps
              current={stageIndex + 1}
              label={
                isComplete
                  ? // The completion canvas already carries the learned state.
                    // Repeating it here gave the child the same badge twice.
                    `All ${guidedWisdomStages.length} stages`
                  : `${stageTitle} · ${stageIndex + 1} of ${guidedWisdomStages.length}`
              }
              total={guidedWisdomStages.length}
            />
          </View>
          <View style={styles.headerSlot} />
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardArea}
      >
        <View style={styles.canvasGlowTop} />
        <View style={styles.canvasGlowBottom} />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          contentInsetAdjustmentBehavior="automatic"
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.contentInner, contentContainerStyle]}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: appColors.canvas,
    flex: 1,
    overflow: 'hidden',
    width: '100%',
  },
  headerShell: {
    backgroundColor: appColors.surfaceOverlay,
    borderBottomColor: appColors.border,
    borderBottomWidth: 1,
    ...shadows.subtle,
    zIndex: 1,
  },
  header: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    maxWidth: layout.readingMaxWidth,
    paddingHorizontal: layout.pagePadding,
    paddingVertical: space.xs,
    width: '100%',
  },
  headerSlot: {
    height: layout.minimumTouchTarget,
    width: layout.minimumTouchTarget,
  },
  progressWrap: {
    flex: 1,
    marginHorizontal: space.xs,
    minWidth: 0,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: space.xxs,
  },
  wisdomTitle: {
    flexShrink: 1,
    minWidth: 0,
    textAlign: 'center',
  },
  learnedBadge: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: appColors.wisdomGreenSoft,
    borderColor: appColors.border,
    borderRadius: radii.round,
    borderWidth: 1,
    flexDirection: 'row',
    flexShrink: 0,
    marginLeft: space.xs,
    paddingHorizontal: space.xs,
    paddingVertical: space.xxs,
  },
  learnedLabel: {
    marginLeft: space.xxs,
  },
  keyboardArea: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  canvasGlowTop: {
    backgroundColor: appColors.primarySoft,
    borderRadius: radii.round,
    height: 190,
    opacity: 0.48,
    pointerEvents: 'none',
    position: 'absolute',
    right: -110,
    top: -92,
    width: 190,
  },
  canvasGlowBottom: {
    backgroundColor: appColors.warmGoldSoft,
    borderRadius: radii.round,
    bottom: -120,
    height: 220,
    left: -132,
    opacity: 0.42,
    pointerEvents: 'none',
    position: 'absolute',
    width: 220,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: space.xxxl,
    paddingTop: space.lg,
  },
  contentInner: {
    alignSelf: 'center',
    maxWidth: layout.readingMaxWidth,
    paddingHorizontal: layout.pagePadding,
    width: '100%',
  },
});
