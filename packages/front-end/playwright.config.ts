import type { PlaywrightTestConfig } from 'playwright/test';
import { envConfig } from '@/packages/front-end/config/env-config';

const config: PlaywrightTestConfig = {
  testDir: './tests/e2e',
  timeout: 100 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  use: {
    actionTimeout: 0,
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    headless: true,
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'setup-local',
      testMatch: /.*\.setup.ts/,
      use: {
        baseURL: 'http://localhost:3000',
      },
    },
    {
      name: 'setup',
      testMatch: /.*\.setup.ts/,
      use: {
        baseURL: `https://${envConfig.appDomainName}`,
      },
    },
    {
      name: 'local',
      testMatch: '**/*.spec.e2e.ts',
      use: {
        baseURL: 'http://localhost:3000',
        storageState: './tests/e2e/.auth/user.json',
      },
      dependencies: ['setup-local'],
    },
    {
      name: 'quality',
      testMatch: '**/*.spec.e2e.ts',
      use: {
        baseURL: `https://${envConfig.appDomainName}`,
        storageState: './tests/e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],

  reporter:
    process.env.CI && process.env.SLACK_E2E_TEST_WEBHOOK_URL
      ? [
          [
            './node_modules/playwright-slack-report/dist/src/SlackReporter.js',
            {
              slackWebHookUrl: process.env.SLACK_E2E_TEST_WEBHOOK_URL,
              sendResults: 'always',
              'meta': [
                { 'key': 'runNumber', 'value': process.env.GITHUB_RUN_NUMBER },
                { 'key': 'sha', 'value': process.env.GITHUB_SHA },
              ],
            },
          ],
          ['dot'],
        ]
      : [['html', { outputDir: './playwright-report' }]],
};

export default config;
