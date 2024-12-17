import { test, expect } from 'playwright/test';
import { envConfig } from '../../../config/env-config';

/*
 * Test preconditions:
 * - a lab exists named 'Playwright test lab' or 'Automated Lab - Updated' (labName or labNameUpdated)
 *   - has workspace ID/PAT set (so the alert popup doesn't appear)
 *   - has user 'Lab Manager' on lab
 */

const orgName = 'Default Organization';
const labName = 'Playwright test lab';
const labNameUpdated = 'Automated Lab - Updated';
const labManagerName = 'Lab Manager';
const labManagerEmail = 'lab.manager@easygenomics.org';

test('01 - Remove user from a Laboratory Successfully', async ({ page, baseURL }) => {
  // Check if the user has been added already to a Lab
  await page.goto(`${baseURL}/labs`);
  await page.waitForLoadState('networkidle');
  let hasTestLab = true;
  try {
    hasTestLab = await page.getByRole('row', { name: labName }).isVisible();
  } catch (error) {
    console.log('Test lab not found', error);
  }

  if (hasTestLab) {
    let userNotAddedToLab = true;
    try {
      userNotAddedToLab = await page.getByRole('row', { name: labManagerName + 'Grant access' }).isHidden();
    } catch (error) {
      console.log('User is not added yet to Automation Lab!', error);
    }

    if (userNotAddedToLab) {
      await page.getByRole('row', { name: labName }).locator('button').click();
      await page.getByRole('menuitem', { name: 'View / Edit' }).click();
      await page.getByRole('tab', { name: 'Lab Users' }).click();
      await page.waitForTimeout(2000);
      await page.getByRole('row', { name: labManagerName }).locator('button').click();
      await page.getByRole('menuitem', { name: 'Remove From Lab' }).click();
      await page.getByRole('button', { name: 'Remove User' }).click();
      await page.waitForTimeout(2000);
      //await page.getByRole('status').locator('div').nth(1).click();
      await expect(page.getByText('Successfully removed ' + labManagerName + ' from ' + labName).nth(0)).toBeVisible();
    }
  }

  await page.goto(`${baseURL}/labs`);
  await page.waitForLoadState('networkidle');

  let hasUpdatedTestLab = true;
  try {
    hasUpdatedTestLab = await page.getByRole('row', { name: labNameUpdated }).isVisible();
  } catch (error) {
    console.log('Test lab not found', error);
  }

  if (hasUpdatedTestLab) {
    let userNotAddedToLab = true;
    try {
      userNotAddedToLab = await page.getByRole('row', { name: 'Grant access' }).isHidden();
    } catch (error) {
      console.log('User is not added yet to Automation Lab!', error);
    }

    if (userNotAddedToLab) {
      await page.getByRole('row', { name: labNameUpdated }).locator('button').click();
      await page.getByRole('menuitem', { name: 'View / Edit' }).click();
      await page.getByRole('tab', { name: 'Lab Users' }).click();
      await page.waitForTimeout(2000);
      await page.getByRole('row', { name: labManagerName }).locator('button').click();
      await page.getByRole('menuitem', { name: 'Remove From Lab' }).click();
      await page.getByRole('button', { name: 'Remove User' }).click();
      await page.waitForTimeout(2000);
      //await page.getByRole('status').locator('div').nth(1).click();
      await expect(
        page.getByText('Successfully removed ' + labManagerName + ' from ' + labNameUpdated).nth(0),
      ).toBeVisible();
    }
  }
});

