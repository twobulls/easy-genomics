import { test, expect } from 'playwright/test';
import { envConfig } from '../../../config/env-config';

test('01 - Reset Password', async ({ page, baseURL }) => {
  const resetPassword = page.getByRole('link', { name: 'Reset password' });
  const sendPasswordresetlink = page.getByRole('button', { name: 'Send password reset link' });

  // Go to profile directly
  await page.goto(`${baseURL}/profile`);
  await page.waitForLoadState('networkidle');

  // Check reset password button and redirection
  await expect(resetPassword).toBeVisible();
  await resetPassword.click();
  await expect(page).toHaveURL(`${baseURL}/forgot-password`);

  // Reset password for the test invite email
  await page.getByRole('textbox', { name: 'Email address' }).fill(envConfig.testInviteEmail);
  await sendPasswordresetlink.click();
  await page.waitForTimeout(3000);

  // Confirm success
  await expect(page.getByText('Reset link has been sent to ' + envConfig.testInviteEmail).nth(0)).toBeVisible();

  // Check redirection to the Labs page
  await expect(page).toHaveURL(`${baseURL}/labs`);
});
