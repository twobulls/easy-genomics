import { FullConfig, chromium } from '@playwright/test';
import { envConfig } from '../../config/env-config';
import * as fs from 'fs';
import * as path from 'path';

type UserType = 'sys-admin' | 'org-admin';

interface Credentials {
  email: string;
  password: string;
}

const authFileMap: Record<UserType, string> = {
  'sys-admin': './tests/e2e/.auth/sys-admin.json',
  'org-admin': './tests/e2e/.auth/org-admin.json',
};

const credentialsMap: Record<UserType, Credentials> = {
  'sys-admin': {
    email: envConfig.sysAdminEmail,
    password: envConfig.sysAdminPassword,
  },
  'org-admin': {
    email: envConfig.orgAdminEmail,
    password: envConfig.orgAdminPassword,
  },
};

/**
 * Ensures that the .auth directory exists.
 * @param authFile The path to the auth file.
 */
function ensureAuthDirectoryExists(authFile: string) {
  const authDir = path.dirname(authFile);
  if (!fs.existsSync(authDir)) {
    console.log(`Creating directory: ${authDir}`);
    fs.mkdirSync(authDir, { recursive: true });
  } else {
    console.log(`Directory already exists: ${authDir}`);
  }
}

/**
 * Perform the sign-in process and save the storage state.
 * @param page The Playwright page object.
 * @param baseURL The base URL for the application.
 * @param credentials The user credentials.
 * @param authFile The path to save the storage state.
 * @param userType The type of user (sys-admin or org-admin).
 */
async function signInAndSaveState(
  page: any,
  baseURL: string,
  credentials: Credentials,
  authFile: string,
  userType: UserType,
) {
  console.log(`Navigating to Sign In page @ ${baseURL}/signin`);

  await page.goto(`${baseURL}/signin`);
  await page.getByLabel('Email').click();
  await page.keyboard.type(credentials.email);
  await page.getByLabel('Password').click();
  await page.keyboard.type(credentials.password);

  console.log('Clicking Sign In as ' + userType + '...');
  await page.getByRole('button', { name: 'Sign In' }).click();

  console.log('Waiting for navigation to complete...');
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch((err) => {
    console.log('Load state error:', err);
    throw new Error('Failed to sign in.');
  });

  console.log('Sign-in process completed.');
  console.log(`Saving storage state to: ${authFile}`);

  await page.context().storageState({ path: authFile });
  console.log('Browser closed.');
}

/**
 * Global setup for all Playwright tests.
 * @param config Full Playwright test configuration.
 */
async function globalSetup(config: FullConfig) {
  console.log('FullConfig:', JSON.stringify(config, null, 2));

  const userType = process.env.USER_TYPE as UserType;
  console.log('Determined userType:', userType);

  if (!userType || !['sys-admin', 'org-admin'].includes(userType)) {
    throw new Error(`Invalid or missing USER_TYPE environment variable: ${userType}`);
  }

  const credentials = credentialsMap[userType];
  if (!credentials) {
    throw new Error(`Invalid user type in credentialsMap: ${userType}`);
  }

  const authFile = authFileMap[userType];
  ensureAuthDirectoryExists(authFile);

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const projectConfig = config.projects.find(
    (project) => project.name === process.argv.find((arg) => arg.startsWith('--project='))?.split('=')[1],
  )?.use;
  const baseURL = projectConfig?.baseURL || `https://${envConfig.appDomainName}`;
  await signInAndSaveState(page, baseURL, credentials, authFile, userType);

  await browser.close();
}

export default globalSetup;
