import { test, expect } from 'playwright/test';

test('01 - Create a new Organization Successfully', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/orgs`);
  await page.waitForLoadState('networkidle');
  await page.getByRole('link', { name: 'Create a new Organization' }).click();
  await page.waitForTimeout(2000);
  await page.getByPlaceholder('Enter organization name (').fill('Automation Org');
  await page.getByPlaceholder('Describe your organization').fill('This is a description of the automated Org');
  await page.getByLabel('Organization name*').dblclick();
  await page.getByRole('button', { name: 'Save changes' }).click();
  await page.waitForTimeout(2000);
  await expect(page.getByText('Organization created').nth(0)).toBeVisible();
});

test('02 - Update an Org Successfully', async ({ page, baseURL }) => {
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
    await page.waitForTimeout(5000);
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

/*


test('001 - Grant access to a user to a Laboratory Successfully', async ({ page, baseURL }) => {
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

test("002 - Change a user's Organization Admin access", async ({ page, baseURL }) => {
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

test('003 - Invite a user to an Org Successfully', async ({ page, baseURL }) => {
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

test('004 - Remove Invited user to an Org Successfully', async ({ page, baseURL }) => {
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

*/
