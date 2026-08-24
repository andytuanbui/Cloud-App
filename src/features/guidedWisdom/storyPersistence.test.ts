import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { migrateAppState } from '../../state/appStateMigration';
import {
  CURRENT_GUIDED_WISDOM_SESSION_VERSION,
  CURRENT_SCHEMA_VERSION,
} from '../../state/types';

describe('guided Story persistence', () => {
  it('migrates the saved visual-scene index to the matching narrative beat', () => {
    const migrated = migrateAppState(
      {
        schemaVersion: 5,
        profile: {},
        wisdomProgress: {
          'three-ways-to-use-money': {
            wisdomId: 'three-ways-to-use-money',
            guidedSession: {
              version: 1,
              currentStage: 'story',
              currentStoryScene: 4,
              completed: false,
            },
          },
        },
      },
      '2026-08-24',
    );

    const session =
      migrated.wisdomProgress['three-ways-to-use-money'].guidedSession;
    assert.equal(migrated.schemaVersion, CURRENT_SCHEMA_VERSION);
    assert.equal(session?.version, CURRENT_GUIDED_WISDOM_SESSION_VERSION);
    assert.equal(session?.currentStage, 'story');
    assert.equal(session?.currentStoryBeat, 9);
  });
});
