// FIXME: eslint false positive for '@zodios/core' should be listed in the project's dependencies
import { makeApi, Zodios, type ZodiosOptions } from '@zodios/core';
import { z } from 'zod';

const ActionQueryAttribute = z.literal('labels');
const Action_Source = z.enum(['github', 'tower']);
const Action_Status = z.enum(['CREATING', 'ACTIVE', 'ERROR', 'PAUSED']);
const GithubActionEvent = z
  .object({
    discriminator: z.string(),
    ref: z.string(),
    commitId: z.string(),
    commitMessage: z.string(),
    pusherName: z.string(),
    pusherEmail: z.string(),
    timestamp: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const Action_TowerActionEvent = z
  .object({ discriminator: z.string(), timestamp: z.string().datetime({ offset: true }), workflowId: z.string() })
  .partial()
  .passthrough();
const Action_EventType = z.discriminatedUnion('discriminator', [GithubActionEvent, Action_TowerActionEvent]);
const LabelDbDto = z
  .object({ id: z.number().int(), name: z.string(), value: z.string(), resource: z.boolean(), isDefault: z.boolean() })
  .partial()
  .passthrough();
const ListActionsResponse_ActionInfo = z
  .object({
    id: z.string(),
    name: z.string(),
    pipeline: z.string(),
    source: Action_Source,
    status: Action_Status,
    lastSeen: z.string().datetime({ offset: true }),
    dateCreated: z.string().datetime({ offset: true }),
    event: Action_EventType,
    endpoint: z.string(),
    labels: z.array(LabelDbDto),
    usageCmd: z.string(),
  })
  .partial()
  .passthrough();
const ListActionsResponse = z
  .object({ actions: z.array(ListActionsResponse_ActionInfo) })
  .partial()
  .passthrough();
const ErrorResponse = z.object({ message: z.string() }).passthrough();
const WorkflowLaunchRequest = z
  .object({
    id: z.string(),
    computeEnvId: z.string(),
    runName: z.string(),
    pipeline: z.string(),
    workDir: z.string(),
    revision: z.string(),
    sessionId: z.string(),
    configProfiles: z.array(z.string()),
    userSecrets: z.array(z.string()),
    workspaceSecrets: z.array(z.string()),
    configText: z.string(),
    towerConfig: z.string(),
    paramsText: z.string(),
    preRunScript: z.string(),
    postRunScript: z.string(),
    mainScript: z.string(),
    entryName: z.string(),
    schemaName: z.string(),
    resume: z.boolean(),
    pullLatest: z.boolean(),
    stubRun: z.boolean(),
    optimizationId: z.string(),
    optimizationTargets: z.string(),
    labelIds: z.array(z.number()),
    headJobCpus: z.number().int(),
    headJobMemoryMb: z.number().int(),
    dateCreated: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const CreateActionRequest = z
  .object({ name: z.string(), source: Action_Source, launch: WorkflowLaunchRequest })
  .partial()
  .passthrough();
const CreateActionResponse = z.object({ actionId: z.string() }).partial().passthrough();
const AssociateActionLabelsRequest = z
  .object({ actionIds: z.array(z.string()), labelIds: z.array(z.number()) })
  .partial()
  .passthrough();
const EventType = z
  .object({ source: z.string(), display: z.string(), description: z.string(), enabled: z.boolean() })
  .partial()
  .passthrough();
const ListEventTypesResponse = z
  .object({ eventTypes: z.array(EventType) })
  .partial()
  .passthrough();
const ConfigEnvVariable = z
  .object({ name: z.string(), value: z.string(), head: z.boolean(), compute: z.boolean() })
  .partial()
  .passthrough();
const ForgeConfig = z
  .object({
    type: z.enum(['SPOT', 'EC2']),
    minCpus: z.number().int(),
    maxCpus: z.number().int(),
    gpuEnabled: z.boolean(),
    ebsAutoScale: z.boolean(),
    instanceTypes: z.array(z.string()),
    allocStrategy: z.enum([
      'BEST_FIT',
      'BEST_FIT_PROGRESSIVE',
      'SPOT_CAPACITY_OPTIMIZED',
      'SPOT_PRICE_CAPACITY_OPTIMIZED',
    ]),
    imageId: z.string(),
    vpcId: z.string(),
    subnets: z.array(z.string()),
    securityGroups: z.array(z.string()),
    fsxMount: z.string(),
    fsxName: z.string(),
    fsxSize: z.number().int(),
    disposeOnDeletion: z.boolean(),
    ec2KeyPair: z.string(),
    allowBuckets: z.array(z.string()),
    ebsBlockSize: z.number().int(),
    fusionEnabled: z.boolean(),
    bidPercentage: z.number().int(),
    efsCreate: z.boolean(),
    efsId: z.string(),
    efsMount: z.string(),
    dragenEnabled: z.boolean(),
    dragenAmiId: z.string(),
    ebsBootSize: z.number().int(),
    ecsConfig: z.string(),
    fargateHeadEnabled: z.boolean(),
    arm64Enabled: z.boolean(),
    dragenInstanceType: z.string(),
  })
  .partial()
  .passthrough();
const AwsBatchConfig = z
  .object({
    storageType: z.string(),
    lustreId: z.string(),
    volumes: z.array(z.string()),
    discriminator: z.string(),
    region: z.string(),
    computeQueue: z.string(),
    dragenQueue: z.string(),
    dragenInstanceType: z.string(),
    computeJobRole: z.string(),
    executionRole: z.string(),
    headQueue: z.string(),
    headJobRole: z.string(),
    cliPath: z.string(),
    workDir: z.string(),
    preRunScript: z.string(),
    postRunScript: z.string(),
    headJobCpus: z.number().int(),
    headJobMemoryMb: z.number().int(),
    environment: z.array(ConfigEnvVariable),
    waveEnabled: z.boolean(),
    fusion2Enabled: z.boolean(),
    nvnmeStorageEnabled: z.boolean(),
    logGroup: z.string(),
    forge: ForgeConfig,
    forgedResources: z.array(z.object({}).partial().passthrough()),
  })
  .partial()
  .passthrough();
const GoogleLifeSciencesConfig = z
  .object({
    discriminator: z.string(),
    region: z.string(),
    zones: z.array(z.string()),
    location: z.string(),
    workDir: z.string(),
    preemptible: z.boolean(),
    bootDiskSizeGb: z.number().int(),
    projectId: z.string(),
    sshDaemon: z.boolean(),
    sshImage: z.string(),
    debugMode: z.number().int(),
    copyImage: z.string(),
    usePrivateAddress: z.boolean(),
    labels: z.record(z.string()),
    preRunScript: z.string(),
    postRunScript: z.string(),
    headJobCpus: z.number().int(),
    headJobMemoryMb: z.number().int(),
    nfsTarget: z.string(),
    nfsMount: z.string(),
    environment: z.array(ConfigEnvVariable),
  })
  .partial()
  .passthrough();
const GoogleBatchConfig = z
  .object({
    discriminator: z.string(),
    location: z.string(),
    workDir: z.string(),
    spot: z.boolean(),
    bootDiskSizeGb: z.number().int(),
    cpuPlatform: z.string(),
    machineType: z.string(),
    projectId: z.string(),
    sshDaemon: z.boolean(),
    sshImage: z.string(),
    debugMode: z.number().int(),
    copyImage: z.string(),
    usePrivateAddress: z.boolean(),
    labels: z.record(z.string()),
    preRunScript: z.string(),
    postRunScript: z.string(),
    headJobCpus: z.number().int(),
    headJobMemoryMb: z.number().int(),
    nfsTarget: z.string(),
    nfsMount: z.string(),
    environment: z.array(ConfigEnvVariable),
    waveEnabled: z.boolean(),
    fusion2Enabled: z.boolean(),
    serviceAccount: z.string(),
    network: z.string(),
    subnetwork: z.string(),
    headJobInstanceTemplate: z.string(),
    computeJobsInstanceTemplate: z.string(),
  })
  .partial()
  .passthrough();
const AzBatchForgeConfig = z
  .object({
    vmType: z.string(),
    vmCount: z.number().int(),
    autoScale: z.boolean(),
    disposeOnDeletion: z.boolean(),
    containerRegIds: z.array(z.string()),
  })
  .partial()
  .passthrough();
const JobCleanupPolicy = z.enum(['on_success', 'always', 'never']);
const AzBatchConfig = z
  .object({
    discriminator: z.string(),
    workDir: z.string(),
    preRunScript: z.string(),
    postRunScript: z.string(),
    region: z.string(),
    headPool: z.string(),
    autoPoolMode: z.boolean(),
    forge: AzBatchForgeConfig,
    tokenDuration: z.string(),
    deleteJobsOnCompletion: JobCleanupPolicy,
    deletePoolsOnCompletion: z.boolean(),
    environment: z.array(ConfigEnvVariable),
    waveEnabled: z.boolean(),
    fusion2Enabled: z.boolean(),
  })
  .partial()
  .passthrough();
const AbstractGridConfig = z
  .object({
    workDir: z.string(),
    preRunScript: z.string(),
    postRunScript: z.string(),
    launchDir: z.string(),
    userName: z.string(),
    hostName: z.string(),
    port: z.number().int(),
    headQueue: z.string(),
    computeQueue: z.string(),
    maxQueueSize: z.number().int(),
    headJobOptions: z.string(),
    propagateHeadJobOptions: z.boolean(),
  })
  .partial()
  .passthrough();
const LsfComputeConfig = AbstractGridConfig.and(
  z
    .object({
      discriminator: z.string(),
      unitForLimits: z.string(),
      perJobMemLimit: z.boolean(),
      perTaskReserve: z.boolean(),
      environment: z.array(ConfigEnvVariable),
    })
    .partial()
    .passthrough(),
);
const SlurmComputeConfig = AbstractGridConfig.and(
  z
    .object({ discriminator: z.string(), environment: z.array(ConfigEnvVariable) })
    .partial()
    .passthrough(),
);
const PodCleanupPolicy = z.enum(['on_success', 'always', 'never']);
const K8sComputeConfig = z
  .object({
    discriminator: z.string(),
    workDir: z.string(),
    preRunScript: z.string(),
    postRunScript: z.string(),
    server: z.string(),
    sslCert: z.string(),
    namespace: z.string(),
    computeServiceAccount: z.string(),
    headServiceAccount: z.string(),
    storageClaimName: z.string(),
    storageMountPath: z.string(),
    podCleanup: PodCleanupPolicy,
    headPodSpec: z.string(),
    servicePodSpec: z.string(),
    environment: z.array(ConfigEnvVariable),
    headJobCpus: z.number().int(),
    headJobMemoryMb: z.number().int(),
  })
  .partial()
  .passthrough();
const EksComputeConfig = K8sComputeConfig.and(
  z
    .object({
      discriminator: z.string(),
      workDir: z.string(),
      preRunScript: z.string(),
      postRunScript: z.string(),
      environment: z.array(ConfigEnvVariable),
      region: z.string(),
      clusterName: z.string(),
      waveEnabled: z.boolean(),
      fusion2Enabled: z.boolean(),
    })
    .partial()
    .passthrough(),
);
const GkeComputeConfig = K8sComputeConfig.and(
  z
    .object({
      discriminator: z.string(),
      workDir: z.string(),
      preRunScript: z.string(),
      postRunScript: z.string(),
      environment: z.array(ConfigEnvVariable),
      region: z.string(),
      clusterName: z.string(),
      fusion2Enabled: z.boolean(),
      waveEnabled: z.boolean(),
    })
    .partial()
    .passthrough(),
);
const UnivaComputeConfig = AbstractGridConfig.and(
  z
    .object({ discriminator: z.string(), environment: z.array(ConfigEnvVariable) })
    .partial()
    .passthrough(),
);
const AltairPbsComputeConfig = AbstractGridConfig.and(
  z
    .object({ discriminator: z.string(), environment: z.array(ConfigEnvVariable) })
    .partial()
    .passthrough(),
);
const MoabComputeConfig = AbstractGridConfig.and(
  z
    .object({ discriminator: z.string(), environment: z.array(ConfigEnvVariable) })
    .partial()
    .passthrough(),
);
const ComputeConfig = z.discriminatedUnion('discriminator', [
  AwsBatchConfig,
  GoogleLifeSciencesConfig,
  GoogleBatchConfig,
  AzBatchConfig,
  LsfComputeConfig,
  SlurmComputeConfig,
  K8sComputeConfig,
  EksComputeConfig,
  GkeComputeConfig,
  UnivaComputeConfig,
  AltairPbsComputeConfig,
  MoabComputeConfig,
]);
const ComputeEnv_Status = z.enum(['CREATING', 'AVAILABLE', 'ERRORED', 'INVALID']);
const ComputeEnv_ComputeConfig_ = z
  .object({
    credentialsId: z.string().optional(),
    orgId: z.number().int().optional(),
    workspaceId: z.number().int().optional(),
    id: z.string().max(22).optional(),
    name: z.string().max(100),
    description: z.string().max(2000).optional(),
    platform: z.enum([
      'aws-batch',
      'google-lifesciences',
      'google-batch',
      'azure-batch',
      'k8s-platform',
      'eks-platform',
      'gke-platform',
      'uge-platform',
      'slurm-platform',
      'lsf-platform',
      'altair-platform',
      'moab-platform',
      'local-platform',
    ]),
    config: ComputeConfig,
    dateCreated: z.string().datetime({ offset: true }).optional(),
    lastUpdated: z.string().datetime({ offset: true }).optional(),
    lastUsed: z.string().datetime({ offset: true }).optional(),
    deleted: z.boolean().optional(),
    status: ComputeEnv_Status.and(z.string()).optional(),
    message: z.string().max(4096).optional(),
    primary: z.boolean().optional(),
  })
  .passthrough();
const Launch = z
  .object({
    id: z.string().max(22).optional(),
    computeEnv: ComputeEnv_ComputeConfig_.nullish(),
    pipeline: z.string().max(200),
    workDir: z.string().optional(),
    revision: z.string().max(100).optional(),
    configText: z.string().optional(),
    towerConfig: z.string().optional(),
    paramsText: z.string().optional(),
    preRunScript: z.string().optional(),
    postRunScript: z.string().optional(),
    mainScript: z.string().max(200).optional(),
    entryName: z.string().max(80).optional(),
    schemaName: z
      .string()
      .max(100)
      .regex(/[\p{Graph}&&[^\/]]\p{Graph}+/)
      .optional(),
    resume: z.boolean().optional(),
    resumeLaunchId: z.string().max(22).optional(),
    pullLatest: z.boolean().optional(),
    stubRun: z.boolean().optional(),
    sessionId: z.string().max(36).optional(),
    runName: z.string().max(80).optional(),
    configProfiles: z.array(z.string()).optional(),
    userSecrets: z.array(z.string()).optional(),
    workspaceSecrets: z.array(z.string()).optional(),
    optimizationId: z.string().max(32).optional(),
    optimizationTargets: z.string().optional(),
    headJobCpus: z.number().int().optional(),
    headJobMemoryMb: z.number().int().optional(),
    dateCreated: z.string().datetime({ offset: true }),
    lastUpdated: z.string().datetime({ offset: true }).optional(),
  })
  .passthrough();
const Action_TowerActionConfig = z.object({ discriminator: z.string() }).partial().passthrough();
const GithubActionConfig = z
  .object({ discriminator: z.string(), events: z.array(z.string()) })
  .partial()
  .passthrough();
const Action_ConfigType = z.discriminatedUnion('discriminator', [Action_TowerActionConfig, GithubActionConfig]);
const ActionResponseDto = z
  .object({
    id: z.string(),
    launch: Launch,
    name: z.string(),
    hookId: z.string(),
    hookUrl: z.string(),
    message: z.string(),
    source: Action_Source,
    status: Action_Status,
    config: Action_ConfigType,
    event: Action_EventType,
    lastSeen: z.string().datetime({ offset: true }),
    dateCreated: z.string().datetime({ offset: true }),
    lastUpdated: z.string().datetime({ offset: true }),
    labels: z.array(LabelDbDto),
  })
  .partial()
  .passthrough();
const DescribeActionResponse = z.object({ action: ActionResponseDto }).partial().passthrough();
const UpdateActionRequest = z.object({ name: z.string(), launch: WorkflowLaunchRequest }).partial().passthrough();
const LaunchActionRequest = z
  .object({ params: z.object({}).partial().passthrough() })
  .partial()
  .passthrough();
const LaunchActionResponse = z.object({ workflowId: z.string() }).partial().passthrough();
const EmptyBodyRequest = z.object({}).partial().passthrough();
const Avatar = z
  .object({
    id: z.string().max(22),
    dateCreated: z.string().datetime({ offset: true }),
    lastUpdated: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const CreateAvatarResponse = z.object({ avatar: Avatar, url: z.string() }).partial().passthrough();
const ListComputeEnvsResponse_Entry = z
  .object({
    id: z.string(),
    name: z.string(),
    platform: z.string(),
    status: ComputeEnv_Status,
    message: z.string(),
    lastUsed: z.string().datetime({ offset: true }),
    primary: z.boolean(),
    workspaceName: z.string(),
    visibility: z.string(),
    workDir: z.string(),
    credentialsId: z.string(),
    region: z.string(),
  })
  .partial()
  .passthrough();
const ListComputeEnvsResponse = z
  .object({ computeEnvs: z.array(ListComputeEnvsResponse_Entry) })
  .partial()
  .passthrough();
const CreateComputeEnvRequest = z
  .object({ computeEnv: ComputeEnv_ComputeConfig_, labelIds: z.array(z.number()) })
  .partial()
  .passthrough();
const CreateComputeEnvResponse = z.object({ computeEnvId: z.string() }).partial().passthrough();
const ComputeEnvQueryAttribute = z.literal('labels');
const ComputeEnvResponseDto = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    platform: z.enum([
      'aws-batch',
      'google-lifesciences',
      'google-batch',
      'azure-batch',
      'k8s-platform',
      'eks-platform',
      'gke-platform',
      'uge-platform',
      'slurm-platform',
      'lsf-platform',
      'altair-platform',
    ]),
    config: ComputeConfig,
    dateCreated: z.string().datetime({ offset: true }),
    lastUpdated: z.string().datetime({ offset: true }),
    lastUsed: z.string().datetime({ offset: true }),
    deleted: z.boolean(),
    status: ComputeEnv_Status,
    message: z.string(),
    primary: z.boolean(),
    credentialsId: z.string(),
    orgId: z.number().int(),
    workspaceId: z.number().int(),
    labels: z.array(LabelDbDto),
  })
  .partial()
  .passthrough();
const DescribeComputeEnvResponse = z.object({ computeEnv: ComputeEnvResponseDto }).partial().passthrough();
const UpdateComputeEnvRequest = z.object({ name: z.string() }).partial().passthrough();
const AwsSecurityKeys = z
  .object({ discriminator: z.string(), accessKey: z.string(), secretKey: z.string(), assumeRoleArn: z.string() })
  .partial()
  .passthrough();
const GoogleSecurityKeys = z.object({ discriminator: z.string(), data: z.string() }).partial().passthrough();
const GitHubSecurityKeys = z
  .object({ discriminator: z.string(), username: z.string(), password: z.string() })
  .partial()
  .passthrough();
const GitLabSecurityKeys = z
  .object({ discriminator: z.string(), username: z.string(), password: z.string(), token: z.string() })
  .partial()
  .passthrough();
const BitBucketSecurityKeys = z
  .object({ discriminator: z.string(), username: z.string(), password: z.string() })
  .partial()
  .passthrough();
const GiteaSecurityKeys = z
  .object({ discriminator: z.string(), username: z.string(), password: z.string() })
  .partial()
  .passthrough();
const SSHSecurityKeys = z
  .object({ discriminator: z.string(), privateKey: z.string(), passphrase: z.string() })
  .partial()
  .passthrough();
const K8sSecurityKeys = z
  .object({ discriminator: z.string(), certificate: z.string(), privateKey: z.string(), token: z.string() })
  .partial()
  .passthrough();
const AzureSecurityKeys = z
  .object({
    discriminator: z.string(),
    batchName: z.string(),
    batchKey: z.string(),
    storageName: z.string(),
    storageKey: z.string(),
  })
  .partial()
  .passthrough();
const AzureReposSecurityKeys = z
  .object({ discriminator: z.string(), username: z.string(), password: z.string() })
  .partial()
  .passthrough();
const ContainerRegistryKeys = z
  .object({ discriminator: z.string(), userName: z.string(), password: z.string(), registry: z.string() })
  .partial()
  .passthrough();
const AgentSecurityKeys = z
  .object({ discriminator: z.string(), connectionId: z.string(), workDir: z.string(), shared: z.boolean() })
  .partial()
  .passthrough();
const CodeCommitSecurityKeys = z
  .object({ discriminator: z.string(), username: z.string(), password: z.string() })
  .partial()
  .passthrough();
const SecurityKeys = z.discriminatedUnion('discriminator', [
  AwsSecurityKeys,
  GoogleSecurityKeys,
  GitHubSecurityKeys,
  GitLabSecurityKeys,
  BitBucketSecurityKeys,
  GiteaSecurityKeys,
  SSHSecurityKeys,
  K8sSecurityKeys,
  AzureSecurityKeys,
  AzureReposSecurityKeys,
  ContainerRegistryKeys,
  AgentSecurityKeys,
  CodeCommitSecurityKeys,
]);
const Credentials = z
  .object({
    id: z.string().max(22).optional(),
    name: z.string().max(100),
    description: z.string().optional(),
    provider: z.enum([
      'aws',
      'azure',
      'google',
      'github',
      'gitlab',
      'bitbucket',
      'ssh',
      'k8s',
      'container-reg',
      'tw-agent',
      'codecommit',
      'gitea',
      'azurerepos',
    ]),
    baseUrl: z.string().max(200).optional(),
    category: z.string().max(20).optional(),
    deleted: z.boolean().optional(),
    lastUsed: z.string().datetime({ offset: true }).optional(),
    dateCreated: z.string().datetime({ offset: true }).optional(),
    lastUpdated: z.string().datetime({ offset: true }).optional(),
    keys: SecurityKeys.optional(),
  })
  .passthrough();
const ListCredentialsResponse = z
  .object({ credentials: z.array(Credentials) })
  .partial()
  .passthrough();
const CreateCredentialsRequest = z.object({ credentials: Credentials }).partial().passthrough();
const CreateCredentialsResponse = z.object({ credentialsId: z.string() }).partial().passthrough();
const DescribeCredentialsResponse = z.object({ credentials: Credentials }).partial().passthrough();
const UpdateCredentialsRequest = z.object({ credentials: Credentials }).partial().passthrough();
const DeleteCredentialsConflictResponse_Conflict = z
  .object({ type: z.string(), id: z.string(), name: z.string(), url: z.string() })
  .partial()
  .passthrough();
const DeleteCredentialsConflictResponse = z
  .object({ credentialsId: z.string(), conflicts: z.array(DeleteCredentialsConflictResponse_Conflict) })
  .partial()
  .passthrough();
const DataLinkType = z.literal('bucket');
const DataLinkProvider = z.enum(['aws', 'google', 'azure']);
const DataLinkCredentials = z.object({ id: z.string(), name: z.string(), provider: DataLinkProvider }).passthrough();
const DataLink_Status = z.enum(['VALID', 'INVALID']);
const DataLinkDto = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    resourceRef: z.string(),
    type: DataLinkType,
    provider: DataLinkProvider,
    region: z.string(),
    credentials: z.array(DataLinkCredentials),
    publicAccessible: z.boolean(),
    hidden: z.boolean(),
    status: DataLink_Status.and(z.string()),
    message: z.string(),
  })
  .partial()
  .passthrough();
const DataLinksListResponse = z
  .object({ dataLinks: z.array(DataLinkDto), totalSize: z.number().int() })
  .partial()
  .passthrough();
const DataLinkCreateRequest = z
  .object({
    name: z.string(),
    description: z.string(),
    type: DataLinkType,
    provider: DataLinkProvider,
    resourceRef: z.string(),
    publicAccessible: z.boolean(),
    credentialsId: z.string(),
  })
  .partial()
  .passthrough();
const DataLinkResponse = z.object({ dataLink: DataLinkDto }).partial().passthrough();
const DataLinkUpdateRequest = z
  .object({ name: z.string(), description: z.string(), credentialsId: z.string() })
  .partial()
  .passthrough();
const DataLinkItemType = z.enum(['FOLDER', 'FILE']);
const DataLinkItem = z
  .object({ type: DataLinkItemType, name: z.string(), size: z.number().int(), mimeType: z.string() })
  .partial()
  .passthrough();
const DataLinkContentResponse = z
  .object({ originalPath: z.string(), objects: z.array(DataLinkItem), nextPageToken: z.string() })
  .partial()
  .passthrough();
const Dataset = z
  .object({
    id: z.string().max(22).optional(),
    name: z
      .string()
      .max(100)
      .regex(/^[a-zA-Z\d](?:[a-zA-Z\d]|[-_](?=[a-zA-Z\d])){1,98}$/),
    description: z.string().max(1000).optional(),
    mediaType: z.string().max(80).optional(),
    deleted: z.boolean().optional(),
    dateCreated: z.string().datetime({ offset: true }).optional(),
    lastUpdated: z.string().datetime({ offset: true }).optional(),
  })
  .passthrough();
const ListDatasetsResponse = z
  .object({ datasets: z.array(Dataset) })
  .partial()
  .passthrough();
const CreateDatasetRequest = z.object({ name: z.string(), description: z.string() }).partial().passthrough();
const CreateDatasetResponse = z.object({ dataset: Dataset }).partial().passthrough();
const DatasetVersionDbDto = z
  .object({
    datasetId: z.string(),
    datasetName: z.string(),
    datasetDescription: z.string(),
    hasHeader: z.boolean(),
    version: z.number().int(),
    lastUpdated: z.string().datetime({ offset: true }),
    fileName: z.string(),
    mediaType: z.string(),
    url: z.string(),
  })
  .partial()
  .passthrough();
const ListDatasetVersionsResponse = z
  .object({ versions: z.array(DatasetVersionDbDto) })
  .partial()
  .passthrough();
const UpdateDatasetRequest = z.object({ name: z.string(), description: z.string() }).partial().passthrough();
const DescribeDatasetResponse = z.object({ dataset: Dataset }).partial().passthrough();
const MultiRequestFileSchema = z
  .object({ file: z.instanceof(File) })
  .partial()
  .passthrough();
const UploadDatasetVersionResponse = z.object({ version: DatasetVersionDbDto }).partial().passthrough();
const State = z.enum([
  'UNKNOWN',
  'QUEUED',
  'INITIALIZING',
  'RUNNING',
  'PAUSED',
  'COMPLETE',
  'EXECUTOR_ERROR',
  'SYSTEM_ERROR',
  'CANCELED',
  'CANCELING',
]);
const RunStatus = z.object({ run_id: z.string(), state: State }).partial().passthrough();
const RunListResponse = z
  .object({ runs: z.array(RunStatus), next_page_token: z.string() })
  .partial()
  .passthrough();
const WesErrorResponse = z.object({ msg: z.string(), status_code: z.number().int() }).partial().passthrough();
const RunRequest = z
  .object({
    workflow_params: z.string(),
    workflow_type: z.string(),
    workflow_type_version: z.string(),
    tags: z.record(z.string()),
    workflow_engine_parameters: z.record(z.string()),
    workflow_url: z.string(),
  })
  .partial()
  .passthrough();
const RunId = z.object({ run_id: z.string() }).partial().passthrough();
const Log = z
  .object({
    name: z.string(),
    cmd: z.array(z.string()),
    start_time: z.string(),
    end_time: z.string(),
    stdout: z.string(),
    stderr: z.string(),
    exit_code: z.number().int(),
  })
  .partial()
  .passthrough();
const RunLog = z
  .object({
    run_id: z.string(),
    request: RunRequest,
    state: State,
    run_log: Log,
    task_logs: z.array(Log),
    outputs: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const NavbarConfig_NavbarMenu = z.object({ label: z.string(), url: z.string() }).partial().passthrough();
const NavbarConfig = z
  .object({ menus: z.array(NavbarConfig_NavbarMenu) })
  .partial()
  .passthrough();
const Analytics = z.object({ url: z.string(), siteId: z.number().int() }).partial().passthrough();
const ServiceInfo = z
  .object({
    version: z.string(),
    apiVersion: z.string(),
    commitId: z.string(),
    authTypes: z.array(z.string()),
    loginPath: z.string(),
    navbar: NavbarConfig,
    heartbeatInterval: z.number().int(),
    userWorkspaceEnabled: z.boolean(),
    allowInstanceCredentials: z.boolean(),
    landingUrl: z.string(),
    termsOfUseUrl: z.string(),
    contentUrl: z.string(),
    analytics: Analytics,
    allowLocalRepos: z.boolean(),
    contentMaxFileSize: z.number().int(),
    waveEnabled: z.boolean(),
    groundswellEnabled: z.boolean(),
    groundswellAllowedWorkspaces: z.array(z.number()),
    waveAllowedWorkspaces: z.array(z.number()),
    forgePrefix: z.string(),
    seqeraCloud: z.boolean(),
    evalWorkspaceIds: z.array(z.number()),
    contactEmail: z.string(),
    allowNextflowCliLogs: z.boolean(),
  })
  .partial()
  .passthrough();
const ListLabelsResponse = z
  .object({ labels: z.array(LabelDbDto), totalSize: z.number().int() })
  .partial()
  .passthrough();
const CreateLabelRequest = z
  .object({ name: z.string(), value: z.string(), resource: z.boolean(), isDefault: z.boolean() })
  .partial()
  .passthrough();
const CreateLabelResponse = z
  .object({ id: z.number().int(), name: z.string(), value: z.string(), resource: z.boolean(), isDefault: z.boolean() })
  .partial()
  .passthrough();
const UpdateLabelRequest = z
  .object({ name: z.string(), value: z.string(), isDefault: z.boolean() })
  .partial()
  .passthrough();
const UpdateLabelResponse = z
  .object({ id: z.number().int(), name: z.string(), value: z.string(), isDefault: z.boolean() })
  .partial()
  .passthrough();
const DescribeLaunchResponse = z.object({ launch: Launch }).partial().passthrough();
const OrgRole = z.enum(['owner', 'member', 'collaborator']);
const OrganizationDbDto = z
  .object({
    orgId: z.number().int(),
    name: z.string(),
    fullName: z.string(),
    description: z.string(),
    location: z.string(),
    website: z.string(),
    logoId: z.string(),
    logoUrl: z.string(),
    memberId: z.number().int(),
    memberRole: OrgRole,
    paying: z.boolean(),
  })
  .partial()
  .passthrough();
const ListOrganizationsResponse = z
  .object({ organizations: z.array(OrganizationDbDto), totalSize: z.number().int() })
  .partial()
  .passthrough();
const Organization = z
  .object({
    id: z.number().int().nullish(),
    name: z
      .string()
      .max(40)
      .regex(/^[a-zA-Z\d](?:[a-zA-Z\d]|[-_](?=[a-zA-Z\d])){1,38}$/),
    fullName: z.string().max(100),
    description: z.string().max(1000).optional(),
    location: z.string().max(100).optional(),
    website: z.string().optional(),
    dateCreated: z.string().datetime({ offset: true }).optional(),
    lastUpdated: z.string().datetime({ offset: true }).optional(),
  })
  .passthrough();
const CreateOrganizationRequest = z.object({ organization: Organization, logoId: z.string() }).partial().passthrough();
const CreateOrganizationResponse = z.object({ organization: OrganizationDbDto }).partial().passthrough();
const DescribeOrganizationResponse = z.object({ organization: OrganizationDbDto }).partial().passthrough();
const UpdateOrganizationRequest = z
  .object({
    fullName: z.string(),
    name: z.string(),
    description: z.string(),
    location: z.string(),
    website: z.string(),
    logoId: z.string(),
    paying: z.boolean().nullable(),
  })
  .partial()
  .passthrough();
const MemberDbDto = z
  .object({
    memberId: z.number().int(),
    userId: z.number().int(),
    userName: z.string(),
    email: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    avatar: z.string(),
    role: OrgRole,
  })
  .partial()
  .passthrough();
const ListMembersResponse = z
  .object({ members: z.array(MemberDbDto), totalSize: z.number().int() })
  .partial()
  .passthrough();
const AddMemberRequest = z.object({ user: z.string() }).partial().passthrough();
const AddMemberResponse = z.object({ member: MemberDbDto }).partial().passthrough();
const UpdateMemberRoleRequest = z.object({ role: OrgRole }).partial().passthrough();
const TeamDbDto = z
  .object({
    teamId: z.number().int(),
    name: z.string(),
    description: z.string(),
    avatarUrl: z.string(),
    membersCount: z.number().int(),
  })
  .partial()
  .passthrough();
const ListTeamResponse = z
  .object({ teams: z.array(TeamDbDto), totalSize: z.number().int() })
  .partial()
  .passthrough();
const Team = z
  .object({
    id: z.number().int().nullish(),
    name: z
      .string()
      .max(40)
      .regex(/^[a-zA-Z\d](?:[a-zA-Z\d]|[-_](?=[a-zA-Z\d])){1,38}$/),
    description: z.string().max(250).optional(),
    dateCreated: z.string().datetime({ offset: true }).optional(),
    lastUpdated: z.string().datetime({ offset: true }).optional(),
  })
  .passthrough();
const CreateTeamRequest = z.object({ team: Team, avatarId: z.string() }).partial().passthrough();
const CreateTeamResponse = z.object({ team: TeamDbDto }).partial().passthrough();
const DescribeTeamResponse = z.object({ team: TeamDbDto }).partial().passthrough();
const UpdateTeamRequest = z
  .object({ name: z.string(), description: z.string(), avatarId: z.string() })
  .partial()
  .passthrough();
const CreateTeamMemberRequest = z.object({ userNameOrEmail: z.string() }).partial().passthrough();
const AddTeamMemberResponse = z.object({ member: MemberDbDto }).partial().passthrough();
const Visibility = z.enum(['PRIVATE', 'SHARED']);
const WorkspaceDbDto = z
  .object({
    id: z.number().int(),
    name: z.string(),
    fullName: z.string(),
    description: z.string(),
    visibility: Visibility,
  })
  .partial()
  .passthrough();
const ListWorkspacesResponse = z
  .object({ workspaces: z.array(WorkspaceDbDto) })
  .partial()
  .passthrough();
const Workspace = z
  .object({
    id: z.number().int().nullish(),
    name: z
      .string()
      .max(40)
      .regex(/^[a-zA-Z\d](?:[a-zA-Z\d]|[-_](?=[a-zA-Z\d])){1,38}$/),
    fullName: z.string().max(100),
    description: z.string().max(1000).optional(),
    visibility: Visibility,
    dateCreated: z.string().datetime({ offset: true }).optional(),
    lastUpdated: z.string().datetime({ offset: true }).optional(),
  })
  .passthrough();
const CreateWorkspaceRequest = z.object({ workspace: Workspace }).partial().passthrough();
const CreateWorkspaceResponse = z.object({ workspace: Workspace }).partial().passthrough();
const DescribeWorkspaceResponse = z.object({ workspace: Workspace }).partial().passthrough();
const UpdateWorkspaceRequest = z
  .object({ name: z.string(), fullName: z.string(), description: z.string(), visibility: Visibility })
  .partial()
  .passthrough();
const WspRole = z.enum(['owner', 'admin', 'maintain', 'launch', 'connect', 'view']);
const ParticipantType = z.enum(['MEMBER', 'TEAM', 'COLLABORATOR']);
const ParticipantDbDto = z
  .object({
    participantId: z.number().int(),
    memberId: z.number().int(),
    userName: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    orgRole: OrgRole,
    teamId: z.number().int(),
    teamName: z.string(),
    wspRole: WspRole,
    type: ParticipantType,
    teamAvatarUrl: z.string(),
    userAvatarUrl: z.string(),
  })
  .partial()
  .passthrough();
const ListParticipantsResponse = z
  .object({ participants: z.array(ParticipantDbDto), totalSize: z.number().int() })
  .partial()
  .passthrough();
const AddParticipantRequest = z
  .object({ memberId: z.number().int(), teamId: z.number().int(), userNameOrEmail: z.string() })
  .partial()
  .passthrough();
const AddParticipantResponse = z.object({ participant: ParticipantDbDto }).partial().passthrough();
const UpdateParticipantRoleRequest = z.object({ role: WspRole }).partial().passthrough();
const PipelineSecret = z
  .object({
    id: z.number().int().nullish(),
    name: z
      .string()
      .max(100)
      .regex(/^[a-zA-Z_](?:[0-9A-Za-z]+|(_)(?!\1)){1,49}$/),
    lastUsed: z.string().datetime({ offset: true }).optional(),
    dateCreated: z.string().datetime({ offset: true }).optional(),
    lastUpdated: z.string().datetime({ offset: true }).optional(),
  })
  .passthrough();
const ListPipelineSecretsResponse = z
  .object({ pipelineSecrets: z.array(PipelineSecret), totalSize: z.number().int() })
  .partial()
  .passthrough();
const CreatePipelineSecretRequest = z.object({ name: z.string(), value: z.string() }).partial().passthrough();
const CreatePipelineSecretResponse = z.object({ secretId: z.number().int() }).partial().passthrough();
const DescribePipelineSecretResponse = z.object({ pipelineSecret: PipelineSecret }).partial().passthrough();
const UpdatePipelineSecretRequest = z.object({ value: z.string() }).partial().passthrough();
const PipelineQueryAttribute = z.enum(['optimized', 'labels', 'computeEnv']);
const PipelineOptimizationStatus = z.enum(['OPTIMIZED', 'OPTIMIZABLE', 'UNAVAILABLE']);
const ComputeEnvDbDto = z
  .object({ id: z.string(), name: z.string(), platform: z.string(), region: z.string() })
  .partial()
  .passthrough();
const PipelineDbDto = z
  .object({
    pipelineId: z.number().int(),
    name: z.string(),
    description: z.string(),
    icon: z.string(),
    repository: z.string(),
    userId: z.number().int(),
    userName: z.string(),
    userFirstName: z.string(),
    userLastName: z.string(),
    orgId: z.number().int(),
    orgName: z.string(),
    workspaceId: z.number().int(),
    workspaceName: z.string(),
    visibility: z.string(),
    deleted: z.boolean(),
    lastUpdated: z.string().datetime({ offset: true }),
    optimizationId: z.string(),
    optimizationTargets: z.string(),
    optimizationStatus: PipelineOptimizationStatus,
    labels: z.array(LabelDbDto),
    computeEnv: ComputeEnvDbDto,
  })
  .partial()
  .passthrough();
const ListPipelinesResponse = z
  .object({ pipelines: z.array(PipelineDbDto), totalSize: z.number().int() })
  .partial()
  .passthrough();
const CreatePipelineRequest = z
  .object({
    name: z.string(),
    description: z.string(),
    icon: z.string(),
    launch: WorkflowLaunchRequest,
    labelIds: z.array(z.number()),
  })
  .partial()
  .passthrough();
const CreatePipelineResponse = z.object({ pipeline: PipelineDbDto }).partial().passthrough();
const WfManifest = z
  .object({
    nextflowVersion: z.string().max(20),
    defaultBranch: z.string().max(20),
    version: z.string().max(20),
    homePage: z.string().max(200),
    gitmodules: z.string().max(150),
    description: z.string().max(1024),
    name: z.string().max(150),
    mainScript: z.string().max(100),
    author: z.string().max(150),
  })
  .partial()
  .passthrough();
const PipelineInfo = z
  .object({
    projectName: z.string(),
    simpleName: z.string(),
    repositoryUrl: z.string(),
    cloneUrl: z.string(),
    provider: z.string(),
    configFiles: z.array(z.string()),
    workDirs: z.array(z.string()),
    revisions: z.array(z.string()),
    profiles: z.array(z.string()),
    manifest: WfManifest,
    warnings: z.array(z.string()),
  })
  .partial()
  .passthrough();
const DescribePipelineInfoResponse = z.object({ pipelineInfo: PipelineInfo }).partial().passthrough();
const AssociatePipelineLabelsRequest = z
  .object({ pipelineIds: z.array(z.number()), labelIds: z.array(z.number()) })
  .partial()
  .passthrough();
const ListPipelineInfoResponse = z
  .object({ pipelines: z.array(z.string()) })
  .partial()
  .passthrough();
const DescribePipelineResponse = z.object({ pipeline: PipelineDbDto }).partial().passthrough();
const UpdatePipelineRequest = z
  .object({
    name: z.string(),
    description: z.string(),
    icon: z.string(),
    launch: WorkflowLaunchRequest,
    labelIds: z.array(z.number()),
  })
  .partial()
  .passthrough();
const UpdatePipelineResponse = z.object({ pipeline: PipelineDbDto }).partial().passthrough();
const PipelineSchemaAttributes = z.enum(['schema', 'params']);
const PipelineSchemaResponse = z.object({ schema: z.string(), params: z.string().optional() }).passthrough();
const ComputePlatform = z
  .object({ id: z.string(), name: z.string(), credentialsProviders: z.array(z.string()) })
  .partial()
  .passthrough();
const ListPlatformsResponse = z
  .object({ platforms: z.array(ComputePlatform) })
  .partial()
  .passthrough();
const AwsBatchPlatformMetainfo_JobQueue = z.object({ name: z.string(), state: z.string() }).passthrough();
const AwsBatchPlatformMetainfo_Bucket = z.object({ path: z.string() }).partial().passthrough();
const AwsBatchPlatformMetainfo_FsxFileSystem = z
  .object({ id: z.string(), dns: z.string(), mount: z.string() })
  .partial()
  .passthrough();
const AwsBatchPlatformMetainfo_EfsFileSystem = z.object({ id: z.string() }).partial().passthrough();
const AwsBatchPlatformMetainfo_Vpc = z.object({ id: z.string(), isDefault: z.boolean() }).partial().passthrough();
const AwsBatchPlatformMetainfo_Image = z
  .object({ id: z.string(), name: z.string(), description: z.string() })
  .partial()
  .passthrough();
const AwsBatchPlatformMetainfo_SecurityGroup = z
  .object({ id: z.string(), name: z.string(), vpcId: z.string() })
  .partial()
  .passthrough();
const AwsBatchPlatformMetainfo_Subnet = z
  .object({ id: z.string(), zone: z.string(), vpcId: z.string() })
  .partial()
  .passthrough();
const AwsBatchPlatformMetainfo = z
  .object({
    warnings: z.array(z.string()),
    jobQueues: z.array(AwsBatchPlatformMetainfo_JobQueue),
    buckets: z.array(AwsBatchPlatformMetainfo_Bucket),
    fileSystems: z.array(AwsBatchPlatformMetainfo_FsxFileSystem),
    efsFileSystems: z.array(AwsBatchPlatformMetainfo_EfsFileSystem),
    keyPairs: z.array(z.string()),
    vpcs: z.array(AwsBatchPlatformMetainfo_Vpc),
    images: z.array(AwsBatchPlatformMetainfo_Image),
    securityGroups: z.array(AwsBatchPlatformMetainfo_SecurityGroup),
    subnets: z.array(AwsBatchPlatformMetainfo_Subnet),
    instanceFamilies: z.array(z.string()),
    allocStrategy: z.array(z.string()),
  })
  .partial()
  .passthrough();
const GooglePlatformMetainfo_Bucket = z.object({ path: z.string() }).partial().passthrough();
const GooglePlatformMetainfo_Filestore = z
  .object({ target: z.string(), name: z.string(), location: z.string() })
  .partial()
  .passthrough();
const GooglePlatformMetainfo = z
  .object({
    locations: z.array(z.string()),
    warnings: z.array(z.string()),
    zones: z.array(z.string()),
    buckets: z.array(GooglePlatformMetainfo_Bucket),
    filestores: z.array(GooglePlatformMetainfo_Filestore),
  })
  .partial()
  .passthrough();
const PlatformMetainfo = z.union([AwsBatchPlatformMetainfo, GooglePlatformMetainfo]);
const DescribePlatformResponse = z.object({ metainfo: PlatformMetainfo }).partial().passthrough();
const ComputeRegion = z.object({ id: z.string(), name: z.string() }).partial().passthrough();
const ListRegionsResponse = z
  .object({ regions: z.array(ComputeRegion) })
  .partial()
  .passthrough();
const ServiceInfoResponse = z.object({ serviceInfo: ServiceInfo }).partial().passthrough();
const AccessToken = z
  .object({
    basicAuth: z.string().optional(),
    id: z.number().int().nullish(),
    name: z.string().min(1).max(50),
    lastUsed: z.string().datetime({ offset: true }).optional(),
    dateCreated: z.string().datetime({ offset: true }).optional(),
  })
  .passthrough();
const ListAccessTokensResponse = z
  .object({ tokens: z.array(AccessToken) })
  .partial()
  .passthrough();
const CreateAccessTokenRequest = z.object({ name: z.string() }).partial().passthrough();
const CreateAccessTokenResponse = z.object({ accessKey: z.string(), token: AccessToken }).partial().passthrough();
const TraceCreateRequest = z
  .object({
    launchId: z.string(),
    sessionId: z.string(),
    runName: z.string(),
    projectName: z.string(),
    repository: z.string(),
    workflowId: z.string(),
  })
  .partial()
  .passthrough();
const TraceCreateResponse = z.object({ message: z.string(), workflowId: z.string() }).partial().passthrough();
const WorkflowStatus = z.enum(['SUBMITTED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'UNKNOWN']);
const WfNextflow = z
  .object({ version: z.string().max(20), build: z.string().max(10), timestamp: z.string().datetime({ offset: true }) })
  .partial()
  .passthrough();
const WfStats = z
  .object({
    computeTimeFmt: z.string().max(50),
    cachedCount: z.number().int(),
    failedCount: z.number().int(),
    ignoredCount: z.number().int(),
    succeedCount: z.number().int(),
    cachedCountFmt: z.string(),
    succeedCountFmt: z.string(),
    failedCountFmt: z.string(),
    ignoredCountFmt: z.string(),
    cachedPct: z.number(),
    failedPct: z.number(),
    succeedPct: z.number(),
    ignoredPct: z.number(),
    cachedDuration: z.number().int(),
    failedDuration: z.number().int(),
    succeedDuration: z.number().int(),
  })
  .partial()
  .passthrough();
const Workflow = z
  .object({
    status: WorkflowStatus.optional(),
    ownerId: z.number().int().optional(),
    repository: z.string().optional(),
    id: z.string().max(16).optional(),
    submit: z.string().datetime({ offset: true }),
    start: z.string().datetime({ offset: true }).optional(),
    complete: z.string().datetime({ offset: true }).optional(),
    dateCreated: z.string().datetime({ offset: true }).nullish(),
    lastUpdated: z.string().datetime({ offset: true }).nullish(),
    runName: z.string().max(80),
    sessionId: z.string().max(36),
    profile: z.string().max(100).optional(),
    workDir: z.string(),
    commitId: z.string().max(40).optional(),
    userName: z.string().max(40),
    scriptId: z.string().max(40).optional(),
    revision: z.string().max(100).optional(),
    commandLine: z.string().max(8096),
    projectName: z.string().max(200),
    scriptName: z.string().max(100).optional(),
    launchId: z.string().max(22).optional(),
    configFiles: z.array(z.string()).optional(),
    params: z.object({}).partial().passthrough().optional(),
    configText: z.string().optional(),
    manifest: WfManifest.optional(),
    nextflow: WfNextflow.optional(),
    stats: WfStats.optional(),
    errorMessage: z.string().optional(),
    errorReport: z.string().optional(),
    deleted: z.boolean().optional(),
    projectDir: z.string().optional(),
    homeDir: z.string().optional(),
    container: z.string().optional(),
    containerEngine: z.string().optional(),
    scriptFile: z.string().optional(),
    launchDir: z.string().optional(),
    duration: z.number().int().optional(),
    exitStatus: z.number().int().optional(),
    resume: z.boolean().optional(),
    success: z.boolean().optional(),
    logFile: z.string().max(255).optional(),
    outFile: z.string().max(255).optional(),
    operationId: z.string().max(110).optional(),
  })
  .passthrough();
const TraceBeginRequest = z
  .object({ launchId: z.string(), workflow: Workflow, processNames: z.array(z.string()), towerLaunch: z.boolean() })
  .partial()
  .passthrough();
const TraceProcessingStatus = z.enum(['OK', 'KO']);
const TraceBeginResponse = z
  .object({ status: TraceProcessingStatus, workflowId: z.string(), watchUrl: z.string() })
  .partial()
  .passthrough();
const ResourceData = z
  .object({
    warnings: z.array(z.string()),
    mean: z.number(),
    min: z.number(),
    q1: z.number(),
    q2: z.number(),
    q3: z.number(),
    max: z.number(),
    minLabel: z.string(),
    maxLabel: z.string(),
    q1Label: z.string(),
    q2Label: z.string(),
    q3Label: z.string(),
  })
  .partial()
  .passthrough();
const WorkflowMetrics = z
  .object({
    id: z.number().int().nullish(),
    process: z.string().max(255),
    cpu: ResourceData.optional(),
    mem: ResourceData.optional(),
    vmem: ResourceData.optional(),
    time: ResourceData.optional(),
    reads: ResourceData.optional(),
    writes: ResourceData.optional(),
    cpuUsage: ResourceData.optional(),
    memUsage: ResourceData.optional(),
    timeUsage: ResourceData.optional(),
  })
  .passthrough();
const TraceProgressDetail = z
  .object({
    index: z.number().int(),
    name: z.string(),
    pending: z.number().int(),
    submitted: z.number().int(),
    running: z.number().int(),
    succeeded: z.number().int(),
    cached: z.number().int(),
    failed: z.number().int(),
    aborted: z.number().int(),
    stored: z.number().int(),
    ignored: z.number().int(),
    retries: z.number().int(),
    terminated: z.boolean(),
    loadCpus: z.number().int(),
    loadMemory: z.number().int(),
    peakRunning: z.number().int(),
    peakCpus: z.number().int(),
    peakMemory: z.number().int(),
  })
  .partial()
  .passthrough();
const TraceProgressData = z
  .object({
    pending: z.number().int(),
    submitted: z.number().int(),
    running: z.number().int(),
    succeeded: z.number().int(),
    cached: z.number().int(),
    failed: z.number().int(),
    aborted: z.number().int(),
    stored: z.number().int(),
    ignored: z.number().int(),
    retries: z.number().int(),
    loadCpus: z.number().int(),
    loadMemory: z.number().int(),
    peakRunning: z.number().int(),
    peakCpus: z.number().int(),
    peakMemory: z.number().int(),
    processes: z.array(TraceProgressDetail),
  })
  .partial()
  .passthrough();
const TraceCompleteRequest = z
  .object({ workflow: Workflow, metrics: z.array(WorkflowMetrics), progress: TraceProgressData })
  .partial()
  .passthrough();
const TraceCompleteResponse = z
  .object({ status: TraceProcessingStatus, workflowId: z.string() })
  .partial()
  .passthrough();
const TraceHeartbeatRequest = z.object({ progress: TraceProgressData }).partial().passthrough();
const TraceHeartbeatResponse = z.object({ message: z.string() }).partial().passthrough();
const CloudPriceModel = z.enum(['standard', 'spot']);
const TaskStatus = z.enum(['NEW', 'SUBMITTED', 'RUNNING', 'CACHED', 'COMPLETED', 'FAILED', 'ABORTED']);
const Task = z
  .object({
    hash: z.string().optional(),
    name: z.string().optional(),
    process: z.string().optional(),
    tag: z.string().optional(),
    submit: z.string().datetime({ offset: true }).optional(),
    start: z.string().datetime({ offset: true }).optional(),
    complete: z.string().datetime({ offset: true }).optional(),
    module: z.array(z.string()).optional(),
    container: z.string().optional(),
    attempt: z.number().int().optional(),
    script: z.string().optional(),
    scratch: z.string().optional(),
    workdir: z.string().optional(),
    queue: z.string().optional(),
    cpus: z.number().int().optional(),
    memory: z.number().int().optional(),
    disk: z.number().int().optional(),
    time: z.number().int().optional(),
    env: z.string().optional(),
    executor: z.string().optional(),
    machineType: z.string().optional(),
    cloudZone: z.string().optional(),
    priceModel: CloudPriceModel.optional(),
    cost: z.number().optional(),
    errorAction: z.string().optional(),
    exitStatus: z.number().int().optional(),
    duration: z.number().int().optional(),
    realtime: z.number().int().optional(),
    nativeId: z.string().optional(),
    pcpu: z.number().optional(),
    pmem: z.number().optional(),
    rss: z.number().int().optional(),
    vmem: z.number().int().optional(),
    peakRss: z.number().int().optional(),
    peakVmem: z.number().int().optional(),
    rchar: z.number().int().optional(),
    wchar: z.number().int().optional(),
    syscr: z.number().int().optional(),
    syscw: z.number().int().optional(),
    readBytes: z.number().int().optional(),
    writeBytes: z.number().int().optional(),
    volCtxt: z.number().int().optional(),
    invCtxt: z.number().int().optional(),
    exit: z.number().int().optional(),
    id: z.number().int().nullish(),
    taskId: z.number().int(),
    status: TaskStatus,
    dateCreated: z.string().datetime({ offset: true }).nullish(),
    lastUpdated: z.string().datetime({ offset: true }).nullish(),
  })
  .passthrough();
const TraceProgressRequest = z
  .object({ tasks: z.array(Task), progress: TraceProgressData })
  .partial()
  .passthrough();
const TraceProgressResponse = z
  .object({ status: TraceProcessingStatus, workflowId: z.string() })
  .partial()
  .passthrough();
const UserDbDto = z
  .object({
    id: z.number().int().optional(),
    userName: z.string().max(40),
    email: z.string().max(255).email(),
    firstName: z.string().max(100).optional(),
    lastName: z.string().max(100).optional(),
    organization: z.string().max(100).optional(),
    description: z.string().max(1000).optional(),
    avatar: z.string().optional(),
    avatarId: z.string().optional(),
    notification: z.boolean().optional(),
    termsOfUseConsent: z.boolean().optional(),
    marketingConsent: z.boolean().optional(),
    lastAccess: z.string().datetime({ offset: true }).optional(),
    dateCreated: z.string().datetime({ offset: true }).optional(),
    lastUpdated: z.string().datetime({ offset: true }).optional(),
    deleted: z.boolean().optional(),
  })
  .passthrough();
const DescribeUserResponse = z
  .object({ user: UserDbDto, needConsent: z.boolean(), defaultWorkspaceId: z.number().int() })
  .partial()
  .passthrough();
const OrgAndWorkspaceDto = z
  .object({
    orgId: z.number().int(),
    orgName: z.string(),
    orgLogoUrl: z.string(),
    workspaceId: z.number().int(),
    workspaceName: z.string(),
    workspaceFullName: z.string(),
    visibility: Visibility,
    roles: z.array(z.string()),
  })
  .partial()
  .passthrough();
const ListWorkspacesAndOrgResponse = z
  .object({ orgsAndWorkspaces: z.array(OrgAndWorkspaceDto) })
  .partial()
  .passthrough();
const WorkflowQueryAttribute = z.enum(['optimized', 'labels', 'minimal']);
const WorkflowDbDto = z
  .object({
    id: z.string(),
    ownerId: z.number().int(),
    submit: z.string().datetime({ offset: true }),
    start: z.string().datetime({ offset: true }),
    complete: z.string().datetime({ offset: true }),
    dateCreated: z.string().datetime({ offset: true }),
    lastUpdated: z.string().datetime({ offset: true }),
    runName: z.string(),
    sessionId: z.string(),
    profile: z.string(),
    workDir: z.string(),
    commitId: z.string(),
    userName: z.string(),
    scriptId: z.string(),
    revision: z.string(),
    commandLine: z.string(),
    projectName: z.string(),
    scriptName: z.string(),
    launchId: z.string(),
    status: WorkflowStatus,
    configFiles: z.array(z.string()),
    params: z.object({}).partial().passthrough(),
    configText: z.string(),
    manifest: WfManifest,
    nextflow: WfNextflow,
    stats: WfStats,
    errorMessage: z.string(),
    errorReport: z.string(),
    deleted: z.boolean(),
    projectDir: z.string(),
    homeDir: z.string(),
    container: z.string(),
    repository: z.string(),
    containerEngine: z.string(),
    scriptFile: z.string(),
    launchDir: z.string(),
    duration: z.number().int(),
    exitStatus: z.number().int(),
    resume: z.boolean(),
    success: z.boolean(),
  })
  .partial()
  .passthrough();
const WorkflowLoad = z
  .object({
    pending: z.number().int(),
    submitted: z.number().int(),
    running: z.number().int(),
    succeeded: z.number().int(),
    failed: z.number().int(),
    cached: z.number().int(),
    memoryEfficiency: z.number().optional(),
    cpuEfficiency: z.number().optional(),
    cpus: z.number().int(),
    cpuTime: z.number().int(),
    cpuLoad: z.number().int(),
    memoryRss: z.number().int(),
    memoryReq: z.number().int(),
    readBytes: z.number().int(),
    writeBytes: z.number().int(),
    volCtxSwitch: z.number().int(),
    invCtxSwitch: z.number().int(),
    cost: z.number().optional(),
    loadTasks: z.number().int(),
    loadCpus: z.number().int(),
    loadMemory: z.number().int(),
    peakCpus: z.number().int(),
    peakTasks: z.number().int(),
    peakMemory: z.number().int(),
    executors: z.array(z.string()).optional(),
    dateCreated: z.string().datetime({ offset: true }).optional(),
    lastUpdated: z.string().datetime({ offset: true }).optional(),
  })
  .passthrough();
const ProcessLoad = z
  .object({
    pending: z.number().int(),
    submitted: z.number().int(),
    running: z.number().int(),
    succeeded: z.number().int(),
    failed: z.number().int(),
    cached: z.number().int(),
    memoryEfficiency: z.number().optional(),
    cpuEfficiency: z.number().optional(),
    process: z.string(),
    cpus: z.number().int(),
    cpuTime: z.number().int(),
    cpuLoad: z.number().int(),
    memoryRss: z.number().int(),
    memoryReq: z.number().int(),
    readBytes: z.number().int(),
    writeBytes: z.number().int(),
    volCtxSwitch: z.number().int(),
    invCtxSwitch: z.number().int(),
    loadTasks: z.number().int(),
    loadCpus: z.number().int(),
    loadMemory: z.number().int(),
    peakCpus: z.number().int(),
    peakTasks: z.number().int(),
    peakMemory: z.number().int(),
    dateCreated: z.string().datetime({ offset: true }).optional(),
    lastUpdated: z.string().datetime({ offset: true }).optional(),
  })
  .passthrough();
const ProgressData = z
  .object({ workflowProgress: WorkflowLoad, processesProgress: z.array(ProcessLoad) })
  .partial()
  .passthrough();
const ListWorkflowsResponse_ListWorkflowsElement = z
  .object({
    workflow: WorkflowDbDto,
    progress: ProgressData,
    orgId: z.number().int(),
    orgName: z.string(),
    workspaceId: z.number().int(),
    workspaceName: z.string(),
    labels: z.array(LabelDbDto),
    starred: z.boolean(),
    optimized: z.boolean(),
  })
  .partial()
  .passthrough();
const ListWorkflowsResponse = z
  .object({ workflows: z.array(ListWorkflowsResponse_ListWorkflowsElement), totalSize: z.number().int() })
  .partial()
  .passthrough();
const DeleteWorkflowsRequest = z
  .object({ workflowIds: z.array(z.string()) })
  .partial()
  .passthrough();
const DeleteWorkflowsResponse = z
  .object({ failedWorkflowIds: z.array(z.string()) })
  .partial()
  .passthrough();
const AssociateWorkflowLabelsRequest = z
  .object({ workflowIds: z.array(z.string()), labelIds: z.array(z.number()) })
  .partial()
  .passthrough();
const SubmitWorkflowLaunchRequest = z.object({ launch: WorkflowLaunchRequest }).partial().passthrough();
const SubmitWorkflowLaunchResponse = z.object({ workflowId: z.string() }).partial().passthrough();
const RandomWorkflowNameResponse = z.object({ name: z.string() }).partial().passthrough();
const ComputePlatformDto = z.object({ id: z.string(), name: z.string() }).partial().passthrough();
const JobInfoDto = z
  .object({
    id: z.number().int(),
    operationId: z.string(),
    message: z.string(),
    status: z.string(),
    exitCode: z.number().int(),
  })
  .partial()
  .passthrough();
const DescribeWorkflowResponse = z
  .object({
    workflow: Workflow,
    progress: ProgressData,
    platform: ComputePlatformDto,
    jobInfo: JobInfoDto,
    orgId: z.number().int(),
    orgName: z.string(),
    workspaceId: z.number().int(),
    workspaceName: z.string(),
    labels: z.array(LabelDbDto),
    optimized: z.boolean(),
  })
  .partial()
  .passthrough();
const WorkflowLaunchResponse = z
  .object({
    id: z.string(),
    computeEnv: ComputeEnv_ComputeConfig_,
    pipeline: z.string(),
    pipelineId: z.number().int(),
    workDir: z.string(),
    revision: z.string(),
    sessionId: z.string(),
    configProfiles: z.array(z.string()),
    userSecrets: z.array(z.string()),
    workspaceSecrets: z.array(z.string()),
    configText: z.string(),
    towerConfig: z.string(),
    paramsText: z.string(),
    preRunScript: z.string(),
    postRunScript: z.string(),
    mainScript: z.string(),
    entryName: z.string(),
    schemaName: z.string(),
    resume: z.boolean(),
    pullLatest: z.boolean(),
    stubRun: z.boolean(),
    resumeDir: z.string(),
    resumeCommitId: z.string(),
    headJobMemoryMb: z.number().int(),
    headJobCpus: z.number().int(),
    optimizationId: z.string(),
    optimizationTargets: z.string(),
    dateCreated: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const DescribeWorkflowLaunchResponse = z.object({ launch: WorkflowLaunchResponse }).partial().passthrough();
const Iterator_String_ = z.object({}).partial().passthrough();
const LogPage_Download = z
  .object({ saveName: z.string(), fileName: z.string(), displayText: z.string() })
  .partial()
  .passthrough();
const LogPage = z
  .object({
    truncated: z.boolean(),
    entries: Iterator_String_,
    rewindToken: z.string(),
    forwardToken: z.string(),
    pending: z.boolean(),
    message: z.string(),
    downloads: z.array(LogPage_Download),
  })
  .partial()
  .passthrough();
const WorkflowLogResponse = z.object({ log: LogPage }).partial().passthrough();
const GetWorkflowMetricsResponse = z
  .object({ metrics: z.array(WorkflowMetrics) })
  .partial()
  .passthrough();
const GetProgressResponse = z.object({ progress: ProgressData }).partial().passthrough();
const CreateWorkflowStarResponse = z.object({ workflowId: z.string() }).partial().passthrough();
const DescribeTaskResponse = z.object({ task: Task }).partial().passthrough();
const ListTasksResponse = z
  .object({ tasks: z.array(DescribeTaskResponse), total: z.number().int() })
  .partial()
  .passthrough();

export const schemas = {
  ActionQueryAttribute,
  Action_Source,
  Action_Status,
  GithubActionEvent,
  Action_TowerActionEvent,
  Action_EventType,
  LabelDbDto,
  ListActionsResponse_ActionInfo,
  ListActionsResponse,
  ErrorResponse,
  WorkflowLaunchRequest,
  CreateActionRequest,
  CreateActionResponse,
  AssociateActionLabelsRequest,
  EventType,
  ListEventTypesResponse,
  ConfigEnvVariable,
  ForgeConfig,
  AwsBatchConfig,
  GoogleLifeSciencesConfig,
  GoogleBatchConfig,
  AzBatchForgeConfig,
  JobCleanupPolicy,
  AzBatchConfig,
  AbstractGridConfig,
  LsfComputeConfig,
  SlurmComputeConfig,
  PodCleanupPolicy,
  K8sComputeConfig,
  EksComputeConfig,
  GkeComputeConfig,
  UnivaComputeConfig,
  AltairPbsComputeConfig,
  MoabComputeConfig,
  ComputeConfig,
  ComputeEnv_Status,
  ComputeEnv_ComputeConfig_,
  Launch,
  Action_TowerActionConfig,
  GithubActionConfig,
  Action_ConfigType,
  ActionResponseDto,
  DescribeActionResponse,
  UpdateActionRequest,
  LaunchActionRequest,
  LaunchActionResponse,
  EmptyBodyRequest,
  Avatar,
  CreateAvatarResponse,
  ListComputeEnvsResponse_Entry,
  ListComputeEnvsResponse,
  CreateComputeEnvRequest,
  CreateComputeEnvResponse,
  ComputeEnvQueryAttribute,
  ComputeEnvResponseDto,
  DescribeComputeEnvResponse,
  UpdateComputeEnvRequest,
  AwsSecurityKeys,
  GoogleSecurityKeys,
  GitHubSecurityKeys,
  GitLabSecurityKeys,
  BitBucketSecurityKeys,
  GiteaSecurityKeys,
  SSHSecurityKeys,
  K8sSecurityKeys,
  AzureSecurityKeys,
  AzureReposSecurityKeys,
  ContainerRegistryKeys,
  AgentSecurityKeys,
  CodeCommitSecurityKeys,
  SecurityKeys,
  Credentials,
  ListCredentialsResponse,
  CreateCredentialsRequest,
  CreateCredentialsResponse,
  DescribeCredentialsResponse,
  UpdateCredentialsRequest,
  DeleteCredentialsConflictResponse_Conflict,
  DeleteCredentialsConflictResponse,
  DataLinkType,
  DataLinkProvider,
  DataLinkCredentials,
  DataLink_Status,
  DataLinkDto,
  DataLinksListResponse,
  DataLinkCreateRequest,
  DataLinkResponse,
  DataLinkUpdateRequest,
  DataLinkItemType,
  DataLinkItem,
  DataLinkContentResponse,
  Dataset,
  ListDatasetsResponse,
  CreateDatasetRequest,
  CreateDatasetResponse,
  DatasetVersionDbDto,
  ListDatasetVersionsResponse,
  UpdateDatasetRequest,
  DescribeDatasetResponse,
  MultiRequestFileSchema,
  UploadDatasetVersionResponse,
  State,
  RunStatus,
  RunListResponse,
  WesErrorResponse,
  RunRequest,
  RunId,
  Log,
  RunLog,
  NavbarConfig_NavbarMenu,
  NavbarConfig,
  Analytics,
  ServiceInfo,
  ListLabelsResponse,
  CreateLabelRequest,
  CreateLabelResponse,
  UpdateLabelRequest,
  UpdateLabelResponse,
  DescribeLaunchResponse,
  OrgRole,
  OrganizationDbDto,
  ListOrganizationsResponse,
  Organization,
  CreateOrganizationRequest,
  CreateOrganizationResponse,
  DescribeOrganizationResponse,
  UpdateOrganizationRequest,
  MemberDbDto,
  ListMembersResponse,
  AddMemberRequest,
  AddMemberResponse,
  UpdateMemberRoleRequest,
  TeamDbDto,
  ListTeamResponse,
  Team,
  CreateTeamRequest,
  CreateTeamResponse,
  DescribeTeamResponse,
  UpdateTeamRequest,
  CreateTeamMemberRequest,
  AddTeamMemberResponse,
  Visibility,
  WorkspaceDbDto,
  ListWorkspacesResponse,
  Workspace,
  CreateWorkspaceRequest,
  CreateWorkspaceResponse,
  DescribeWorkspaceResponse,
  UpdateWorkspaceRequest,
  WspRole,
  ParticipantType,
  ParticipantDbDto,
  ListParticipantsResponse,
  AddParticipantRequest,
  AddParticipantResponse,
  UpdateParticipantRoleRequest,
  PipelineSecret,
  ListPipelineSecretsResponse,
  CreatePipelineSecretRequest,
  CreatePipelineSecretResponse,
  DescribePipelineSecretResponse,
  UpdatePipelineSecretRequest,
  PipelineQueryAttribute,
  PipelineOptimizationStatus,
  ComputeEnvDbDto,
  PipelineDbDto,
  ListPipelinesResponse,
  CreatePipelineRequest,
  CreatePipelineResponse,
  WfManifest,
  PipelineInfo,
  DescribePipelineInfoResponse,
  AssociatePipelineLabelsRequest,
  ListPipelineInfoResponse,
  DescribePipelineResponse,
  UpdatePipelineRequest,
  UpdatePipelineResponse,
  PipelineSchemaAttributes,
  PipelineSchemaResponse,
  ComputePlatform,
  ListPlatformsResponse,
  AwsBatchPlatformMetainfo_JobQueue,
  AwsBatchPlatformMetainfo_Bucket,
  AwsBatchPlatformMetainfo_FsxFileSystem,
  AwsBatchPlatformMetainfo_EfsFileSystem,
  AwsBatchPlatformMetainfo_Vpc,
  AwsBatchPlatformMetainfo_Image,
  AwsBatchPlatformMetainfo_SecurityGroup,
  AwsBatchPlatformMetainfo_Subnet,
  AwsBatchPlatformMetainfo,
  GooglePlatformMetainfo_Bucket,
  GooglePlatformMetainfo_Filestore,
  GooglePlatformMetainfo,
  PlatformMetainfo,
  DescribePlatformResponse,
  ComputeRegion,
  ListRegionsResponse,
  ServiceInfoResponse,
  AccessToken,
  ListAccessTokensResponse,
  CreateAccessTokenRequest,
  CreateAccessTokenResponse,
  TraceCreateRequest,
  TraceCreateResponse,
  WorkflowStatus,
  WfNextflow,
  WfStats,
  Workflow,
  TraceBeginRequest,
  TraceProcessingStatus,
  TraceBeginResponse,
  ResourceData,
  WorkflowMetrics,
  TraceProgressDetail,
  TraceProgressData,
  TraceCompleteRequest,
  TraceCompleteResponse,
  TraceHeartbeatRequest,
  TraceHeartbeatResponse,
  CloudPriceModel,
  TaskStatus,
  Task,
  TraceProgressRequest,
  TraceProgressResponse,
  UserDbDto,
  DescribeUserResponse,
  OrgAndWorkspaceDto,
  ListWorkspacesAndOrgResponse,
  WorkflowQueryAttribute,
  WorkflowDbDto,
  WorkflowLoad,
  ProcessLoad,
  ProgressData,
  ListWorkflowsResponse_ListWorkflowsElement,
  ListWorkflowsResponse,
  DeleteWorkflowsRequest,
  DeleteWorkflowsResponse,
  AssociateWorkflowLabelsRequest,
  SubmitWorkflowLaunchRequest,
  SubmitWorkflowLaunchResponse,
  RandomWorkflowNameResponse,
  ComputePlatformDto,
  JobInfoDto,
  DescribeWorkflowResponse,
  WorkflowLaunchResponse,
  DescribeWorkflowLaunchResponse,
  Iterator_String_,
  LogPage_Download,
  LogPage,
  WorkflowLogResponse,
  GetWorkflowMetricsResponse,
  GetProgressResponse,
  CreateWorkflowStarResponse,
  DescribeTaskResponse,
  ListTasksResponse,
};

const endpoints = makeApi([
  {
    method: 'get',
    path: '/actions',
    alias: 'ListActions',
    description: `Lists all available actions in a user context, enriched by &#x60;attributes&#x60;. Append &#x60;?workspaceId&#x60; to list actions in a workspace context.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'attributes',
        type: 'Query',
        schema: z.array(ActionQueryAttribute).optional(),
      },
    ],
    response: ListActionsResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'post',
    path: '/actions',
    alias: 'CreateAction',
    description: `Creates a new pipeline action. Append &#x60;?workspaceId&#x60; to associate the action with the given workspace.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Action create request`,
        type: 'Body',
        schema: CreateActionRequest,
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: z.object({ actionId: z.string() }).partial().passthrough(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/actions/:actionId',
    alias: 'DescribeAction',
    description: `Retrieves the details of the pipeline action identified by the given &#x60;actionId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'actionId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'attributes',
        type: 'Query',
        schema: z.array(ActionQueryAttribute).optional(),
      },
    ],
    response: DescribeActionResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'put',
    path: '/actions/:actionId',
    alias: 'UpdateAction',
    description: `Updates the details of the action identified by the given &#x60;actionId&#x60;. The &#x60;source&#x60; of an existing action cannot be changed.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Action update request`,
        type: 'Body',
        schema: UpdateActionRequest,
      },
      {
        name: 'actionId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'delete',
    path: '/actions/:actionId',
    alias: 'DeleteAction',
    description: `Deletes the pipeline action identified by the given &#x60;actionId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'actionId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'post',
    path: '/actions/:actionId/launch',
    alias: 'LaunchAction',
    description: `Triggers the execution of the Tower Launch action identified by the given &#x60;actionId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Action launch request`,
        type: 'Body',
        schema: z
          .object({ params: z.object({}).partial().passthrough() })
          .partial()
          .passthrough(),
      },
      {
        name: 'actionId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: z.object({ workflowId: z.string() }).partial().passthrough(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'post',
    path: '/actions/:actionId/pause',
    alias: 'PauseAction',
    description: `Pauses or resumes the pipeline action identified by the given &#x60;actionId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: z.object({}).partial().passthrough(),
      },
      {
        name: 'actionId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'post',
    path: '/actions/labels/add',
    alias: 'AddLabelsToActions',
    description: `Adds the given list of labels to the given pipeline actions. Existing labels are preserved.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Labels add request`,
        type: 'Body',
        schema: AssociateActionLabelsRequest,
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'post',
    path: '/actions/labels/apply',
    alias: 'ApplyLabelsToActions',
    description: `Applies the given list of labels to the given pipeline actions. Existing labels are replaced — include labels to be preserved in &#x60;labelIds&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Labels apply request`,
        type: 'Body',
        schema: AssociateActionLabelsRequest,
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'post',
    path: '/actions/labels/remove',
    alias: 'RemoveLabelsFromActions',
    description: `Removes the given list of labels from the given pipeline actions.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Labels remove request`,
        type: 'Body',
        schema: AssociateActionLabelsRequest,
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/actions/types',
    alias: 'ListActionTypes',
    description: `Lists the supported event types that trigger a pipeline action. Append &#x60;?workspaceId&#x60; to list event types in a workspace context.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: ListEventTypesResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/actions/validate',
    alias: 'ValidateActionName',
    description: `Confirms the validity of the given action name. Append &#x60;?name&#x3D;&lt;your_action_name&gt;&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'name',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
      {
        status: 409,
        description: `Duplicate element`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: 'post',
    path: '/avatars',
    alias: 'CreateAvatar',
    requestFormat: 'form-data',
    parameters: [
      {
        name: 'body',
        description: `Image file request`,
        type: 'Body',
        schema: z
          .object({ image: z.instanceof(File) })
          .partial()
          .passthrough(),
      },
    ],
    response: CreateAvatarResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/avatars/:avatarId',
    alias: 'DownloadAvatar',
    requestFormat: 'json',
    parameters: [
      {
        name: 'avatarId',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: z.instanceof(File),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Not found element`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/compute-envs',
    alias: 'ListComputeEnvs',
    description: `Lists all available Tower compute environments in a user context. Append &#x60;?workspaceId&#x60; to list compute environments in a workspace context, and &#x60;?status&#x60; to filter by compute environment status.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'status',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: ListComputeEnvsResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'post',
    path: '/compute-envs',
    alias: 'CreateComputeEnv',
    description: `Creates a new Tower compute environment. Append &#x60;?workspaceId&#x60; to create the environment in a workspace context.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Compute environment create request`,
        type: 'Body',
        schema: CreateComputeEnvRequest,
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: z.object({ computeEnvId: z.string() }).partial().passthrough(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/compute-envs/:computeEnvId',
    alias: 'DescribeComputeEnv',
    description: `Retrieves the details of the Tower compute environment identified by the given &#x60;computeEnvId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'computeEnvId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'attributes',
        type: 'Query',
        schema: z.array(ComputeEnvQueryAttribute).optional(),
      },
    ],
    response: DescribeComputeEnvResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'put',
    path: '/compute-envs/:computeEnvId',
    alias: 'UpdateComputeEnv',
    description: `Updates the details of the compute environment identified by the given &#x60;computeEnvId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Compute environment update request`,
        type: 'Body',
        schema: z.object({ name: z.string() }).partial().passthrough(),
      },
      {
        name: 'computeEnvId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
      {
        status: 409,
        description: `Duplicate element`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: 'delete',
    path: '/compute-envs/:computeEnvId',
    alias: 'DeleteComputeEnv',
    description: `Deletes the Tower compute environment identified by the given &#x60;computeEnvId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'computeEnvId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
      {
        status: 409,
        description: `Conflicting deletion`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: 'post',
    path: '/compute-envs/:computeEnvId/primary',
    alias: 'UpdateComputeEnvPrimary',
    description: `Selects the compute environment identified by the given &#x60;computeEnvId&#x60; as the primary compute environment in the given workspace context.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: z.object({}).partial().passthrough(),
      },
      {
        name: 'computeEnvId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/compute-envs/validate',
    alias: 'ValidateComputeEnvName',
    description: `Confirms the validity of the given compute environment name in a user context. Append &#x60;?name&#x3D;&lt;your_ce_name&gt;&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'name',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
      {
        status: 409,
        description: `Duplicate element`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/credentials',
    alias: 'ListCredentials',
    description: `Lists all available Tower credentials in a user context. Append &#x60;?workspaceId&#x60; to list credentials in a workspace context, and &#x60;?platformId&#x60; to filter credentials by computing platform.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'platformId',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: ListCredentialsResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'post',
    path: '/credentials',
    alias: 'CreateCredentials',
    description: `Creates new Tower credentials in a user context. Append &#x60;?workspaceId&#x60; to create the credentials in a workspace context.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Credentials create request`,
        type: 'Body',
        schema: CreateCredentialsRequest,
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: z.object({ credentialsId: z.string() }).partial().passthrough(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/credentials/:credentialsId',
    alias: 'DescribeCredentials',
    description: `Retrieves the details of the credentials identified by the given &#x60;credentialsId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'credentialsId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: DescribeCredentialsResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'put',
    path: '/credentials/:credentialsId',
    alias: 'UpdateCredentials',
    description: `Updates the details of the credentials identified by the given &#x60;credentialsId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Credentials update request`,
        type: 'Body',
        schema: UpdateCredentialsRequest,
      },
      {
        name: 'credentialsId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'delete',
    path: '/credentials/:credentialsId',
    alias: 'DeleteCredentials',
    description: `Deletes the credentials identified by the given &#x60;credentialsId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'credentialsId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'checked',
        type: 'Query',
        schema: z.boolean().optional(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
      {
        status: 409,
        description: `Running jobs block the deletion of this credentials`,
        schema: DeleteCredentialsConflictResponse,
      },
    ],
  },
  {
    method: 'get',
    path: '/credentials/validate',
    alias: 'ValidateCredentialsName',
    description: `Validates the given credentials name. Append &#x60;?name&#x3D;&lt;your_credential_name&gt;&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'name',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
      {
        status: 409,
        description: `Duplicate element`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/data-links',
    alias: 'ListDataLinks',
    requestFormat: 'json',
    parameters: [
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'credentialsId',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'search',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'max',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'offset',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'visibility',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: DataLinksListResponse,
    errors: [
      {
        status: 400,
        description: `BadRequest`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `NotFound, when the workspace or credentials are not found or when the api is disabled for the workspace`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: 'post',
    path: '/data-links',
    alias: 'CreateCustomDataLink',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Request for creating new data link`,
        type: 'Body',
        schema: DataLinkCreateRequest,
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: DataLinkDto,
    errors: [
      {
        status: 400,
        description: `BadRequest`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `NotFound, when the workspace or credentials are not found or when the api is disabled for the workspace or if data link or path not found`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/data-links/:dataLinkId',
    alias: 'DescribeDataLink',
    requestFormat: 'json',
    parameters: [
      {
        name: 'dataLinkId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'credentialsId',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: DataLinkResponse,
    errors: [
      {
        status: 400,
        description: `BadRequest`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `NotFound, when the workspace or credentials are not found or when the api is disabled for the workspace or data link not found`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: 'put',
    path: '/data-links/:dataLinkId',
    alias: 'UpdateCustomDataLink',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Request for updating data link`,
        type: 'Body',
        schema: DataLinkUpdateRequest,
      },
      {
        name: 'dataLinkId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: DataLinkDto,
    errors: [
      {
        status: 400,
        description: `BadRequest`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `NotFound, when the workspace or credentials are not found or when the api is disabled for the workspace or data link was not found`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: 'delete',
    path: '/data-links/:dataLinkId',
    alias: 'DeleteCustomDataLink',
    requestFormat: 'json',
    parameters: [
      {
        name: 'dataLinkId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `BadRequest`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `NotFound, when the workspace or credentials are not found or when the api is disabled for the workspace or data link was not found`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/data-links/:dataLinkId/browse',
    alias: 'ExploreDataLink',
    requestFormat: 'json',
    parameters: [
      {
        name: 'dataLinkId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'credentialsId',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'search',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'nextPageToken',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'pageSize',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: DataLinkContentResponse,
    errors: [
      {
        status: 400,
        description: `BadRequest`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `NotFound, when the workspace or credentials are not found or when the API is disabled for the workspace or if data link or path not found`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/data-links/:dataLinkId/browse/:path',
    alias: 'ExploreDataLink_1',
    requestFormat: 'json',
    parameters: [
      {
        name: 'dataLinkId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'path',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'credentialsId',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'search',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'nextPageToken',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'pageSize',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: DataLinkContentResponse,
    errors: [
      {
        status: 400,
        description: `BadRequest`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `NotFound, when the workspace or credentials are not found or when the API is disabled for the workspace or if data link or path not found`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/datasets',
    alias: 'ListDatasetsV2',
    description: `Lists all available datasets in the user context. Append &#x60;?workspaceId&#x60; to list datasets in a workspace context`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: ListDatasetsResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'post',
    path: '/datasets',
    alias: 'CreateDatasetV2',
    description: `Creates a new Tower dataset in the user context. Include the dataset file and details in your request body. Append &#x60;?workspaceId&#x60; to create the dataset in a workspace context.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Dataset create request`,
        type: 'Body',
        schema: CreateDatasetRequest,
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: CreateDatasetResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
      {
        status: 409,
        description: `Duplicate element`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: 'put',
    path: '/datasets/:datasetId',
    alias: 'UpdateDatasetV2',
    description: `Updates the details of the dataset identified by the given &#x60;datasetId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Dataset update request`,
        type: 'Body',
        schema: UpdateDatasetRequest,
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'datasetId',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
      {
        status: 409,
        description: `Duplicate element`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: 'delete',
    path: '/datasets/:datasetId',
    alias: 'DeleteDatasetV2',
    description: `Deletes the dataset identified by the given &#x60;datasetId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'datasetId',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/datasets/:datasetId/metadata',
    alias: 'DescribeDatasetV2',
    description: `Retrieves the metadata of the dataset identified by the given &#x60;datasetId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'datasetId',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: DescribeDatasetResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'post',
    path: '/datasets/:datasetId/upload',
    alias: 'UploadDatasetV2',
    description: `Uploads the CSV or TSV content to create a new version of the dataset identified by the given &#x60;datasetId&#x60;.`,
    requestFormat: 'form-data',
    parameters: [
      {
        name: 'body',
        description: `Dataset file request`,
        type: 'Body',
        schema: z
          .object({ file: z.instanceof(File) })
          .partial()
          .passthrough(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'datasetId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'header',
        type: 'Query',
        schema: z.boolean().optional(),
      },
    ],
    response: UploadDatasetVersionResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/datasets/:datasetId/v/:version/n/:fileName',
    alias: 'DownloadDatasetV2',
    description: `Downloads the content of the dataset identified by the given &#x60;datasetId&#x60; and &#x60;version&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'datasetId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'version',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'fileName',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: z.instanceof(File),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Not found`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/datasets/:datasetId/versions',
    alias: 'ListDatasetVersionsV2',
    description: `Lists all versions of the given &#x60;datasetId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'datasetId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'mimeType',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: ListDatasetVersionsResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/datasets/versions',
    alias: 'ListLatestDatasetVersionsV2',
    description: `Lists the latest version of each dataset in the user context. Append &#x60;?workspaceId&#x60; to list latest versions in a workspace context.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'mimeType',
        type: 'Query',
        schema: z.string().nullish(),
      },
    ],
    response: ListDatasetVersionsResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/ga4gh/wes/v1/runs',
    alias: 'GaRunList',
    description: `Uses the GA4GH workflow execution service API to list all run records.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'page_size',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'page_token',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: RunListResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: WesErrorResponse,
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'post',
    path: '/ga4gh/wes/v1/runs',
    alias: 'GaRunCreate',
    description: `Uses the GA4GH workflow execution service API to launch a new run. Runs are launched in the user workspace context by default. To launch in an organization workspace context, include the &#x60;workspaceId&#x60; in &#x60;workflow_engine_parameters&#x60;. Runs are launched with the workspace primary compute environment by default. To launch with a different compute environment, include the &#x60;computeEnvId&#x60; in &#x60;workflow_engine_parameters&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Run request`,
        type: 'Body',
        schema: RunRequest,
      },
    ],
    response: z.object({ run_id: z.string() }).partial().passthrough(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: WesErrorResponse,
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/ga4gh/wes/v1/runs/:run_id',
    alias: 'GaRunDescribe',
    description: `Uses the GA4GH workflow execution service API to retrieve the details of the run assoiated with the given &#x60;run_id&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'run_id',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: RunLog,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: WesErrorResponse,
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'post',
    path: '/ga4gh/wes/v1/runs/:run_id/cancel',
    alias: 'GaRunCancel',
    description: `Uses the GA4GH workflow execution service API to cancel the run associated with the given &#x60;run_id&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: z.object({}).partial().passthrough(),
      },
      {
        name: 'run_id',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: z.object({ run_id: z.string() }).partial().passthrough(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: WesErrorResponse,
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/ga4gh/wes/v1/runs/:run_id/status',
    alias: 'GaRunStatus',
    description: `Uses the GA4GH workflow execution service API to retrieve the status of the run associated with the given &#x60;run_id&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'run_id',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: RunStatus,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: WesErrorResponse,
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/ga4gh/wes/v1/service-info',
    alias: 'GaServiceInfo',
    requestFormat: 'json',
    response: ServiceInfo,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: WesErrorResponse,
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/labels',
    alias: 'ListLabels',
    description: `Lists all available labels in a user context. Append &#x60;?workspaceId&#x60; to list labels in a workspace context.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'max',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'offset',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'search',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'type',
        type: 'Query',
        schema: z.enum(['simple', 'resource', 'all']).optional(),
      },
      {
        name: 'isDefault',
        type: 'Query',
        schema: z.boolean().optional(),
      },
    ],
    response: ListLabelsResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'post',
    path: '/labels',
    alias: 'CreateLabel',
    description: `Creates a new label or returns an existing label based on name/value. By default the operation works in a user context, append &#x60;?workspaceId&#x60; to create/retrieve a label in a workspace context. Resource labels include &#x60;resource: true&#x60; and a &#x60;value&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Provide a label &#x60;name&#x60;. Set &#x60;resource: true&#x60; for resource labels. Only resource labels have a &#x60;value&#x60; — if &#x60;resource: true&#x60;, include a &#x60;value&#x60;. Else, omit &#x60;value&#x60; from your request body.`,
        type: 'Body',
        schema: CreateLabelRequest,
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: CreateLabelResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'put',
    path: '/labels/:labelId',
    alias: 'UpdateLabel',
    description: `Updates the label identified by the given &#x60;labelId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Label update request`,
        type: 'Body',
        schema: UpdateLabelRequest,
      },
      {
        name: 'labelId',
        type: 'Path',
        schema: z.number().int(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: UpdateLabelResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'delete',
    path: '/labels/:labelId',
    alias: 'DeleteLabel',
    description: `Deletes the label identified by the given &#x60;labelId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'labelId',
        type: 'Path',
        schema: z.number().int(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/launch/:launchId',
    alias: 'DescribeLaunch',
    description: `Retrieves the details of the launch identified by the given &#x60;launchId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'launchId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: DescribeLaunchResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/launch/:launchId/datasets',
    alias: 'ListLaunchDatasetVersions',
    description: `Retrieves the details of the datasets used in the launch identified by the given &#x60;launchId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'launchId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: DescribeLaunchResponse,
    errors: [
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/orgs',
    alias: 'ListOrganizations',
    description: `Lists all available organizations in a user context.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'role',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: ListOrganizationsResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'post',
    path: '/orgs',
    alias: 'CreateOrganization',
    description: `Creates a new organization.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Organization create request`,
        type: 'Body',
        schema: CreateOrganizationRequest,
      },
    ],
    response: CreateOrganizationResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
      {
        status: 409,
        description: `Duplicate element`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/orgs/:orgId',
    alias: 'DescribeOrganization',
    description: `Retrieves the details of the organization identified by the given &#x60;orgId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'orgId',
        type: 'Path',
        schema: z.number().int(),
      },
    ],
    response: DescribeOrganizationResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'put',
    path: '/orgs/:orgId',
    alias: 'UpdateOrganization',
    description: `Updates the details of the organization identified by the given &#x60;orgId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Organization update request`,
        type: 'Body',
        schema: UpdateOrganizationRequest,
      },
      {
        name: 'orgId',
        type: 'Path',
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 409,
        description: `Duplicate element`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: 'delete',
    path: '/orgs/:orgId',
    alias: 'DeleteOrganization',
    description: `Deletes the organization identified by the given &#x60;orgId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'orgId',
        type: 'Path',
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/orgs/:orgId/collaborators',
    alias: 'ListOrganizationCollaborators',
    description: `Lists the collaborators of the organization identified by the given &#x60;orgId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'orgId',
        type: 'Path',
        schema: z.number().int(),
      },
      {
        name: 'max',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'offset',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'search',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: ListMembersResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/orgs/:orgId/members',
    alias: 'ListOrganizationMembers',
    description: `Lists the members of the organization identified by the given &#x60;orgId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'orgId',
        type: 'Path',
        schema: z.number().int(),
      },
      {
        name: 'max',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'offset',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'search',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: ListMembersResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'delete',
    path: '/orgs/:orgId/members/:memberId',
    alias: 'DeleteOrganizationMember',
    description: `Deletes the member identified by the given &#x60;memberId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'orgId',
        type: 'Path',
        schema: z.number().int(),
      },
      {
        name: 'memberId',
        type: 'Path',
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'put',
    path: '/orgs/:orgId/members/:memberId/role',
    alias: 'UpdateOrganizationMemberRole',
    description: `Updates the role of the member identified by the given &#x60;memberId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Member role update request`,
        type: 'Body',
        schema: UpdateMemberRoleRequest,
      },
      {
        name: 'orgId',
        type: 'Path',
        schema: z.number().int(),
      },
      {
        name: 'memberId',
        type: 'Path',
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'put',
    path: '/orgs/:orgId/members/add',
    alias: 'CreateOrganizationMember',
    description: `Adds a new member to the organization identified by the given &#x60;orgId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Member addition request`,
        type: 'Body',
        schema: z.object({ user: z.string() }).partial().passthrough(),
      },
      {
        name: 'orgId',
        type: 'Path',
        schema: z.number().int(),
      },
    ],
    response: AddMemberResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
      {
        status: 409,
        description: `Duplicate element`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: 'delete',
    path: '/orgs/:orgId/members/leave',
    alias: 'LeaveOrganization',
    description: `Removes the requesting user from the organization identified by the given &#x60;orgId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'orgId',
        type: 'Path',
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/orgs/:orgId/teams',
    alias: 'ListOrganizationTeams',
    description: `Lists all teams in the organization identified by the given &#x60;orgId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'orgId',
        type: 'Path',
        schema: z.number().int(),
      },
      {
        name: 'max',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'offset',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'search',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: ListTeamResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'post',
    path: '/orgs/:orgId/teams',
    alias: 'CreateOrganizationTeam',
    description: `Creates a new team in the organization identified by the given &#x60;orgId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Team create request`,
        type: 'Body',
        schema: CreateTeamRequest,
      },
      {
        name: 'orgId',
        type: 'Path',
        schema: z.number().int(),
      },
    ],
    response: CreateTeamResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
      {
        status: 409,
        description: `Duplicated element`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/orgs/:orgId/teams/:teamId',
    alias: 'DescribeOrganizationTeam',
    description: `Retrieves the details of the team identified by the given &#x60;teamId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'orgId',
        type: 'Path',
        schema: z.number().int(),
      },
      {
        name: 'teamId',
        type: 'Path',
        schema: z.number().int(),
      },
    ],
    response: DescribeTeamResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'put',
    path: '/orgs/:orgId/teams/:teamId',
    alias: 'UpdateOrganizationTeam',
    description: `Updates the details of the team identified by the given &#x60;teamId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Team update request`,
        type: 'Body',
        schema: UpdateTeamRequest,
      },
      {
        name: 'orgId',
        type: 'Path',
        schema: z.number().int(),
      },
      {
        name: 'teamId',
        type: 'Path',
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
      {
        status: 409,
        description: `Duplicated element`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: 'delete',
    path: '/orgs/:orgId/teams/:teamId',
    alias: 'DeleteOrganizationTeam',
    description: `Deletes the team identified by the given &#x60;teamId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'orgId',
        type: 'Path',
        schema: z.number().int(),
      },
      {
        name: 'teamId',
        type: 'Path',
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/orgs/:orgId/teams/:teamId/members',
    alias: 'ListOrganizationTeamMembers',
    description: `Lists the team members associated with the given &#x60;teamId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'orgId',
        type: 'Path',
        schema: z.number().int(),
      },
      {
        name: 'teamId',
        type: 'Path',
        schema: z.number().int(),
      },
      {
        name: 'max',
        type: 'Query',
        schema: z.number().int().nullish(),
      },
      {
        name: 'offset',
        type: 'Query',
        schema: z.number().int().nullish(),
      },
      {
        name: 'search',
        type: 'Query',
        schema: z.string().nullish(),
      },
    ],
    response: ListMembersResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'post',
    path: '/orgs/:orgId/teams/:teamId/members',
    alias: 'CreateOrganizationTeamMember',
    description: `Adds a new member to the team identified by the given &#x60;teamId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Team create request`,
        type: 'Body',
        schema: z.object({ userNameOrEmail: z.string() }).partial().passthrough(),
      },
      {
        name: 'orgId',
        type: 'Path',
        schema: z.number().int(),
      },
      {
        name: 'teamId',
        type: 'Path',
        schema: z.number().int(),
      },
    ],
    response: AddTeamMemberResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'delete',
    path: '/orgs/:orgId/teams/:teamId/members/:memberId/delete',
    alias: 'DeleteOrganizationTeamMember',
    description: `Deletes the team member identified by the given &#x60;memberId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'orgId',
        type: 'Path',
        schema: z.number().int(),
      },
      {
        name: 'teamId',
        type: 'Path',
        schema: z.number().int(),
      },
      {
        name: 'memberId',
        type: 'Path',
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/orgs/:orgId/teams/:teamId/workspaces',
    alias: 'ListWorkspacesByTeam',
    description: `Lists all the workspaces of which the given &#x60;teamId&#x60; is a participant.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'orgId',
        type: 'Path',
        schema: z.number().int(),
      },
      {
        name: 'teamId',
        type: 'Path',
        schema: z.number().int(),
      },
      {
        name: 'max',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'offset',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'search',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: ListWorkspacesResponse,
    errors: [
      {
        status: 400,
        description: `Bad Request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Not Found`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/orgs/:orgId/teams/validate',
    alias: 'ValidateTeamName',
    description: `Confirms the validity of the given team name. Append &#x60;?name&#x3D;&lt;your_team_name&gt;&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'orgId',
        type: 'Path',
        schema: z.number().int(),
      },
      {
        name: 'name',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/orgs/:orgId/workspaces',
    alias: 'ListWorkspaces',
    description: `Lists the organization workspaces in &#x60;orgId&#x60; to which the requesting user belongs.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'orgId',
        type: 'Path',
        schema: z.number().int(),
      },
    ],
    response: ListWorkspacesResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'post',
    path: '/orgs/:orgId/workspaces',
    alias: 'CreateWorkspace',
    description: `Creates a new organization workspace.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Workspace create request`,
        type: 'Body',
        schema: CreateWorkspaceRequest,
      },
      {
        name: 'orgId',
        type: 'Path',
        schema: z.number().int(),
      },
    ],
    response: CreateWorkspaceResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
      {
        status: 409,
        description: `Duplicate element`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/orgs/:orgId/workspaces/:workspaceId',
    alias: 'DescribeWorkspace',
    description: `Retrieves the details of the workspace identified by the given &#x60;workspaceId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'orgId',
        type: 'Path',
        schema: z.number().int(),
      },
      {
        name: 'workspaceId',
        type: 'Path',
        schema: z.number().int(),
      },
    ],
    response: DescribeWorkspaceResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'put',
    path: '/orgs/:orgId/workspaces/:workspaceId',
    alias: 'UpdateWorkspace',
    description: `Updates the details of the workspace identified by the given &#x60;workspaceId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Workspace update request`,
        type: 'Body',
        schema: UpdateWorkspaceRequest,
      },
      {
        name: 'orgId',
        type: 'Path',
        schema: z.number().int(),
      },
      {
        name: 'workspaceId',
        type: 'Path',
        schema: z.number().int(),
      },
    ],
    response: DescribeWorkspaceResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
      {
        status: 409,
        description: `Duplicate name`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: 'delete',
    path: '/orgs/:orgId/workspaces/:workspaceId',
    alias: 'DeleteWorkspace',
    description: `Deletes the workspace identified by the given &#x60;workspaceId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'orgId',
        type: 'Path',
        schema: z.number().int(),
      },
      {
        name: 'workspaceId',
        type: 'Path',
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/orgs/:orgId/workspaces/:workspaceId/participants',
    alias: 'ListWorkspaceParticipants',
    description: `Lists the participants of the workspace identified by the given &#x60;workspaceId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'orgId',
        type: 'Path',
        schema: z.number().int(),
      },
      {
        name: 'workspaceId',
        type: 'Path',
        schema: z.number().int(),
      },
      {
        name: 'max',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'offset',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'search',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: ListParticipantsResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'delete',
    path: '/orgs/:orgId/workspaces/:workspaceId/participants',
    alias: 'LeaveWorkspaceParticipant',
    description: `Removes the requesting user from the given workspace.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'orgId',
        type: 'Path',
        schema: z.number().int(),
      },
      {
        name: 'workspaceId',
        type: 'Path',
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'delete',
    path: '/orgs/:orgId/workspaces/:workspaceId/participants/:participantId',
    alias: 'DeleteWorkspaceParticipant',
    description: `Deletes the given participant from the given workspace.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'orgId',
        type: 'Path',
        schema: z.number().int(),
      },
      {
        name: 'workspaceId',
        type: 'Path',
        schema: z.number().int(),
      },
      {
        name: 'participantId',
        type: 'Path',
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'put',
    path: '/orgs/:orgId/workspaces/:workspaceId/participants/:participantId/role',
    alias: 'UpdateWorkspaceParticipantRole',
    description: `Updates the role of the given participant in the given workspace.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Participant role update request`,
        type: 'Body',
        schema: UpdateParticipantRoleRequest,
      },
      {
        name: 'orgId',
        type: 'Path',
        schema: z.number().int(),
      },
      {
        name: 'workspaceId',
        type: 'Path',
        schema: z.number().int(),
      },
      {
        name: 'participantId',
        type: 'Path',
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'put',
    path: '/orgs/:orgId/workspaces/:workspaceId/participants/add',
    alias: 'CreateWorkspaceParticipant',
    description: `Adds a new participant to the workspace identified by the given &#x60;workspaceId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Participant addition request`,
        type: 'Body',
        schema: AddParticipantRequest,
      },
      {
        name: 'orgId',
        type: 'Path',
        schema: z.number().int(),
      },
      {
        name: 'workspaceId',
        type: 'Path',
        schema: z.number().int(),
      },
    ],
    response: AddParticipantResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
      {
        status: 409,
        description: `Duplicate element`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/orgs/:orgId/workspaces/validate',
    alias: 'WorkspaceValidate',
    description: `Confirms the validity of the given workspace name. Append &#x60;?name&#x3D;&lt;your_workspace_name&gt;&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'orgId',
        type: 'Path',
        schema: z.number().int(),
      },
      {
        name: 'name',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
      {
        status: 409,
        description: `Duplicate element`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/orgs/validate',
    alias: 'ValidateOrganizationName',
    description: `Confirms the validity of the given organization name. Append &#x60;?name&#x3D;&lt;your_org_name&gt;&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'name',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
      {
        status: 409,
        description: `Duplicated element`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/pipeline-secrets',
    alias: 'ListPipelineSecrets',
    description: `Lists all available pipeline secrets in a user context. Append &#x60;?workspaceId&#x60; to list secrets in a workspace context.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: ListPipelineSecretsResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'post',
    path: '/pipeline-secrets',
    alias: 'CreatePipelineSecret',
    description: `Creates a new pipeline secret in the user context. Append &#x60;?workspaceId&#x60; to create the secret in a workspace context.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Pipeline secret create request`,
        type: 'Body',
        schema: CreatePipelineSecretRequest,
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: z.object({ secretId: z.number().int() }).partial().passthrough(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/pipeline-secrets/:secretId',
    alias: 'DescribePipelineSecret',
    description: `Retrieves the details of the pipeline secret identified by the given &#x60;secretId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'secretId',
        type: 'Path',
        schema: z.number().int(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: DescribePipelineSecretResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'put',
    path: '/pipeline-secrets/:secretId',
    alias: 'UpdatePipelineSecret',
    description: `Updates the pipeline secret identified by the given &#x60;secretId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Secret update request`,
        type: 'Body',
        schema: z.object({ value: z.string() }).partial().passthrough(),
      },
      {
        name: 'secretId',
        type: 'Path',
        schema: z.number().int(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'delete',
    path: '/pipeline-secrets/:secretId',
    alias: 'DeletePipelineSecret',
    description: `Deletes the pipeline secret identified by the given &#x60;secretId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'secretId',
        type: 'Path',
        schema: z.number().int(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/pipeline-secrets/validate',
    alias: 'ValidatePipelineSecretName',
    description: `Confirms the validity of the given pipeline secret name in a user context. Append &#x60;?name&#x3D;&lt;your_secret_name&gt;&#x60;. Append &#x60;?workspaceId&#x60; to validate the name in a workspace context.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'name',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
      {
        status: 409,
        description: `Duplicate element`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/pipelines',
    alias: 'ListPipelines',
    description: `Lists all available pipelines in a user context, enriched by &#x60;attributes&#x60;. Append &#x60;workspaceId&#x60; to list pipelines in a workspace context.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'attributes',
        type: 'Query',
        schema: z.array(PipelineQueryAttribute).optional(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'max',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'offset',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'search',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'visibility',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: ListPipelinesResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'post',
    path: '/pipelines',
    alias: 'CreatePipeline',
    description: `Creates a new pipeline in a user context. Append &#x60;?workspaceId&#x60; to create the pipeline in a workspace context.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Pipeline creation request`,
        type: 'Body',
        schema: CreatePipelineRequest,
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: CreatePipelineResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
      {
        status: 409,
        description: `Duplicate element`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/pipelines/:pipelineId',
    alias: 'DescribePipeline',
    description: `Retrieves the details of the pipeline identified by the given &#x60;pipelineId&#x60;, enriched by &#x60;attributes&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'pipelineId',
        type: 'Path',
        schema: z.number().int(),
      },
      {
        name: 'attributes',
        type: 'Query',
        schema: z.array(PipelineQueryAttribute).optional(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'sourceWorkspaceId',
        type: 'Query',
        schema: z.number().int().nullish(),
      },
    ],
    response: DescribePipelineResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'put',
    path: '/pipelines/:pipelineId',
    alias: 'UpdatePipeline',
    description: `Updates the details of the pipeline identified by the given &#x60;pipelineId&#x60;. 
            **Note**: If &#x60;labelIds&#x60; is &#x60;null&#x60;, empty, or ommitted, existing pipeline labels are removed.
            Include &#x60;labelIds: [&lt;label-id-1&gt;,&lt;label-id-2&gt;]&#x60; to override existing labels. Labels to be preserved must be included.
            To append a list of labels to multiple pipelines, use &#x60;/pipelines/labels/add&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Pipeline update request`,
        type: 'Body',
        schema: UpdatePipelineRequest,
      },
      {
        name: 'pipelineId',
        type: 'Path',
        schema: z.number().int(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: UpdatePipelineResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
      {
        status: 409,
        description: `Duplicate element`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: 'delete',
    path: '/pipelines/:pipelineId',
    alias: 'DeletePipeline',
    description: `Deletes the pipeline identified by the given &#x60;pipelineId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'pipelineId',
        type: 'Path',
        schema: z.number().int(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/pipelines/:pipelineId/launch',
    alias: 'DescribePipelineLaunch',
    description: `Retrieves the launch details of the pipeline identified by the given &#x60;pipelineId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'pipelineId',
        type: 'Path',
        schema: z.number().int(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'sourceWorkspaceId',
        type: 'Query',
        schema: z.number().int().nullish(),
      },
    ],
    response: DescribeLaunchResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/pipelines/:pipelineId/schema',
    alias: 'DescribePipelineSchema',
    description: `Retrieves the pipeline schema of the pipeline identified by the given &#x60;pipelineId&#x60;, enriched by &#x60;attributes&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'pipelineId',
        type: 'Path',
        schema: z.number().int(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'sourceWorkspaceId',
        type: 'Query',
        schema: z.number().int().nullish(),
      },
      {
        name: 'attributes',
        type: 'Query',
        schema: z.array(PipelineSchemaAttributes).optional(),
      },
    ],
    response: PipelineSchemaResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/pipelines/info',
    alias: 'DescribePipelineRepository',
    description: `Retrieves the details of a remote Nextflow pipeline Git repository. Append the repository name or full URL with &#x60;?name&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'name',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'revision',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: DescribePipelineInfoResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'post',
    path: '/pipelines/labels/add',
    alias: 'AddLabelsToPipelines',
    description: `Adds the given list of labels to the given pipelines. Existing labels are preserved.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Labels add request`,
        type: 'Body',
        schema: AssociatePipelineLabelsRequest,
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'post',
    path: '/pipelines/labels/apply',
    alias: 'ApplyLabelsToPipelines',
    description: `Applies the given list of labels to the given pipelines. Existing labels are replaced — include labels to be preserved in &#x60;labelIds&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Labels apply request`,
        type: 'Body',
        schema: AssociatePipelineLabelsRequest,
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'post',
    path: '/pipelines/labels/remove',
    alias: 'RemoveLabelsFromPipelines',
    description: `Removes the given list of labels from the given pipelines.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Labels remove request`,
        type: 'Body',
        schema: AssociatePipelineLabelsRequest,
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/pipelines/repositories',
    alias: 'ListPipelineRepositories',
    description: `Lists known Nextflow pipeline Git repositories, extracted from existing runs. Append &#x60;?workspaceId&#x60; to list repositories in a workspace context.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: ListPipelineInfoResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/pipelines/validate',
    alias: 'ValidatePipelineName',
    description: `Confirms the validity of the given pipeline &#x60;name&#x60; in a user context. Append &#x60;?name&#x3D;&lt;your_pipeline_name&gt;&#x60;. Append &#x60;?workspaceId&#x60; to validate the name in a workspace context.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'orgId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'name',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
      {
        status: 409,
        description: `Duplicate element`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/platforms',
    alias: 'ListPlatforms',
    description: `Lists all available computing platforms in a user context. Append &#x60;?workspaceId&#x60; to list platforms in a workspace context.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'orgId',
        type: 'Query',
        schema: z.string().nullish(),
      },
    ],
    response: ListPlatformsResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/platforms/:platformId',
    alias: 'DescribePlatform',
    description: `Retrieves the details of the computing platform identified by the given &#x60;platformId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'platformId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'regionId',
        type: 'Query',
        schema: z.string(),
      },
      {
        name: 'credentialsId',
        type: 'Query',
        schema: z.string(),
      },
    ],
    response: DescribePlatformResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/platforms/:platformId/regions',
    alias: 'ListPlatformRegions',
    description: `Lists the available regions for the computing platform identified by the given &#x60;platformId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'platformId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: ListRegionsResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/service-info',
    alias: 'Info',
    requestFormat: 'json',
    response: ServiceInfoResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/tokens',
    alias: 'TokenList',
    requestFormat: 'json',
    response: ListAccessTokensResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'post',
    path: '/tokens',
    alias: 'CreateToken',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Access token create request`,
        type: 'Body',
        schema: z.object({ name: z.string() }).partial().passthrough(),
      },
    ],
    response: CreateAccessTokenResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
      {
        status: 409,
        description: `Duplicated element`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: 'delete',
    path: '/tokens/:tokenId',
    alias: 'DeleteToken',
    requestFormat: 'json',
    parameters: [
      {
        name: 'tokenId',
        type: 'Path',
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'delete',
    path: '/tokens/delete-all',
    alias: 'DeleteAllTokens',
    requestFormat: 'json',
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'put',
    path: '/trace/:workflowId/begin',
    alias: 'UpdateTraceBegin',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Trace begin request`,
        type: 'Body',
        schema: TraceBeginRequest,
      },
      {
        name: 'workflowId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: TraceBeginResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'put',
    path: '/trace/:workflowId/complete',
    alias: 'UpdateTraceComplete',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Trace complete request`,
        type: 'Body',
        schema: TraceCompleteRequest,
      },
      {
        name: 'workflowId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: TraceCompleteResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'put',
    path: '/trace/:workflowId/heartbeat',
    alias: 'UpdateTraceHeartbeat',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Trace heartbeat request`,
        type: 'Body',
        schema: TraceHeartbeatRequest,
      },
      {
        name: 'workflowId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: z.object({ message: z.string() }).partial().passthrough(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'put',
    path: '/trace/:workflowId/progress',
    alias: 'UpdateTraceProgress',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Trace progress request`,
        type: 'Body',
        schema: TraceProgressRequest,
      },
      {
        name: 'workflowId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: TraceProgressResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'post',
    path: '/trace/create',
    alias: 'CreateTrace',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Trace create request`,
        type: 'Body',
        schema: TraceCreateRequest,
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: TraceCreateResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/user-info',
    alias: 'UserInfo',
    requestFormat: 'json',
    response: DescribeUserResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/user/:userId/workspaces',
    alias: 'ListWorkspacesUser',
    description: `Lists the workspaces and organizations to which the user identified by the given &#x60;userId&#x60; belongs.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'userId',
        type: 'Path',
        schema: z.number().int(),
      },
    ],
    response: ListWorkspacesAndOrgResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/users/:userId',
    alias: 'DescribeUser',
    requestFormat: 'json',
    parameters: [
      {
        name: 'userId',
        type: 'Path',
        schema: z.number().int(),
      },
    ],
    response: DescribeUserResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'post',
    path: '/users/:userId',
    alias: 'UpdateUser',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `User update request`,
        type: 'Body',
        schema: UserDbDto,
      },
      {
        name: 'userId',
        type: 'Path',
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'delete',
    path: '/users/:userId',
    alias: 'DeleteUser',
    requestFormat: 'json',
    parameters: [
      {
        name: 'userId',
        type: 'Path',
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/users/validate',
    alias: 'ValidateUserName',
    requestFormat: 'json',
    parameters: [
      {
        name: 'name',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
      {
        status: 409,
        description: `Duplicated element`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/workflow',
    alias: 'ListWorkflows',
    description: `Lists all workflow records, enriched with &#x60;attributes&#x60;. Append &#x60;?workspaceId&#x60; to list workflow records in a workspace context.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'attributes',
        type: 'Query',
        schema: z.array(WorkflowQueryAttribute).optional(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'max',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'offset',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'search',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: ListWorkflowsResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/workflow/:workflowId',
    alias: 'DescribeWorkflow',
    description: `Retrieves the details of the workflow record associated with the given &#x60;workflowId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'workflowId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'attributes',
        type: 'Query',
        schema: z.array(WorkflowQueryAttribute).optional(),
      },
    ],
    response: DescribeWorkflowResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'delete',
    path: '/workflow/:workflowId',
    alias: 'DeleteWorkflow',
    requestFormat: 'json',
    parameters: [
      {
        name: 'workflowId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'force',
        type: 'Query',
        schema: z.boolean().optional(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'post',
    path: '/workflow/:workflowId/cancel',
    alias: 'CancelWorkflow',
    description: `Cancels the workflow execution identified by the given &#x60;workflowId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: z.object({}).partial().passthrough(),
      },
      {
        name: 'workflowId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/workflow/:workflowId/download',
    alias: 'DownloadWorkflowLog',
    description: `Downloads the workflow files for the Nextflow main job associated with the given &#x60;workflowId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'workflowId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'fileName',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: z.instanceof(File),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/workflow/:workflowId/download/:taskId',
    alias: 'DownloadWorkflowTaskLog',
    description: `Downloads the workflow files of the task identified by the given &#x60;taskId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'workflowId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'taskId',
        type: 'Path',
        schema: z.number().int(),
      },
      {
        name: 'fileName',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: z.instanceof(File),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/workflow/:workflowId/launch',
    alias: 'DescribeWorkflowLaunch',
    description: `Retrieves the details of the workflow launch associated with the given &#x60;workflowId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'workflowId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: DescribeWorkflowLaunchResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
      {
        status: 409,
        description: `Duplicate element. Existing run name and session ID combination`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/workflow/:workflowId/log',
    alias: 'WorkflowLogs',
    description: `Retrieves the output logs for the Nextflow main job of the workflow identified by the given &#x60;workflowId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'workflowId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'next',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: WorkflowLogResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/workflow/:workflowId/log/:taskId',
    alias: 'GetWorkflowTaskLog',
    description: `Retrieves the output logs for the workflow task identified by the given &#x60;taskId&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'workflowId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'taskId',
        type: 'Path',
        schema: z.number().int(),
      },
      {
        name: 'next',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: WorkflowLogResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/workflow/:workflowId/metrics',
    alias: 'DescribeWorkflowMetrics',
    requestFormat: 'json',
    parameters: [
      {
        name: 'workflowId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: GetWorkflowMetricsResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/workflow/:workflowId/progress',
    alias: 'DescribeWorkflowProgress',
    requestFormat: 'json',
    parameters: [
      {
        name: 'workflowId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: GetProgressResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/workflow/:workflowId/star',
    alias: 'DescribeWorkflowStar',
    description: `Confirms whether the given &#x60;workflowId&#x60; is starred.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'workflowId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: z.object({ workflowId: z.string() }).partial().passthrough(),
    errors: [
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Not found`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: 'post',
    path: '/workflow/:workflowId/star',
    alias: 'CreateWorkflowStar',
    description: `Adds the workflow identified by the given &#x60;workflowId&#x60; to your list of starred workflows.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'workflowId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: z.object({ workflowId: z.string() }).partial().passthrough(),
    errors: [
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Not found`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 409,
        description: `Duplicated element`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: 'delete',
    path: '/workflow/:workflowId/star',
    alias: 'DeleteWorkflowStar',
    description: `Removes the workflow identified by the given &#x60;workflowId&#x60; from your list of starred workflows.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'workflowId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: z.object({ workflowId: z.string() }).partial().passthrough(),
    errors: [
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Not found`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/workflow/:workflowId/task/:taskId',
    alias: 'DescribeWorkflowTask',
    requestFormat: 'json',
    parameters: [
      {
        name: 'workflowId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'taskId',
        type: 'Path',
        schema: z.number().int(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: DescribeTaskResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/workflow/:workflowId/tasks',
    alias: 'ListWorkflowTasks',
    requestFormat: 'json',
    parameters: [
      {
        name: 'workflowId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'max',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'offset',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'sortBy',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'sortDir',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'search',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: ListTasksResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'post',
    path: '/workflow/delete',
    alias: 'DeleteWorkflowMany',
    description: `Deletes the workflow records identified by the given list of &#x60;workflowIds&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Delete workflows request`,
        type: 'Body',
        schema: DeleteWorkflowsRequest,
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'force',
        type: 'Query',
        schema: z.boolean().optional(),
      },
    ],
    response: DeleteWorkflowsResponse,
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'post',
    path: '/workflow/labels/add',
    alias: 'AddLabelsToWorkflows',
    description: `Adds the given list of labels to the given workflows. Existing labels are preserved.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Labels add request`,
        type: 'Body',
        schema: AssociateWorkflowLabelsRequest,
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'post',
    path: '/workflow/labels/apply',
    alias: 'ApplyLabelsToWorkflows',
    description: `Applies the given list of labels to the given workflows. Existing labels are replaced — include labels to be preserved in &#x60;labelIds&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Labels apply request`,
        type: 'Body',
        schema: AssociateWorkflowLabelsRequest,
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'post',
    path: '/workflow/labels/remove',
    alias: 'RemoveLabelsFromWorkflows',
    description: `Removes the given list of labels from the given workflows.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Labels remove request`,
        type: 'Body',
        schema: AssociateWorkflowLabelsRequest,
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'post',
    path: '/workflow/launch',
    alias: 'CreateWorkflowLaunch',
    description: `Submits a workflow execution.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Workflow launch request`,
        type: 'Body',
        schema: SubmitWorkflowLaunchRequest,
      },
      {
        name: 'workspaceId',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'sourceWorkspaceId',
        type: 'Query',
        schema: z.number().int().nullish(),
      },
    ],
    response: z.object({ workflowId: z.string() }).partial().passthrough(),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: 'get',
    path: '/workflow/random-name',
    alias: 'GenerateRandomWorkflowName',
    requestFormat: 'json',
    response: z.object({ name: z.string() }).partial().passthrough(),
  },
  {
    method: 'get',
    path: '/workflow/validate',
    alias: 'ValidateWorkflowConstraints',
    requestFormat: 'json',
    parameters: [
      {
        name: 'runName',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'sessionId',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad request. Invalid run name format`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 409,
        description: `Duplicated element. Existing run name and session ID combination`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/workspaces/:workspaceId/datasets/:datasetId/v/:version/n/:fileName',
    alias: 'DownloadDataset',
    description: `Downloads the content of the dataset identified by the given &#x60;datasetId&#x60; and &#x60;version&#x60;.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'workspaceId',
        type: 'Path',
        schema: z.number().int(),
      },
      {
        name: 'datasetId',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'version',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'fileName',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: z.instanceof(File),
    errors: [
      {
        status: 400,
        description: `Bad request`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
      {
        status: 403,
        description: `Operation not allowed`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Not found`,
        schema: z.object({ message: z.string() }).passthrough(),
      },
    ],
  },
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
