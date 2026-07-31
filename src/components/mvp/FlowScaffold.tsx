import { PropsWithChildren, useEffect, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { wisdomSteps, WisdomStep } from '../../state/types';
import { appColors, layout, space } from '../../theme';
import { AppText, IconButton, ProgressSteps } from '../ui';

const titles: Record<WisdomStep, string> = {
  opening: 'Opening Question',
  read: 'Read',
  talk: 'Talk with Cloud',
  reflect: 'Reflect',
  practice: 'Practice',
  quiz: 'Quiz',
  completion: 'Completion',
};

export function FlowScaffold({
  step,
  wisdomTitle,
  onBack,
  reviewMode,
  children,
}: PropsWithChildren<{
  step: WisdomStep;
  wisdomTitle: string;
  onBack?: () => void;
  reviewMode?: boolean;
}>) {
  const stepIndex = wisdomSteps.indexOf(step);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ animated: false, y: 0 });
  }, [reviewMode, step]);

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
              style={styles.wisdomContext}
              tone="secondary"
              variant="caption"
            >
              {wisdomTitle}
            </AppText>
            {reviewMode ? (
              <AppText style={styles.reviewStatus} tone="brand" variant="label">
                Review mode · {titles[step]}
              </AppText>
            ) : (
              <ProgressSteps
                current={stepIndex + 1}
                label={`${titles[step]} · Step ${stepIndex + 1} of ${wisdomSteps.length}`}
                total={wisdomSteps.length}
              />
            )}
          </View>
          <View style={styles.headerSlot} />
        </View>
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          contentInsetAdjustmentBehavior="automatic"
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentInner}>
            {children}
          </View>
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
  wisdomContext: {
    marginBottom: space.xxs,
    textAlign: 'center',
  },
  reviewStatus: {
    minHeight: space.sm,
    textAlign: 'center',
  },
  keyboardArea: {
    flex: 1,
  },
  content: {
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
