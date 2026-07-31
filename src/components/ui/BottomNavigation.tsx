import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { appColors, layout, shadows, space, typeStyles } from '../../theme';

export type BottomNavigationItem<Route extends string> = {
  label: string;
  route: Route;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
};

export function BottomNavigation<Route extends string>({
  active,
  items,
  onSelect,
}: {
  active?: Route;
  items: BottomNavigationItem<Route>[];
  onSelect: (route: Route) => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      accessibilityRole="tablist"
      style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, space.xs) }]}
    >
      <View style={styles.inner}>
        {items.map((item) => (
          <NavigationItem
            item={item}
            key={item.route}
            onPress={() => onSelect(item.route)}
            selected={item.route === active}
          />
        ))}
      </View>
    </View>
  );
}

function NavigationItem<Route extends string>({
  item,
  onPress,
  selected,
}: {
  item: BottomNavigationItem<Route>;
  onPress: () => void;
  selected: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityLabel={item.label}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        focused && styles.itemFocused,
        pressed && styles.itemPressed,
      ]}
    >
      <View style={[styles.iconWrap, selected && styles.iconWrapActive]}>
        <Ionicons
          color={selected ? appColors.primary : appColors.textMuted}
          name={selected ? item.activeIcon : item.icon}
          size={22}
        />
      </View>
      <Text style={[styles.label, selected && styles.labelActive]}>{item.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: appColors.navBackground,
    borderTopColor: appColors.border,
    borderTopWidth: 1,
    ...shadows.subtle,
  },
  inner: {
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    maxWidth: layout.maxContentWidth,
    paddingHorizontal: space.xs,
    paddingTop: space.xs,
    width: '100%',
  },
  item: {
    alignItems: 'center',
    borderColor: appColors.transparent,
    borderRadius: 12,
    borderWidth: 2,
    flex: 1,
    justifyContent: 'center',
    minHeight: 56,
    minWidth: 58,
  },
  itemFocused: {
    borderColor: appColors.focus,
  },
  itemPressed: {
    opacity: 0.68,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: 16,
    height: 30,
    justifyContent: 'center',
    width: 38,
  },
  iconWrapActive: {
    backgroundColor: appColors.primarySoft,
  },
  label: {
    ...typeStyles.caption,
    color: appColors.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  labelActive: {
    color: appColors.primary,
    fontWeight: '900',
  },
});
