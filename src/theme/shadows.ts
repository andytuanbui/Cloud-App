import { Platform, type ViewStyle } from 'react-native';

import { appColors } from './colors';

type ShadowTokens = Record<'subtle' | 'card' | 'focus', ViewStyle>;

const nativeShadows = {
  subtle: {
    elevation: 1,
    shadowColor: appColors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  card: {
    elevation: 3,
    shadowColor: appColors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 22,
  },
  focus: {
    elevation: 2,
    shadowColor: appColors.focus,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.24,
    shadowRadius: 5,
  },
} satisfies ShadowTokens;

const webShadows = {
  subtle: {
    boxShadow: '0 4px 12px rgba(41, 66, 61, 0.06)',
  },
  card: {
    boxShadow: '0 10px 22px rgba(41, 66, 61, 0.10)',
  },
  focus: {
    boxShadow: '0 0 5px rgba(62, 117, 135, 0.24)',
  },
} satisfies ShadowTokens;

export const shadows = Platform.OS === 'web' ? webShadows : nativeShadows;
