// eslint-disable-next-line import/no-extraneous-dependencies
import { Project, SourceCode } from 'projen';
// eslint-disable-next-line import/no-extraneous-dependencies
import { PROJEN_MARKER } from 'projen/lib/common';
import { ProjectFolders, ProjectFolderStructure } from './project-folders-structure';

const MONO_REPO_ROOT_FOLDER = 'packages';

/**
 * Projen will be used to automatically create the templated project folder structure and add README.md descriptions for this project.
 *
 * This provides greater consistency for standard Projen projects without maintain our own Projen customised templates.
 */
export function setupProjectFolders(project: Project) {
  const root = ProjectFolderStructure;
  if (root.name === MONO_REPO_ROOT_FOLDER && root.type === 'directory') {
    // Proceed with provisioning project folder structure recursively
    createProjectFolders(project, root.children, `${root.name}`);
  } else {
    throw new Error(
      `ProjectFolders folder structure does not start with '${MONO_REPO_ROOT_FOLDER}' directory. Please review the 'project-folders-structure.ts' definition.`
    );
  }
}

/**
 * Recursively create project folder structure.
 * @param project
 * @param projectFolder
 * @param folderPath
 */
function createProjectFolders(project: Project, projectFolder?: ProjectFolders.Structure[], folderPath: string = '') {
  const folder = projectFolder || [];

  folder.map((s: ProjectFolders.Structure) => {
    if (s.name === 'README.md' && s.type === 'file') {
      createFolderReadMe(project, `${folderPath}/${s.name}`, s.content);
    } else {
      if (s.name === 'app' && s.type === 'directory') {
        createProjectFolders(project, s.children, `${folderPath}/${s.name}`); // Recursion for app folders in src directory
      } else {
        createProjectFolders(project, s.children, `${folderPath}/${s.name}`); // Recursion for other folders
      }
    }
  });
}

/**
 * Uses Projen to create README.md for templated project folder structure with designated description.
 * @param project
 * @param filePath
 * @param description
 */
function createFolderReadMe(project: Project, filePath: string, content?: string) {
  const readMe = new SourceCode(project, `${filePath}`, { readonly: true });
  const description = content || '...';
  readMe.line(`> ${PROJEN_MARKER}`);
  readMe.line(`# ${filePath}`);
  readMe.line(`This folder contains ${description}`);
}
