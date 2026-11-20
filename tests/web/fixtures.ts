import { test as base } from '@playwright/test';
import { SearchHomePage } from '../../pages';

export const test = base.extend<{ homePage: SearchHomePage }>({
  homePage: async ({ page }, use) => {
    const homePage = new SearchHomePage(page);
    await homePage.goto();
    await use(homePage);
  },
});

export { expect } from '@playwright/test';
