import { test, expect } from 'playwright/test';
import { randomUUID } from 'node:crypto';
import { envConfig } from '../../../config/env-config';

const labName = 'Playwright test lab';
const labNameUpdated = 'Automated Lab - Updated';
const seqeraPipeline = 'quality-e2e-test-pipeline';
const filePath1 = './tests/e2e/fixtures/GOL2051A64544_S114_L002_R1_001.fastq.gz';
const filePath2 = './tests/e2e/fixtures/GOL2051A64544_S114_L002_R2_001.fastq.gz';
const labTechnicianName = 'Lab Technician';

test('01 - Hide Create a new Laboratory button', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/labs`);
  await page.waitForTimeout(2000);

  // confirm button if enabled/visible
  await expect(page.getByRole('button', { name: 'Create a new Lab' })).toBeHidden();
});

test('02 - Hide Remove a Laboratory option', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/labs`);
  await page.waitForLoadState('networkidle');

  // Check if any test lab exists
  let hasTestLab = true;
  try {
    hasTestLab = await page.getByRole('row').nth(1).isVisible();
  } catch (error) {
    console.error('No labs found');
  }

  if (hasTestLab) {
    // Click on the first lab row available
    await page.getByRole('row').locator('button').nth(1).click();

    // Confirm if Remove option is available on the first row
    await expect(page.getByRole('menuitem', { name: 'Remove' })).toBeHidden();
  }
});

test('03 - Hide Organization link', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}`);
  await page.waitForLoadState('networkidle');

  //check if the Organizations menu is visible
  await expect(page.getByRole('link', { name: 'Organizations' })).toBeHidden();
});

test('04 - Disable Editing Lab Details', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/labs`);
  await page.waitForLoadState('networkidle');

  let hasTestLab = false;
  try {
    hasTestLab = await page.getByRole('row', { name: labName }).isVisible();
  } catch (error) {
    console.log(labName + ' test lab not found', error);
  }

  if (hasTestLab == true) {
    await page.getByRole('row', { name: labName }).locator('button').click();
    await page.getByRole('menuitem', { name: 'View / Edit' }).click();
    await page.getByRole('tab', { name: 'Details' }).click();

    // check if Edit is disabled
    await expect(page.getByRole('button', { name: 'Edit' })).toBeDisabled();
  } else {
    console.log('Cannot find ' + labName);
  }

  await page.goto(`${baseURL}/labs`);
  await page.waitForLoadState('networkidle');

  let hasUpdatedTestLab = false;
  try {
    hasUpdatedTestLab = await page.getByRole('row', { name: labNameUpdated }).isVisible();
  } catch (error) {
    console.log(labNameUpdated + ' test lab not found', error);
  }

  if (hasUpdatedTestLab == true) {
    await page.getByRole('row', { name: labNameUpdated }).locator('button').click();
    await page.getByRole('menuitem', { name: 'View / Edit' }).click();
    await page.getByRole('tab', { name: 'Details' }).click();

    // check if Edit is disabled
    await expect(page.getByRole('button', { name: 'Edit' })).toBeDisabled();
  } else {
    console.log('Cannot find ' + labNameUpdated);
  }
});

