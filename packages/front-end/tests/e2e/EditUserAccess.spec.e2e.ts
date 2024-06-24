import test from './helpers/signIn';

test("Should change a user's Organization Admin access", async ({ page }) => {
  await page.getByRole('link', { name: 'Organizations' }).click();
  await page.getByRole('row', { name: 'Default Organization' }).locator('button').click();
  await page.getByRole('menuitem', { name: 'View / Edit' }).click();
  await page.getByRole('row', { name: 'RS Rick Sanchez test.user@' }).locator('button').click();
  await page.getByRole('menuitem', { name: 'Edit User Access' }).click();
  await page.waitForLoadState('networkidle');
  // await page.locator('.eq-org-admin-toggle').click();
  await page.locator('//button[contains(@class, "qe-org-admin-toggle")]').click();
  await page.locator('button >> text="Organization Admin"').click();
  // await page.locator('div').filter({ hasText: /^Organization Admin$/ }).click();
});
