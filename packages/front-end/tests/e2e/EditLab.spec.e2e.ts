import { test, expect } from 'playwright/test';

test.describe('Laboratory workflow', () => {
  test('Clean up existing test lab', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/labs`);
    await page.waitForTimeout(2000);

    // Check if the updated test lab exists and remove it if found
    let hasUpdatedLab = false;
    try {
      hasUpdatedLab = await page.getByRole('row', { name: 'Automation Lab' }).isVisible();
    } catch (error) {
      console.log('Automation Lab not found', error);
    }

    if (hasUpdatedLab) {
      await page.getByRole('row', { name: 'Automation Lab' }).locator('button').click();
      await page.getByRole('menuitem', { name: 'Remove' }).click();
      await page.getByRole('button', { name: 'Remove Lab' }).click();
      await page.waitForTimeout(5000);
      await expect(page.getByText("Lab 'Automation Lab' has been removed").nth(0)).toBeVisible();
    }
  });

  test('Verify the existence of Playwright test lab', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/labs`);
    await page.waitForTimeout(2000);

    // Check if the 'Playwright test lab' exists
    let hasTestLab = false;
    try {
      hasTestLab = await page.getByRole('row', { name: 'Playwright test lab' }).isVisible();
    } catch (error) {
      console.log('Playwright test lab not found', error);
    }

    expect(hasTestLab).toBe(true);
  });

  test('Update Playwright test lab to Automation Lab', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/labs`);
    await page.waitForTimeout(2000);

    // Ensure 'Playwright test lab' exists before proceeding
    const hasTestLab = await page.getByRole('row', { name: 'Playwright test lab' }).isVisible();
    expect(hasTestLab).toBe(true);

    // Update Laboratory
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

    // Confirm update
    await expect(page.getByText('Automation Lab successfully updated').nth(0)).toBeVisible();
    await expect(page.getByText('Automation Lab').nth(0)).toBeVisible();
  });
});
