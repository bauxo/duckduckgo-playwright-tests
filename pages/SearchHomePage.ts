import { type Locator, type Page } from '@playwright/test';
import { SearchResultsPage } from './SearchResultsPage';
import { searchHomeSelectors as sel } from '../selectors';

export class SearchHomePage {
  readonly searchBox: Locator;

  constructor(private readonly page: Page) {
    this.searchBox = page.getByRole(sel.searchBox.role, { name: sel.searchBox.name });
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async search(term: string): Promise<SearchResultsPage> {
    await this.searchBox.fill(term);
    await this.searchBox.press('Enter');
    const resultsPage = new SearchResultsPage(this.page);
    await resultsPage.waitForResults();
    return resultsPage;
  }
}
