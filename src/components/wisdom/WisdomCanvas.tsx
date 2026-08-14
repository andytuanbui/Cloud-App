import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { Image, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import type { CanvasAssetId } from '../../features/wisdomCanvas/assetIds';
import {
  canvasManifestByAssetId,
  hasFinalCanvasArtwork,
} from '../../features/wisdomCanvas/manifest';
import { tryResolveCanvasImage } from '../../features/wisdomCanvas/registry';
import type { CanvasFitMode } from '../../features/wisdomCanvas/types';
import { appColors, radii, space, typography } from '../../theme';
import { AppText } from '../ui';

/**
 * Renders one text-free Wisdom canvas.
 *
 * It resolves artwork through a stable asset id and draws overlay content in a
 * separate layer, so every title, control and amount stays real application
 * UI. It holds no stage logic — callers decide what to overlay.
 */
export function WisdomCanvas({
  accessibilityDescription,
  assetId,
  children,
  fitMode,
  height,
  showSafeAreas = false,
  style,
}: {
  /** Overrides the manifest description when a stage needs more context. */
  accessibilityDescription?: string;
  assetId: CanvasAssetId;
  /** Overlay UI. Rendered above the artwork, never baked into it. */
  children?: ReactNode;
  fitMode?: CanvasFitMode;
  /** Fixed height; width always fills the parent to avoid overflow. */
  height: number;
  /**
   * Development-only safe-area outlines. Never enable in shipped code — it is
   * additionally gated on `__DEV__` below.
   */
  showSafeAreas?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const metadata = canvasManifestByAssetId[assetId];
  const source = tryResolveCanvasImage(assetId);
  const resolvedFit = fitMode ?? metadata?.fitMode ?? 'cover';
  const label = accessibilityDescription ?? metadata?.accessibilityDescription;
  const isDev = typeof __DEV__ !== 'undefined' && __DEV__;
  // Assets still waiting on final art borrow a nearby approved image so the
  // registry always resolves. Drawing that stand-in inside a fixed band would
  // crop it badly and misrepresent the design, so the band shows the approved
  // gradient until the real canvas lands. The manifest status is the switch —
  // it is the same one every other Wisdom surface reads, so a delivered canvas
  // turns on everywhere at once rather than in whichever list was remembered.
  const awaitingFinalArt = !hasFinalCanvasArtwork(assetId);

  if (!source || awaitingFinalArt) {
    // Missing artwork is a content error. In development it is made obvious;
    // in production the overlay still renders on a plain surface so the child
    // never sees a broken screen.
    return (
      <View
        accessibilityLabel={label}
        accessible={Boolean(label)}
        style={[styles.canvas, !source && styles.missing, { height }, style]}
      >
        {awaitingFinalArt ? (
          <>
            <LinearGradient
              colors={[
                appColors.wisdomNightSoft,
                appColors.wisdomNight,
                appColors.wisdomNightDeep,
              ]}
              end={{ x: 1, y: 1 }}
              start={{ x: 0, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View accessible={false} pointerEvents="none" style={styles.placeholderGlow} />
          </>
        ) : null}
        {isDev && !source ? (
          <AppText style={styles.missingLabel} tone="secondary" variant="caption">
            {`Missing canvas: ${assetId}`}
          </AppText>
        ) : null}
        <View pointerEvents="box-none" style={styles.overlay}>
          {children}
        </View>
      </View>
    );
  }

  // The focal point keeps the important part of the artwork visible when the
  // container forces a crop.
  const focal = metadata?.focalPoint ?? { x: 0.5, y: 0.5 };

  return (
    <View
      accessibilityLabel={label}
      accessible={Boolean(label)}
      style={[styles.canvas, { height }, style]}
    >
      <Image
        accessible={false}
        resizeMode={resolvedFit}
        source={source}
        style={[
          StyleSheet.absoluteFillObject,
          resolvedFit === 'cover'
            ? { left: `${(0.5 - focal.x) * 12}%`, top: `${(0.5 - focal.y) * 12}%` }
            : null,
        ]}
      />

      {isDev && showSafeAreas
        ? metadata?.safeAreas.map((area, index) => (
            <View
              key={`${area.purpose}-${index}`}
              pointerEvents="none"
              style={[
                styles.safeArea,
                {
                  height: `${area.height * 100}%`,
                  left: `${area.x * 100}%`,
                  top: `${area.y * 100}%`,
                  width: `${area.width * 100}%`,
                },
              ]}
            >
              <AppText style={styles.safeAreaLabel} tone="inverse" variant="caption">
                {area.purpose}
              </AppText>
            </View>
          ))
        : null}

      <View pointerEvents="box-none" style={styles.overlay}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    borderRadius: radii.hero,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  missing: {
    alignItems: 'center',
    backgroundColor: appColors.surfaceMuted,
    borderColor: appColors.borderStrong,
    borderStyle: 'dashed',
    borderWidth: 2,
    justifyContent: 'center',
  },
  missingLabel: {
    fontWeight: typography.weight.bold,
    padding: space.sm,
    textAlign: 'center',
  },
  overlay: {
    flex: 1,
  },
  placeholderGlow: {
    backgroundColor: appColors.wisdomNightSoft,
    borderRadius: 999,
    height: 220,
    opacity: 0.45,
    position: 'absolute',
    right: -60,
    top: -70,
    width: 220,
  },
  safeArea: {
    borderColor: appColors.focus,
    borderStyle: 'dashed',
    borderWidth: 1,
    position: 'absolute',
  },
  safeAreaLabel: {
    backgroundColor: appColors.overlay,
    paddingHorizontal: space.xxs,
  },
});
