import { z } from 'zod';

export const ActionQueryAttribute = z.literal('labels');
export const Action_Source = z.enum(['github', 'tower']);
export const Action_Status = z.enum(['CREATING', 'ACTIVE', 'ERROR', 'PAUSED']);
export const GithubActionEvent = z
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
export const Action_TowerActionEvent = z
  .object({ discriminator: z.string(), timestamp: z.string().datetime({ offset: true }), workflowId: z.string() })
  .partial()
  .passthrough();
export const Action_EventType = z.discriminatedUnion('discriminator', [GithubActionEvent, Action_TowerActionEvent]);
export const LabelDbDto = z
  .object({ id: z.number().int(), name: z.string(), value: z.string(), resource: z.boolean(), isDefault: z.boolean() })
  .partial()
  .passthrough();
export const ListActionsResponse_ActionInfo = z
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
export const ListActionsResponse = z
  .object({ actions: z.array(ListActionsResponse_ActionInfo) })
  .partial()
  .passthrough();
export const ErrorResponse = z.object({ message: z.string() }).passthrough();
export const WorkflowLaunchRequest = z
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
export const CreateActionRequest = z
  .object({ name: z.string(), source: Action_Source, launch: WorkflowLaunchRequest })
  .partial()
  .passthrough();
export const CreateActionResponse = z.object({ actionId: z.string() }).partial().passthrough();
export const AssociateActionLabelsRequest = z
  .object({ actionIds: z.array(z.string()), labelIds: z.array(z.number()) })
  .partial()
  .passthrough();
export const EventType = z
  .object({ source: z.string(), display: z.string(), description: z.string(), enabled: z.boolean() })
  .partial()
  .passthrough();
export const ListEventTypesResponse = z
  .object({ eventTypes: z.array(EventType) })
  .partial()
  .passthrough();
export const ConfigEnvVariable = z
  .object({ name: z.string(), value: z.string(), head: z.boolean(), compute: z.boolean() })
  .partial()
  .passthrough();
export const ForgeConfig = z
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
export const AwsBatchConfig = z
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
export const GoogleLifeSciencesConfig = z
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
export const GoogleBatchConfig = z
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
export const AzBatchForgeConfig = z
  .object({
    vmType: z.string(),
    vmCount: z.number().int(),
    autoScale: z.boolean(),
    disposeOnDeletion: z.boolean(),
    containerRegIds: z.array(z.string()),
  })
  .partial()
  .passthrough();
