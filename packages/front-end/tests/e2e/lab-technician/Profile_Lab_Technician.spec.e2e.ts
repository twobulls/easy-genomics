import { test, expect } from 'playwright/test';
import { envConfig } from '../../../config/env-config';

const firstName = 'Lab';
const lastName = 'Technician';
const fullName = `${firstName} ${lastName}`;
const initials = firstName.charAt(0) + lastName.charAt(0);
const email = envConfig.labTechnicianEmail || '';

test('01 - Update names', async ({ page, baseURL }) => {
  // Check if the user has been added already to a Lab
  await page.goto(`${baseURL}/profile`);
  await page.waitForLoadState('networkidle');

  const firstNameField = page.getByRole('textbox', { name: 'First Name' });
  const lastNameField = page.getByRole('textbox', { name: 'Last Name' });

  const saveButton = page.getByRole('button', { name: 'Save Changes' });

  // check initial page state
  await expect(firstNameField).toHaveValue(firstName);
  await expect(lastNameField).toHaveValue(lastName);

  await expect(page.getByText(fullName)).toBeVisible();
  await expect(page.getByText(email)).toBeVisible();
  await expect(page.getByText(initials)).toHaveCount(2); // in header dropdown button and above text inputs

  await expect(saveButton).toBeDisabled();

  // enter new values
  await firstNameField.fill('FirstNameNew');
  await lastNameField.fill('LastNameNew');

  // submit
  await expect(saveButton).toBeEnabled();
  await saveButton.click();

  // verify successful update
  await page.waitForTimeout(3000);
  await expect(page.getByText('Your Profile has been updated').nth(0)).toBeVisible();

  await expect(page.getByText('FirstNameNew LastNameNew')).toBeVisible();
  await expect(page.getByText(email)).toBeVisible();
  await expect(page.getByText('FL')).toHaveCount(2);

  await expect(saveButton).toBeDisabled();

  // change names back
  await firstNameField.fill(firstName);
  await lastNameField.fill(lastName);
  await saveButton.click();

  await page.waitForTimeout(3000);
  await expect(page.getByText('Your Profile has been updated').nth(0)).toBeVisible();

  // check everything is back to original values
  await expect(firstNameField).toHaveValue(firstName);
  await expect(lastNameField).toHaveValue(lastName);

  await expect(page.getByText(fullName)).toBeVisible();
  await expect(page.getByText(email)).toBeVisible();
  await expect(page.getByText(initials)).toHaveCount(2);

  await expect(saveButton).toBeDisabled();
});

test('02 - Reset Password', async ({ page, baseURL }) => {
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
