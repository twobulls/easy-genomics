import { test, expect } from '@playwright/test';
import { envConfig } from '../../../config/env-config';
//import { envConfig } from 'config/env-config';

//const COGNITO_USER_POOL_CLIENT_ID = "5ioh3mb9g78lqjq04u1icuc5lj";
const COGNITO_USER_POOL_CLIENT_ID = '4c01u7oir5134alqpi967boooi';
const laboratoryID = 'bbac4190-0446-4db4-a084-cfdbc8102297';
const organizationID = '61c86013-74f2-4d30-916a-70b03a97ba14';

let easyGenomicsApiContext;
test.beforeAll(async ({ playwright, request }) => {
  const tokenResponse = await request.post('https://cognito-idp.us-east-1.amazonaws.com/', {
    headers: {
      'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
      'Content-Type': 'application/x-amz-json-1.1',
    },
    data: {
      ClientId: COGNITO_USER_POOL_CLIENT_ID,
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: {
        USERNAME: envConfig.orgAdminEmail,
        PASSWORD: envConfig.orgAdminPassword,
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
    baseURL: 'https://huid9t1tbj.execute-api.us-east-1.amazonaws.com/prod/',
    extraHTTPHeaders: {
      Authorization: `Bearer ${idToken}`,
    },
  });
});

test('Get - list of Seqera Lab Runs', async ({ page }) => {
  const response = await easyGenomicsApiContext.get(
    './easy-genomics/laboratory/run/list-laboratory-runs?laboratoryId=' + laboratoryID,
  );
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
  console.log(await response.body());
});

test('Get - list of Labs', async ({ page }) => {
  const response = await easyGenomicsApiContext.get(
    './easy-genomics/laboratory/list-laboratories?organizationId=' + organizationID,
  );
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
});
