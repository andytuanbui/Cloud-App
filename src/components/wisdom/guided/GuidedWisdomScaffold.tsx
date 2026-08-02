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
import { appColors, layout, radii, space, spacing } from '../../../theme';
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
    scrollRef.current?.scrollTo({ animated: false, y: 0 });
  }, [stage]);

  return (
    <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={styles.screen}>
      <View style={styles.headerShell}>
        <View style={styles.header}>
          <View style={styles.headerSlot}>
            {onBack ? (
              <IconButton accessibilityLabel="Go back" icon="arrow-back" onPress={onBack} />
            ) : null}
          </View>
          <View accessibilityLiveRegion="polite" style={styles.progressWrap}>
            <AppText
              accessibilityRole="header"
              numberOfLines={1}
              style={styles.wisdomTitle}
              tone="secondary"
              variant="caption"
            >
              {wisdomTitle}
            </AppText>
            {learned ? (
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
            <ProgressSteps
              current={stageIndex + 1}
              label={
                isComplete
                  ? `${completionLabel} · All ${guidedWisdomStages.length} stages`
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
  },
  headerShell: {
    backgroundColor: appColors.surfaceOverlay,
    borderBottomColor: appColors.border,
    borderBottomWidth: 1,
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
    marginHorizontal: space.sm,
  },
  wisdomTitle: {
    marginBottom: space.xxs,
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
    marginBottom: space.xxs,
    paddingHorizontal: space.xs,
    paddingVertical: space.xxs,
  },
  learnedLabel: {
    marginLeft: space.xxs,
  },
  keyboardArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: space.xxl,
    paddingHorizontal: layout.pagePadding,
    paddingTop: space.md,
  },
  contentInner: {
    alignSelf: 'center',
    maxWidth: layout.readingMaxWidth,
    width: '100%',
  },
});
