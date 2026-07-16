// Three elevation levels. Soft shadows only — nothing hard, nothing neon.

import { ViewStyle } from 'react-native';

export const shadows: Record<'soft' | 'medium' | 'strong', ViewStyle> = {
  soft: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 6,
  },
  strong: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.24,
    shadowRadius: 36,
    elevation: 10,
  },
};
