import { FullConfig, chromium } from '@playwright/test';
import { envConfig } from '../../config/env-config';
import * as fs from 'fs';
import * as path from 'path';

type UserType = 'sys-admin' | 'org-admin';

/**
 * Global setup for all tests:
 * - Loads the configuration settings for the current environment from the master YAML configuration
 * - Determines the user type (sys-admin or org-admin) based on the environment name
 * - Loads the auth file for the specified user type
 *
 * @param config
 */
async function globalSetup(config: FullConfig) {
  console.log('FullConfig:', JSON.stringify(config, null, 2));
  let projectConfig;
  let userType: UserType | undefined;

  const targetProjectName = process.argv.find((arg) => arg.startsWith('--project='))?.split('=')[1];
  console.log('Target project name:', targetProjectName);

  const currentProject = config.projects.find((project) => project.name === targetProjectName);

  if (currentProject) {
    console.log(`Using project configuration for ${targetProjectName}`);
    projectConfig = currentProject.use;
    userType = projectConfig?.userType as UserType;
  } else {
    throw new Error(`Project configuration for ${targetProjectName} not found.`);
  }

  console.log('Determined userType:', userType);

  if (!userType || !['sys-admin', 'org-admin'].includes(userType)) {
    throw new Error(`Invalid or missing userType: ${userType}`);
  }

  const authFileMap: Record<UserType, string> = {
    'sys-admin': './tests/e2e/.auth/sys-admin.json',
    'org-admin': './tests/e2e/.auth/org-admin.json',
  };

  const credentialsMap: Record<UserType, { email: string; password: string }> = {
    'sys-admin': {
      email: envConfig.sysAdminEmail,
      password: envConfig.sysAdminPassword,
    },
    'org-admin': {
      email: envConfig.orgAdminEmail,
      password: envConfig.orgAdminPassword,
    },
  };

  if (!credentialsMap[userType]) {
    throw new Error(`Invalid user type in credentialsMap: ${userType}`);
  }

  const authFile = authFileMap[userType];
  const { email, password } = credentialsMap[userType];
  const baseURL = projectConfig.baseURL || `https://${envConfig.appDomainName}`;

  // Ensure the .auth directory exists
  const authDir = path.dirname(authFile);
  if (!fs.existsSync(authDir)) {
    console.log(`Creating directory: ${authDir}`);
    fs.mkdirSync(authDir, { recursive: true });
  } else {
    console.log(`Directory already exists: ${authDir}`);
  }

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log(`Navigating to Sign In page @ ${baseURL}/signin`);

  await page.goto(`${baseURL}/signin`);
  await page.getByLabel('Email').click();
  await page.keyboard.type(email);
  await page.getByLabel('Password').click();
  await page.keyboard.type(password);
  console.log('Clicking Sign In as ' + userType + '...');

  await page.getByRole('button', { name: 'Sign In' }).click();
  console.log('Waiting for navigation to complete...');

  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch((err) => {
    console.log('Load state error:', err);
    throw new Error('Failed to sign in.');
  });
  console.log('Sign-in process completed.');

  console.log(`Saving storage state to: ${authFile}`);

  await context.storageState({ path: authFile });
  await browser.close();

  console.log('Browser closed.');
}

export default globalSetup;
