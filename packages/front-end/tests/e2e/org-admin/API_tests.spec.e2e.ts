import { test, expect } from '@playwright/test';
import { envConfig } from '../../../config/env-config';
//import { envConfig } from 'config/env-config';

//const COGNITO_USER_POOL_CLIENT_ID = "5ioh3mb9g78lqjq04u1icuc5lj";
const COGNITO_USER_POOL_CLIENT_ID = '4c01u7oir5134alqpi967boooi';
const laboratoryID = 'bbac4190-0446-4db4-a084-cfdbc8102297';
const organizationID = '61c86013-74f2-4d30-916a-70b03a97ba14';
let newLabID: string;

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
      'Authorization': `Bearer ${idToken}`,
    },
  });
});

test('Get - list of Seqera Lab Runs', async ({}) => {
  const response = await easyGenomicsApiContext.get(
    './easy-genomics/laboratory/run/list-laboratory-runs?laboratoryId=' + laboratoryID,
  );
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
  console.log(await response.json());
});

test('Get - list of Seqera Pipelines', async ({}) => {
  const response = await easyGenomicsApiContext.get('./nf-tower/pipeline/list-pipelines?laboratoryId=' + laboratoryID);
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
  console.log(await response.json());
});

test('Get - list of Labs', async ({}) => {
  const response = await easyGenomicsApiContext.get(
    './easy-genomics/laboratory/list-laboratories?organizationId=' + organizationID,
  );
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
  console.log(await response.json());
});

test('Get - list of OMICS Private Workflows', async ({}) => {
  const response = await easyGenomicsApiContext.get(
    './aws-healthomics/workflow/list-private-workflows?laboratoryId=' + laboratoryID,
  );
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
  console.log(await response.json());
});

test('Get - list of OMICS Lab Runs', async ({}) => {
  const response = await easyGenomicsApiContext.get('./aws-healthomics/run/list-runs?laboratoryId=' + laboratoryID);
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
  console.log(await response.json());
});

test('Get - list of Lab Users by Org', async ({}) => {
  const response = await easyGenomicsApiContext.get(
    './easy-genomics/laboratory/user/list-laboratory-users?organizationId=' + organizationID,
  );
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
  console.log(await response.json());
});

test('Get - list of Buckets', async ({}) => {
  const response = await easyGenomicsApiContext.get('./easy-genomics/list-buckets');
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
  console.log(await response.json());
});

test('Post - Create Lab', async ({ page }) => {
  const createLab = await easyGenomicsApiContext.post(`./easy-genomics/laboratory/create-laboratory`, {
    data: {
      'OrganizationId': organizationID,
      'Name': 'Postman - Auto Lab',
      'Description': 'This is an automated creation of Lab',
      'Status': 'Active',
      'AwsHealthOmicsEnabled': false,
      'NextFlowTowerEnabled': false,
    },
  });
  expect(createLab.ok()).toBeTruthy();
  expect(createLab.status()).toBe(200);
  //newLabID = await createLab.json().laboratoryId;
  //newLabID = await createLab.json().laboratoryId;
  //newLabID = postAPIResponseBody.LaboratoryID;
  const postAPIResponseBody = JSON.parse(await createLab.text());
  //const postAPIResponseBody = JSON.parse(await createLab.response());
  //newLabID = page.getByRole('heading', { name: "LaboratoryID"},).; // postAPIResponseBody.LaboratoryID;
  //const data = createLab.json()
  //newLabID = postAPIResponseBody['LaboratoryID']; //'123abfdg'
  newLabID = '123abfdg';
  const myResponseBody = await createLab.json();
  const theLabID = myResponseBody.data[0].LaboratoryID; //(await createLab.json()).LaboratoryID;
  console.log(postAPIResponseBody);
  expect(postAPIResponseBody).toHaveProperty('OrganizationId', '61c86013-74f2-4d30-916a-70b03a97ba14');

  //console.log(data);
  console.log('The new Lab ID is: ' + theLabID);

  //const data = await createLab.json();
  //console.log("The new Lab ID is: " + data[0].LaboratoryID);

  /*
    let marvin;
    let data: any  = await createLab.body();
    marvin = await JSON.parse(data);
    console.log(data);
    console.log("The new Lab ID is: " + marvin);
*/
});

test('Delete - Delete a Lab', async ({}) => {
  const deleteLab = await easyGenomicsApiContext.delete(`./easy-genomics/laboratory/delete-laboratory/${newLabID}`, {
    //("./easy-genomics/laboratory/delete-laboratory/e1cbdcce-eac6-45a5-a75b-7a2058225426", { //
    data: {},
  });
  expect(deleteLab.ok()).toBeTruthy();
  expect(deleteLab.status()).toBe(200);
});
