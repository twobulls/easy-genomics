import { test, expect } from 'playwright/test';
const inviteEmail = 'marvin.umali+eg99@deptagency.com';
const orgName = 'Automated Org';
const orgNameUpdated = 'Automated Org - Updated';

test('01 - Remove an Organization Successfully', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/orgs`);
  await page.waitForLoadState('networkidle');

  // Check if the org exists
  let org1Exists = false;
  let org2Exists = false;

  try {
    // Attempt to check the visibility of the element
    org1Exists = await page.getByRole('row', { name: orgName, exact: true }).isVisible();
  } catch (error) {
    // This block will catch errors such as selector issues or other Playwright API errors
    console.error(error);
  }

  if (org1Exists) {
    //this will Org if it exists
    await page.getByRole('row', { name: orgName, exact: true }).locator('button').click();
    await page.getByRole('menuitem', { name: 'Remove' }).click();
    await page.getByRole('button', { name: 'Remove Organization' }).click();
    await page.waitForTimeout(2000);
    await expect(page.getByText('Organization deleted').nth(0)).toBeVisible();
  }

  try {
    // Attempt to check the visibility of the element
    org2Exists = await page.getByRole('row', { name: orgName, exact: true }).isVisible();
  } catch (error) {
    // This block will catch errors such as selector issues or other Playwright API errors
    console.error(error);
  }

  if (org2Exists) {
    //this will Org if it exists
    await page.getByRole('row', { name: orgNameUpdated, exact: true }).locator('button').click();
    await page.getByRole('menuitem', { name: 'Remove' }).click();
    await page.getByRole('button', { name: 'Remove Organization' }).click();
    await page.waitForTimeout(2000);
    await expect(page.getByText('Organization deleted').nth(0)).toBeVisible();
  }
});

test('02 - Create a new Organization Successfully', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/orgs`);
  await page.waitForLoadState('networkidle');

  // Check if the org exists
  let OrgExists = true;
  try {
    OrgExists = await page.getByRole('row', { name: orgName }).isHidden();
  } catch (error) {
    console.log('Org already exists!', error);
  }

  if (OrgExists) {
    await page.getByRole('link', { name: 'Create a new Organization' }).click();
    await page.waitForTimeout(2000);
    await page.getByPlaceholder('Enter organization name (').fill(orgName);
    await page.getByPlaceholder('Describe your organization').fill('This is a description of the automated Org');
    await page.getByLabel('Organization name*').dblclick();
    await page.getByRole('button', { name: 'Save changes' }).click();
    await page.waitForTimeout(2000);
    await expect(page.getByText('Organization created').nth(0)).toBeVisible();
  }
});

test('03 - Invite a user to an Org Successfully', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/orgs`);
  await page.waitForLoadState('networkidle');
  await page.getByRole('row', { name: orgName }).locator('button').click();
  await page.getByRole('menuitem', { name: 'View / Edit' }).click();

  // Check if the Org user exists
  let UserExists = true;
  try {
    UserExists = await page.getByRole('row', { name: inviteEmail }).isHidden();
  } catch (error) {
    console.log('User already exists!', error);
  }

  if (UserExists) {
    await page.getByRole('button', { name: 'Invite users' }).click();
    await page.waitForTimeout(2000);
    await page.getByPlaceholder('Enter Email').click();
    await page.keyboard.type(inviteEmail);
    await page.getByRole('button', { name: 'Invite', exact: true }).click();

    // confirm
    await expect(page.getByText(inviteEmail + ' has been sent an invite').nth(0)).toBeVisible();

    await page.reload();
    await page.waitForTimeout(2000);
    const cell = page.getByRole('cell', {
      name: inviteEmail,
      exact: true,
    });
    await expect(cell).toBeVisible();
  }
});

test("04 - Change a user's Organization Admin access", async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/orgs`);
  await page.waitForLoadState('networkidle');
  await page.getByRole('row', { name: orgName }).locator('button').click();
  await page.getByRole('menuitem', { name: 'View / Edit' }).click();
  await page.waitForTimeout(2000);

  // Check if the Org user exists
  let UserExists = true;
  try {
    UserExists = await page.getByRole('row', { name: inviteEmail }).isVisible();
  } catch (error) {
    console.log('User does not exists!', error);
  }

  if (UserExists) {
    await page.getByRole('row', { name: inviteEmail }).locator('button').nth(1).click();
    await page.getByRole('menuitem', { name: 'Edit User Access' }).click();
    await page.waitForLoadState('networkidle');
    await page.locator('span').filter({ hasText: 'Organization Admin' }).click();
    await page.getByRole('status').locator('div').nth(1).click();
    const toastMessage = await page.locator('.test-toast-success').innerText();
    expect(toastMessage).toContain(inviteEmail + '’s Lab Access has been successfully updated');
  }
});

test('05 - Remove Invited user to an Org Successfully', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/orgs`);
  await page.waitForLoadState('networkidle');
  await page.getByRole('row', { name: orgName }).locator('button').click();
  await page.getByRole('menuitem', { name: 'View / Edit' }).click();
  await page.waitForTimeout(2000);

  // Check if the Org user exists
  let UserExists = true;
  try {
    UserExists = await page.getByRole('row', { name: inviteEmail }).isVisible();
  } catch (error) {
    console.log('Org already exists!', error);
  }

  if (UserExists) {
    await page.getByRole('row', { name: inviteEmail }).locator('button').nth(1).click();
    await page.getByRole('menuitem', { name: 'Remove From Org' }).click();
    await page.getByRole('button', { name: 'Remove User' }).nth(1).click();

    // confirm deletion
    page.getByText(inviteEmail + ' has been removed from Default Organization');
    const cell = page.getByRole('cell', {
      name: inviteEmail,
      exact: true,
    });

    await expect(cell).toBeHidden();
  }
});

test('06 - Update an Org Successfully', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/orgs`);
  await page.waitForTimeout(2000);

  // Check if the 'updated' test org already exists then update it back to the original value
  let AutoOrgExists = true;
  try {
    AutoOrgExists = await page.getByRole('row', { name: orgName }).isVisible();
  } catch (error) {
    console.log('Updated Organization not found', error);
  }

  if (AutoOrgExists) {
    await page.getByRole('row', { name: orgName }).locator('button').click();
    await page.getByRole('menuitem', { name: 'View / Edit' }).click();
    await page.getByRole('tab', { name: 'Details' }).click();
    await page.getByText('Organization name*').isVisible();
    await page.getByLabel('Organization name*').fill(orgNameUpdated);
    await page.getByPlaceholder('Describe your organization').fill('This is an ORG created by Playwright');
    await page.getByRole('button', { name: 'Save changes' }).click();
    await page.getByText('Organization updated', { exact: true }).isVisible();
    await page.waitForTimeout(2000);
    await expect(page.getByText('Organization updated').nth(0)).toBeVisible();

    await page.reload();
    await page.waitForTimeout(2000);
    await expect(page.getByText(orgNameUpdated).nth(0)).toBeVisible();
    await expect(page.getByText('This is an ORG created by Playwright').nth(0)).toBeVisible();
  } else {
    console.log('Updated Organization not found');
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





*/
