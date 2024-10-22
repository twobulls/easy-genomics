import { test, expect } from 'playwright/test';

test('01 - Create a Laboratory Successfully', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/labs`);
  await page.waitForTimeout(2000);

  // Check if the test lab exists and handle the result gracefully
  let hasTestLab = false;
  try {
    hasTestLab = await page.getByRole('row', { name: 'Playwright test lab' }).isVisible();
  } catch (error) {
    console.log('Test lab not found, proceeding to create it:', error);
  }

  // cleanup: remove test lab if exist from previous test run
  if (hasTestLab) {
    await page.getByRole('row', { name: 'Playwright test lab' }).locator('button').click();
    await page.getByRole('menuitem', { name: 'Remove' }).click();
    await page.getByRole('button', { name: 'Remove Lab' }).click();
    page.getByText("Lab 'Playwright test lab' has been removed");
  }
  // create new Laboratory
  await page.getByRole('button', { name: 'Create a new Lab' }).click();
  await page.getByLabel('Workspace ID').fill('test.user@easygenomics.org');
  await page.getByLabel('Personal Access Token').fill('P@ssw0rd');
  await page.getByPlaceholder('Enter lab name (required and').click();
  await page.getByPlaceholder('Enter lab name (required and').fill('Playwright test lab');
  await page.getByPlaceholder('Describe your lab and what').click();
  await page.getByPlaceholder('Describe your lab and what').fill('Playwright test lab description');
  await page.getByLabel('Default S3 bucket directory').click();
  await page.getByText('851725267090-quality.dev.easygenomics.org').click();
  await page.getByLabel('Workspace ID').click();
  await page.getByLabel('Workspace ID').fill('');
  await page.getByLabel('Personal Access Token').click();
  await page.getByLabel('Personal Access Token').fill('');
  await page.getByRole('button', { name: 'Create Lab' }).click();
  page.getByRole('cell', { name: 'Playwright test lab' });
  page.getByRole('cell', { name: 'Playwright test lab description' });

  // confirm creation
  page.getByText('Successfully created Lab: Playwright test lab');
  const cell = page.getByRole('cell', {
    name: 'Playwright test lab',
    exact: true,
  });

  await expect(cell).toBeVisible();
});

test('02 - Update a Laboratory Successfully', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/labs`);
  await page.waitForTimeout(2000);

  // Check if the updated test lab exists and handle the result gracefully
  let hasUpdatedLab = false;
  try {
    hasUpdatedLab = await page.getByRole('row', { name: 'Automation Lab' }).isVisible();
  } catch (error) {
    console.log('Automation Lab not found', error);
  }

  // cleanup: remove the updated test lab from previous test run to avoid failure due to existing Lab name
  if (hasUpdatedLab) {
    await page.getByRole('row', { name: 'Automation Lab' }).locator('button').click();
    await page.getByRole('menuitem', { name: 'Remove' }).click();
    await page.getByRole('button', { name: 'Remove Lab' }).click();
    await page.waitForTimeout(5000);
    await expect(page.getByText("Lab 'Automation Lab' has been removed").nth(0)).toBeVisible();
  }

  // Check if the 'Playwright test lab' which was created in another test
  let hasTestLab = false;
  try {
    hasTestLab = await page.getByRole('row', { name: 'Playwright test lab' }).isVisible();
  } catch (error) {
    console.log('Playwright test lab not found', error);
  }

  // Check if a 'Playwright test lab' is existing then update can proceed
  if (hasTestLab) {
    // update Laboratory
    await page.getByRole('row', { name: 'Playwright test lab' }).locator('button').click();
    await page.getByRole('menuitem', { name: 'View / Edit' }).click();
    await page.getByRole('button', { name: 'Okay' }).click();
    await page.getByRole('button', { name: 'Edit' }).click();

    await page.getByPlaceholder('Enter lab name (required and').click();
    await page.getByPlaceholder('Enter lab name (required and').fill('Automation Lab');
    await page.getByPlaceholder('Describe your lab and what').click();
    await page.getByPlaceholder('Describe your lab and what').fill('Automation test lab description');
    await page.getByLabel('Workspace ID').click();
    await page.getByLabel('Workspace ID').fill('40230138858677');
    await page.getByLabel('Personal Access Token').click();
    await page
      .getByLabel('Personal Access Token')
      .fill('eyJ0aWQiOiA5NjY5fS5jNTYxOGNmNmVmNzY4ZWU4M2JhZWUzMTQ0MGMxNjRjNTYwYWZlZmRm');

    await page.getByRole('button', { name: 'Save Changes' }).click();
    await page.waitForTimeout(5000);

    // confirm update
    await expect(page.getByText('Automation Lab successfully updated').nth(0)).toBeVisible();
    await expect(page.getByText('Automation Lab').nth(0)).toBeVisible();
  }
});

test('03 - Grant access to a user to a Laboratory via Edit User Access Successfully', async ({ page, baseURL }) => {
  // Check if the user has been added already to a Lab
  await page.goto(`${baseURL}/orgs`);
  await page.waitForLoadState('networkidle');
  await page.getByRole('row', { name: 'Default Organization' }).locator('button').click();
  await page.getByRole('menuitem', { name: 'View / Edit' }).click();
  await page.getByRole('row', { name: 'Org Admin' }).locator('button').click();
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
  await page.getByRole('row', { name: 'Org Admin' }).locator('button').click();
  await page.getByRole('menuitem', { name: 'Edit User Access' }).click();
  await page.getByRole('row', { name: 'Automation Lab Grant access' }).getByRole('button').click();
  await page.waitForTimeout(2000);
  await page.getByRole('status').locator('div').nth(1).click();
});

test('04 - Remove user from a Laboratory Successfully', async ({ page, baseURL }) => {
  // Check if the user has been added already to a Lab
  await page.goto(`${baseURL}/labs`);
  await page.waitForLoadState('networkidle');
  await page.getByRole('row', { name: 'Automation Lab' }).locator('button').click();
  await page.getByRole('menuitem', { name: 'View / Edit' }).click();
  await page.getByRole('tab', { name: 'Lab Users' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('row', { name: 'Org Admin' }).locator('button').click();
  await page.getByRole('menuitem', { name: 'Remove From Lab' }).click();
  await page.getByRole('button', { name: 'Remove User' }).click();
  await page.waitForTimeout(2000);
  //await page.getByRole('status').locator('div').nth(1).click();
  await expect(page.getByText('Successfully removed Org Admin from Automation Lab').nth(0)).toBeVisible();
});

/*
test('Remove user from a Laboratory containing users', async ({ page, baseURL }) => {
});

test('Remove Laboratory successfully', async ({ page, baseURL }) => {
});

*/
