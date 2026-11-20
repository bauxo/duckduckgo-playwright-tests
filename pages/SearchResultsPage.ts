import { expect, type Locator, type Page } from '@playwright/test';
import { RegionsModal } from './RegionsModal';
import { searchResultsSelectors as sel } from '../selectors';

export class SearchResultsPage {
  readonly results: Locator;
  readonly resultTitles: Locator;
  readonly regionFilterButton: Locator;

  constructor(private readonly page: Page) {
    this.results = page.getByTestId(sel.result.testId);
    this.resultTitles = this.results.getByTestId(sel.resultTitle.testId);
    this.regionFilterButton = page.getByRole(sel.regionFilterButton.role).filter({ has: page.getByTestId(sel.regionFilterLabel.testId) });
  }

  async waitForResults(): Promise<void> {
    await expect(
      this.results.first(),
      'No organic results loaded. If the page URL contains "home-error/418", DDG flagged the browser as a bot (see README).',
    ).toBeVisible();
  }

  async getResultTitles(): Promise<string[]> {
    return (await this.resultTitles.allInnerTexts()).map((title) => title.trim());
  }

  async openRegionsModal(): Promise<RegionsModal> {
    await this.regionFilterButton.click();
    const modal = new RegionsModal(this.page);
    await modal.waitForOpen();
    return modal;
  }
}
