import { test, expect } from 'playwright/test';

test('Grant access to a user to a Laboratory Successfully', async ({ page, baseURL }) => {
  // Check if the user has been added already to a Lab
  await page.goto(`${baseURL}/orgs`);
  await page.waitForLoadState('networkidle');
  await page.getByRole('row', { name: 'Default Organization' }).locator('button').click();
  await page.getByRole('menuitem', { name: 'View / Edit' }).click();
  await page.getByRole('row', { name: 'Rick Sanchez' }).locator('button').click();
  await page.getByRole('menuitem', { name: 'Edit User Access' }).click();
  await page.waitForTimeout(2000);

  let UserNotAddedtoLab = true;
  try {
    UserNotAddedtoLab = await page.getByRole('row', { name: 'Automation Lab Grant access' }).isHidden();
  } catch (error) {
    console.log('User added to Automation Lab already!', error);
  }

  if (UserNotAddedtoLab) {
    //this will delete the user from the Lab so we can add later
    await page.getByRole('link', { name: 'Labs' }).click();
    await page.getByRole('row', { name: 'Automation Lab' }).locator('button').click();
    await page.getByRole('menuitem', { name: 'View / Edit' }).click();
    await page.getByRole('tab', { name: 'Lab Users' }).click();
    await page.waitForTimeout(3000);
    await page.getByRole('row', { name: 'Rick Sanchez' }).locator('button').click();
    await page.getByRole('menuitem', { name: 'Remove From Lab' }).click();
    await page.getByRole('button', { name: 'Remove User' }).click();
    await page.getByRole('status').locator('div').nth(1).click();
  }

  // Click Grant Access in Edit User Access page
  await page.getByRole('link', { name: 'Organizations' }).click();
  await page.getByRole('row', { name: 'Default Organization' }).locator('button').click();
  await page.getByRole('menuitem', { name: 'View / Edit' }).click();
  await page.getByRole('row', { name: 'Rick Sanchez' }).locator('button').click();
  await page.getByRole('menuitem', { name: 'Edit User Access' }).click();
  await page.getByRole('row', { name: 'Automation Lab Grant access' }).getByRole('button').click();
  await page.waitForTimeout(2000);
  await page.getByRole('status').locator('div').nth(1).click();
});