test('02 - Remove a Laboratory Successfully', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/labs`);
  await page.waitForLoadState('networkidle');

  // Check if the test lab exists before deleting
  let hasTestLab = true;
  try {
    hasTestLab = await page.getByRole('row', { name: labName }).isVisible();
  } catch (error) {
    console.log('Test lab not found, proceeding to create it:', error);
  }

  if (hasTestLab) {
    await page.getByRole('row', { name: labName }).locator('button').click();
    await page.getByRole('menuitem', { name: 'Remove' }).click();
    await page.getByRole('button', { name: 'Remove Lab' }).click();

    // confirm deletion
    await expect(page.getByText("Lab '" + labName + "' has been removed")).toBeVisible();

    await page.waitForTimeout(2000);
    const cell = page.getByRole('cell', {
      name: labName,
      exact: true,
    });

    await expect(cell).toBeHidden();
  }

  await page.goto(`${baseURL}/labs`);
  await page.waitForLoadState('networkidle');

  let hasTestLabUpdated = true;
  try {
    hasTestLabUpdated = await page.getByRole('row', { name: labNameUpdated }).isVisible();
  } catch (error) {
    console.log('Test lab not found, proceeding to create it:', error);
  }

  if (hasTestLabUpdated) {
    await page.getByRole('row', { name: labNameUpdated }).locator('button').click();
    await page.getByRole('menuitem', { name: 'Remove' }).click();
    await page.getByRole('button', { name: 'Remove Lab' }).click();

    // confirm deletion
    await expect(page.getByText("Lab '" + labNameUpdated + "' has been removed")).toBeVisible();

    await page.waitForTimeout(2000);
    const cell = page.getByRole('cell', {
      name: labNameUpdated,
      exact: true,
    });

    await expect(cell).toBeHidden();
  }
});

test('03 - Create a Laboratory Successfully', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/labs`);
  await page.waitForTimeout(2000);

  // Check if the test lab exists and handle the result gracefully
  let hasTestLab = false;
  try {
    hasTestLab = await page.getByRole('row', { name: labName }).isVisible();
  } catch (error) {
    console.log('Test lab not found, proceeding to create it:', error);
  }

  // cleanup: remove test lab if exist from previous test run
  if (hasTestLab) {
    await page.getByRole('row', { name: labName }).locator('button').click();
    await page.getByRole('menuitem', { name: 'Remove' }).click();
    await page.getByRole('button', { name: 'Remove Lab' }).click();
    page.getByText('Lab ' + labName + ' has been removed');
  }
  // create new Laboratory
  await page.getByRole('button', { name: 'Create a new Lab' }).click();
  await page.getByPlaceholder('Enter lab name (required and').click();
  await page.getByPlaceholder('Enter lab name (required and').fill('Playwright test lab');
  await page.getByPlaceholder('Describe your lab and what').click();
  await page.getByPlaceholder('Describe your lab and what').fill('Playwright test lab description');
  await page.getByLabel('Default S3 bucket directory').click();
  await page.getByText(envConfig.testS3Url).click();
  await page.getByLabel('Enable Seqera Integration').check();
  await page.getByLabel('Workspace ID').click();
  await page.getByLabel('Workspace ID').fill(envConfig.testWorkspaceId);
  await page.getByLabel('Personal Access Token').click();
  await page.getByLabel('Personal Access Token').fill(envConfig.testAccessToken);
  await page.getByRole('button', { name: 'Create Lab' }).click();
  page.getByRole('cell', { name: 'Playwright test lab' });
  page.getByRole('cell', { name: 'Playwright test lab description' });

  // confirm creation
  page.getByText('Successfully created Lab: ' + labName);
  const cell = page.getByRole('cell', {
    name: 'Playwright test lab',
    exact: true,
  });

  await expect(cell).toBeVisible();
});

test('04 - Update a Laboratory Successfully', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/labs`);
  await page.waitForLoadState('networkidle');

  // Check if the 'Playwright test lab' which was created in another test
  let hasTestLab = false;
  try {
    hasTestLab = await page.getByRole('row', { name: labName }).isVisible();
  } catch (error) {
    console.log('Playwright test lab not found', error);
  }

  // Check if a 'Playwright test lab' is existing then update can proceed
  if (hasTestLab) {
    // update Laboratory
    await page.getByRole('row', { name: labName }).locator('button').click();
    await page.getByRole('menuitem', { name: 'View / Edit' }).click();
    await page.waitForTimeout(5 * 1000); // this waits for s3 bucket info to load
    await page.getByRole('tab', { name: 'Details' }).click();
    await page.getByRole('button', { name: 'Edit' }).click();

    await page.getByPlaceholder('Enter lab name (required and').click();
    await page.getByPlaceholder('Enter lab name (required and').fill(labNameUpdated);
    await page.getByPlaceholder('Describe your lab and what').click();
    await page.getByPlaceholder('Describe your lab and what').fill('Automation test lab description');
    await page.getByLabel('Enable Seqera Integration').check();
    await page.getByLabel('Workspace ID').click();
    await page.getByLabel('Workspace ID').fill(envConfig.testWorkspaceId);
    await page.getByLabel('Personal Access Token').click();
    await page.getByLabel('Personal Access Token').fill(envConfig.testAccessToken);

    await page.getByRole('button', { name: 'Save Changes' }).click();
    await page.waitForTimeout(2000);

    // confirm update toast message
    await expect(page.getByText(labNameUpdated + ' successfully updated').nth(0)).toBeVisible();
    await expect(page.getByText(labNameUpdated).nth(1)).toBeVisible();

    // go back to lab list and confirm
    await page.goto(`${baseURL}/labs`);
    await page.waitForLoadState('networkidle');

    const cell = page.getByRole('cell', {
      name: labNameUpdated,
      exact: true,
    });
    await expect(cell).toBeVisible();
  }
});

test('05 - Grant access to a user to a Lab via Edit User Access Successfully', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/orgs`);
  await page.waitForLoadState('networkidle');
  await page.getByRole('row', { name: orgName }).locator('button').click();
  await page.getByRole('menuitem', { name: 'View / Edit' }).click();
  await page.getByRole('row', { name: labManagerName }).locator('button').click();
  await page.getByRole('menuitem', { name: 'Edit User Access' }).click();
  await page.waitForTimeout(2000);

  let userNotAddedToLab = true;
  try {
    userNotAddedToLab = await page.getByRole('row', { name: labNameUpdated + ' Grant access' }).isVisible();
  } catch (error) {
    console.log('User was already added!', error);
  }

  if (userNotAddedToLab) {
    // Click Grant Access in Edit User Access page
    await page
      .getByRole('row', { name: labNameUpdated + ' Grant access' })
      .getByRole('button')
      .click();
    await page.waitForTimeout(2000);

    // confirm creation
    await page.getByText(labNameUpdated + ' has been successfully updated for ' + labManagerName);

    await page.reload();
    await page.waitForTimeout(2000);
    await page.getByRole('row', { name: labNameUpdated + ' Lab Technician' }).isVisible();
  }
});

