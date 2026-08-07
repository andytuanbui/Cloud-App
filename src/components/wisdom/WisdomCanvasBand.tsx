import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import type { CanvasAssetId } from '../../features/wisdomCanvas/assetIds';
import { canvasBandHeights } from '../../features/wisdomCanvas/bandHeights';
import type { CanvasFitMode } from '../../features/wisdomCanvas/types';
import { radii } from '../../theme';
import { WisdomCanvas } from './WisdomCanvas';

/**
 * A fixed-height artwork region at the top of a stage.
 *
 * The point of this component is that its height never depends on stage
 * content. Measurement showed the old full-stage canvases growing up to 2.66×
 * as answers, follow-ups and response fields appeared, which makes it
 * impossible to commission artwork for them.
 *
 * The band holds artwork only. Titles, questions, choices, amounts, controls
 * and status all render as normal application UI in a sibling region below —
 * never inside the image.
 */
export function WisdomCanvasBand({
  accessibilityDescription,
  assetId,
  children,
  fitMode,
  height,
  showSafeAreas = false,
  style,
}: {
  accessibilityDescription?: string;
  assetId: CanvasAssetId;
  /**
   * Optional decoration drawn over the artwork. Must stay non-textual and
   * must not change the band's height.
   */
  children?: ReactNode;
  fitMode?: CanvasFitMode;
  /** Defaults to the stage's measured stable height. */
  height?: number;
  /** Development only; additionally gated on `__DEV__` inside WisdomCanvas. */
  showSafeAreas?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const bandHeight = height ?? canvasBandHeights[assetId] ?? 220;

  return (
    <View
      style={[styles.band, { height: bandHeight }, style]}
      testID={`canvas-band-${assetId}`}
    >
      <WisdomCanvas
        accessibilityDescription={accessibilityDescription}
        assetId={assetId}
        fitMode={fitMode}
        height={bandHeight}
        showSafeAreas={showSafeAreas}
        style={styles.canvas}
      >
        {children}
      </WisdomCanvas>
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    // Height is fixed by the caller. `overflow: hidden` guarantees nothing
    // inside can push the band taller.
    overflow: 'hidden',
    width: '100%',
  },
  canvas: {
    borderRadius: radii.large,
  },
});
