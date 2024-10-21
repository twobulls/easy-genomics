import { test, expect } from 'playwright/test';

test('Grant access to a user to a Laboratory Successfully', async ({ page, baseURL }) => {
  // Check if the user has been added already to a Lab
  await page.goto(`${baseURL}/orgs`);
  //await page.getByRole('link', { name: 'Organizations' }).click();
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
  await page.getByRole('status').locator('div').nth(1).click();
});

test('V2 Add a user to a Laboratory Successfully', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/labs`);
  await page.waitForTimeout(2000);

  //******************************/
  // Check if the updated test lab exists and handle the result gracefully
  let hasUpdatedLab = false;
  try {
    hasUpdatedLab = await page.getByRole('row', { name: 'Automation Lab' }).isVisible();
  } catch (error) {
    console.log('Automation Lab not found', error);
  }
  // Check if the Original Lab 'Playwright test lab' exists
  let hasTestLab = false;
  try {
    hasTestLab = await page.getByRole('row', { name: 'Playwright test lab' }).isVisible();
  } catch (error) {
    console.log('Playwright test lab not found', error);
  }
  //******************************/

  // Check if a 'Playwright test lab' is existing then update can proceed
  if (hasUpdatedLab) {
    await page.getByRole('row', { name: 'Automation Lab' }).locator('button').click();
    await page.getByRole('menuitem', { name: 'View / Edit' }).click();
    await page.getByRole('tab', { name: 'Lab Users' }).click();

    let UserAddedtoaLab = true;
    try {
      UserAddedtoaLab = await page.getByRole('row', { name: 'Rick Sanchez' }).isVisible();
    } catch (error) {
      console.log('User added to Automation Lab already!', error);
    }
    if (UserAddedtoaLab) {
      await page.getByRole('row', { name: 'Rick Sanchez' }).locator('button').click();
      await page.getByRole('menuitem', { name: 'Remove From Lab' }).click();
      await page.getByRole('button', { name: 'Remove User' }).click();
      await page.getByRole('status').locator('div').nth(1).click();
    } else {
      //await page.getByRole('row', { name: 'Automation Lab' }).locator('button').click();
      //await page.getByRole('menuitem', { name: 'View / Edit' }).click();
      //await page.getByRole('tab', { name: 'Lab Users' }).click();
      await page.getByRole('button', { name: 'Add Lab Users' }).click();
      //await page.waitForTimeout(3000);
      await page.waitForLoadState('domcontentloaded');
      //await page.waitForLoadState('networkidle');
      await page.getByText('Select User').click();
      await page.waitForTimeout(2000);
      await page.getByPlaceholder('Search all users...').click();
      //await page.getByPlaceholder('Search all users...').fill('test.user@easygenomics.org');
      //await page.getByPlaceholder("Select User").click();
      //await page.getByRole('button', { name: 'Select User' }).click();
      //await page.locator('#headlessui-combobox-button-v-0-37').getByRole('button', { name: 'Select User' }).click();
      //await page.getByPlaceholder('Select User').dblclick();
      //await page.getByText('QA Marvin').click();
      // await page.getByRole('option', { name: 'RS Rick Sanchez test.user@' }).click();
      //await page.keyboard.type('test.user@easygenomics.org');
      await page.keyboard.type('test');
      //await page.getByRole('option', { name: 'RS Rick Sanchez test.user@' }).click();
      await page.getByText('Rick Sanchez').click();
      //await page.getByText('test.user@easygenomics.org').click();
      //await page.locator('#headlessui-combobox-button-v-0-36').getByRole('button', { name: 'Rick Sanchez' }).click();
      await page.getByRole('button', { name: 'Add', exact: true }).click();
      await page.getByText('Successfully added Rick').click();
    }
  } else if (hasTestLab) {
    // update Laboratory
    await page.getByRole('row', { name: 'Playwright test lab' }).locator('button').click();
    await page.getByRole('menuitem', { name: 'View / Edit' }).click();
    await page.getByRole('tab', { name: 'Lab Users' }).click();
    await page.getByRole('button', { name: 'Add Lab Users' }).click();
    await page.waitForLoadState('networkidle');
    await page.getByText('Select User').click();
    await page.getByPlaceholder('Search all users...').click();
    await page.getByPlaceholder('Search all users...').fill('test.user@easygenomics.org');
    //await page.getByRole('button', { name: 'Select User' }).click();
    //await page.getByPlaceholder("Select User").click();
    //await page.locator('#headlessui-combobox-button-v-0-37').getByRole('button', { name: 'Select User' }).click();
    //await page.getByPlaceholder('Select User').dblclick();
    //await page.getByText('QA Marvin').click();
    await page.getByRole('option', { name: 'RS Rick Sanchez test.user@' }).click();
    //await page.locator('#headlessui-combobox-button-v-0-169').getByRole('button', { name: 'Select User' }).click();
    //await page.getByText('test.user@easygenomics.org').click();
    //await page.locator('#headlessui-combobox-button-v-0-36').getByRole('button', { name: 'Rick Sanchez' }).click();
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await page.getByText('Successfully added Rick').click();
  }
});

test('Add a user to a Laboratory Successfully', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/labs`);
  await page.waitForTimeout(2000);

  // Check if the updated test lab exists and handle the result gracefully
  let hasUpdatedLab = false;
  try {
    hasUpdatedLab = await page.getByRole('row', { name: 'Automation Lab' }).isVisible();
  } catch (error) {
    console.log('Automation Lab not found', error);
  }

  //

  // Check if the 'Playwright test lab' which was created in another test
  let hasTestLab = false;
  try {
    hasTestLab = await page.getByRole('row', { name: 'Playwright test lab' }).isVisible();
  } catch (error) {
    console.log('Playwright test lab not found', error);
  }

  // Check if a 'Playwright test lab' is existing then update can proceed
  if (hasUpdatedLab) {
    await page.getByRole('row', { name: 'Automation Lab' }).locator('button').click();
    await page.getByRole('menuitem', { name: 'View / Edit' }).click();
    await page.getByRole('tab', { name: 'Lab Users' }).click();
    await page.getByRole('button', { name: 'Add Lab Users' }).click();
    await page.waitForLoadState('networkidle');
    await page.getByText('Select User').click();
    await page.getByPlaceholder('Search all users...').click();
    //await page.getByPlaceholder('Search all users...').fill('test.user@easygenomics.org');
    //await page.getByPlaceholder("Select User").click();
    //await page.getByRole('button', { name: 'Select User' }).click();
    //await page.locator('#headlessui-combobox-button-v-0-37').getByRole('button', { name: 'Select User' }).click();
    //await page.getByPlaceholder('Select User').dblclick();
    //await page.getByText('QA Marvin').click();
    // await page.getByRole('option', { name: 'RS Rick Sanchez test.user@' }).click();
    await page.keyboard.type('test.user@easygenomics.org');
    await page.getByRole('option', { name: 'RS Rick Sanchez test.user@' }).click();
    //await page.getByText('test.user@easygenomics.org').click();
    //await page.locator('#headlessui-combobox-button-v-0-36').getByRole('button', { name: 'Rick Sanchez' }).click();
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await page.getByText('Successfully added Rick').click();
  } else if (hasTestLab) {
    // update Laboratory
    await page.getByRole('row', { name: 'Playwright test lab' }).locator('button').click();
    await page.getByRole('menuitem', { name: 'View / Edit' }).click();
    await page.getByRole('tab', { name: 'Lab Users' }).click();
    await page.getByRole('button', { name: 'Add Lab Users' }).click();
    await page.waitForLoadState('networkidle');
    await page.getByText('Select User').click();
    await page.getByPlaceholder('Search all users...').click();
    await page.getByPlaceholder('Search all users...').fill('test.user@easygenomics.org');
    //await page.getByRole('button', { name: 'Select User' }).click();
    //await page.getByPlaceholder("Select User").click();
    //await page.locator('#headlessui-combobox-button-v-0-37').getByRole('button', { name: 'Select User' }).click();
    //await page.getByPlaceholder('Select User').dblclick();
    //await page.getByText('QA Marvin').click();
    await page.getByRole('option', { name: 'RS Rick Sanchez test.user@' }).click();
    //await page.locator('#headlessui-combobox-button-v-0-169').getByRole('button', { name: 'Select User' }).click();
    //await page.getByText('test.user@easygenomics.org').click();
    //await page.locator('#headlessui-combobox-button-v-0-36').getByRole('button', { name: 'Rick Sanchez' }).click();
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await page.getByText('Successfully added Rick').click();
  }
});
