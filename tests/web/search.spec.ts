import { test, expect } from './fixtures';

const SEARCH_TERM = 'android';

test.describe('TC1 - Search results', () => {
  test(`every result title contains "${SEARCH_TERM}"`, async ({ homePage }) => {
    const resultsPage = await homePage.search(SEARCH_TERM);
    const titles = await resultsPage.getResultTitles();

    console.log(`Result titles for "${SEARCH_TERM}":\n  ${titles.join('\n  ')}`);
    expect(titles.length, 'Expected at least one organic result').toBeGreaterThan(0);

    for (const [index, title] of titles.entries()) {
      expect.soft(title, `Result #${index + 1} title should contain "${SEARCH_TERM}"`).toMatch(new RegExp(SEARCH_TERM, 'i'));
    }
    // TODO(improve): parametrize over several search terms and check results beyond the first page.
  });
});
