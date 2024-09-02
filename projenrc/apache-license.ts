import { Project, LicenseOptions, License, IResolver } from 'projen';
import { TypeScriptProject } from 'projen/lib/typescript';
import { AwsCdkTypeScriptApp } from 'projen/lib/awscdk';
import * as fs from 'fs';

/**
 * Apply the Apache 2.0 license with the correct copyright date and name
 */
export class ApacheLicense extends License {
  apacheText: string;
  constructor(project: Project, options: LicenseOptions) {
    super(project, options);
    const spdx = 'Apache-2.0';

    if (project instanceof TypeScriptProject || project instanceof AwsCdkTypeScriptApp) {
      // apply the license type to the project
      project.addFields({ license: spdx });
    }

    const textFile = `projenrc/license-text/${spdx}.txt`;
    if (!fs.existsSync(textFile)) {
      throw new Error(`could not find license ${spdx}`);
    }
    const years = options.copyrightPeriod ?? new Date().getFullYear().toString();
    const owner = options.copyrightOwner;
    let text = fs.readFileSync(textFile, 'utf-8');
    text = text.replace('[yyyy]', years);
    if (owner) {
      text = text.replace('[name of copyright owner]', owner);
    }

    this.apacheText = text;
  }
  synthesizeContent(_: IResolver) {
    return this.apacheText;
  }
}
