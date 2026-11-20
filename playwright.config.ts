import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // DuckDuckGo rate-limits bursts from one IP.
  workers: process.env.CI ? 1 : 2,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    locale: 'en-US',
  },
  // TODO(improve): add WebKit and mobile viewports once verified against DDG's bot checks.
  projects: [
    {
      name: 'chromium',
      testDir: './tests/web',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://start.duckduckgo.com',
        // chrome-headless-shell gets DuckDuckGo's 418 bot page; full Chromium does not.
        channel: 'chromium',
      },
    },
    {
      name: 'firefox',
      testDir: './tests/web',
      use: { ...devices['Desktop Firefox'], baseURL: 'https://start.duckduckgo.com' },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: 'https://api.duckduckgo.com',
        extraHTTPHeaders: { Accept: 'application/json' },
      },
    },
  ],
});
