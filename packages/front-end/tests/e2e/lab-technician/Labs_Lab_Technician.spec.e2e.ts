import { test, expect } from 'playwright/test';

test('01 - Create a Laboratory Unsuccessfully', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/labs`);
  await page.waitForTimeout(2000);

  // confirm button if enabled/visible
  await expect(page.getByRole('button', { name: 'Create a new Lab' })).toBeHidden();
});

test('02 - Remove a Laboratory Unsuccessfully', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/labs`);
  await page.waitForLoadState('networkidle');

  // Check if any test lab exists
  let hasTestLab = true;
  try {
    hasTestLab = await page.getByRole('row').nth(1).isVisible();
  } catch (error) {
    console.error('No labs found');
  }

  if (hasTestLab) {
    // Click on the first lab row available
    await page.getByRole('row').locator('button').nth(1).click();

    // Confirm if Remove option is available on the first row
    await expect(page.getByRole('menuitem', { name: 'Remove' })).toBeHidden();
  }
});

test('03 - View Org Page Unsuccessfully', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}`);
  await page.waitForLoadState('networkidle');

  //check if the Organizations menu is visible
  await expect(page.getByRole('link', { name: 'Organizations' })).toBeHidden();
});
