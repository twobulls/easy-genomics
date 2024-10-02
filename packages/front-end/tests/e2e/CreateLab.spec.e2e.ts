import { test, expect } from 'playwright/test';

test('Should create a Laboratory', async ({ page, baseURL }) => {
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
