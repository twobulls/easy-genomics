import { test, expect } from 'playwright/test';

test("Should change a user's Organization Admin access", async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/orgs`);
  await page.getByRole('link', { name: 'Organizations' }).click();
  await page.getByRole('row', { name: 'Default Organization' }).locator('button').click();
  await page.getByRole('menuitem', { name: 'View / Edit' }).click();
  await page.getByRole('row', { name: 'Rick Sanchez' }).locator('button').click();
  await page.getByRole('menuitem', { name: 'Edit User Access' }).click();
  await page.waitForLoadState('networkidle');
  await page.locator('span').filter({ hasText: 'Organization Admin' }).click();
  await page.getByRole('status').locator('div').nth(1).click();
  const toastMessage = await page.locator('.test-toast-success').innerText();
  expect(toastMessage).toContain('Rick Sanchez’s Lab Access has been successfully updated');
});
