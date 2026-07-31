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
  onBack,
  reviewMode,
  children,
}: PropsWithChildren<{ step: WisdomStep; onBack?: () => void; reviewMode?: boolean }>) {
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
          <View style={styles.progressWrap}>
            {reviewMode ? (
              <AppText
                accessibilityLiveRegion="polite"
                style={styles.reviewLabel}
                tone="brand"
                variant="caption"
              >
                Review Wisdom
              </AppText>
            ) : (
              <ProgressSteps
                current={stepIndex + 1}
                label={`Step ${stepIndex + 1} of ${wisdomSteps.length}`}
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
            <AppText
              accessibilityLiveRegion="polite"
              style={styles.eyebrow}
              tone="brand"
              variant="label"
            >
              {reviewMode ? 'Review' : titles[step]}
            </AppText>
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
    paddingVertical: space.sm,
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
  reviewLabel: {
    textAlign: 'center',
  },
  keyboardArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingBottom: space.huge,
    paddingHorizontal: layout.pagePadding,
    paddingTop: space.lg,
  },
  contentInner: {
    alignSelf: 'center',
    maxWidth: layout.readingMaxWidth,
    width: '100%',
  },
  eyebrow: {
    marginBottom: space.sm,
    textTransform: 'uppercase',
  },
});
