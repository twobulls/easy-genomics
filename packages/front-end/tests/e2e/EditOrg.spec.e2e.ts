import { test, expect } from 'playwright/test';

test('Update an Org Successfully', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/orgs`);
  await page.waitForTimeout(2000);

  // Check if the 'updated' test org already exists then update it back to the original value
  let hasUpdatedOrg = false;
  try {
    hasUpdatedOrg = await page.getByRole('row', { name: 'Default Organization Updated' }).isVisible();
  } catch (error) {
    console.log('Updated Organization not found', error);
  }

  if (hasUpdatedOrg) {
    await page.getByRole('row', { name: 'Default Organization Update' }).locator('button').click();
    await page.getByRole('menuitem', { name: 'View / Edit' }).click();
    await page.getByRole('tab', { name: 'Details' }).click();
    await page.getByText('Organization name*').isVisible();
    await page.getByLabel('Organization name*').fill('Default Organization');
    await page.getByPlaceholder('Describe your organization').fill('This is the default Organization back to original');
    await page.getByRole('button', { name: 'Save changes' }).click();
    await page.getByText('Organization updated', { exact: true }).isVisible();
    await expect(page.getByText('Default Organization').nth(0)).toBeVisible();
    await expect(page.getByText('This is the default Organization back to original').nth(0)).toBeVisible();
  } else {
    console.log('Updated Organization not found');
  }

  // Check if the 'orginal/default' test org exists and update it
  let hasTestOrg = false;
  try {
    hasTestOrg = await page.getByRole('row', { name: 'Default Organization' }).isVisible();
  } catch (error) {
    console.log('Default Organization updated Test not found', error);
  }

  if (hasTestOrg) {
    await page.getByRole('row', { name: 'Default Organization' }).locator('button').click();
    await page.getByRole('menuitem', { name: 'View / Edit' }).click();
    await page.getByRole('tab', { name: 'Details' }).click();
    await page.getByText('Organization name*').isVisible();
    await page.getByLabel('Organization name*').fill('Default Organization Updated');
    await page.getByPlaceholder('Describe your organization').fill('This is an update to the default Organization');
    await page.getByRole('button', { name: 'Save changes' }).click();
    await page.getByText('Organization updated', { exact: true }).isVisible();
    await expect(page.getByText('Default Organization Updated').nth(0)).toBeVisible();
    await expect(page.getByText('This is an update to the default Organization').nth(0)).toBeVisible();
  }
});
