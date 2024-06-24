import { test as base } from 'playwright/test';
import { envConfig } from '~~/config/env-config';

/**
 * Test wrapper to sign in as a test user
 */
const test = base.extend({
  page: async ({ page, baseURL }, use) => {
    await page.goto(`${baseURL}/login`);
    await page.getByLabel('Email').click();
    await page.keyboard.type(envConfig['back-end']['test-user-email']);
    // await page.keyboard.type('test.user@easygenomics.org');
    await page.getByLabel('Password').click();
    await page.keyboard.type(envConfig['back-end']['test-user-password']);
    // await page.keyboard.type('P@ssw0rd');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForLoadState('networkidle');
    await use(page);
  },
});

export default test;
