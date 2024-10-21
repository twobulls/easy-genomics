import { test, expect } from 'playwright/test';

const runName = 'Auto_run_test_ignore';
const pipelineName = 'nf-core-viralrecon';
//const filePath1 = "./fixtures/GOL2051A64544_S114_L002_R1_001.fastq.gz";
//const filePath2 = "./fixtures/GOL2051A64544_S114_L002_R1_002.fastq.gz";
//@easy-genomics/shared-lib/src/app/types/configuration
const filePath1 = './tests/e2e/fixtures/GOL2051A64544_S114_L002_R1_001.fastq.gz';
const filePath2 = './tests/e2e/fixtures/GOL2051A64544_S114_L002_R1_002.fastq.gz';

test('Launch a Pipeline Run Successfully', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/labs`);
  await page.waitForTimeout(2000);

  // Check if the updated test lab exists and handle the result gracefully
  let hasTestLab = false;
  try {
    hasTestLab = await page.getByRole('row', { name: 'Automation Lab' }).isVisible();
  } catch (error) {
    console.log('Automation lab not found', error);
  }

  if (hasTestLab) {
    // Go to Pipelines
    await page.getByRole('row', { name: 'Automation Lab' }).locator('button').click();
    await page.getByRole('menuitem', { name: 'View / Edit' }).click();
    await page.getByRole('tab', { name: 'Pipelines' }).click();
    //await page.getByRole('tab', { name: 'Pipelines' }).click();
    await page.getByRole('columnheader', { name: 'Name' }).isVisible();

    // Go to 2nd page and look for 'nf-core-viralrecon'
    await page.getByRole('button', { name: '2' }).click();
    await page.getByText(pipelineName).click();

    //Check if user is in Step 1
    await page.getByLabel('Run Details').getByText('Step').isVisible();

    //Populate Step 1
    await page.getByRole('textbox', { name: 'Run Name*' }).fill(runName);
    await page.getByRole('button', { name: 'Save & Continue' }).click();

    //Populate Step 2
    await page.getByRole('button', { name: 'Choose Files' }).click();
    await page.getByRole('button', { name: 'Choose Files' }).setInputFiles([filePath1, filePath2]);
    await page.getByRole('button', { name: 'Upload Files' }).click();

    /*
    const inputElement = await page.locator('input[type="file"]');
    await page.locator('input[name="file-upload"]').click();
    await inputElement.setInputFiles([filePath1]);
    await inputElement.setInputFiles([filePath2]);
*/
    await page.getByText('100%').click();
    await page.getByRole('status').locator('div').nth(1).click();
    await expect(page.getByText('Automation Lab successfully updated').nth(0)).toBeVisible();
    await page.getByRole('button', { name: 'Next step' }).click();
    await page.getByRole('button', { name: 'Save & Continue' }).click();
    await page.getByLabel('Run Details').getByText(pipelineName).isVisible();
    await page.getByLabel('Run Details').getByText(runName).isVisible();
  }
});
