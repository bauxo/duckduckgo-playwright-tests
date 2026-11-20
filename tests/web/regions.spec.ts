import { test, expect } from './fixtures';

const MIN_REGIONS = 10;

test.describe('TC2 - Regions modal', () => {
  test(`regions modal lists more than ${MIN_REGIONS} regions`, async ({ homePage }) => {
    const resultsPage = await homePage.search('android');
    const regionsModal = await resultsPage.openRegionsModal();

    const count = await regionsModal.getRegionCount();
    console.log(`Regions in modal: ${count}`);

    expect(count, `Expected more than ${MIN_REGIONS} regions, got ${count}`).toBeGreaterThan(MIN_REGIONS);
    // TODO(improve): add a test that selects a region and checks the results and the kl= URL parameter.
  });
});
