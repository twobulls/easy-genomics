import test from './helpers/signIn';

test('User can sign in', async ({ page }) => {
  await page.getByRole('heading', { name: 'Labs' }).click();
});
