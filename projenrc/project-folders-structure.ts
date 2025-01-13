import Structure = ProjectFolders.Structure;

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ProjectFolders {
  export interface Structure {
    name: string;
    type: string;
    content?: string;
    children?: Structure[];
  }
}

const lambdaFunctionNamingConvention =
  'Each Lambda function defined needs to follow the snake-case naming convention, and needs to' +
  '\nstart with one of the following verbs that will auto-link to the REST API request method:' +
  '\n\t- create | abort | complete | request = HTTP POST request' +
  '\n\t- list | read = HTTP GET request' +
  '\n\t- update | cancel = HTTP PUT request' +
  '\n\t- patch = HTTP PATCH request' +
  '\n\t- delete = HTTP DELETE request' +
  '\n\t- process = None // Generic operation not mapped to REST API (e.g. S3 Event Trigger, etc.)';

// Easy-Genomics components definition for sub-folders: easy-genomics, aws-healthomics & nf-tower
const EASY_GENOMICS_COMPONENT: { [key: string]: string } = {
  ['easy-genomics']: 'Easy Genomics',
  ['aws-healthomics']: 'AWS HealthOmics',
  ['nf-tower']: 'NextFlow Tower',
};

const getComponentSubFolders = (message: string): Structure[] => {
  return Object.keys(EASY_GENOMICS_COMPONENT).map((key: string) => {
    return <Structure>{
      name: key,
      type: 'directory',
      children: [
        {
          name: 'README.md',
          type: 'file',
          content: `${EASY_GENOMICS_COMPONENT[key]} ${message}`,
        },
      ],
    };
  });
};

// Return infra sub-folder definition (utilised by front-end and backend subprojects)
const getInfraSubFolderDefinition = (prefixMessage?: string, additional?: Structure[]): ProjectFolders.Structure => {
  const infraFolder: ProjectFolders.Structure = {
    name: 'infra',
    type: 'directory',
    children: [
      {
        name: 'README.md',
        type: 'file',
        content: `${prefixMessage} containing infrastructure-as-code definitions utilising AWS CDK.`.trim(),
      },
      {
        name: 'constructs',
        type: 'directory',
        children: [
          {
            name: 'README.md',
            type: 'file',
            content: `${prefixMessage} containing CDK Construct definitions.`.trim(),
          },
        ],
      },
      {
        name: 'types',
        type: 'directory',
        children: [
          {
            name: 'README.md',
            type: 'file',
            content:
              `${prefixMessage} containing Object Type / Interface definitions providing the models layer for the infrastructure setup.`.trim(),
          },
        ],
      },
      {
        name: 'stacks',
        type: 'directory',
        children: [
          {
            name: 'README.md',
            type: 'file',
            content: `${prefixMessage} containing CDK Stack definitions.`.trim(),
          },
        ],
      },
      ...(additional ? additional : []),
    ],
  };
  return infraFolder;
};

/** Start of ./packages/back-end/src subproject folder definitions **/
// Return backend controllers sub-folder definition
const getBackendControllersSubFolderDefinition = (prefixMessage?: string): ProjectFolders.Structure => {
  // Define easy-genomics, aws-healthomics, nf-tower component sub-folders for back-end controllers sub-folder
  const backendControllersSubFolder: ProjectFolders.Structure = {
    name: 'controllers',
    type: 'directory',
    children: [
      {
        name: 'README.md',
        type: 'file',
        content:
          `${prefixMessage} defining the Lambda Functions for REST API endpoints.\n\n${lambdaFunctionNamingConvention}`.trim(),
      },
      ...getComponentSubFolders(`specific controllers layer logic.\n\n${lambdaFunctionNamingConvention}`),
    ],
  };

  return backendControllersSubFolder;
};

// Return backend services sub-folder definition
const getBackendServicesSubFolderDefinition = (prefixMessage?: string): ProjectFolders.Structure => {
  // Define easy-genomics, aws-healthomics, nf-tower component sub-folders for back-end controllers sub-folder
  const backendServicesSubFolder: ProjectFolders.Structure = {
    name: 'services',
    type: 'directory',
    children: [
      {
        name: 'README.md',
        type: 'file',
        content:
          `${prefixMessage} defining reusable Object / Domain specific services logic utilized by controllers layer.`.trim(),
      },
      ...getComponentSubFolders('specific services layer logic.'),
    ],
  };

  return backendServicesSubFolder;
};

