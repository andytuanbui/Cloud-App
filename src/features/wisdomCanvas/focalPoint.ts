import type { ImageStyle } from 'react-native';
import type { CanvasFocalPoint } from './types';

/**
 * Focal-point panning for `cover` artwork.
 *
 * Every artwork container is a fixed-height band, so the image is always
 * cropped on one axis. The focal point says which part of the picture must
 * survive that crop — on `TALK-WITH-CLOUD` it is Cloud himself, at 0.22 / 0.42.
 *
 * The subtlety is that a `cover` image already fills its box exactly. Shifting
 * a box that is exactly container-sized does not pan the picture, it slides the
 * picture off one side and leaves the opposite edge uncovered — a transparent
 * strip down the edge of the band. That is what the previous inline style did:
 * it set `left` while `StyleSheet.absoluteFillObject` still held `right: 0`,
 * which narrowed the box to 96.64% and exposed 3.36% of the band.
 *
 * To pan a `cover` image you have to make its box *larger* than the container
 * and anchor it to the side you are panning towards. So every returned inset is
 * zero or negative: the box always contains the container, whatever the focal
 * point, and no edge can ever be exposed.
 *
 * `maxPanPercent` is unchanged from the original implementation, so the amount
 * of movement — and therefore every existing composition — is exactly as before.
 * Only the direction of the box growth is corrected.
 */

/** Maximum pan, as a percentage of the container, at a fully off-centre focal point. */
const maxPanPercent = 6;

export type FocalCoverInset = Pick<
  ImageStyle,
  'bottom' | 'left' | 'right' | 'top'
>;

/**
 * Insets that pan a `cover` image toward `focal` while still covering the
 * whole container.
 *
 * A centred focal point returns all zeros, which is plain `absoluteFillObject`.
 */
export function focalCoverInset(focal: CanvasFocalPoint): FocalCoverInset {
  const panX = (0.5 - focal.x) * 2 * maxPanPercent;
  const panY = (0.5 - focal.y) * 2 * maxPanPercent;

  // Grow the box outward on the side we are panning away from, and keep the
  // side we are panning towards flush at 0. Never a positive inset.
  return {
    bottom: `${Math.min(0, -panY)}%`,
    left: `${Math.min(0, panX)}%`,
    right: `${Math.min(0, -panX)}%`,
    top: `${Math.min(0, panY)}%`,
  };
}
