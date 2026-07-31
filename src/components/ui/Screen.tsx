import { PropsWithChildren, ReactNode } from 'react';
import {
  ScrollView,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { appColors, layout, space } from '../../theme';

export function Screen({
  children,
  bottomNavigation,
  contentContainerStyle,
  scroll = true,
  scrollProps,
}: PropsWithChildren<{
  bottomNavigation?: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scroll?: boolean;
  scrollProps?: ScrollViewProps;
}>) {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
      {scroll ? (
        <ScrollView
          {...scrollProps}
          contentContainerStyle={[styles.content, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.staticContent, contentContainerStyle]}>
          {children}
        </View>
      )}
      {bottomNavigation}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: appColors.canvas,
    flex: 1,
  },
  content: {
    alignSelf: 'center',
    maxWidth: layout.maxContentWidth,
    paddingBottom: space.xl,
    paddingHorizontal: layout.pagePadding,
    paddingTop: layout.screenTop,
    width: '100%',
  },
  staticContent: {
    flex: 1,
  },
});
