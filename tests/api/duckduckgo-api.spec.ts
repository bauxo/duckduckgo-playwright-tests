import { test, expect } from '@playwright/test';
import { DuckDuckGoApiClient } from '../../api/DuckDuckGoApiClient';
import { collectIconUrls } from '../../api/icons';

test.describe('TC3 - Instant Answer API: Icon URLs', () => {
  test('prints every non-null Icon URL for "marvel"', async ({ request }) => {
    const client = new DuckDuckGoApiClient(request);

    const response = await client.getInstantAnswer('marvel');
    expect(response.Heading, 'Response should be about Marvel').toMatch(/marvel/i);
    expect(Array.isArray(response.RelatedTopics), 'RelatedTopics should be an array').toBe(true);

    const icons = collectIconUrls(response);

    console.log(`Found ${icons.length} non-null Icon URL(s) for "marvel":`);
    for (const icon of icons) {
      console.log(`  ${icon.url}  ->  ${icon.absoluteUrl}  (${icon.source})`);
    }

    expect(icons.length, 'Expected at least one Icon with a URL').toBeGreaterThan(0);
    for (const icon of icons) {
      expect.soft(icon.url, `Icon URL for "${icon.source}" should be an image path`).toMatch(/^(\/|https?:\/\/)\S+\.(png|jpe?g|gif|svg|webp|ico)$/i);
    }
    // TODO(improve): request one icon URL and assert it returns an image.
  });
});
