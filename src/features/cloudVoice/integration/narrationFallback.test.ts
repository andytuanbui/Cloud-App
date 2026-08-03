import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { runNarrationProviderFallback } from '../../../services/narrationProviderFallback';

describe('Narration provider fallback', () => {
  it('prefers configured AI narration', async () => {
    let browserCalled = false;
    const started = await runNarrationProviderFallback(
      async () => true,
      async () => {
        browserCalled = true;
        return true;
      },
    );
    assert.equal(started, true);
    assert.equal(browserCalled, false);
  });

  it('uses browser speech synthesis adapter after an API failure', async () => {
    let browserCalled = false;
    const started = await runNarrationProviderFallback(
      async () => {
        throw new Error('backend unavailable');
      },
      async () => {
        browserCalled = true;
        return true;
      },
    );
    assert.equal(started, true);
    assert.equal(browserCalled, true);
  });

  it('returns unavailable when neither provider can start', async () => {
    assert.equal(await runNarrationProviderFallback(undefined, undefined), false);
  });
});
