import path from 'path';
import { Component, Project, YamlFile } from 'projen';

// Custom projen component that generates pnpm-workspace.yaml
// and defines the monorepo packages based on the subprojects.

export class PnpmWorkspace extends Component {
  constructor(rootProject: Project) {
    super(rootProject);

    new YamlFile(rootProject, 'pnpm-workspace.yaml', {
      obj: {
        packages: rootProject.subprojects.map((project) => path.relative(rootProject.outdir, project.outdir)),
      },
    });
  }
}
