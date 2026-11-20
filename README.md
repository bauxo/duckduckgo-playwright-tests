# DuckDuckGo test automation (Playwright + TypeScript)

Take-home assessment for the Test Automation Engineer role at Prediktive / SmartEquip.

- **TC1:** search "android" and check every result title contains "android".
- **TC2:** open the regions modal from the results page and check it lists more than 10 regions.
- **TC3:** call the Instant Answer API for "marvel" and print every Icon URL that isn't null.

The web tests (TC1, TC2) and the API test (TC3) use the same framework, Playwright Test, because it covers both: browser tests use the `page` fixture and API tests use the `request` fixture, with no browser launched.

## Setup

Requires Node.js 18+ (tested with Node 24).

```bash
npm ci
npx playwright install chromium firefox     # add --with-deps on a fresh Linux machine
```

## Running the tests

```bash
npm test                                         # everything: chromium + firefox + api
npx playwright test --project=chromium           # web tests in Chromium (TC1, TC2)
npx playwright test --project=firefox            # web tests in Firefox
npx playwright test --project=api                # API tests (TC3 + offline parsing tests)
npx playwright test tests/web/search.spec.ts     # a single spec
npx playwright test --project=chromium --headed  # watch the browser
npx playwright test --ui                         # Playwright UI mode
npx playwright show-report                       # open the HTML report of the last run
npx tsc --noEmit                                 # type check
```

The specs print useful output to the console: TC1 prints the result titles, TC2 the region count, and TC3 every Icon URL.

## Project structure

```
pages/                        Page Object Model (behavior: actions and reads)
  SearchHomePage.ts           start page: search box, search()
  SearchResultsPage.ts        results, titles, region button, openRegionsModal()
  RegionsModal.ts             region picker: items, count
selectors/                    Raw selector data per page, one <page>.selectors.ts file each
  searchHome.selectors.ts
  searchResults.selectors.ts
  regionsModal.selectors.ts
  index.ts                    single import point for page objects
api/
  DuckDuckGoApiClient.ts      thin typed client over Playwright's request fixture
  icons.ts                    Icon URL extraction: null handling, relative URL resolution
  types.ts                    response types (only the fields we use)
tests/
  web/fixtures.ts             test.extend: gives each test an opened SearchHomePage
  web/search.spec.ts          TC1
  web/regions.spec.ts         TC2
  api/duckduckgo-api.spec.ts  TC3 (live API)
  api/icons.spec.ts           offline tests for the parsing logic in api/icons.ts
.claude/skills/debug-api-test/SKILL.md   agent skill to run, debug and update the API test
AGENTS.md                     short pointer for other AI agents
playwright.config.ts          projects: chromium, firefox, api
.github/workflows/playwright.yml         minimal CI
```

## Design decisions

- **Page Object Model.** Page actions live in `pages/`, and the raw selector data (roles, accessible names, test ids) lives in `selectors/`, one file per page. When the UI changes, the fix goes in one selectors file, and as the suite grows each new page or component gets its own selectors file. Specs never touch selectors directly; specs only read like the test case. `search()` returns a `SearchResultsPage` and `openRegionsModal()` returns a `RegionsModal`, so the flow is easy to follow.
- **User-facing locators.** DDG's CSS class names are generated (`yQDlj3B5DI5YO8c8Ulio`), so I didn't use them. Instead:
  - search box: `getByRole('combobox', { name: 'Search with DuckDuckGo' })`
  - results: `getByTestId('result')`, titles: `getByTestId('result-title-a')`
  - region button: `getByRole('button').filter({ has: getByTestId('region-filter-label') })`
  - regions: `getByRole('menu')` that contains a `menuitemradio` named "All regions", then its `menuitemradio` items
- **What counts as an "entry" (TC1).** Only organic web results (`data-testid="result"`, 10 on the first page). The "About" knowledge panel, ads, news/videos modules and "Related searches" are separate modules, so they are not counted. I only check the first page of results.
- **Case-insensitive check (TC1).** "Android" and "ANDROID" both match. I use `expect.soft` per title, so one run reports every failing title with its position instead of stopping at the first.
- **The "All Regions" button (TC2).** The button shows the current region. In most places it reads "All Regions", but from my network it showed a geo-detected "Argentina" (with "All regions" checked inside the modal). That's why I locate it by test id instead of text.
- **What counts as a region (TC2).** Every `menuitemradio` in the modal, which includes "All regions" and any "Recent" entry. On my run that was **64**. The number changes when DDG adds or removes regions, so the test only asserts `> 10`.
- **Which Icon URLs (TC3).** This response has no top-level `Icon`. Icons appear on items in `RelatedTopics`, some of which are groups with nested `Topics`. I collect icons from all of them (plus `Results` and a top-level `Icon` if DDG ever sends one). DDG sends `""` instead of `null`, so empty and whitespace-only URLs are treated as null and not printed. URLs are relative (`/i/69490b3f.png`), so I print both the raw value and the absolute URL (`https://duckduckgo.com/i/69490b3f.png`). Duplicates are kept because each belongs to a different topic.
- **HTTP 202 (TC3).** The API often answers **202 with a full JSON body**, and the Content-Type is `application/x-javascript`. The client accepts 200/202, then checks the body isn't empty and is valid JSON, with a clear error message for each case.
- **Bot detection.** By default Playwright runs headless Chromium as `chrome-headless-shell`, and DDG redirects that to a 418 bot page (`/static-pages/home-error/418.html`). I use `channel: 'chromium'` (the full Chromium build in new headless mode) with the standard `devices['Desktop Chrome']` user agent, which gets normal results. Firefox works as-is. If results don't load, the failure message says to check for the 418 page.
- **Low parallelism.** `workers: 2` locally and `1` on CI, to avoid DDG's rate limiting.
- **Debugging artifacts.** HTML report, `trace: 'on-first-retry'`, a screenshot on failure, and 2 retries on CI only.

## Results from my runs

- All tests pass in Chromium, Firefox and the API project. I ran the full suite three times in a row (`--repeat-each=3`) with no failures or flakiness.
- TC1: the 10 organic titles for "android" all contained "android" at the time of my runs. Results change over time; if a title doesn't match, the test fails and lists it. That would be a real finding, not a test bug.
- TC2: 64 regions.
- TC3: 17 non-null Icon URLs, all relative `/i/...` paths.

## Assumptions

- Tests run in English (`locale: 'en-US'`). Labels like "All regions" are English.
- Results, region counts and API icons are live data and change. Assertions avoid exact values.
- DDG may block or rate-limit some networks (CI runners, VPNs, data centers). Those failures are environmental, not product bugs.

## What I'd improve with more time

Inline `// TODO(improve):` comments mark the main ones in the code.

- **TC1:** parametrize over several search terms; check results beyond the first page ("More results"); agree with the product owner whether a match in the URL/snippet is acceptable when the title doesn't match.
- **TC2:** assert well-known regions are present; add a test that selects a region and checks the results and the `kl=` URL parameter change.
- **TC3:** validate the response at runtime with a schema (e.g. zod) instead of a type cast; retry with backoff on 429/empty 202 responses; request one icon URL and check it returns an image.
- **Browsers:** add WebKit once it's verified against DDG's bot checks, and mobile viewports.
- **Stability:** if DDG blocks CI runners, stub or record responses (`page.route` / HAR) for a deterministic suite, and keep the live suite as a smaller smoke run.
- **Tooling:** ESLint (with `eslint-plugin-playwright`) and Prettier, and a pre-commit hook.
- **Reporting:** Allure or a CI summary, and Slack notifications on failure.