export const JobCleanupPolicy = z.enum(['on_success', 'always', 'never']);
export const AzBatchConfig = z
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
export const AbstractGridConfig = z
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
export const LsfComputeConfig = AbstractGridConfig.and(
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
export const SlurmComputeConfig = AbstractGridConfig.and(
  z
    .object({ discriminator: z.string(), environment: z.array(ConfigEnvVariable) })
    .partial()
    .passthrough(),
);
export const PodCleanupPolicy = z.enum(['on_success', 'always', 'never']);
export const K8sComputeConfig = z
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
export const EksComputeConfig = K8sComputeConfig.and(
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
export const GkeComputeConfig = K8sComputeConfig.and(
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
export const UnivaComputeConfig = AbstractGridConfig.and(
  z
    .object({ discriminator: z.string(), environment: z.array(ConfigEnvVariable) })
    .partial()
    .passthrough(),
);
export const AltairPbsComputeConfig = AbstractGridConfig.and(
  z
    .object({ discriminator: z.string(), environment: z.array(ConfigEnvVariable) })
    .partial()
    .passthrough(),
);
export const MoabComputeConfig = AbstractGridConfig.and(
  z
    .object({ discriminator: z.string(), environment: z.array(ConfigEnvVariable) })
    .partial()
    .passthrough(),
);
export const ComputeConfig = z.discriminatedUnion('discriminator', [
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
export const ComputeEnv_Status = z.enum(['CREATING', 'AVAILABLE', 'ERRORED', 'INVALID']);
export const ComputeEnv_ComputeConfig_ = z
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
export const Launch = z
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
export const Action_TowerActionConfig = z.object({ discriminator: z.string() }).partial().passthrough();
export const GithubActionConfig = z
  .object({ discriminator: z.string(), events: z.array(z.string()) })
  .partial()
  .passthrough();
export const Action_ConfigType = z.discriminatedUnion('discriminator', [Action_TowerActionConfig, GithubActionConfig]);
export const ActionResponseDto = z
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
export const DescribeActionResponse = z.object({ action: ActionResponseDto }).partial().passthrough();
export const UpdateActionRequest = z
  .object({ name: z.string(), launch: WorkflowLaunchRequest })
  .partial()
  .passthrough();
export const LaunchActionRequest = z
  .object({ params: z.object({}).partial().passthrough() })
  .partial()
  .passthrough();
export const LaunchActionResponse = z.object({ workflowId: z.string() }).partial().passthrough();
export const EmptyBodyRequest = z.object({}).partial().passthrough();
export const Avatar = z
  .object({
    id: z.string().max(22),
    dateCreated: z.string().datetime({ offset: true }),
    lastUpdated: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
export const CreateAvatarResponse = z.object({ avatar: Avatar, url: z.string() }).partial().passthrough();
export const ListComputeEnvsResponse_Entry = z
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
export const ListComputeEnvsResponse = z
  .object({ computeEnvs: z.array(ListComputeEnvsResponse_Entry) })
  .partial()
  .passthrough();
export const CreateComputeEnvRequest = z
  .object({ computeEnv: ComputeEnv_ComputeConfig_, labelIds: z.array(z.number()) })
  .partial()
  .passthrough();
export const CreateComputeEnvResponse = z.object({ computeEnvId: z.string() }).partial().passthrough();
export const ComputeEnvQueryAttribute = z.literal('labels');
export const ComputeEnvResponseDto = z
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
export const DescribeComputeEnvResponse = z.object({ computeEnv: ComputeEnvResponseDto }).partial().passthrough();
export const UpdateComputeEnvRequest = z.object({ name: z.string() }).partial().passthrough();
export const AwsSecurityKeys = z
  .object({ discriminator: z.string(), accessKey: z.string(), secretKey: z.string(), assumeRoleArn: z.string() })
  .partial()
  .passthrough();
export const GoogleSecurityKeys = z.object({ discriminator: z.string(), data: z.string() }).partial().passthrough();
export const GitHubSecurityKeys = z
  .object({ discriminator: z.string(), username: z.string(), password: z.string() })
  .partial()
  .passthrough();
export const GitLabSecurityKeys = z
  .object({ discriminator: z.string(), username: z.string(), password: z.string(), token: z.string() })
  .partial()
  .passthrough();
export const BitBucketSecurityKeys = z
  .object({ discriminator: z.string(), username: z.string(), password: z.string() })
  .partial()
  .passthrough();
export const GiteaSecurityKeys = z
  .object({ discriminator: z.string(), username: z.string(), password: z.string() })
  .partial()
  .passthrough();
export const SSHSecurityKeys = z
  .object({ discriminator: z.string(), privateKey: z.string(), passphrase: z.string() })
  .partial()
  .passthrough();
export const K8sSecurityKeys = z
  .object({ discriminator: z.string(), certificate: z.string(), privateKey: z.string(), token: z.string() })
  .partial()
  .passthrough();
export const AzureSecurityKeys = z
  .object({
    discriminator: z.string(),
    batchName: z.string(),
    batchKey: z.string(),
    storageName: z.string(),
    storageKey: z.string(),
  })
  .partial()
  .passthrough();
export const AzureReposSecurityKeys = z
  .object({ discriminator: z.string(), username: z.string(), password: z.string() })
  .partial()
  .passthrough();
export const ContainerRegistryKeys = z
  .object({ discriminator: z.string(), userName: z.string(), password: z.string(), registry: z.string() })
  .partial()
  .passthrough();
export const AgentSecurityKeys = z
  .object({ discriminator: z.string(), connectionId: z.string(), workDir: z.string(), shared: z.boolean() })
  .partial()
  .passthrough();
export const CodeCommitSecurityKeys = z
  .object({ discriminator: z.string(), username: z.string(), password: z.string() })
  .partial()
  .passthrough();
export const SecurityKeys = z.discriminatedUnion('discriminator', [
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
export const Credentials = z
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
export const ListCredentialsResponse = z
  .object({ credentials: z.array(Credentials) })
  .partial()
  .passthrough();
export const CreateCredentialsRequest = z.object({ credentials: Credentials }).partial().passthrough();
export const CreateCredentialsResponse = z.object({ credentialsId: z.string() }).partial().passthrough();
export const DescribeCredentialsResponse = z.object({ credentials: Credentials }).partial().passthrough();
export const UpdateCredentialsRequest = z.object({ credentials: Credentials }).partial().passthrough();
export const DeleteCredentialsConflictResponse_Conflict = z
  .object({ type: z.string(), id: z.string(), name: z.string(), url: z.string() })
  .partial()
  .passthrough();
export const DeleteCredentialsConflictResponse = z
  .object({ credentialsId: z.string(), conflicts: z.array(DeleteCredentialsConflictResponse_Conflict) })
  .partial()
  .passthrough();
export const DataLinkType = z.literal('bucket');
export const DataLinkProvider = z.enum(['aws', 'google', 'azure']);
export const DataLinkCredentials = z
  .object({ id: z.string(), name: z.string(), provider: DataLinkProvider })
  .passthrough();
export const DataLink_Status = z.enum(['VALID', 'INVALID']);
export const DataLinkDto = z
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
export const DataLinksListResponse = z
  .object({ dataLinks: z.array(DataLinkDto), totalSize: z.number().int() })
  .partial()
  .passthrough();
export const DataLinkCreateRequest = z
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
export const DataLinkResponse = z.object({ dataLink: DataLinkDto }).partial().passthrough();
export const DataLinkUpdateRequest = z
  .object({ name: z.string(), description: z.string(), credentialsId: z.string() })
  .partial()
  .passthrough();
export const DataLinkItemType = z.enum(['FOLDER', 'FILE']);
export const DataLinkItem = z
  .object({ type: DataLinkItemType, name: z.string(), size: z.number().int(), mimeType: z.string() })
  .partial()
  .passthrough();
export const DataLinkContentResponse = z
  .object({ originalPath: z.string(), objects: z.array(DataLinkItem), nextPageToken: z.string() })
  .partial()
  .passthrough();
export const Dataset = z
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
export const ListDatasetsResponse = z
  .object({ datasets: z.array(Dataset) })
  .partial()
  .passthrough();
export const CreateDatasetRequest = z.object({ name: z.string(), description: z.string() }).partial().passthrough();
export const CreateDatasetResponse = z.object({ dataset: Dataset }).partial().passthrough();
export const DatasetVersionDbDto = z
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
export const ListDatasetVersionsResponse = z
  .object({ versions: z.array(DatasetVersionDbDto) })
  .partial()
  .passthrough();
export const UpdateDatasetRequest = z.object({ name: z.string(), description: z.string() }).partial().passthrough();
export const DescribeDatasetResponse = z.object({ dataset: Dataset }).partial().passthrough();
export const MultiRequestFileSchema = z
  .object({ file: z.instanceof(File) })
  .partial()
  .passthrough();
export const UploadDatasetVersionResponse = z.object({ version: DatasetVersionDbDto }).partial().passthrough();
export const State = z.enum([
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
export const RunStatus = z.object({ run_id: z.string(), state: State }).partial().passthrough();
export const RunListResponse = z
  .object({ runs: z.array(RunStatus), next_page_token: z.string() })
  .partial()
  .passthrough();
export const WesErrorResponse = z.object({ msg: z.string(), status_code: z.number().int() }).partial().passthrough();
export const RunRequest = z
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
export const RunId = z.object({ run_id: z.string() }).partial().passthrough();
export const Log = z
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
export const RunLog = z
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
export const NavbarConfig_NavbarMenu = z.object({ label: z.string(), url: z.string() }).partial().passthrough();
export const NavbarConfig = z
  .object({ menus: z.array(NavbarConfig_NavbarMenu) })
  .partial()
  .passthrough();
export const Analytics = z.object({ url: z.string(), siteId: z.number().int() }).partial().passthrough();
export const ServiceInfo = z
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
export const ListLabelsResponse = z
  .object({ labels: z.array(LabelDbDto), totalSize: z.number().int() })
  .partial()
  .passthrough();
export const CreateLabelRequest = z
  .object({ name: z.string(), value: z.string(), resource: z.boolean(), isDefault: z.boolean() })
  .partial()
  .passthrough();
export const CreateLabelResponse = z
  .object({ id: z.number().int(), name: z.string(), value: z.string(), resource: z.boolean(), isDefault: z.boolean() })
  .partial()
  .passthrough();
export const UpdateLabelRequest = z
  .object({ name: z.string(), value: z.string(), isDefault: z.boolean() })
  .partial()
  .passthrough();
export const UpdateLabelResponse = z
  .object({ id: z.number().int(), name: z.string(), value: z.string(), isDefault: z.boolean() })
  .partial()
  .passthrough();
export const DescribeLaunchResponse = z.object({ launch: Launch }).partial().passthrough();
export const OrgRole = z.enum(['owner', 'member', 'collaborator']);
export const OrganizationDbDto = z
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
export const ListOrganizationsResponse = z
  .object({ organizations: z.array(OrganizationDbDto), totalSize: z.number().int() })
  .partial()
  .passthrough();
export const Organization = z
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
export const CreateOrganizationRequest = z
  .object({ organization: Organization, logoId: z.string() })
  .partial()
  .passthrough();
export const CreateOrganizationResponse = z.object({ organization: OrganizationDbDto }).partial().passthrough();
export const DescribeOrganizationResponse = z.object({ organization: OrganizationDbDto }).partial().passthrough();
export const UpdateOrganizationRequest = z
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
export const MemberDbDto = z
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
export const ListMembersResponse = z
  .object({ members: z.array(MemberDbDto), totalSize: z.number().int() })
  .partial()
  .passthrough();
export const AddMemberRequest = z.object({ user: z.string() }).partial().passthrough();
export const AddMemberResponse = z.object({ member: MemberDbDto }).partial().passthrough();
export const UpdateMemberRoleRequest = z.object({ role: OrgRole }).partial().passthrough();
export const TeamDbDto = z
  .object({
    teamId: z.number().int(),
    name: z.string(),
    description: z.string(),
    avatarUrl: z.string(),
    membersCount: z.number().int(),
  })
  .partial()
  .passthrough();
export const ListTeamResponse = z
  .object({ teams: z.array(TeamDbDto), totalSize: z.number().int() })
  .partial()
  .passthrough();
export const Team = z
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
export const CreateTeamRequest = z.object({ team: Team, avatarId: z.string() }).partial().passthrough();
export const CreateTeamResponse = z.object({ team: TeamDbDto }).partial().passthrough();
export const DescribeTeamResponse = z.object({ team: TeamDbDto }).partial().passthrough();
export const UpdateTeamRequest = z
  .object({ name: z.string(), description: z.string(), avatarId: z.string() })
  .partial()
  .passthrough();
export const CreateTeamMemberRequest = z.object({ userNameOrEmail: z.string() }).partial().passthrough();
export const AddTeamMemberResponse = z.object({ member: MemberDbDto }).partial().passthrough();
export const Visibility = z.enum(['PRIVATE', 'SHARED']);
export const WorkspaceDbDto = z
  .object({
    id: z.number().int(),
    name: z.string(),
    fullName: z.string(),
    description: z.string(),
    visibility: Visibility,
  })
  .partial()
  .passthrough();
export const ListWorkspacesResponse = z
  .object({ workspaces: z.array(WorkspaceDbDto) })
  .partial()
  .passthrough();
export const Workspace = z
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
export const CreateWorkspaceRequest = z.object({ workspace: Workspace }).partial().passthrough();
export const CreateWorkspaceResponse = z.object({ workspace: Workspace }).partial().passthrough();
export const DescribeWorkspaceResponse = z.object({ workspace: Workspace }).partial().passthrough();
export const UpdateWorkspaceRequest = z
  .object({ name: z.string(), fullName: z.string(), description: z.string(), visibility: Visibility })
  .partial()
  .passthrough();
export const WspRole = z.enum(['owner', 'admin', 'maintain', 'launch', 'connect', 'view']);
export const ParticipantType = z.enum(['MEMBER', 'TEAM', 'COLLABORATOR']);
export const ParticipantDbDto = z
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
export const ListParticipantsResponse = z
  .object({ participants: z.array(ParticipantDbDto), totalSize: z.number().int() })
  .partial()
  .passthrough();
export const AddParticipantRequest = z
  .object({ memberId: z.number().int(), teamId: z.number().int(), userNameOrEmail: z.string() })
  .partial()
  .passthrough();
export const AddParticipantResponse = z.object({ participant: ParticipantDbDto }).partial().passthrough();
export const UpdateParticipantRoleRequest = z.object({ role: WspRole }).partial().passthrough();
export const PipelineSecret = z
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
export const ListPipelineSecretsResponse = z
  .object({ pipelineSecrets: z.array(PipelineSecret), totalSize: z.number().int() })
  .partial()
  .passthrough();
export const CreatePipelineSecretRequest = z.object({ name: z.string(), value: z.string() }).partial().passthrough();
export const CreatePipelineSecretResponse = z.object({ secretId: z.number().int() }).partial().passthrough();
export const DescribePipelineSecretResponse = z.object({ pipelineSecret: PipelineSecret }).partial().passthrough();
export const UpdatePipelineSecretRequest = z.object({ value: z.string() }).partial().passthrough();
export const PipelineQueryAttribute = z.enum(['optimized', 'labels', 'computeEnv']);
export const PipelineOptimizationStatus = z.enum(['OPTIMIZED', 'OPTIMIZABLE', 'UNAVAILABLE']);
export const ComputeEnvDbDto = z
  .object({ id: z.string(), name: z.string(), platform: z.string(), region: z.string() })
  .partial()
  .passthrough();
export const PipelineDbDto = z
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
export const ListPipelinesResponse = z
  .object({ pipelines: z.array(PipelineDbDto), totalSize: z.number().int() })
  .partial()
  .passthrough();
export const CreatePipelineRequest = z
  .object({
    name: z.string(),
    description: z.string(),
    icon: z.string(),
    launch: WorkflowLaunchRequest,
    labelIds: z.array(z.number()),
  })
  .partial()
  .passthrough();
export const CreatePipelineResponse = z.object({ pipeline: PipelineDbDto }).partial().passthrough();
export const WfManifest = z
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
export const PipelineInfo = z
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
export const DescribePipelineInfoResponse = z.object({ pipelineInfo: PipelineInfo }).partial().passthrough();
export const AssociatePipelineLabelsRequest = z
  .object({ pipelineIds: z.array(z.number()), labelIds: z.array(z.number()) })
  .partial()
  .passthrough();
export const ListPipelineInfoResponse = z
  .object({ pipelines: z.array(z.string()) })
  .partial()
  .passthrough();
export const DescribePipelineResponse = z.object({ pipeline: PipelineDbDto }).partial().passthrough();
export const UpdatePipelineRequest = z
  .object({
    name: z.string(),
    description: z.string(),
    icon: z.string(),
    launch: WorkflowLaunchRequest,
    labelIds: z.array(z.number()),
  })
  .partial()
  .passthrough();
export const UpdatePipelineResponse = z.object({ pipeline: PipelineDbDto }).partial().passthrough();
export const PipelineSchemaAttributes = z.enum(['schema', 'params']);
export const PipelineSchemaResponse = z.object({ schema: z.string(), params: z.string().optional() }).passthrough();
export const ComputePlatform = z
  .object({ id: z.string(), name: z.string(), credentialsProviders: z.array(z.string()) })
  .partial()
  .passthrough();
export const ListPlatformsResponse = z
  .object({ platforms: z.array(ComputePlatform) })
  .partial()
  .passthrough();
export const AwsBatchPlatformMetainfo_JobQueue = z.object({ name: z.string(), state: z.string() }).passthrough();
export const AwsBatchPlatformMetainfo_Bucket = z.object({ path: z.string() }).partial().passthrough();
export const AwsBatchPlatformMetainfo_FsxFileSystem = z
  .object({ id: z.string(), dns: z.string(), mount: z.string() })
  .partial()
  .passthrough();
export const AwsBatchPlatformMetainfo_EfsFileSystem = z.object({ id: z.string() }).partial().passthrough();
export const AwsBatchPlatformMetainfo_Vpc = z
  .object({ id: z.string(), isDefault: z.boolean() })
  .partial()
  .passthrough();
export const AwsBatchPlatformMetainfo_Image = z
  .object({ id: z.string(), name: z.string(), description: z.string() })
  .partial()
  .passthrough();
export const AwsBatchPlatformMetainfo_SecurityGroup = z
  .object({ id: z.string(), name: z.string(), vpcId: z.string() })
  .partial()
  .passthrough();
export const AwsBatchPlatformMetainfo_Subnet = z
  .object({ id: z.string(), zone: z.string(), vpcId: z.string() })
  .partial()
  .passthrough();
export const AwsBatchPlatformMetainfo = z
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
export const GooglePlatformMetainfo_Bucket = z.object({ path: z.string() }).partial().passthrough();
export const GooglePlatformMetainfo_Filestore = z
  .object({ target: z.string(), name: z.string(), location: z.string() })
  .partial()
  .passthrough();
export const GooglePlatformMetainfo = z
  .object({
    locations: z.array(z.string()),
    warnings: z.array(z.string()),
    zones: z.array(z.string()),
    buckets: z.array(GooglePlatformMetainfo_Bucket),
    filestores: z.array(GooglePlatformMetainfo_Filestore),
  })
  .partial()
  .passthrough();
export const PlatformMetainfo = z.union([AwsBatchPlatformMetainfo, GooglePlatformMetainfo]);
export const DescribePlatformResponse = z.object({ metainfo: PlatformMetainfo }).partial().passthrough();
export const ComputeRegion = z.object({ id: z.string(), name: z.string() }).partial().passthrough();
export const ListRegionsResponse = z
  .object({ regions: z.array(ComputeRegion) })
  .partial()
  .passthrough();
export const ServiceInfoResponse = z.object({ serviceInfo: ServiceInfo }).partial().passthrough();
export const AccessToken = z
  .object({
    basicAuth: z.string().optional(),
    id: z.number().int().nullish(),
    name: z.string().min(1).max(50),
    lastUsed: z.string().datetime({ offset: true }).optional(),
    dateCreated: z.string().datetime({ offset: true }).optional(),
  })
  .passthrough();
export const ListAccessTokensResponse = z
  .object({ tokens: z.array(AccessToken) })
  .partial()
  .passthrough();
export const CreateAccessTokenRequest = z.object({ name: z.string() }).partial().passthrough();
export const CreateAccessTokenResponse = z
  .object({ accessKey: z.string(), token: AccessToken })
  .partial()
  .passthrough();
export const TraceCreateRequest = z
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
export const TraceCreateResponse = z.object({ message: z.string(), workflowId: z.string() }).partial().passthrough();
export const WorkflowStatus = z.enum(['SUBMITTED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'UNKNOWN']);
export const WfNextflow = z
  .object({ version: z.string().max(20), build: z.string().max(10), timestamp: z.string().datetime({ offset: true }) })
  .partial()
  .passthrough();
export const WfStats = z
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
export const Workflow = z
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
export const TraceBeginRequest = z
  .object({ launchId: z.string(), workflow: Workflow, processNames: z.array(z.string()), towerLaunch: z.boolean() })
  .partial()
  .passthrough();
export const TraceProcessingStatus = z.enum(['OK', 'KO']);
export const TraceBeginResponse = z
  .object({ status: TraceProcessingStatus, workflowId: z.string(), watchUrl: z.string() })
  .partial()
  .passthrough();
export const ResourceData = z
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
export const WorkflowMetrics = z
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
export const TraceProgressDetail = z
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
export const TraceProgressData = z
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
export const TraceCompleteRequest = z
  .object({ workflow: Workflow, metrics: z.array(WorkflowMetrics), progress: TraceProgressData })
  .partial()
  .passthrough();
export const TraceCompleteResponse = z
  .object({ status: TraceProcessingStatus, workflowId: z.string() })
  .partial()
  .passthrough();
export const TraceHeartbeatRequest = z.object({ progress: TraceProgressData }).partial().passthrough();
export const TraceHeartbeatResponse = z.object({ message: z.string() }).partial().passthrough();
export const CloudPriceModel = z.enum(['standard', 'spot']);
export const TaskStatus = z.enum(['NEW', 'SUBMITTED', 'RUNNING', 'CACHED', 'COMPLETED', 'FAILED', 'ABORTED']);
export const Task = z
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
export const TraceProgressRequest = z
  .object({ tasks: z.array(Task), progress: TraceProgressData })
  .partial()
  .passthrough();
export const TraceProgressResponse = z
  .object({ status: TraceProcessingStatus, workflowId: z.string() })
  .partial()
  .passthrough();
export const UserDbDto = z
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
export const DescribeUserResponse = z
  .object({ user: UserDbDto, needConsent: z.boolean(), defaultWorkspaceId: z.number().int() })
  .partial()
  .passthrough();
export const OrgAndWorkspaceDto = z
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
export const ListWorkspacesAndOrgResponse = z
  .object({ orgsAndWorkspaces: z.array(OrgAndWorkspaceDto) })
  .partial()
  .passthrough();
export const WorkflowQueryAttribute = z.enum(['optimized', 'labels', 'minimal']);
export const WorkflowDbDto = z
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
export const WorkflowLoad = z
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
export const ProcessLoad = z
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
export const ProgressData = z
  .object({ workflowProgress: WorkflowLoad, processesProgress: z.array(ProcessLoad) })
  .partial()
  .passthrough();
export const ListWorkflowsResponse_ListWorkflowsElement = z
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
export const ListWorkflowsResponse = z
  .object({ workflows: z.array(ListWorkflowsResponse_ListWorkflowsElement), totalSize: z.number().int() })
  .partial()
  .passthrough();
export const DeleteWorkflowsRequest = z
  .object({ workflowIds: z.array(z.string()) })
  .partial()
  .passthrough();
export const DeleteWorkflowsResponse = z
  .object({ failedWorkflowIds: z.array(z.string()) })
  .partial()
  .passthrough();
export const AssociateWorkflowLabelsRequest = z
  .object({ workflowIds: z.array(z.string()), labelIds: z.array(z.number()) })
  .partial()
  .passthrough();
export const SubmitWorkflowLaunchRequest = z.object({ launch: WorkflowLaunchRequest }).partial().passthrough();
export const SubmitWorkflowLaunchResponse = z.object({ workflowId: z.string() }).partial().passthrough();
export const RandomWorkflowNameResponse = z.object({ name: z.string() }).partial().passthrough();
export const ComputePlatformDto = z.object({ id: z.string(), name: z.string() }).partial().passthrough();
export const JobInfoDto = z
  .object({
    id: z.number().int(),
    operationId: z.string(),
    message: z.string(),
    status: z.string(),
    exitCode: z.number().int(),
  })
  .partial()
  .passthrough();
export const DescribeWorkflowResponse = z
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
export const WorkflowLaunchResponse = z
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
export const DescribeWorkflowLaunchResponse = z.object({ launch: WorkflowLaunchResponse }).partial().passthrough();
export const Iterator_String_ = z.object({}).partial().passthrough();
export const LogPage_Download = z
  .object({ saveName: z.string(), fileName: z.string(), displayText: z.string() })
  .partial()
  .passthrough();
export const LogPage = z
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
export const WorkflowLogResponse = z.object({ log: LogPage }).partial().passthrough();
export const GetWorkflowMetricsResponse = z
  .object({ metrics: z.array(WorkflowMetrics) })
  .partial()
  .passthrough();
export const GetProgressResponse = z.object({ progress: ProgressData }).partial().passthrough();
export const CreateWorkflowStarResponse = z.object({ workflowId: z.string() }).partial().passthrough();
export const DescribeTaskResponse = z.object({ task: Task }).partial().passthrough();
export const ListTasksResponse = z
  .object({ tasks: z.array(DescribeTaskResponse), total: z.number().int() })
  .partial()
  .passthrough();
export const LabelType = z.enum(['simple', 'resource', 'all']);

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
  LabelType,
};