test('06 - Remove user from a Lab via Edit User Access Successfully', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/orgs`);
  await page.waitForLoadState('networkidle');
  await page.getByRole('row', { name: orgName }).locator('button').click();
  await page.getByRole('menuitem', { name: 'View / Edit' }).click();
  await page.getByRole('row', { name: labManagerName }).locator('button').click();
  await page.getByRole('menuitem', { name: 'Edit User Access' }).click();
  await page.waitForTimeout(2000);

  let UserAddedtoLab = true;
  try {
    UserAddedtoLab = await page.getByRole('row', { name: labNameUpdated + ' Grant access' }).isHidden();
  } catch (error) {
    console.log('User has not been added!', error);
  }

  if (UserAddedtoLab) {
    //this will delete the user
    await page.getByRole('row', { name: labNameUpdated }).locator('button').click();
    await page.getByRole('menuitem', { name: 'Remove From Lab' }).click();
    await page.getByRole('button', { name: 'Remove User' }).click();
    await page.waitForTimeout(2000);
    await page.getByRole('status').locator('div').nth(1).click();
    await page.getByText('Successfully removed ' + labManagerName + ' from ' + labNameUpdated).click();
    await page.getByRole('row', { name: labNameUpdated + ' Grant Access' }).isVisible();
  }
});

test('07 - Add a user to a Laboratory Successfully', async ({ page, baseURL }) => {
  // Check if the user has been added already to a Lab
  await page.goto(`${baseURL}/labs`);
  await page.waitForLoadState('networkidle');

  let userNotAddedToLab = true;
  try {
    userNotAddedToLab = await page.getByRole('row', { name: 'Grant access' }).isHidden();
  } catch (error) {
    console.log('User is not added yet to Automation Lab!', error);
  }

  if (userNotAddedToLab) {
    await page.getByRole('row', { name: labNameUpdated }).locator('button').click();
    await page.getByRole('menuitem', { name: 'View / Edit' }).click();
    await page.getByRole('tab', { name: 'Lab Users' }).click();
    await page.getByRole('button', { name: 'Add Lab Users' }).click();
    await page.waitForLoadState('networkidle');

    await page.getByText('Select User').click();
    await page.getByPlaceholder('Search all users...').click();
    await page.keyboard.type(labManagerEmail);
    await page.getByRole('option', { name: labManagerName }).click();
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await page.getByText('Successfully added ' + labManagerName + ' to ' + labNameUpdated).click();
  }
});

test('08 - Enable HealthOmics Integration Successfully', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/labs`);
  await page.waitForLoadState('networkidle');

  // Check if the 'Playwright test lab' which was created in another test
  let hasUpdatedTestLab = false;
  try {
    hasUpdatedTestLab = await page.getByRole('row', { name: labNameUpdated }).isVisible();
  } catch (error) {
    console.log(labNameUpdated + ' lab not found', error);
  }

  // Check if a 'Playwright test lab' is existing then update can proceed
  if (hasUpdatedTestLab) {
    // update Laboratory
    await page.getByRole('row', { name: labNameUpdated }).locator('button').click();
    await page.getByRole('menuitem', { name: 'View / Edit' }).click();
    await page.waitForTimeout(5 * 1000); // this waits for s3 bucket info to load
    await page.getByRole('tab', { name: 'Details' }).click();
    await page.getByRole('button', { name: 'Edit' }).click();

    let omicsEnabled = true;
    try {
      omicsEnabled = await page.getByLabel('Enable HealthOmics Integration').isChecked();
    } catch (error) {
      console.log('OMICS toggle is already enabled!', error);
    }

    if (omicsEnabled == false) {
      await page.getByLabel('Enable HealthOmics Integration').check();

      await page.getByRole('button', { name: 'Save Changes' }).click();
      await page.waitForTimeout(2000);

      // confirm update toast message
      await expect(page.getByText(labNameUpdated + ' successfully updated').nth(0)).toBeVisible();
      await expect(page.getByText(labNameUpdated).nth(1)).toBeVisible();
      await page.waitForLoadState('networkidle');

      // confirm if the 'HealthOmics Workflows' tab is visible
      await expect(page.getByRole('tab', { name: 'HealthOmics Workflows' })).toBeVisible();
    } else {
      console.log('OMICS toggle is already enabled!');
    }
  }
});

//TO DO
//The scripts below are TO DO and will included in the file soon
/*
test('Remove user from a Laboratory containing users', async ({ page, baseURL }) => {
});

test('Remove Laboratory successfully', async ({ page, baseURL }) => {
});

test('Grant Access as Lab Technician', async ({ page, baseURL }) => {
});

test('Grant Access as Lab Manager', async ({ page, baseURL }) => {
});

*/
