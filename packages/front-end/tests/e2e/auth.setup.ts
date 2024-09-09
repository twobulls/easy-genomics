import { test as setup } from 'playwright/test';
import { envConfig } from '../../config/env-config';

const authFile = './tests/e2e/.auth/user.json';

setup('Authenticate user', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/signin`);
  await page.getByLabel('Email').click();
  if (typeof envConfig.testUserEmail === 'string') {
    await page.keyboard.type(envConfig.testUserEmail);
  }
  await page.getByLabel('Password').click();
  if (typeof envConfig.testUserPassword === 'string') {
    await page.keyboard.type(envConfig.testUserPassword);
  }
  console.log('Clicking Sign In...');

  await page.getByRole('button', { name: 'Sign In' }).click();
  console.log('Waiting for navigation to complete...');

  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch((err) => {
    console.log('Load state error:', err);
    throw new Error('Failed to sign in');
  });
  console.log('Sign-in process completed.');

  await page.context().storageState({ path: authFile });
});
