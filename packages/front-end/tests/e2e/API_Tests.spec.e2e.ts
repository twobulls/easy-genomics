import { test, expect } from '@playwright/test';

const COGNITO_USER_POOL_CLIENT_ID = '3o1pp5jliqiusne4p4dvi8ajju';
let easyGenomicsApiContext;
test.beforeAll(async ({ playwright, request }) => {
  const tokenResponse = await request.post(`https://cognito-idp.us-east-1.amazonaws.com/`, {
    headers: {
      'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
      'Content-Type': 'application/x-amz-json-1.1',
    },
    data: {
      ClientId: COGNITO_USER_POOL_CLIENT_ID,
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: {
        USERNAME: 'sysadmin@easygenomics.org',
        PASSWORD: 'Ch@nge_M3!',
      },
    },
  });
  console.log(await tokenResponse.json());
  expect(tokenResponse.ok()).toBeTruthy();
  expect(tokenResponse.status()).toBe(200);

  const idToken = (await tokenResponse.json()).AuthenticationResult.IdToken;
  console.log(await idToken);
  easyGenomicsApiContext = await playwright.request.newContext({
    // All requests we send go to this API endpoint.
    baseURL: 'https://rder51yhd0.execute-api.us-east-1.amazonaws.com/prod/',
    extraHTTPHeaders: {
      'Authorization': `Bearer ${idToken}`,
    },
  });
});

test('Get - list of workflow runs', async ({ page }) => {
  const response = await easyGenomicsApiContext.get('./easy-genomics/organization/list-organizations');
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
});
