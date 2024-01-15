import { awscdk, javascript } from 'projen';
const project = new awscdk.AwsCdkTypeScriptApp({
  authorName: 'DEPT Agency',
  authorOrganization: true,
  cdkVersion: '2.121.0',
  copyrightOwner: 'DEPT Agency',
  copyrightPeriod: '2024',
  defaultReleaseBranch: 'main',
  description: 'Easy Genomics web application to help simplify genomic analysis of sequenced genetic data for bioinformaticans utilizing AWS HealthOmics & NextFlow Tower',
  homepage: 'https://github.com/DEPTAgency/easy-genomics',
  license: 'Apache-2.0',
  licensed: true,
  name: 'easy-genomics',
  packageManager: javascript.NodePackageManager.PNPM,
  projenrcTs: true,

  // deps: [],                /* Runtime dependencies of this module. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();