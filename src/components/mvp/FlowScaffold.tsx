import { Ionicons } from '@expo/vector-icons';
import { PropsWithChildren, useEffect, useRef } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { wisdomSteps, WisdomStep } from '../../state/types';

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
    <View style={styles.screen}>
      <View style={styles.header}>
        {onBack ? (
          <Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={onBack} style={styles.back}>
            <Ionicons name="arrow-back" size={24} color="#19304E" />
          </Pressable>
        ) : (
          <View style={styles.back} />
        )}
        <View style={styles.progressWrap}>
          <Text style={styles.stepText}>
            {reviewMode ? 'Review Wisdom' : `Step ${stepIndex + 1} of ${wisdomSteps.length}`}
          </Text>
          {!reviewMode && (
            <View style={styles.progress}>
              {wisdomSteps.map((item, index) => (
                <View key={item} style={[styles.segment, index <= stepIndex && styles.segmentActive]} />
              ))}
            </View>
          )}
        </View>
        <View style={styles.back} />
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          ref={scrollRef}
        >
          <Text style={styles.eyebrow}>{reviewMode ? 'Review' : titles[step]}</Text>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#F5FAF8', flex: 1 },
  keyboardArea: { flex: 1 },
  header: { alignItems: 'center', flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12 },
  back: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
  progressWrap: { flex: 1 },
  stepText: { color: '#64736F', fontSize: 12, fontWeight: '700', marginBottom: 7, textAlign: 'center' },
  progress: { flexDirection: 'row', gap: 5 },
  segment: { backgroundColor: '#DCE6E2', borderRadius: 4, flex: 1, height: 5 },
  segmentActive: { backgroundColor: '#3D8C78' },
  content: { paddingBottom: 40, paddingHorizontal: 22 },
  eyebrow: { color: '#3D786A', fontSize: 13, fontWeight: '800', letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' },
});
