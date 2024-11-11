import { test, expect } from 'playwright/test';

const labName = 'Playwright test lab';
const labNameUpdated = 'Automated Lab - Updated';

test('01 - Hide Create a new Laboratory button', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/labs`);
  await page.waitForTimeout(2000);

  // confirm button if enabled/visible
  await expect(page.getByRole('button', { name: 'Create a new Lab' })).toBeHidden();
});

test('02 - Hide Remove a Laboratory option', async ({ page, baseURL }) => {
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

test('03 - Hide Organization link', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}`);
  await page.waitForLoadState('networkidle');

  //check if the Organizations menu is visible
  await expect(page.getByRole('link', { name: 'Organizations' })).toBeHidden();
});

test('04 - Disable Editing Lab Details', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/labs`);
  await page.waitForLoadState('networkidle');

  let hasTestLab = false;
  try {
    hasTestLab = await page.getByRole('row', { name: labName }).isVisible();
  } catch (error) {
    console.log(labName + ' test lab not found', error);
  }

  if (hasTestLab == true) {
    await page.getByRole('row', { name: labName }).locator('button').click();
    await page.getByRole('menuitem', { name: 'View / Edit' }).click();
    await page.getByRole('tab', { name: 'Details' }).click();

    // check if Edit is disabled
    await expect(page.getByRole('button', { name: 'Edit' })).toBeDisabled();
  }

  await page.goto(`${baseURL}/labs`);
  await page.waitForLoadState('networkidle');

  let hasUpdatedTestLab = false;
  try {
    hasUpdatedTestLab = await page.getByRole('row', { name: labNameUpdated }).isVisible();
  } catch (error) {
    console.log(labNameUpdated + ' test lab not found', error);
  }

  if (hasUpdatedTestLab == true) {
    await page.getByRole('row', { name: labNameUpdated }).locator('button').click();
    await page.getByRole('menuitem', { name: 'View / Edit' }).click();
    await page.getByRole('tab', { name: 'Details' }).click();

    // check if Edit is disabled
    await expect(page.getByRole('button', { name: 'Edit' })).toBeDisabled();
  }
});