test('05 - Launch Seqera Run Successfully', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/labs`);
  await page.waitForLoadState('networkidle');

  // Check if the 'Playwright test lab' which was created in another test
  let hasTestLab = false;
  try {
    hasTestLab = await page.getByRole('row', { name: labNameUpdated }).isVisible();
  } catch (error) {
    console.log('Updated test lab not found', error);
  }

  // Check if a 'Playwright test lab' is existing then update can proceed
  if (hasTestLab) {
    // update Laboratory
    await page.getByRole('row', { name: labNameUpdated }).locator('button').click();
    await page.getByRole('menuitem', { name: 'View / Edit' }).click();
    await page.waitForTimeout(5 * 1000);
    await page.getByRole('tab', { name: 'Seqera Pipelines' }).click();
    await page.waitForLoadState('networkidle');

    let hasSeqPipeline = false;
    try {
      hasSeqPipeline = await page.getByRole('row', { name: seqeraPipeline }).isVisible();
    } catch (error) {
      console.log('Pipeline not found', error);
    }

    if (hasSeqPipeline) {
      const uuid = randomUUID();
      const runName = `EasyG_SEQ_Run-${uuid}`;
      await page.getByRole('row', { name: seqeraPipeline }).locator('button').click();
      await page.getByRole('menuitem', { name: 'Run' }).click();
      await page.waitForLoadState('networkidle');

      // STEP 01
      await page.getByRole('textbox', { name: 'Run Name*' }).click();
      await page.getByRole('textbox', { name: 'Run Name*' }).fill(runName);
      await page.getByRole('button', { name: 'Save & Continue' }).click();

      // STEP 02
      const fileChooserPromise = page.waitForEvent('filechooser');
      await page.getByRole('button', { name: 'Choose Files' }).click();
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles([filePath1, filePath2]);
      await page.getByRole('button', { name: 'Upload Files' }).click();
      await page.waitForTimeout(35 * 1000);

      // ** Check if files are successfully uploaded
      await page.waitForLoadState('networkidle');
      await expect(page.getByText('100%').nth(0)).toBeVisible();
      // ** Check if Download Sample Sheet button is enabled
      await expect(page.getByRole('button', { name: 'Download sample sheet' })).toBeEnabled();

      await page.getByRole('button', { name: 'Next step' }).click();

      // STEP 03
      await expect(page.getByRole('textbox', { name: 'Input/output options' })).not.toBeNull();
      await expect(page.getByRole('textbox', { name: 'outdir' })).not.toBeNull();
      await page.getByRole('button', { name: 'Save & Continue' }).click();

      // STEP 04
      await page.getByRole('button', { name: 'Launch Workflow Run' }).click();
      await page.waitForTimeout(2000);
      await page.getByRole('button', { name: 'Back to Runs' }).click();
      await page.waitForLoadState('networkidle');

      // ** Check if the run name appears in the Run List
      await expect(page.getByRole('row', { name: runName })).toBeVisible();
    }
  }
});

test('06 - Remove user from a Laboratory Successfully', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/labs`);
  await page.waitForLoadState('networkidle');

  let hasUpdatedTestLab = true;
  try {
    hasUpdatedTestLab = await page.getByRole('row', { name: labNameUpdated }).isVisible();
  } catch (error) {
    console.log('Test lab not found', error);
  }

  if (hasUpdatedTestLab) {
    await page.getByRole('row', { name: labNameUpdated }).locator('button').click();
    await page.getByRole('menuitem', { name: 'View / Edit' }).click();
    await page.getByRole('tab', { name: 'Lab Users' }).click();
    await page.waitForTimeout(5 * 1000);
    await page.waitForLoadState('networkidle');

    let userVisible = false;
    try {
      userVisible = await page.getByRole('row', { name: labTechnicianName }).isVisible();
    } catch (error) {
      console.log('User is not added yet to Automation Lab!', error);
    }

    if (userVisible == true) {
      await page.getByRole('row', { name: labTechnicianName }).locator('button').click();
      await page.getByRole('menuitem', { name: 'Remove From Lab' }).click();
      await page.getByRole('button', { name: 'Remove User' }).click();
      await page.waitForTimeout(2000);
      //await page.getByRole('status').locator('div').nth(1).click();
      await expect(
        page.getByText('Successfully removed ' + labTechnicianName + ' from ' + labNameUpdated).nth(0),
      ).toBeVisible();
    }
  }
});

test('07 - Add a Lab Technician to a Lab Successfully', async ({ page, baseURL }) => {
  // Check if the user has been added already to a Lab
  await page.goto(`${baseURL}/labs`);
  await page.getByRole('row', { name: labNameUpdated }).locator('button').click();
  await page.waitForLoadState('networkidle');
  await page.getByRole('menuitem', { name: 'View / Edit' }).click();
  await page.getByRole('tab', { name: 'Lab Users' }).click();

  let userHidden = false;
  try {
    userHidden = await page.getByRole('row', { name: labTechnicianName }).isHidden();
  } catch (error) {
    console.log('User is not added yet to Automation Lab!', error);
  }

  if (userHidden == true) {
    await page.getByRole('button', { name: 'Add Lab Users' }).click();
    await page.getByText('Select User').click();
    await page.getByPlaceholder('Search all users...').click();
    await page.keyboard.type(envConfig.labTechnicianEmail);
    await page.getByRole('option', { name: labTechnicianName }).click();
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await expect(page.getByText('Successfully added ' + labTechnicianName + ' to ' + labNameUpdated)).toBeVisible();
  }
});

test('08 - Check if Reset Password fails', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}`);
  await page.waitForLoadState('networkidle');

  // confirm button if enabled/visible
  await page.getByRole('button', { name: 'LM' }).click();
  await page.getByRole('menuitem', { name: 'Sign Out' }).click();
  await page.waitForTimeout(2000);

  // check Sign out confirmation
  await expect(page.getByText('You have been signed out')).toBeVisible();

  await page.getByRole('link', { name: 'Forgot password?' }).click();

  // check page link where the user is redirected
  await page.waitForLoadState();
  expect(page.url()).toEqual(`${baseURL}/forgot-password`);

  await page.waitForTimeout(2000);
  await page.getByLabel('Email address').fill(`${envConfig.testInviteEmail}`);
  await page.getByRole('button', { name: 'Send password reset link' }).click();

  // check confirmation
  await page.waitForTimeout(2000);
  await expect(page.getByText('Reset link has been sent to ' + envConfig.testInviteEmail)).toBeVisible();
});
