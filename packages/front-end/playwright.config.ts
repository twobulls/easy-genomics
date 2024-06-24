import type { PlaywrightTestConfig } from 'playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './tests/e2e',
  /* Maximum time one test can run for. */
  timeout: 100 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 5000,
  },
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    baseURL: 'http://localhost:3000',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    headless: true, // set `false` to run in browser
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'e2e-local',
      testMatch: '**/*.spec.e2e.ts',
      use: {
        baseURL: 'http://localhost:3000',
      },
    },
    {
      name: 'e2e-qe',
      testMatch: '**/*.spec.e2e.ts',
      use: {
        baseURL: 'https://build.dev.easygenomics.org',
      },
    },
    /* Remove commented additional browsers below as required */
    // {
    //   name: 'Chrome',
    //   use: {
    //     ...devices['Desktop Chrome']
    //   }
    // },
    // {
    //   name: 'Firefox',
    //   use: {
    //     ...devices['Desktop Firefox']
    //   }
    // },
    // {
    //   name: 'Safari',
    //   use: {
    //     ...devices['Desktop Safari']
    //   }
    // }

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: {
    //     ...devices['Pixel 5'],
    //   },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: {
    //     ...devices['iPhone 12'],
    //   },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: {
    //     channel: 'msedge',
    //   },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: {
    //     channel: 'chrome',
    //   },
    // },
  ],

  // FIXME?? not working
  outputDir: 'test-results/',

  reporter: [['html', { outputDir: './playwright-report' }]],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run nuxt-dev-e2e',
  //   url: 'http://localhost:3000',
  //   timeout: 120 * 1000,
  //   reuseExistingServer: true,
  // },
};

export default config;