// Return backend app sub-folder definition
const getBackendAppSubFolderDefinition = () => {
  return {
    name: 'app',
    type: 'directory',
    children: [
      {
        name: 'README.md',
        type: 'file',
        content:
          "Easy Genomics' Back-End web application logic supporting the MVC design pattern.\n - ./controllers: contains the Lambda/API function definitions\n - ./services: contains the reusable service logic to support the Lambda/API functions",
      },
      getBackendControllersSubFolderDefinition("Easy Genomics' Back-End controller sub-folder"),
      getBackendServicesSubFolderDefinition("Easy Genomics' Back-End services sub-folder"),
    ],
  };
};

const BackEndFolder: ProjectFolders.Structure = {
  name: 'back-end/src',
  type: 'directory',
  children: [
    getBackendAppSubFolderDefinition(),
    getInfraSubFolderDefinition("Easy Genomics' Back-End infra sub-folder"),
  ],
};
/** End of ./packages/back-end/src subproject folder definitions **/

/** Start of ./packages/front-end/src subproject folder definitions **/
const getFrontendAppSubFolderDefinition = () => {
  return {
    name: 'app',
    type: 'directory',
    children: [
      {
        name: 'README.md',
        type: 'file',
        content:
          "Easy Genomics' Front-End web application logic supporting the MVC design pattern utilising VueJs & NuxtJs.",
      },
    ],
  };
};

const FrontEndFolder: ProjectFolders.Structure = {
  name: 'front-end/src',
  type: 'directory',
  children: [
    {
      name: 'README.md',
      type: 'file',
      content:
        "Easy Genomics' Front-End infrastructure & web application logic supporting the MVC design pattern.\n - ./app: contains the Front-End UI resources for display\n - ./infra: contains the Front-End AWS infrastructure-as-code definitions",
    },
    getFrontendAppSubFolderDefinition(),
    getInfraSubFolderDefinition("Easy Genomics' Front-End infra sub-folder"),
  ],
};
/** End of ./packages/front-end/src subproject folder definitions **/

/** Start of ./packages/shared-libs subproject folder definitions **/
const SharedLibTypesFolder: ProjectFolders.Structure = {
  name: 'types',
  type: 'directory',
  children: [
    {
      name: 'README.md',
      type: 'file',
      content:
        'Object Type / Interface definitions providing the models layer for the application and shared by the Front-End and Back-End subprojects.',
    },
  ],
};

const SharedLibUtilitiesFolder: ProjectFolders.Structure = {
  name: 'utils',
  type: 'directory',
  children: [
    {
      name: 'README.md',
      type: 'file',
      content: 'Shared Utility functions that are utilised by Front-End and Back-End subprojects.',
    },
  ],
};

const getSharedLibAppSubFolderDefinition = () => {
  return {
    name: 'app',
    type: 'directory',
    children: [
      {
        name: 'README.md',
        type: 'file',
        content:
          "Easy Genomics' Shared-Lib logic supporting the integration between Front-End and Backend-End subprojects.",
      },
      SharedLibTypesFolder,
      SharedLibUtilitiesFolder,
    ],
  };
};

const SharedLibFolder: ProjectFolders.Structure = {
  name: 'shared-lib/src',
  type: 'directory',
  children: [
    {
      name: 'README.md',
      type: 'file',
      content:
        "Easy Genomics' shared-lib which defines the shared Object Type / Interface, and reusable logic utilised by both the Front-End and Back-End subprojects.",
    },
    getSharedLibAppSubFolderDefinition(),
    getInfraSubFolderDefinition("Easy Genomics' Shared-Lib infra sub-folder"),
  ],
};
/** End of ./packages/shared-libs subproject folder definitions **/

export const ProjectFolderStructure: ProjectFolders.Structure = {
  name: 'packages',
  type: 'directory',
  children: [BackEndFolder, FrontEndFolder, SharedLibFolder],
};
