import path from 'path';
import { Component, JsonFile, Project } from 'projen';

// Custom projen component that generates vscode settings
// and defines workspace directories for eslint. This allows
// the IDE to use the correct eslint helpers for the subproject.
export class VscodeSettings extends Component {
  constructor(rootProject: Project) {
    super(rootProject);

    new JsonFile(rootProject, '.vscode/settings.json', {
      obj: {
        'tailwindCSS.experimental.classRegex': [
          ['cva\\(([^)]*)\\)', '["\'`]([^"\'`]*).*?["\'`]'],
          ['cx\\(([^)]*)\\)', "(?:'|\"|`)([^']*)(?:'|\"|`)"],
        ],
        'eslint.workingDirectories': rootProject.subprojects.map((project) => ({
          pattern: path.relative(rootProject.outdir, project.outdir),
        })),
      },
    });
  }
}
