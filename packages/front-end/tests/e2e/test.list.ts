import { test } from '@playwright/test';
import featureTestA from './EditOrg.spec.e2e.ts';
import featureTestB from './CreateLab.spec.e2e.ts';
import featureTestC from './EditLab.spec.e2e.js';
import featureTestD from './EditUserAccess.spec.e2e.js';

test.describe(featureTestA);
test.describe(featureTestB);
test.describe(featureTestC);
test.describe(featureTestD);
