import { test, expect } from 'playwright/test';

test('Update a Laboratory Successfully', async ({ page, baseURL }) => {
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
    await page.getByRole('menuitem', { name: 'View / Edit' }).click();

    // Check if "Automation Lab" has users

    /*
      const promises = data.map(async row => {
        const [name, address, url] = row;
      
        await page.goto(url);
      
        // Do other things
      });
      
      await Promise.all(promises);
      */

    let hasUsers = true;
    try {
      hasUsers = await page.getByRole('row', { name: 'There are no users in your Lab' }).isHidden();
    } catch (error) {
      console.log('User is not found', error);
    }

    if (hasUsers) {
      /*
        await page.getByRole('row', { name: 'Rick Sanchez' }).locator('button').click();
        await page.getByRole('menuitem', { name: 'Remove From Lab' }).click();
        await page.getByRole('button', { name: 'Remove User' }).click();
        await page.getByRole('status').locator('div').nth(1).click();
        */

      //const rowCount = await page.getByRole('menuitem', { name: 'Lab Technician' }).count();
      const rowCount = await page
        .locator(
          'xpath=//body[1]/div[1]/main[1]/div[2]/div[2]/div[3]/div[1]/div[2]/div[1]/div[1]/table[1]/tbody[1]/tr[1]/td[2]',
        )
        .count();

      for (let i = 0; i < rowCount; i++) {
        await page.getByRole('menuitem', { name: 'Remove From Lab' }).click();
        await page.getByRole('button', { name: 'Remove User' }).click();
        await page.getByRole('status').locator('div').nth(1).click();
      }
    }

    await page.getByRole('link', { name: 'Labs' }).dblclick();
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
