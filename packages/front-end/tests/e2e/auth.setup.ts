import { test as setup } from 'playwright/test';
import { envConfig } from '../../config/env-config';

const authFile = './tests/e2e/.auth/user.json';

setup('Authenticate user', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/signin`);
  await page.getByLabel('Email').click();
  await page.keyboard.type(envConfig['back-end']['test-user-email']);
  await page.getByLabel('Password').click();
  await page.keyboard.type(envConfig['back-end']['test-user-password']);
  console.log('Clicking Sign In...');

  await page.getByRole('button', { name: 'Sign In' }).click();
  console.log('Waiting for navigation to complete...');

  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch((err) => {
    console.log('Load state error:', err);
  });
  console.log('Sign-in process completed.');

  await page.context().storageState({ path: authFile });
});
