import { expect, type Locator, type Page } from '@playwright/test';
import { regionsModalSelectors as sel } from '../selectors';

export class RegionsModal {
  readonly root: Locator;
  readonly regions: Locator;

  constructor(page: Page) {
    this.root = page
      .getByRole(sel.menu.role)
      .filter({ has: page.getByRole(sel.allRegionsItem.role, { name: sel.allRegionsItem.name }) });
    this.regions = this.root.getByRole(sel.regionItem.role);
  }

  async waitForOpen(): Promise<void> {
    await expect(this.root, 'Regions modal did not open').toBeVisible();
  }

  async getRegionCount(): Promise<number> {
    return this.regions.count();
  }

  async getRegionNames(): Promise<string[]> {
    return (await this.regions.allInnerTexts()).map((name) => name.trim());
  }

}
