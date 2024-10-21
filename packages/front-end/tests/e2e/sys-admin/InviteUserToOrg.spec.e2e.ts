import { test, expect } from 'playwright/test';

test('Invite a user to an Org Successfully', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/orgs`);
  await page.waitForLoadState('networkidle');
  await page.getByRole('row', { name: 'Default Organization' }).locator('button').click();
  await page.getByRole('menuitem', { name: 'View / Edit' }).click();
  await page.getByRole('button', { name: 'Invite users' }).click();
  await page.waitForTimeout(2000);
  await page.getByPlaceholder('Enter Email').click();
  await page.keyboard.type('marvin.umali+eg99@deptagency.com');
  await page.getByRole('button', { name: 'Invite', exact: true }).click();

  // confirm creation
  page.getByText('marvin.umali+eg99@deptagency.com has been sent an invite');
  const cell = page.getByRole('cell', {
    name: 'marvin.umali+eg99@deptagency.com',
    exact: true,
  });

  await expect(cell).toBeVisible();
});

test('Remove Invited user to an Org Successfully', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/orgs`);
  await page.waitForLoadState('networkidle');
  await page.getByRole('row', { name: 'Default Organization' }).locator('button').click();
  await page.getByRole('menuitem', { name: 'View / Edit' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('row', { name: 'marvin.umali+eg99@deptagency.com' }).locator('button').nth(1).click();
  await page.getByRole('menuitem', { name: 'Remove From Org' }).click();
  await page.getByRole('button', { name: 'Remove User' }).nth(1).click();

  // confirm deletion
  page.getByText('marvin.umali+eg99@deptagency.com has been removed from Default Organization');
  const cell = page.getByRole('cell', {
    name: 'marvin.umali+eg99@deptagency.com',
    exact: true,
  });

  await expect(cell).toBeHidden();
});
