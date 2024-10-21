import { count } from 'console';
import { test, expect } from 'playwright/test';

test('Update a Laboratory Successfully', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/labs`);
  await page.waitForTimeout(2000);

  await page.getByRole('row', { name: 'Automation Lab' }).locator('button').click();
  await page.getByRole('menuitem', { name: 'View / Edit' }).click();

  const rowCount = await page.locator('id=headlessui-menu-button-v-0-26').count();

  for (let i = 0; i < rowCount; i++) {
    await page.getByRole('menuitem', { name: 'Remove From Lab' }).click();
    await page.getByRole('button', { name: 'Remove User' }).click();
    await page.getByRole('status').locator('div').nth(1).click();
  }
});
