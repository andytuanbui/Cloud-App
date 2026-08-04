import {
  type CanvasAssetId,
  canvasSourceKeyByAssetId,
  isCanvasAssetId,
  storySceneCanvasAssetIds,
  wisdomCanvasAssetIds,
} from './assetIds';
import type {
  CanvasAssetMetadata,
  CanvasManifest,
  CanvasStageId,
  CanvasValidationIssue,
} from './types';

/**
 * Canvas Pack validation.
 *
 * Catches drift between the manifest, the registry and the Wisdom content
 * before it reaches a child as a blank or stretched canvas.
 */

const validStageIds: readonly CanvasStageId[] = [
  'welcome',
  'story',
  'talk',
  'choice',
  'takeaway',
  'practice',
  'completion',
  'home-card',
  'library-card',
];

function issue(
  assetId: string,
  field: string,
  message: string,
): CanvasValidationIssue {
  return { assetId, field, message };
}

function isNormalized(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 1;
}

export function validateCanvasAsset(
  asset: CanvasAssetMetadata,
  knownWisdomIds: readonly string[],
  knownStorySceneIds: readonly string[],
): CanvasValidationIssue[] {
  const issues: CanvasValidationIssue[] = [];
  const id = asset.assetId || '(unknown)';

  if (!isCanvasAssetId(asset.assetId)) {
    issues.push(issue(id, 'assetId', 'Asset id is not registered in assetIds.ts.'));
  }
  if (!knownWisdomIds.includes(asset.wisdomId)) {
    issues.push(issue(id, 'wisdomId', `Unknown Wisdom id "${asset.wisdomId}".`));
  }
  if (!validStageIds.includes(asset.stageId)) {
    issues.push(issue(id, 'stageId', `Unknown stage id "${asset.stageId}".`));
  }
  if (asset.stageId === 'story') {
    if (!asset.storySceneId) {
      issues.push(issue(id, 'storySceneId', 'Story canvases must name a story scene.'));
    } else if (!knownStorySceneIds.includes(asset.storySceneId)) {
      issues.push(
        issue(id, 'storySceneId', `Unknown story scene "${asset.storySceneId}".`),
      );
    }
  }
  if (!asset.filename?.endsWith('.png')) {
    issues.push(issue(id, 'filename', 'Filename must be a .png.'));
  }
  if (!Number.isInteger(asset.version) || asset.version < 1) {
    issues.push(issue(id, 'version', 'Version must be a positive integer.'));
  }
  if (!(asset.sourceWidth > 0) || !(asset.sourceHeight > 0)) {
    issues.push(issue(id, 'sourceWidth', 'Source dimensions must be above zero.'));
  } else {
    const expected = Number((asset.sourceWidth / asset.sourceHeight).toFixed(4));
    if (Math.abs(expected - asset.aspectRatio) > 0.01) {
      issues.push(
        issue(
          id,
          'aspectRatio',
          `Aspect ratio ${asset.aspectRatio} does not match ${asset.sourceWidth}×${asset.sourceHeight} (${expected}).`,
        ),
      );
    }
  }
  if (!isNormalized(asset.focalPoint?.x) || !isNormalized(asset.focalPoint?.y)) {
    issues.push(issue(id, 'focalPoint', 'Focal point must be normalized 0–1.'));
  }

  asset.safeAreas?.forEach((area, index) => {
    const field = `safeAreas[${index}]`;
    if (
      !isNormalized(area.x) ||
      !isNormalized(area.y) ||
      !isNormalized(area.width) ||
      !isNormalized(area.height)
    ) {
      issues.push(issue(id, field, 'Safe area values must be normalized 0–1.'));
      return;
    }
    if (area.x + area.width > 1.0001 || area.y + area.height > 1.0001) {
      issues.push(issue(id, field, 'Safe area extends beyond the image bounds.'));
    }
  });

  if (!asset.accessibilityDescription?.trim()) {
    issues.push(
      issue(id, 'accessibilityDescription', 'An accessibility description is required.'),
    );
  }
  if (asset.textFree !== true) {
    issues.push(issue(id, 'textFree', 'Canvas artwork must be text-free.'));
  }
  if (!isCanvasAssetId(asset.assetId)) return issues;
  if (!canvasSourceKeyByAssetId[asset.assetId as CanvasAssetId]) {
    issues.push(issue(id, 'registry', 'No registry binding for this asset id.'));
  }

  return issues;
}

/**
 * Validates a whole Canvas Pack, including manifest ↔ registry symmetry and
 * assets claiming to be final while their file is absent.
 */
export function validateCanvasManifest(
  manifest: CanvasManifest,
  options: {
    knownWisdomIds: readonly string[];
    knownStorySceneIds: readonly string[];
    /** Filenames present on disk, when the caller can read the folder. */
    existingFilenames?: readonly string[];
  },
): CanvasValidationIssue[] {
  const issues: CanvasValidationIssue[] = [];
  const seenIds = new Set<string>();
  const seenFilenames = new Set<string>();

  for (const asset of manifest.assets) {
    if (seenIds.has(asset.assetId)) {
      issues.push(issue(asset.assetId, 'assetId', 'Duplicate asset id in manifest.'));
    }
    seenIds.add(asset.assetId);

    if (asset.status !== 'deprecated') {
      if (seenFilenames.has(asset.filename)) {
        issues.push(
          issue(asset.assetId, 'filename', `Duplicate active filename "${asset.filename}".`),
        );
      }
      seenFilenames.add(asset.filename);
    }

    if (
      asset.status === 'final' &&
      options.existingFilenames &&
      !options.existingFilenames.includes(asset.filename)
    ) {
      issues.push(
        issue(
          asset.assetId,
          'status',
          `Marked final but "${asset.filename}" is not in the Canvas Pack folder.`,
        ),
      );
    }

    issues.push(
      ...validateCanvasAsset(asset, options.knownWisdomIds, options.knownStorySceneIds),
    );
  }

  // Registry entries with no manifest entry.
  for (const assetId of wisdomCanvasAssetIds) {
    if (!seenIds.has(assetId)) {
      issues.push(issue(assetId, 'manifest', 'Registered asset id is missing from the manifest.'));
    }
  }

  // Every story scene must map to its own canvas.
  const sceneAssetIds = Object.values(storySceneCanvasAssetIds);
  if (new Set(sceneAssetIds).size !== sceneAssetIds.length) {
    issues.push(
      issue('(story-scenes)', 'storySceneCanvasAssetIds', 'Story scenes share a canvas asset id.'),
    );
  }
  for (const sceneId of options.knownStorySceneIds) {
    if (!storySceneCanvasAssetIds[sceneId]) {
      issues.push(issue('(story-scenes)', sceneId, 'Story scene has no canvas asset id.'));
    }
  }

  return issues;
}

export function formatCanvasIssues(
  issues: readonly CanvasValidationIssue[],
): string {
  return issues
    .map((item) => `[${item.assetId}] ${item.field}: ${item.message}`)
    .join('\n');
}
