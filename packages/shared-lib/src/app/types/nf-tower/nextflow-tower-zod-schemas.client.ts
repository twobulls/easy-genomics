import z from 'zod';

export type AbstractGridConfig = z.infer<typeof AbstractGridConfig>;
export const AbstractGridConfig = z.object({
  workDir: z.string().optional(),
  preRunScript: z.string().optional(),
  postRunScript: z.string().optional(),
  launchDir: z.string().optional(),
  userName: z.string().optional(),
  hostName: z.string().optional(),
  port: z.number().optional(),
  headQueue: z.string().optional(),
  computeQueue: z.string().optional(),
  maxQueueSize: z.number().optional(),
  headJobOptions: z.string().optional(),
  propagateHeadJobOptions: z.boolean().optional(),
});

export type AccessToken = z.infer<typeof AccessToken>;
export const AccessToken = z.object({
  basicAuth: z.union([z.string(), z.undefined()]).optional(),
  id: z.union([z.number(), z.null(), z.undefined()]).optional(),
  name: z.string(),
  lastUsed: z.union([z.string(), z.undefined()]).optional(),
  dateCreated: z.union([z.string(), z.undefined()]).optional(),
});

export type Action_TowerActionConfig = z.infer<typeof Action_TowerActionConfig>;
export const Action_TowerActionConfig = z.object({
  discriminator: z.string().optional(),
});

export type GithubActionConfig = z.infer<typeof GithubActionConfig>;
export const GithubActionConfig = z.object({
  discriminator: z.string().optional(),
  events: z.array(z.string()).optional(),
});

export type Action_ConfigType = z.infer<typeof Action_ConfigType>;
export const Action_ConfigType = z.union([Action_TowerActionConfig, GithubActionConfig]);

export type GithubActionEvent = z.infer<typeof GithubActionEvent>;
export const GithubActionEvent = z.object({
  discriminator: z.string().optional(),
  ref: z.string().optional(),
  commitId: z.string().optional(),
  commitMessage: z.string().optional(),
  pusherName: z.string().optional(),
  pusherEmail: z.string().optional(),
  timestamp: z.string().optional(),
});

export type Action_TowerActionEvent = z.infer<typeof Action_TowerActionEvent>;
export const Action_TowerActionEvent = z.object({
  discriminator: z.string().optional(),
  timestamp: z.string().optional(),
  workflowId: z.string().optional(),
});

export type Action_EventType = z.infer<typeof Action_EventType>;
export const Action_EventType = z.union([GithubActionEvent, Action_TowerActionEvent]);

export type Action_Source = z.infer<typeof Action_Source>;
export const Action_Source = z.union([z.literal('github'), z.literal('tower')]);

export type Action_Status = z.infer<typeof Action_Status>;
export const Action_Status = z.union([
  z.literal('CREATING'),
  z.literal('ACTIVE'),
  z.literal('ERROR'),
  z.literal('PAUSED'),
]);

export type ActionQueryAttribute = z.infer<typeof ActionQueryAttribute>;
export const ActionQueryAttribute = z.literal('labels');

export type ConfigEnvVariable = z.infer<typeof ConfigEnvVariable>;
export const ConfigEnvVariable = z.object({
  name: z.string().optional(),
  value: z.string().optional(),
  head: z.boolean().optional(),
  compute: z.boolean().optional(),
});

export type ForgeConfig = z.infer<typeof ForgeConfig>;
export const ForgeConfig = z.object({
  type: z.union([z.literal('SPOT'), z.literal('EC2')]).optional(),
  minCpus: z.number().optional(),
  maxCpus: z.number().optional(),
  gpuEnabled: z.boolean().optional(),
  ebsAutoScale: z.boolean().optional(),
  instanceTypes: z.array(z.string()).optional(),
  allocStrategy: z
    .union([
      z.literal('BEST_FIT'),
      z.literal('BEST_FIT_PROGRESSIVE'),
      z.literal('SPOT_CAPACITY_OPTIMIZED'),
      z.literal('SPOT_PRICE_CAPACITY_OPTIMIZED'),
    ])
    .optional(),
  imageId: z.string().optional(),
  vpcId: z.string().optional(),
  subnets: z.array(z.string()).optional(),
  securityGroups: z.array(z.string()).optional(),
  fsxMount: z.string().optional(),
  fsxName: z.string().optional(),
  fsxSize: z.number().optional(),
  disposeOnDeletion: z.boolean().optional(),
  ec2KeyPair: z.string().optional(),
  allowBuckets: z.array(z.string()).optional(),
  ebsBlockSize: z.number().optional(),
  fusionEnabled: z.boolean().optional(),
  bidPercentage: z.number().optional(),
  efsCreate: z.boolean().optional(),
  efsId: z.string().optional(),
  efsMount: z.string().optional(),
  dragenEnabled: z.boolean().optional(),
  dragenAmiId: z.string().optional(),
  ebsBootSize: z.number().optional(),
  ecsConfig: z.string().optional(),
  fargateHeadEnabled: z.boolean().optional(),
  arm64Enabled: z.boolean().optional(),
  dragenInstanceType: z.string().optional(),
});

export type AwsBatchConfig = z.infer<typeof AwsBatchConfig>;
export const AwsBatchConfig = z.object({
  storageType: z.string().optional(),
  lustreId: z.string().optional(),
  volumes: z.array(z.string()).optional(),
  discriminator: z.string().optional(),
  region: z.string().optional(),
  computeQueue: z.string().optional(),
  dragenQueue: z.string().optional(),
  dragenInstanceType: z.string().optional(),
  computeJobRole: z.string().optional(),
  executionRole: z.string().optional(),
  headQueue: z.string().optional(),
  headJobRole: z.string().optional(),
  cliPath: z.string().optional(),
  workDir: z.string().optional(),
  preRunScript: z.string().optional(),
  postRunScript: z.string().optional(),
  headJobCpus: z.number().optional(),
  headJobMemoryMb: z.number().optional(),
  environment: z.array(ConfigEnvVariable).optional(),
  waveEnabled: z.boolean().optional(),
  fusion2Enabled: z.boolean().optional(),
  nvnmeStorageEnabled: z.boolean().optional(),
  logGroup: z.string().optional(),
  forge: ForgeConfig.optional(),
  forgedResources: z.array(z.unknown()).optional(),
});

export type GoogleLifeSciencesConfig = z.infer<typeof GoogleLifeSciencesConfig>;
export const GoogleLifeSciencesConfig = z.object({
  discriminator: z.string().optional(),
  region: z.string().optional(),
  zones: z.array(z.string()).optional(),
  location: z.string().optional(),
  workDir: z.string().optional(),
  preemptible: z.boolean().optional(),
  bootDiskSizeGb: z.number().optional(),
  projectId: z.string().optional(),
  sshDaemon: z.boolean().optional(),
  sshImage: z.string().optional(),
  debugMode: z.number().optional(),
  copyImage: z.string().optional(),
  usePrivateAddress: z.boolean().optional(),
  labels: z.unknown().optional(),
  preRunScript: z.string().optional(),
  postRunScript: z.string().optional(),
  headJobCpus: z.number().optional(),
  headJobMemoryMb: z.number().optional(),
  nfsTarget: z.string().optional(),
  nfsMount: z.string().optional(),
  environment: z.array(ConfigEnvVariable).optional(),
});

export type GoogleBatchConfig = z.infer<typeof GoogleBatchConfig>;
export const GoogleBatchConfig = z.object({
  discriminator: z.string().optional(),
  location: z.string().optional(),
  workDir: z.string().optional(),
  spot: z.boolean().optional(),
  bootDiskSizeGb: z.number().optional(),
  cpuPlatform: z.string().optional(),
  machineType: z.string().optional(),
  projectId: z.string().optional(),
  sshDaemon: z.boolean().optional(),
  sshImage: z.string().optional(),
  debugMode: z.number().optional(),
  copyImage: z.string().optional(),
  usePrivateAddress: z.boolean().optional(),
  labels: z.unknown().optional(),
  preRunScript: z.string().optional(),
  postRunScript: z.string().optional(),
  headJobCpus: z.number().optional(),
  headJobMemoryMb: z.number().optional(),
  nfsTarget: z.string().optional(),
  nfsMount: z.string().optional(),
  environment: z.array(ConfigEnvVariable).optional(),
  waveEnabled: z.boolean().optional(),
  fusion2Enabled: z.boolean().optional(),
  serviceAccount: z.string().optional(),
  network: z.string().optional(),
  subnetwork: z.string().optional(),
  headJobInstanceTemplate: z.string().optional(),
  computeJobsInstanceTemplate: z.string().optional(),
});

export type AzBatchForgeConfig = z.infer<typeof AzBatchForgeConfig>;
export const AzBatchForgeConfig = z.object({
  vmType: z.string().optional(),
  vmCount: z.number().optional(),
  autoScale: z.boolean().optional(),
  disposeOnDeletion: z.boolean().optional(),
  containerRegIds: z.array(z.string()).optional(),
});

export type JobCleanupPolicy = z.infer<typeof JobCleanupPolicy>;
export const JobCleanupPolicy = z.union([z.literal('on_success'), z.literal('always'), z.literal('never')]);

export type AzBatchConfig = z.infer<typeof AzBatchConfig>;
export const AzBatchConfig = z.object({
  discriminator: z.string().optional(),
  workDir: z.string().optional(),
  preRunScript: z.string().optional(),
  postRunScript: z.string().optional(),
  region: z.string().optional(),
  headPool: z.string().optional(),
  autoPoolMode: z.boolean().optional(),
  forge: AzBatchForgeConfig.optional(),
  tokenDuration: z.string().optional(),
  deleteJobsOnCompletion: JobCleanupPolicy.optional(),
  deletePoolsOnCompletion: z.boolean().optional(),
  environment: z.array(ConfigEnvVariable).optional(),
  waveEnabled: z.boolean().optional(),
  fusion2Enabled: z.boolean().optional(),
});

export type LsfComputeConfig = z.infer<typeof LsfComputeConfig>;
export const LsfComputeConfig = z.intersection(
  AbstractGridConfig,
  z.object({
    discriminator: z.string().optional(),
    unitForLimits: z.string().optional(),
    perJobMemLimit: z.boolean().optional(),
    perTaskReserve: z.boolean().optional(),
    environment: z.array(ConfigEnvVariable).optional(),
  }),
);

export type SlurmComputeConfig = z.infer<typeof SlurmComputeConfig>;
export const SlurmComputeConfig = z.intersection(
  AbstractGridConfig,
  z.object({
    discriminator: z.string().optional(),
    environment: z.array(ConfigEnvVariable).optional(),
  }),
);

export type PodCleanupPolicy = z.infer<typeof PodCleanupPolicy>;
export const PodCleanupPolicy = z.union([z.literal('on_success'), z.literal('always'), z.literal('never')]);

export type K8sComputeConfig = z.infer<typeof K8sComputeConfig>;
export const K8sComputeConfig = z.object({
  discriminator: z.string().optional(),
  workDir: z.string().optional(),
  preRunScript: z.string().optional(),
  postRunScript: z.string().optional(),
  server: z.string().optional(),
  sslCert: z.string().optional(),
  namespace: z.string().optional(),
  computeServiceAccount: z.string().optional(),
  headServiceAccount: z.string().optional(),
  storageClaimName: z.string().optional(),
  storageMountPath: z.string().optional(),
  podCleanup: PodCleanupPolicy.optional(),
  headPodSpec: z.string().optional(),
  servicePodSpec: z.string().optional(),
  environment: z.array(ConfigEnvVariable).optional(),
  headJobCpus: z.number().optional(),
  headJobMemoryMb: z.number().optional(),
});

export type EksComputeConfig = z.infer<typeof EksComputeConfig>;
export const EksComputeConfig = z.intersection(
  K8sComputeConfig,
  z.object({
    discriminator: z.string().optional(),
    workDir: z.string().optional(),
    preRunScript: z.string().optional(),
    postRunScript: z.string().optional(),
    environment: z.array(ConfigEnvVariable).optional(),
    region: z.string().optional(),
    clusterName: z.string().optional(),
    waveEnabled: z.boolean().optional(),
    fusion2Enabled: z.boolean().optional(),
  }),
);

export type GkeComputeConfig = z.infer<typeof GkeComputeConfig>;
export const GkeComputeConfig = z.intersection(
  K8sComputeConfig,
  z.object({
    discriminator: z.string().optional(),
    workDir: z.string().optional(),
    preRunScript: z.string().optional(),
    postRunScript: z.string().optional(),
    environment: z.array(ConfigEnvVariable).optional(),
    region: z.string().optional(),
    clusterName: z.string().optional(),
    fusion2Enabled: z.boolean().optional(),
    waveEnabled: z.boolean().optional(),
  }),
);

export type UnivaComputeConfig = z.infer<typeof UnivaComputeConfig>;
export const UnivaComputeConfig = z.intersection(
  AbstractGridConfig,
  z.object({
    discriminator: z.string().optional(),
    environment: z.array(ConfigEnvVariable).optional(),
  }),
);

export type AltairPbsComputeConfig = z.infer<typeof AltairPbsComputeConfig>;
export const AltairPbsComputeConfig = z.intersection(
  AbstractGridConfig,
  z.object({
    discriminator: z.string().optional(),
    environment: z.array(ConfigEnvVariable).optional(),
  }),
);

export type MoabComputeConfig = z.infer<typeof MoabComputeConfig>;
export const MoabComputeConfig = z.intersection(
  AbstractGridConfig,
  z.object({
    discriminator: z.string().optional(),
    environment: z.array(ConfigEnvVariable).optional(),
  }),
);

export type ComputeConfig = z.infer<typeof ComputeConfig>;
export const ComputeConfig = z.union([
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

export type ComputeEnv_Status = z.infer<typeof ComputeEnv_Status>;
export const ComputeEnv_Status = z.union([
  z.literal('CREATING'),
  z.literal('AVAILABLE'),
  z.literal('ERRORED'),
  z.literal('INVALID'),
]);

export type ComputeEnv_ComputeConfig_ = z.infer<typeof ComputeEnv_ComputeConfig_>;
export const ComputeEnv_ComputeConfig_ = z.object({
  credentialsId: z.union([z.string(), z.undefined()]).optional(),
  orgId: z.union([z.number(), z.undefined()]).optional(),
  workspaceId: z.union([z.number(), z.undefined()]).optional(),
  id: z.union([z.string(), z.undefined()]).optional(),
  name: z.string(),
  description: z.union([z.string(), z.undefined()]).optional(),
  platform: z.union([
    z.literal('aws-batch'),
    z.literal('google-lifesciences'),
    z.literal('google-batch'),
    z.literal('azure-batch'),
    z.literal('k8s-platform'),
    z.literal('eks-platform'),
    z.literal('gke-platform'),
    z.literal('uge-platform'),
    z.literal('slurm-platform'),
    z.literal('lsf-platform'),
    z.literal('altair-platform'),
    z.literal('moab-platform'),
    z.literal('local-platform'),
  ]),
  config: ComputeConfig,
  dateCreated: z.union([z.string(), z.undefined()]).optional(),
  lastUpdated: z.union([z.string(), z.undefined()]).optional(),
  lastUsed: z.union([z.string(), z.undefined()]).optional(),
  deleted: z.union([z.boolean(), z.undefined()]).optional(),
  status: z.union([z.intersection(ComputeEnv_Status, z.string()), z.undefined()]).optional(),
  message: z.union([z.string(), z.undefined()]).optional(),
  primary: z.union([z.boolean(), z.undefined()]).optional(),
});

export type Launch = z.infer<typeof Launch>;
export const Launch = z.object({
  id: z.union([z.string(), z.undefined()]).optional(),
  computeEnv: z.union([ComputeEnv_ComputeConfig_, z.null(), z.undefined()]).optional(),
  pipeline: z.string(),
  workDir: z.union([z.string(), z.undefined()]).optional(),
  revision: z.union([z.string(), z.undefined()]).optional(),
  configText: z.union([z.string(), z.undefined()]).optional(),
  towerConfig: z.union([z.string(), z.undefined()]).optional(),
  paramsText: z.union([z.string(), z.undefined()]).optional(),
  preRunScript: z.union([z.string(), z.undefined()]).optional(),
  postRunScript: z.union([z.string(), z.undefined()]).optional(),
  mainScript: z.union([z.string(), z.undefined()]).optional(),
  entryName: z.union([z.string(), z.undefined()]).optional(),
  schemaName: z.union([z.string(), z.undefined()]).optional(),
  resume: z.union([z.boolean(), z.undefined()]).optional(),
  resumeLaunchId: z.union([z.string(), z.undefined()]).optional(),
  pullLatest: z.union([z.boolean(), z.undefined()]).optional(),
  stubRun: z.union([z.boolean(), z.undefined()]).optional(),
  sessionId: z.union([z.string(), z.undefined()]).optional(),
  runName: z.union([z.string(), z.undefined()]).optional(),
  configProfiles: z.union([z.array(z.string()), z.undefined()]).optional(),
  userSecrets: z.union([z.array(z.string()), z.undefined()]).optional(),
  workspaceSecrets: z.union([z.array(z.string()), z.undefined()]).optional(),
  optimizationId: z.union([z.string(), z.undefined()]).optional(),
  optimizationTargets: z.union([z.string(), z.undefined()]).optional(),
  headJobCpus: z.union([z.number(), z.undefined()]).optional(),
  headJobMemoryMb: z.union([z.number(), z.undefined()]).optional(),
  dateCreated: z.string(),
  lastUpdated: z.union([z.string(), z.undefined()]).optional(),
});

export type LabelDbDto = z.infer<typeof LabelDbDto>;
export const LabelDbDto = z.object({
  id: z.number().optional(),
  name: z.string().optional(),
  value: z.string().optional(),
  resource: z.boolean().optional(),
  isDefault: z.boolean().optional(),
});

export type ActionResponseDto = z.infer<typeof ActionResponseDto>;
export const ActionResponseDto = z.object({
  id: z.string().optional(),
  launch: Launch.optional(),
  name: z.string().optional(),
  hookId: z.string().optional(),
  hookUrl: z.string().optional(),
  message: z.string().optional(),
  source: Action_Source.optional(),
  status: Action_Status.optional(),
  config: Action_ConfigType.optional(),
  event: Action_EventType.optional(),
  lastSeen: z.string().optional(),
  dateCreated: z.string().optional(),
  lastUpdated: z.string().optional(),
  labels: z.array(LabelDbDto).optional(),
});

export type AddMemberRequest = z.infer<typeof AddMemberRequest>;
export const AddMemberRequest = z.object({
  user: z.string().optional(),
});

export type OrgRole = z.infer<typeof OrgRole>;
export const OrgRole = z.union([z.literal('owner'), z.literal('member'), z.literal('collaborator')]);

export type MemberDbDto = z.infer<typeof MemberDbDto>;
export const MemberDbDto = z.object({
  memberId: z.number().optional(),
  userId: z.number().optional(),
  userName: z.string().optional(),
  email: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  avatar: z.string().optional(),
  role: OrgRole.optional(),
});

export type AddMemberResponse = z.infer<typeof AddMemberResponse>;
export const AddMemberResponse = z.object({
  member: MemberDbDto.optional(),
});

export type AddParticipantRequest = z.infer<typeof AddParticipantRequest>;
export const AddParticipantRequest = z.object({
  memberId: z.number().optional(),
  teamId: z.number().optional(),
  userNameOrEmail: z.string().optional(),
});

export type WspRole = z.infer<typeof WspRole>;
export const WspRole = z.union([
  z.literal('owner'),
  z.literal('admin'),
  z.literal('maintain'),
  z.literal('launch'),
  z.literal('connect'),
  z.literal('view'),
]);

export type ParticipantType = z.infer<typeof ParticipantType>;
export const ParticipantType = z.union([z.literal('MEMBER'), z.literal('TEAM'), z.literal('COLLABORATOR')]);

export type ParticipantDbDto = z.infer<typeof ParticipantDbDto>;
export const ParticipantDbDto = z.object({
  participantId: z.number().optional(),
  memberId: z.number().optional(),
  userName: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
  orgRole: OrgRole.optional(),
  teamId: z.number().optional(),
  teamName: z.string().optional(),
  wspRole: WspRole.optional(),
  type: ParticipantType.optional(),
  teamAvatarUrl: z.string().optional(),
  userAvatarUrl: z.string().optional(),
});

export type AddParticipantResponse = z.infer<typeof AddParticipantResponse>;
export const AddParticipantResponse = z.object({
  participant: ParticipantDbDto.optional(),
});

export type AddTeamMemberResponse = z.infer<typeof AddTeamMemberResponse>;
export const AddTeamMemberResponse = z.object({
  member: MemberDbDto.optional(),
});

export type AgentSecurityKeys = z.infer<typeof AgentSecurityKeys>;
export const AgentSecurityKeys = z.object({
  discriminator: z.string().optional(),
  connectionId: z.string().optional(),
  workDir: z.string().optional(),
  shared: z.boolean().optional(),
});

export type Analytics = z.infer<typeof Analytics>;
export const Analytics = z.object({
  url: z.string().optional(),
  siteId: z.number().optional(),
});

export type AssociateActionLabelsRequest = z.infer<typeof AssociateActionLabelsRequest>;
export const AssociateActionLabelsRequest = z.object({
  actionIds: z.array(z.string()).optional(),
  labelIds: z.array(z.number()).optional(),
});

export type AssociatePipelineLabelsRequest = z.infer<typeof AssociatePipelineLabelsRequest>;
export const AssociatePipelineLabelsRequest = z.object({
  pipelineIds: z.array(z.number()).optional(),
  labelIds: z.array(z.number()).optional(),
});

export type AssociateWorkflowLabelsRequest = z.infer<typeof AssociateWorkflowLabelsRequest>;
export const AssociateWorkflowLabelsRequest = z.object({
  workflowIds: z.array(z.string()).optional(),
  labelIds: z.array(z.number()).optional(),
});

export type Avatar = z.infer<typeof Avatar>;
export const Avatar = z.object({
  id: z.string().optional(),
  dateCreated: z.string().optional(),
  lastUpdated: z.string().optional(),
});

export type AwsBatchPlatformMetainfo_JobQueue = z.infer<typeof AwsBatchPlatformMetainfo_JobQueue>;
export const AwsBatchPlatformMetainfo_JobQueue = z.object({
  name: z.string(),
  state: z.string(),
});

export type AwsBatchPlatformMetainfo_Bucket = z.infer<typeof AwsBatchPlatformMetainfo_Bucket>;
export const AwsBatchPlatformMetainfo_Bucket = z.object({
  path: z.string().optional(),
});

export type AwsBatchPlatformMetainfo_FsxFileSystem = z.infer<typeof AwsBatchPlatformMetainfo_FsxFileSystem>;
export const AwsBatchPlatformMetainfo_FsxFileSystem = z.object({
  id: z.string().optional(),
  dns: z.string().optional(),
  mount: z.string().optional(),
});

export type AwsBatchPlatformMetainfo_EfsFileSystem = z.infer<typeof AwsBatchPlatformMetainfo_EfsFileSystem>;
export const AwsBatchPlatformMetainfo_EfsFileSystem = z.object({
  id: z.string().optional(),
});

export type AwsBatchPlatformMetainfo_Vpc = z.infer<typeof AwsBatchPlatformMetainfo_Vpc>;
export const AwsBatchPlatformMetainfo_Vpc = z.object({
  id: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export type AwsBatchPlatformMetainfo_Image = z.infer<typeof AwsBatchPlatformMetainfo_Image>;
export const AwsBatchPlatformMetainfo_Image = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
});

export type AwsBatchPlatformMetainfo_SecurityGroup = z.infer<typeof AwsBatchPlatformMetainfo_SecurityGroup>;
export const AwsBatchPlatformMetainfo_SecurityGroup = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  vpcId: z.string().optional(),
});

export type AwsBatchPlatformMetainfo_Subnet = z.infer<typeof AwsBatchPlatformMetainfo_Subnet>;
export const AwsBatchPlatformMetainfo_Subnet = z.object({
  id: z.string().optional(),
  zone: z.string().optional(),
  vpcId: z.string().optional(),
});

export type AwsBatchPlatformMetainfo = z.infer<typeof AwsBatchPlatformMetainfo>;
export const AwsBatchPlatformMetainfo = z.object({
  warnings: z.array(z.string()).optional(),
  jobQueues: z.array(AwsBatchPlatformMetainfo_JobQueue).optional(),
  buckets: z.array(AwsBatchPlatformMetainfo_Bucket).optional(),
  fileSystems: z.array(AwsBatchPlatformMetainfo_FsxFileSystem).optional(),
  efsFileSystems: z.array(AwsBatchPlatformMetainfo_EfsFileSystem).optional(),
  keyPairs: z.array(z.string()).optional(),
  vpcs: z.array(AwsBatchPlatformMetainfo_Vpc).optional(),
  images: z.array(AwsBatchPlatformMetainfo_Image).optional(),
  securityGroups: z.array(AwsBatchPlatformMetainfo_SecurityGroup).optional(),
  subnets: z.array(AwsBatchPlatformMetainfo_Subnet).optional(),
  instanceFamilies: z.array(z.string()).optional(),
  allocStrategy: z.array(z.string()).optional(),
});

export type AwsSecurityKeys = z.infer<typeof AwsSecurityKeys>;
export const AwsSecurityKeys = z.object({
  discriminator: z.string().optional(),
  accessKey: z.string().optional(),
  secretKey: z.string().optional(),
  assumeRoleArn: z.string().optional(),
});

export type AzureReposSecurityKeys = z.infer<typeof AzureReposSecurityKeys>;
export const AzureReposSecurityKeys = z.object({
  discriminator: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
});

export type AzureSecurityKeys = z.infer<typeof AzureSecurityKeys>;
export const AzureSecurityKeys = z.object({
  discriminator: z.string().optional(),
  batchName: z.string().optional(),
  batchKey: z.string().optional(),
  storageName: z.string().optional(),
  storageKey: z.string().optional(),
});

export type BitBucketSecurityKeys = z.infer<typeof BitBucketSecurityKeys>;
export const BitBucketSecurityKeys = z.object({
  discriminator: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
});

export type CloudPriceModel = z.infer<typeof CloudPriceModel>;
export const CloudPriceModel = z.union([z.literal('standard'), z.literal('spot')]);

export type CodeCommitSecurityKeys = z.infer<typeof CodeCommitSecurityKeys>;
export const CodeCommitSecurityKeys = z.object({
  discriminator: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
});

export type ComputeEnvDbDto = z.infer<typeof ComputeEnvDbDto>;
export const ComputeEnvDbDto = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  platform: z.string().optional(),
  region: z.string().optional(),
});

export type ComputeEnvQueryAttribute = z.infer<typeof ComputeEnvQueryAttribute>;
export const ComputeEnvQueryAttribute = z.literal('labels');

export type ComputeEnvResponseDto = z.infer<typeof ComputeEnvResponseDto>;
export const ComputeEnvResponseDto = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  platform: z
    .union([
      z.literal('aws-batch'),
      z.literal('google-lifesciences'),
      z.literal('google-batch'),
      z.literal('azure-batch'),
      z.literal('k8s-platform'),
      z.literal('eks-platform'),
      z.literal('gke-platform'),
      z.literal('uge-platform'),
      z.literal('slurm-platform'),
      z.literal('lsf-platform'),
      z.literal('altair-platform'),
    ])
    .optional(),
  config: ComputeConfig.optional(),
  dateCreated: z.string().optional(),
  lastUpdated: z.string().optional(),
  lastUsed: z.string().optional(),
  deleted: z.boolean().optional(),
  status: ComputeEnv_Status.optional(),
  message: z.string().optional(),
  primary: z.boolean().optional(),
  credentialsId: z.string().optional(),
  orgId: z.number().optional(),
  workspaceId: z.number().optional(),
  labels: z.array(LabelDbDto).optional(),
});

export type ComputePlatform = z.infer<typeof ComputePlatform>;
export const ComputePlatform = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  credentialsProviders: z.array(z.string()).optional(),
});

export type ComputePlatformDto = z.infer<typeof ComputePlatformDto>;
export const ComputePlatformDto = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
});

export type ComputeRegion = z.infer<typeof ComputeRegion>;
export const ComputeRegion = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
});

export type ContainerRegistryKeys = z.infer<typeof ContainerRegistryKeys>;
export const ContainerRegistryKeys = z.object({
  discriminator: z.string().optional(),
  userName: z.string().optional(),
  password: z.string().optional(),
  registry: z.string().optional(),
});

export type CreateAccessTokenRequest = z.infer<typeof CreateAccessTokenRequest>;
export const CreateAccessTokenRequest = z.object({
  name: z.string().optional(),
});

export type CreateAccessTokenResponse = z.infer<typeof CreateAccessTokenResponse>;
export const CreateAccessTokenResponse = z.object({
  accessKey: z.string().optional(),
  token: AccessToken.optional(),
});

export type WorkflowLaunchRequest = z.infer<typeof WorkflowLaunchRequest>;
export const WorkflowLaunchRequest = z.object({
  id: z.string().optional(),
  computeEnvId: z.string().optional(),
  runName: z.string().optional(),
  pipeline: z.string().optional(),
  workDir: z.string().optional(),
  revision: z.string().optional(),
  sessionId: z.string().optional(),
  configProfiles: z.array(z.string()).optional(),
  userSecrets: z.array(z.string()).optional(),
  workspaceSecrets: z.array(z.string()).optional(),
  configText: z.string().optional(),
  towerConfig: z.string().optional(),
  paramsText: z.string().optional(),
  preRunScript: z.string().optional(),
  postRunScript: z.string().optional(),
  mainScript: z.string().optional(),
  entryName: z.string().optional(),
  schemaName: z.string().optional(),
  resume: z.boolean().optional(),
  pullLatest: z.boolean().optional(),
  stubRun: z.boolean().optional(),
  optimizationId: z.string().optional(),
  optimizationTargets: z.string().optional(),
  labelIds: z.array(z.number()).optional(),
  headJobCpus: z.number().optional(),
  headJobMemoryMb: z.number().optional(),
  dateCreated: z.string().optional(),
});

export type CreateActionRequest = z.infer<typeof CreateActionRequest>;
export const CreateActionRequest = z.object({
  name: z.string().optional(),
  source: Action_Source.optional(),
  launch: WorkflowLaunchRequest.optional(),
});

export type CreateActionResponse = z.infer<typeof CreateActionResponse>;
export const CreateActionResponse = z.object({
  actionId: z.string().optional(),
});

export type CreateAvatarResponse = z.infer<typeof CreateAvatarResponse>;
export const CreateAvatarResponse = z.object({
  avatar: Avatar.optional(),
  url: z.string().optional(),
});

export type CreateComputeEnvRequest = z.infer<typeof CreateComputeEnvRequest>;
export const CreateComputeEnvRequest = z.object({
  computeEnv: ComputeEnv_ComputeConfig_.optional(),
  labelIds: z.array(z.number()).optional(),
});

export type CreateComputeEnvResponse = z.infer<typeof CreateComputeEnvResponse>;
export const CreateComputeEnvResponse = z.object({
  computeEnvId: z.string().optional(),
});

export type GoogleSecurityKeys = z.infer<typeof GoogleSecurityKeys>;
export const GoogleSecurityKeys = z.object({
  discriminator: z.string().optional(),
  data: z.string().optional(),
});

export type GitHubSecurityKeys = z.infer<typeof GitHubSecurityKeys>;
export const GitHubSecurityKeys = z.object({
  discriminator: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
});

export type GitLabSecurityKeys = z.infer<typeof GitLabSecurityKeys>;
export const GitLabSecurityKeys = z.object({
  discriminator: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  token: z.string().optional(),
});

export type GiteaSecurityKeys = z.infer<typeof GiteaSecurityKeys>;
export const GiteaSecurityKeys = z.object({
  discriminator: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
});

export type SSHSecurityKeys = z.infer<typeof SSHSecurityKeys>;
export const SSHSecurityKeys = z.object({
  discriminator: z.string().optional(),
  privateKey: z.string().optional(),
  passphrase: z.string().optional(),
});

export type K8sSecurityKeys = z.infer<typeof K8sSecurityKeys>;
export const K8sSecurityKeys = z.object({
  discriminator: z.string().optional(),
  certificate: z.string().optional(),
  privateKey: z.string().optional(),
  token: z.string().optional(),
});

export type SecurityKeys = z.infer<typeof SecurityKeys>;
export const SecurityKeys = z.union([
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

export type Credentials = z.infer<typeof Credentials>;
export const Credentials = z.object({
  id: z.union([z.string(), z.undefined()]).optional(),
  name: z.string(),
  description: z.union([z.string(), z.undefined()]).optional(),
  provider: z.union([
    z.literal('aws'),
    z.literal('azure'),
    z.literal('google'),
    z.literal('github'),
    z.literal('gitlab'),
    z.literal('bitbucket'),
    z.literal('ssh'),
    z.literal('k8s'),
    z.literal('container-reg'),
    z.literal('tw-agent'),
    z.literal('codecommit'),
    z.literal('gitea'),
    z.literal('azurerepos'),
  ]),
  baseUrl: z.union([z.string(), z.undefined()]).optional(),
  category: z.union([z.string(), z.undefined()]).optional(),
  deleted: z.union([z.boolean(), z.undefined()]).optional(),
  lastUsed: z.union([z.string(), z.undefined()]).optional(),
  dateCreated: z.union([z.string(), z.undefined()]).optional(),
  lastUpdated: z.union([z.string(), z.undefined()]).optional(),
  keys: z.union([SecurityKeys, z.undefined()]).optional(),
});

export type CreateCredentialsRequest = z.infer<typeof CreateCredentialsRequest>;
export const CreateCredentialsRequest = z.object({
  credentials: Credentials.optional(),
});

export type CreateCredentialsResponse = z.infer<typeof CreateCredentialsResponse>;
export const CreateCredentialsResponse = z.object({
  credentialsId: z.string().optional(),
});

export type CreateDatasetRequest = z.infer<typeof CreateDatasetRequest>;
export const CreateDatasetRequest = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

export type Dataset = z.infer<typeof Dataset>;
export const Dataset = z.object({
  id: z.union([z.string(), z.undefined()]).optional(),
  name: z.string(),
  description: z.union([z.string(), z.undefined()]).optional(),
  mediaType: z.union([z.string(), z.undefined()]).optional(),
  deleted: z.union([z.boolean(), z.undefined()]).optional(),
  dateCreated: z.union([z.string(), z.undefined()]).optional(),
  lastUpdated: z.union([z.string(), z.undefined()]).optional(),
});

export type CreateDatasetResponse = z.infer<typeof CreateDatasetResponse>;
export const CreateDatasetResponse = z.object({
  dataset: Dataset.optional(),
});

export type CreateLabelRequest = z.infer<typeof CreateLabelRequest>;
export const CreateLabelRequest = z.object({
  name: z.string().optional(),
  value: z.string().optional(),
  resource: z.boolean().optional(),
  isDefault: z.boolean().optional(),
});

export type CreateLabelResponse = z.infer<typeof CreateLabelResponse>;
export const CreateLabelResponse = z.object({
  id: z.number().optional(),
  name: z.string().optional(),
  value: z.string().optional(),
  resource: z.boolean().optional(),
  isDefault: z.boolean().optional(),
});

export type Organization = z.infer<typeof Organization>;
export const Organization = z.object({
  id: z.union([z.number(), z.null(), z.undefined()]).optional(),
  name: z.string(),
  fullName: z.string(),
  description: z.union([z.string(), z.undefined()]).optional(),
  location: z.union([z.string(), z.undefined()]).optional(),
  website: z.union([z.string(), z.undefined()]).optional(),
  dateCreated: z.union([z.string(), z.undefined()]).optional(),
  lastUpdated: z.union([z.string(), z.undefined()]).optional(),
});

export type CreateOrganizationRequest = z.infer<typeof CreateOrganizationRequest>;
export const CreateOrganizationRequest = z.object({
  organization: Organization.optional(),
  logoId: z.string().optional(),
});

export type OrganizationDbDto = z.infer<typeof OrganizationDbDto>;
export const OrganizationDbDto = z.object({
  orgId: z.number().optional(),
  name: z.string().optional(),
  fullName: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  website: z.string().optional(),
  logoId: z.string().optional(),
  logoUrl: z.string().optional(),
  memberId: z.number().optional(),
  memberRole: OrgRole.optional(),
  paying: z.boolean().optional(),
});

export type CreateOrganizationResponse = z.infer<typeof CreateOrganizationResponse>;
export const CreateOrganizationResponse = z.object({
  organization: OrganizationDbDto.optional(),
});

export type CreatePipelineRequest = z.infer<typeof CreatePipelineRequest>;
export const CreatePipelineRequest = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  launch: WorkflowLaunchRequest.optional(),
  labelIds: z.array(z.number()).optional(),
});

export type PipelineOptimizationStatus = z.infer<typeof PipelineOptimizationStatus>;
export const PipelineOptimizationStatus = z.union([
  z.literal('OPTIMIZED'),
  z.literal('OPTIMIZABLE'),
  z.literal('UNAVAILABLE'),
]);

export type PipelineDbDto = z.infer<typeof PipelineDbDto>;
export const PipelineDbDto = z.object({
  pipelineId: z.number().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  repository: z.string().optional(),
  userId: z.number().optional(),
  userName: z.string().optional(),
  userFirstName: z.string().optional(),
  userLastName: z.string().optional(),
  orgId: z.number().optional(),
  orgName: z.string().optional(),
  workspaceId: z.number().optional(),
  workspaceName: z.string().optional(),
  visibility: z.string().optional(),
  deleted: z.boolean().optional(),
  lastUpdated: z.string().optional(),
  optimizationId: z.string().optional(),
  optimizationTargets: z.string().optional(),
  optimizationStatus: PipelineOptimizationStatus.optional(),
  labels: z.array(LabelDbDto).optional(),
  computeEnv: ComputeEnvDbDto.optional(),
});

export type CreatePipelineResponse = z.infer<typeof CreatePipelineResponse>;
export const CreatePipelineResponse = z.object({
  pipeline: PipelineDbDto.optional(),
});

export type CreatePipelineSecretRequest = z.infer<typeof CreatePipelineSecretRequest>;
export const CreatePipelineSecretRequest = z.object({
  name: z.string().optional(),
  value: z.string().optional(),
});

export type CreatePipelineSecretResponse = z.infer<typeof CreatePipelineSecretResponse>;
export const CreatePipelineSecretResponse = z.object({
  secretId: z.number().optional(),
});

export type CreateTeamMemberRequest = z.infer<typeof CreateTeamMemberRequest>;
export const CreateTeamMemberRequest = z.object({
  userNameOrEmail: z.string().optional(),
});

export type Team = z.infer<typeof Team>;
export const Team = z.object({
  id: z.union([z.number(), z.null(), z.undefined()]).optional(),
  name: z.string(),
  description: z.union([z.string(), z.undefined()]).optional(),
  dateCreated: z.union([z.string(), z.undefined()]).optional(),
  lastUpdated: z.union([z.string(), z.undefined()]).optional(),
});

export type CreateTeamRequest = z.infer<typeof CreateTeamRequest>;
export const CreateTeamRequest = z.object({
  team: Team.optional(),
  avatarId: z.string().optional(),
});

export type TeamDbDto = z.infer<typeof TeamDbDto>;
export const TeamDbDto = z.object({
  teamId: z.number().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  avatarUrl: z.string().optional(),
  membersCount: z.number().optional(),
});

export type CreateTeamResponse = z.infer<typeof CreateTeamResponse>;
export const CreateTeamResponse = z.object({
  team: TeamDbDto.optional(),
});

export type CreateWorkflowStarResponse = z.infer<typeof CreateWorkflowStarResponse>;
export const CreateWorkflowStarResponse = z.object({
  workflowId: z.string().optional(),
});

export type Visibility = z.infer<typeof Visibility>;
export const Visibility = z.union([z.literal('PRIVATE'), z.literal('SHARED')]);

export type Workspace = z.infer<typeof Workspace>;
export const Workspace = z.object({
  id: z.union([z.number(), z.null(), z.undefined()]).optional(),
  name: z.string(),
  fullName: z.string(),
  description: z.union([z.string(), z.undefined()]).optional(),
  visibility: Visibility,
  dateCreated: z.union([z.string(), z.undefined()]).optional(),
  lastUpdated: z.union([z.string(), z.undefined()]).optional(),
});

export type CreateWorkspaceRequest = z.infer<typeof CreateWorkspaceRequest>;
export const CreateWorkspaceRequest = z.object({
  workspace: Workspace.optional(),
});

export type CreateWorkspaceResponse = z.infer<typeof CreateWorkspaceResponse>;
export const CreateWorkspaceResponse = z.object({
  workspace: Workspace.optional(),
});

export type DataLink_Status = z.infer<typeof DataLink_Status>;
export const DataLink_Status = z.union([z.literal('VALID'), z.literal('INVALID')]);

export type DataLinkItemType = z.infer<typeof DataLinkItemType>;
export const DataLinkItemType = z.union([z.literal('FOLDER'), z.literal('FILE')]);

export type DataLinkItem = z.infer<typeof DataLinkItem>;
export const DataLinkItem = z.object({
  type: DataLinkItemType.optional(),
  name: z.string().optional(),
  size: z.number().optional(),
  mimeType: z.string().optional(),
});

export type DataLinkContentResponse = z.infer<typeof DataLinkContentResponse>;
export const DataLinkContentResponse = z.object({
  originalPath: z.string().optional(),
  objects: z.array(DataLinkItem).optional(),
  nextPageToken: z.string().optional(),
});

export type DataLinkType = z.infer<typeof DataLinkType>;
export const DataLinkType = z.literal('bucket');

export type DataLinkProvider = z.infer<typeof DataLinkProvider>;
export const DataLinkProvider = z.union([z.literal('aws'), z.literal('google'), z.literal('azure')]);

export type DataLinkCreateRequest = z.infer<typeof DataLinkCreateRequest>;
export const DataLinkCreateRequest = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  type: DataLinkType.optional(),
  provider: DataLinkProvider.optional(),
  resourceRef: z.string().optional(),
  publicAccessible: z.boolean().optional(),
  credentialsId: z.string().optional(),
});

export type DataLinkCredentials = z.infer<typeof DataLinkCredentials>;
export const DataLinkCredentials = z.object({
  id: z.string(),
  name: z.string(),
  provider: DataLinkProvider,
});

export type DataLinkDto = z.infer<typeof DataLinkDto>;
export const DataLinkDto = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  resourceRef: z.string().optional(),
  type: DataLinkType.optional(),
  provider: DataLinkProvider.optional(),
  region: z.string().optional(),
  credentials: z.array(DataLinkCredentials).optional(),
  publicAccessible: z.boolean().optional(),
  hidden: z.boolean().optional(),
  status: z.intersection(DataLink_Status, z.string()).optional(),
  message: z.string().optional(),
});

export type DataLinkResponse = z.infer<typeof DataLinkResponse>;
export const DataLinkResponse = z.object({
  dataLink: DataLinkDto.optional(),
});

export type DataLinkUpdateRequest = z.infer<typeof DataLinkUpdateRequest>;
export const DataLinkUpdateRequest = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  credentialsId: z.string().optional(),
});

export type DataLinksListResponse = z.infer<typeof DataLinksListResponse>;
export const DataLinksListResponse = z.object({
  dataLinks: z.array(DataLinkDto).optional(),
  totalSize: z.number().optional(),
});

export type DatasetVersionDbDto = z.infer<typeof DatasetVersionDbDto>;
export const DatasetVersionDbDto = z.object({
  datasetId: z.string().optional(),
  datasetName: z.string().optional(),
  datasetDescription: z.string().optional(),
  hasHeader: z.boolean().optional(),
  version: z.number().optional(),
  lastUpdated: z.string().optional(),
  fileName: z.string().optional(),
  mediaType: z.string().optional(),
  url: z.string().optional(),
});

export type DeleteCredentialsConflictResponse_Conflict = z.infer<typeof DeleteCredentialsConflictResponse_Conflict>;
export const DeleteCredentialsConflictResponse_Conflict = z.object({
  type: z.string().optional(),
  id: z.string().optional(),
  name: z.string().optional(),
  url: z.string().optional(),
});

export type DeleteCredentialsConflictResponse = z.infer<typeof DeleteCredentialsConflictResponse>;
export const DeleteCredentialsConflictResponse = z.object({
  credentialsId: z.string().optional(),
  conflicts: z.array(DeleteCredentialsConflictResponse_Conflict).optional(),
});

export type DeleteWorkflowsRequest = z.infer<typeof DeleteWorkflowsRequest>;
export const DeleteWorkflowsRequest = z.object({
  workflowIds: z.array(z.string()).optional(),
});

export type DeleteWorkflowsResponse = z.infer<typeof DeleteWorkflowsResponse>;
export const DeleteWorkflowsResponse = z.object({
  failedWorkflowIds: z.array(z.string()).optional(),
});

export type DescribeActionResponse = z.infer<typeof DescribeActionResponse>;
export const DescribeActionResponse = z.object({
  action: ActionResponseDto.optional(),
});

export type DescribeComputeEnvResponse = z.infer<typeof DescribeComputeEnvResponse>;
export const DescribeComputeEnvResponse = z.object({
  computeEnv: ComputeEnvResponseDto.optional(),
});

export type DescribeCredentialsResponse = z.infer<typeof DescribeCredentialsResponse>;
export const DescribeCredentialsResponse = z.object({
  credentials: Credentials.optional(),
});

export type DescribeDatasetResponse = z.infer<typeof DescribeDatasetResponse>;
export const DescribeDatasetResponse = z.object({
  dataset: Dataset.optional(),
});

export type DescribeLaunchResponse = z.infer<typeof DescribeLaunchResponse>;
export const DescribeLaunchResponse = z.object({
  launch: Launch.optional(),
});

export type DescribeOrganizationResponse = z.infer<typeof DescribeOrganizationResponse>;
export const DescribeOrganizationResponse = z.object({
  organization: OrganizationDbDto.optional(),
});

export type WfManifest = z.infer<typeof WfManifest>;
export const WfManifest = z.object({
  nextflowVersion: z.string().optional(),
  defaultBranch: z.string().optional(),
  version: z.string().optional(),
  homePage: z.string().optional(),
  gitmodules: z.string().optional(),
  description: z.string().optional(),
  name: z.string().optional(),
  mainScript: z.string().optional(),
  author: z.string().optional(),
});

export type PipelineInfo = z.infer<typeof PipelineInfo>;
export const PipelineInfo = z.object({
  projectName: z.string().optional(),
  simpleName: z.string().optional(),
  repositoryUrl: z.string().optional(),
  cloneUrl: z.string().optional(),
  provider: z.string().optional(),
  configFiles: z.array(z.string()).optional(),
  workDirs: z.array(z.string()).optional(),
  revisions: z.array(z.string()).optional(),
  profiles: z.array(z.string()).optional(),
  manifest: WfManifest.optional(),
  warnings: z.array(z.string()).optional(),
});

export type DescribePipelineInfoResponse = z.infer<typeof DescribePipelineInfoResponse>;
export const DescribePipelineInfoResponse = z.object({
  pipelineInfo: PipelineInfo.optional(),
});

export type DescribePipelineResponse = z.infer<typeof DescribePipelineResponse>;
export const DescribePipelineResponse = z.object({
  pipeline: PipelineDbDto.optional(),
});

export type PipelineSecret = z.infer<typeof PipelineSecret>;
export const PipelineSecret = z.object({
  id: z.union([z.number(), z.null(), z.undefined()]).optional(),
  name: z.string(),
  lastUsed: z.union([z.string(), z.undefined()]).optional(),
  dateCreated: z.union([z.string(), z.undefined()]).optional(),
  lastUpdated: z.union([z.string(), z.undefined()]).optional(),
});

export type DescribePipelineSecretResponse = z.infer<typeof DescribePipelineSecretResponse>;
export const DescribePipelineSecretResponse = z.object({
  pipelineSecret: PipelineSecret.optional(),
});

export type GooglePlatformMetainfo_Bucket = z.infer<typeof GooglePlatformMetainfo_Bucket>;
export const GooglePlatformMetainfo_Bucket = z.object({
  path: z.string().optional(),
});

export type GooglePlatformMetainfo_Filestore = z.infer<typeof GooglePlatformMetainfo_Filestore>;
export const GooglePlatformMetainfo_Filestore = z.object({
  target: z.string().optional(),
  name: z.string().optional(),
  location: z.string().optional(),
});

export type GooglePlatformMetainfo = z.infer<typeof GooglePlatformMetainfo>;
export const GooglePlatformMetainfo = z.object({
  locations: z.array(z.string()).optional(),
  warnings: z.array(z.string()).optional(),
  zones: z.array(z.string()).optional(),
  buckets: z.array(GooglePlatformMetainfo_Bucket).optional(),
  filestores: z.array(GooglePlatformMetainfo_Filestore).optional(),
});

export type PlatformMetainfo = z.infer<typeof PlatformMetainfo>;
export const PlatformMetainfo = z.union([AwsBatchPlatformMetainfo, GooglePlatformMetainfo]);

export type DescribePlatformResponse = z.infer<typeof DescribePlatformResponse>;
export const DescribePlatformResponse = z.object({
  metainfo: PlatformMetainfo.optional(),
});

export type TaskStatus = z.infer<typeof TaskStatus>;
export const TaskStatus = z.union([
  z.literal('NEW'),
  z.literal('SUBMITTED'),
  z.literal('RUNNING'),
  z.literal('CACHED'),
  z.literal('COMPLETED'),
  z.literal('FAILED'),
  z.literal('ABORTED'),
]);

export type Task = z.infer<typeof Task>;
export const Task = z.object({
  hash: z.union([z.string(), z.undefined()]).optional(),
  name: z.union([z.string(), z.undefined()]).optional(),
  process: z.union([z.string(), z.undefined()]).optional(),
  tag: z.union([z.string(), z.undefined()]).optional(),
  submit: z.union([z.string(), z.undefined()]).optional(),
  start: z.union([z.string(), z.undefined()]).optional(),
  complete: z.union([z.string(), z.undefined()]).optional(),
  module: z.union([z.array(z.string()), z.undefined()]).optional(),
  container: z.union([z.string(), z.undefined()]).optional(),
  attempt: z.union([z.number(), z.undefined()]).optional(),
  script: z.union([z.string(), z.undefined()]).optional(),
  scratch: z.union([z.string(), z.undefined()]).optional(),
  workdir: z.union([z.string(), z.undefined()]).optional(),
  queue: z.union([z.string(), z.undefined()]).optional(),
  cpus: z.union([z.number(), z.undefined()]).optional(),
  memory: z.union([z.number(), z.undefined()]).optional(),
  disk: z.union([z.number(), z.undefined()]).optional(),
  time: z.union([z.number(), z.undefined()]).optional(),
  env: z.union([z.string(), z.undefined()]).optional(),
  executor: z.union([z.string(), z.undefined()]).optional(),
  machineType: z.union([z.string(), z.undefined()]).optional(),
  cloudZone: z.union([z.string(), z.undefined()]).optional(),
  priceModel: z.union([CloudPriceModel, z.undefined()]).optional(),
  cost: z.union([z.number(), z.undefined()]).optional(),
  errorAction: z.union([z.string(), z.undefined()]).optional(),
  exitStatus: z.union([z.number(), z.undefined()]).optional(),
  duration: z.union([z.number(), z.undefined()]).optional(),
  realtime: z.union([z.number(), z.undefined()]).optional(),
  nativeId: z.union([z.string(), z.undefined()]).optional(),
  pcpu: z.union([z.number(), z.undefined()]).optional(),
  pmem: z.union([z.number(), z.undefined()]).optional(),
  rss: z.union([z.number(), z.undefined()]).optional(),
  vmem: z.union([z.number(), z.undefined()]).optional(),
  peakRss: z.union([z.number(), z.undefined()]).optional(),
  peakVmem: z.union([z.number(), z.undefined()]).optional(),
  rchar: z.union([z.number(), z.undefined()]).optional(),
  wchar: z.union([z.number(), z.undefined()]).optional(),
  syscr: z.union([z.number(), z.undefined()]).optional(),
  syscw: z.union([z.number(), z.undefined()]).optional(),
  readBytes: z.union([z.number(), z.undefined()]).optional(),
  writeBytes: z.union([z.number(), z.undefined()]).optional(),
  volCtxt: z.union([z.number(), z.undefined()]).optional(),
  invCtxt: z.union([z.number(), z.undefined()]).optional(),
  exit: z.union([z.number(), z.undefined()]).optional(),
  id: z.union([z.number(), z.null(), z.undefined()]).optional(),
  taskId: z.number(),
  status: TaskStatus,
  dateCreated: z.union([z.string(), z.null(), z.undefined()]).optional(),
  lastUpdated: z.union([z.string(), z.null(), z.undefined()]).optional(),
});

export type DescribeTaskResponse = z.infer<typeof DescribeTaskResponse>;
export const DescribeTaskResponse = z.object({
  task: Task.optional(),
});

export type DescribeTeamResponse = z.infer<typeof DescribeTeamResponse>;
export const DescribeTeamResponse = z.object({
  team: TeamDbDto.optional(),
});

export type UserDbDto = z.infer<typeof UserDbDto>;
export const UserDbDto = z.object({
  id: z.union([z.number(), z.undefined()]).optional(),
  userName: z.string(),
  email: z.string(),
  firstName: z.union([z.string(), z.undefined()]).optional(),
  lastName: z.union([z.string(), z.undefined()]).optional(),
  organization: z.union([z.string(), z.undefined()]).optional(),
  description: z.union([z.string(), z.undefined()]).optional(),
  avatar: z.union([z.string(), z.undefined()]).optional(),
  avatarId: z.union([z.string(), z.undefined()]).optional(),
  notification: z.union([z.boolean(), z.undefined()]).optional(),
  termsOfUseConsent: z.union([z.boolean(), z.undefined()]).optional(),
  marketingConsent: z.union([z.boolean(), z.undefined()]).optional(),
  lastAccess: z.union([z.string(), z.undefined()]).optional(),
  dateCreated: z.union([z.string(), z.undefined()]).optional(),
  lastUpdated: z.union([z.string(), z.undefined()]).optional(),
  deleted: z.union([z.boolean(), z.undefined()]).optional(),
});

export type DescribeUserResponse = z.infer<typeof DescribeUserResponse>;
export const DescribeUserResponse = z.object({
  user: UserDbDto.optional(),
  needConsent: z.boolean().optional(),
  defaultWorkspaceId: z.number().optional(),
});

export type WorkflowLaunchResponse = z.infer<typeof WorkflowLaunchResponse>;
export const WorkflowLaunchResponse = z.object({
  id: z.string().optional(),
  computeEnv: ComputeEnv_ComputeConfig_.optional(),
  pipeline: z.string().optional(),
  pipelineId: z.number().optional(),
  workDir: z.string().optional(),
  revision: z.string().optional(),
  sessionId: z.string().optional(),
  configProfiles: z.array(z.string()).optional(),
  userSecrets: z.array(z.string()).optional(),
  workspaceSecrets: z.array(z.string()).optional(),
  configText: z.string().optional(),
  towerConfig: z.string().optional(),
  paramsText: z.string().optional(),
  preRunScript: z.string().optional(),
  postRunScript: z.string().optional(),
  mainScript: z.string().optional(),
  entryName: z.string().optional(),
  schemaName: z.string().optional(),
  resume: z.boolean().optional(),
  pullLatest: z.boolean().optional(),
  stubRun: z.boolean().optional(),
  resumeDir: z.string().optional(),
  resumeCommitId: z.string().optional(),
  headJobMemoryMb: z.number().optional(),
  headJobCpus: z.number().optional(),
  optimizationId: z.string().optional(),
  optimizationTargets: z.string().optional(),
  dateCreated: z.string().optional(),
});

export type DescribeWorkflowLaunchResponse = z.infer<typeof DescribeWorkflowLaunchResponse>;
export const DescribeWorkflowLaunchResponse = z.object({
  launch: WorkflowLaunchResponse.optional(),
});

export type WorkflowStatus = z.infer<typeof WorkflowStatus>;
export const WorkflowStatus = z.union([
  z.literal('SUBMITTED'),
  z.literal('RUNNING'),
  z.literal('SUCCEEDED'),
  z.literal('FAILED'),
  z.literal('CANCELLED'),
  z.literal('UNKNOWN'),
]);

export type WfNextflow = z.infer<typeof WfNextflow>;
export const WfNextflow = z.object({
  version: z.string().optional(),
  build: z.string().optional(),
  timestamp: z.string().optional(),
});

export type WfStats = z.infer<typeof WfStats>;
export const WfStats = z.object({
  computeTimeFmt: z.string().optional(),
  cachedCount: z.number().optional(),
  failedCount: z.number().optional(),
  ignoredCount: z.number().optional(),
  succeedCount: z.number().optional(),
  cachedCountFmt: z.string().optional(),
  succeedCountFmt: z.string().optional(),
  failedCountFmt: z.string().optional(),
  ignoredCountFmt: z.string().optional(),
  cachedPct: z.number().optional(),
  failedPct: z.number().optional(),
  succeedPct: z.number().optional(),
  ignoredPct: z.number().optional(),
  cachedDuration: z.number().optional(),
  failedDuration: z.number().optional(),
  succeedDuration: z.number().optional(),
});

export type Workflow = z.infer<typeof Workflow>;
export const Workflow = z.object({
  status: z.union([WorkflowStatus, z.undefined()]).optional(),
  ownerId: z.union([z.number(), z.undefined()]).optional(),
  repository: z.union([z.string(), z.undefined()]).optional(),
  id: z.union([z.string(), z.undefined()]).optional(),
  submit: z.string(),
  start: z.union([z.string(), z.undefined()]).optional(),
  complete: z.union([z.string(), z.undefined()]).optional(),
  dateCreated: z.union([z.string(), z.null(), z.undefined()]).optional(),
  lastUpdated: z.union([z.string(), z.null(), z.undefined()]).optional(),
  runName: z.string(),
  sessionId: z.string(),
  profile: z.union([z.string(), z.undefined()]).optional(),
  workDir: z.string(),
  commitId: z.union([z.string(), z.undefined()]).optional(),
  userName: z.string(),
  scriptId: z.union([z.string(), z.undefined()]).optional(),
  revision: z.union([z.string(), z.undefined()]).optional(),
  commandLine: z.string(),
  projectName: z.string(),
  scriptName: z.union([z.string(), z.undefined()]).optional(),
  launchId: z.union([z.string(), z.undefined()]).optional(),
  configFiles: z.union([z.array(z.string()), z.undefined()]).optional(),
  params: z.union([z.unknown(), z.undefined()]).optional(),
  configText: z.union([z.string(), z.undefined()]).optional(),
  manifest: z.union([WfManifest, z.undefined()]).optional(),
  nextflow: z.union([WfNextflow, z.undefined()]).optional(),
  stats: z.union([WfStats, z.undefined()]).optional(),
  errorMessage: z.union([z.string(), z.undefined()]).optional(),
  errorReport: z.union([z.string(), z.undefined()]).optional(),
  deleted: z.union([z.boolean(), z.undefined()]).optional(),
  projectDir: z.union([z.string(), z.undefined()]).optional(),
  homeDir: z.union([z.string(), z.undefined()]).optional(),
  container: z.union([z.string(), z.undefined()]).optional(),
  containerEngine: z.union([z.string(), z.undefined()]).optional(),
  scriptFile: z.union([z.string(), z.undefined()]).optional(),
  launchDir: z.union([z.string(), z.undefined()]).optional(),
  duration: z.union([z.number(), z.undefined()]).optional(),
  exitStatus: z.union([z.number(), z.undefined()]).optional(),
  resume: z.union([z.boolean(), z.undefined()]).optional(),
  success: z.union([z.boolean(), z.undefined()]).optional(),
  logFile: z.union([z.string(), z.undefined()]).optional(),
  outFile: z.union([z.string(), z.undefined()]).optional(),
  operationId: z.union([z.string(), z.undefined()]).optional(),
});

export type WorkflowLoad = z.infer<typeof WorkflowLoad>;
export const WorkflowLoad = z.object({
  pending: z.number(),
  submitted: z.number(),
  running: z.number(),
  succeeded: z.number(),
  failed: z.number(),
  cached: z.number(),
  memoryEfficiency: z.union([z.number(), z.undefined()]).optional(),
  cpuEfficiency: z.union([z.number(), z.undefined()]).optional(),
  cpus: z.number(),
  cpuTime: z.number(),
  cpuLoad: z.number(),
  memoryRss: z.number(),
  memoryReq: z.number(),
  readBytes: z.number(),
  writeBytes: z.number(),
  volCtxSwitch: z.number(),
  invCtxSwitch: z.number(),
  cost: z.union([z.number(), z.undefined()]).optional(),
  loadTasks: z.number(),
  loadCpus: z.number(),
  loadMemory: z.number(),
  peakCpus: z.number(),
  peakTasks: z.number(),
  peakMemory: z.number(),
  executors: z.union([z.array(z.string()), z.undefined()]).optional(),
  dateCreated: z.union([z.string(), z.undefined()]).optional(),
  lastUpdated: z.union([z.string(), z.undefined()]).optional(),
});

export type ProcessLoad = z.infer<typeof ProcessLoad>;
export const ProcessLoad = z.object({
  pending: z.number(),
  submitted: z.number(),
  running: z.number(),
  succeeded: z.number(),
  failed: z.number(),
  cached: z.number(),
  memoryEfficiency: z.union([z.number(), z.undefined()]).optional(),
  cpuEfficiency: z.union([z.number(), z.undefined()]).optional(),
  process: z.string(),
  cpus: z.number(),
  cpuTime: z.number(),
  cpuLoad: z.number(),
  memoryRss: z.number(),
  memoryReq: z.number(),
  readBytes: z.number(),
  writeBytes: z.number(),
  volCtxSwitch: z.number(),
  invCtxSwitch: z.number(),
  loadTasks: z.number(),
  loadCpus: z.number(),
  loadMemory: z.number(),
  peakCpus: z.number(),
  peakTasks: z.number(),
  peakMemory: z.number(),
  dateCreated: z.union([z.string(), z.undefined()]).optional(),
  lastUpdated: z.union([z.string(), z.undefined()]).optional(),
});

export type ProgressData = z.infer<typeof ProgressData>;
export const ProgressData = z.object({
  workflowProgress: WorkflowLoad.optional(),
  processesProgress: z.array(ProcessLoad).optional(),
});

export type JobInfoDto = z.infer<typeof JobInfoDto>;
export const JobInfoDto = z.object({
  id: z.number().optional(),
  operationId: z.string().optional(),
  message: z.string().optional(),
  status: z.string().optional(),
  exitCode: z.number().optional(),
});

export type DescribeWorkflowResponse = z.infer<typeof DescribeWorkflowResponse>;
export const DescribeWorkflowResponse = z.object({
  workflow: Workflow.optional(),
  progress: ProgressData.optional(),
  platform: ComputePlatformDto.optional(),
  jobInfo: JobInfoDto.optional(),
  orgId: z.number().optional(),
  orgName: z.string().optional(),
  workspaceId: z.number().optional(),
  workspaceName: z.string().optional(),
  labels: z.array(LabelDbDto).optional(),
  optimized: z.boolean().optional(),
});

export type DescribeWorkspaceResponse = z.infer<typeof DescribeWorkspaceResponse>;
export const DescribeWorkspaceResponse = z.object({
  workspace: Workspace.optional(),
});

export type EmptyBodyRequest = z.infer<typeof EmptyBodyRequest>;
export const EmptyBodyRequest = z.unknown();

export type ErrorResponse = z.infer<typeof ErrorResponse>;
export const ErrorResponse = z.object({
  message: z.string(),
});

export type EventType = z.infer<typeof EventType>;
export const EventType = z.object({
  source: z.string().optional(),
  display: z.string().optional(),
  description: z.string().optional(),
  enabled: z.boolean().optional(),
});

export type GetProgressResponse = z.infer<typeof GetProgressResponse>;
export const GetProgressResponse = z.object({
  progress: ProgressData.optional(),
});

export type ResourceData = z.infer<typeof ResourceData>;
export const ResourceData = z.object({
  warnings: z.array(z.string()).optional(),
  mean: z.number().optional(),
  min: z.number().optional(),
  q1: z.number().optional(),
  q2: z.number().optional(),
  q3: z.number().optional(),
  max: z.number().optional(),
  minLabel: z.string().optional(),
  maxLabel: z.string().optional(),
  q1Label: z.string().optional(),
  q2Label: z.string().optional(),
  q3Label: z.string().optional(),
});

export type WorkflowMetrics = z.infer<typeof WorkflowMetrics>;
export const WorkflowMetrics = z.object({
  id: z.union([z.number(), z.null(), z.undefined()]).optional(),
  process: z.string(),
  cpu: z.union([ResourceData, z.undefined()]).optional(),
  mem: z.union([ResourceData, z.undefined()]).optional(),
  vmem: z.union([ResourceData, z.undefined()]).optional(),
  time: z.union([ResourceData, z.undefined()]).optional(),
  reads: z.union([ResourceData, z.undefined()]).optional(),
  writes: z.union([ResourceData, z.undefined()]).optional(),
  cpuUsage: z.union([ResourceData, z.undefined()]).optional(),
  memUsage: z.union([ResourceData, z.undefined()]).optional(),
  timeUsage: z.union([ResourceData, z.undefined()]).optional(),
});

export type GetWorkflowMetricsResponse = z.infer<typeof GetWorkflowMetricsResponse>;
export const GetWorkflowMetricsResponse = z.object({
  metrics: z.array(WorkflowMetrics).optional(),
});

export type Iterator_String_ = z.infer<typeof Iterator_String_>;
export const Iterator_String_ = z.unknown();

export type LabelType = z.infer<typeof LabelType>;
export const LabelType = z.union([z.literal('simple'), z.literal('resource'), z.literal('all')]);

export type LaunchActionRequest = z.infer<typeof LaunchActionRequest>;
export const LaunchActionRequest = z.object({
  params: z.unknown().optional(),
});

export type LaunchActionResponse = z.infer<typeof LaunchActionResponse>;
export const LaunchActionResponse = z.object({
  workflowId: z.string().optional(),
});

export type ListAccessTokensResponse = z.infer<typeof ListAccessTokensResponse>;
export const ListAccessTokensResponse = z.object({
  tokens: z.array(AccessToken).optional(),
});

export type ListActionsResponse_ActionInfo = z.infer<typeof ListActionsResponse_ActionInfo>;
export const ListActionsResponse_ActionInfo = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  pipeline: z.string().optional(),
  source: Action_Source.optional(),
  status: Action_Status.optional(),
  lastSeen: z.string().optional(),
  dateCreated: z.string().optional(),
  event: Action_EventType.optional(),
  endpoint: z.string().optional(),
  labels: z.array(LabelDbDto).optional(),
  usageCmd: z.string().optional(),
});

export type ListActionsResponse = z.infer<typeof ListActionsResponse>;
export const ListActionsResponse = z.object({
  actions: z.array(ListActionsResponse_ActionInfo).optional(),
});

export type ListComputeEnvsResponse_Entry = z.infer<typeof ListComputeEnvsResponse_Entry>;
export const ListComputeEnvsResponse_Entry = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  platform: z.string().optional(),
  status: ComputeEnv_Status.optional(),
  message: z.string().optional(),
  lastUsed: z.string().optional(),
  primary: z.boolean().optional(),
  workspaceName: z.string().optional(),
  visibility: z.string().optional(),
  workDir: z.string().optional(),
  credentialsId: z.string().optional(),
  region: z.string().optional(),
});

export type ListComputeEnvsResponse = z.infer<typeof ListComputeEnvsResponse>;
export const ListComputeEnvsResponse = z.object({
  computeEnvs: z.array(ListComputeEnvsResponse_Entry).optional(),
});

export type ListCredentialsResponse = z.infer<typeof ListCredentialsResponse>;
export const ListCredentialsResponse = z.object({
  credentials: z.array(Credentials).optional(),
});

export type ListDatasetVersionsResponse = z.infer<typeof ListDatasetVersionsResponse>;
export const ListDatasetVersionsResponse = z.object({
  versions: z.array(DatasetVersionDbDto).optional(),
});

export type ListDatasetsResponse = z.infer<typeof ListDatasetsResponse>;
export const ListDatasetsResponse = z.object({
  datasets: z.array(Dataset).optional(),
});

export type ListEventTypesResponse = z.infer<typeof ListEventTypesResponse>;
export const ListEventTypesResponse = z.object({
  eventTypes: z.array(EventType).optional(),
});

export type ListLabelsResponse = z.infer<typeof ListLabelsResponse>;
export const ListLabelsResponse = z.object({
  labels: z.array(LabelDbDto).optional(),
  totalSize: z.number().optional(),
});

export type ListMembersResponse = z.infer<typeof ListMembersResponse>;
export const ListMembersResponse = z.object({
  members: z.array(MemberDbDto).optional(),
  totalSize: z.number().optional(),
});

export type ListOrganizationsResponse = z.infer<typeof ListOrganizationsResponse>;
export const ListOrganizationsResponse = z.object({
  organizations: z.array(OrganizationDbDto).optional(),
  totalSize: z.number().optional(),
});

export type ListParticipantsResponse = z.infer<typeof ListParticipantsResponse>;
export const ListParticipantsResponse = z.object({
  participants: z.array(ParticipantDbDto).optional(),
  totalSize: z.number().optional(),
});

export type ListPipelineInfoResponse = z.infer<typeof ListPipelineInfoResponse>;
export const ListPipelineInfoResponse = z.object({
  pipelines: z.array(z.string()).optional(),
});

export type ListPipelineSecretsResponse = z.infer<typeof ListPipelineSecretsResponse>;
export const ListPipelineSecretsResponse = z.object({
  pipelineSecrets: z.array(PipelineSecret).optional(),
  totalSize: z.number().optional(),
});

export type ListPipelinesResponse = z.infer<typeof ListPipelinesResponse>;
export const ListPipelinesResponse = z.object({
  pipelines: z.array(PipelineDbDto).optional(),
  totalSize: z.number().optional(),
});

export type ListPlatformsResponse = z.infer<typeof ListPlatformsResponse>;
export const ListPlatformsResponse = z.object({
  platforms: z.array(ComputePlatform).optional(),
});

export type ListRegionsResponse = z.infer<typeof ListRegionsResponse>;
export const ListRegionsResponse = z.object({
  regions: z.array(ComputeRegion).optional(),
});

export type ListTasksResponse = z.infer<typeof ListTasksResponse>;
export const ListTasksResponse = z.object({
  tasks: z.array(DescribeTaskResponse).optional(),
  total: z.number().optional(),
});

export type ListTeamResponse = z.infer<typeof ListTeamResponse>;
export const ListTeamResponse = z.object({
  teams: z.array(TeamDbDto).optional(),
  totalSize: z.number().optional(),
});

export type WorkflowDbDto = z.infer<typeof WorkflowDbDto>;
export const WorkflowDbDto = z.object({
  id: z.string().optional(),
  ownerId: z.number().optional(),
  submit: z.string().optional(),
  start: z.string().optional(),
  complete: z.string().optional(),
  dateCreated: z.string().optional(),
  lastUpdated: z.string().optional(),
  runName: z.string().optional(),
  sessionId: z.string().optional(),
  profile: z.string().optional(),
  workDir: z.string().optional(),
  commitId: z.string().optional(),
  userName: z.string().optional(),
  scriptId: z.string().optional(),
  revision: z.string().optional(),
  commandLine: z.string().optional(),
  projectName: z.string().optional(),
  scriptName: z.string().optional(),
  launchId: z.string().optional(),
  status: WorkflowStatus.optional(),
  configFiles: z.array(z.string()).optional(),
  params: z.unknown().optional(),
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
  repository: z.string().optional(),
  containerEngine: z.string().optional(),
  scriptFile: z.string().optional(),
  launchDir: z.string().optional(),
  duration: z.number().optional(),
  exitStatus: z.number().optional(),
  resume: z.boolean().optional(),
  success: z.boolean().optional(),
});

export type ListWorkflowsResponse_ListWorkflowsElement = z.infer<typeof ListWorkflowsResponse_ListWorkflowsElement>;
export const ListWorkflowsResponse_ListWorkflowsElement = z.object({
  workflow: WorkflowDbDto.optional(),
  progress: ProgressData.optional(),
  orgId: z.number().optional(),
  orgName: z.string().optional(),
  workspaceId: z.number().optional(),
  workspaceName: z.string().optional(),
  labels: z.array(LabelDbDto).optional(),
  starred: z.boolean().optional(),
  optimized: z.boolean().optional(),
});

export type ListWorkflowsResponse = z.infer<typeof ListWorkflowsResponse>;
export const ListWorkflowsResponse = z.object({
  workflows: z.array(ListWorkflowsResponse_ListWorkflowsElement).optional(),
  totalSize: z.number().optional(),
});

export type OrgAndWorkspaceDto = z.infer<typeof OrgAndWorkspaceDto>;
export const OrgAndWorkspaceDto = z.object({
  orgId: z.number().optional(),
  orgName: z.string().optional(),
  orgLogoUrl: z.string().optional(),
  workspaceId: z.number().optional(),
  workspaceName: z.string().optional(),
  workspaceFullName: z.string().optional(),
  visibility: Visibility.optional(),
  roles: z.array(z.string()).optional(),
});

export type ListWorkspacesAndOrgResponse = z.infer<typeof ListWorkspacesAndOrgResponse>;
export const ListWorkspacesAndOrgResponse = z.object({
  orgsAndWorkspaces: z.array(OrgAndWorkspaceDto).optional(),
});

export type WorkspaceDbDto = z.infer<typeof WorkspaceDbDto>;
export const WorkspaceDbDto = z.object({
  id: z.number().optional(),
  name: z.string().optional(),
  fullName: z.string().optional(),
  description: z.string().optional(),
  visibility: Visibility.optional(),
});

export type ListWorkspacesResponse = z.infer<typeof ListWorkspacesResponse>;
export const ListWorkspacesResponse = z.object({
  workspaces: z.array(WorkspaceDbDto).optional(),
});

export type Log = z.infer<typeof Log>;
export const Log = z.object({
  name: z.string().optional(),
  cmd: z.array(z.string()).optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  stdout: z.string().optional(),
  stderr: z.string().optional(),
  exit_code: z.number().optional(),
});

export type LogPage_Download = z.infer<typeof LogPage_Download>;
export const LogPage_Download = z.object({
  saveName: z.string().optional(),
  fileName: z.string().optional(),
  displayText: z.string().optional(),
});

export type LogPage = z.infer<typeof LogPage>;
export const LogPage = z.object({
  truncated: z.boolean().optional(),
  entries: Iterator_String_.optional(),
  rewindToken: z.string().optional(),
  forwardToken: z.string().optional(),
  pending: z.boolean().optional(),
  message: z.string().optional(),
  downloads: z.array(LogPage_Download).optional(),
});

export type MultiRequestFileSchema = z.infer<typeof MultiRequestFileSchema>;
export const MultiRequestFileSchema = z.object({
  file: z.string().optional(),
});

export type NavbarConfig_NavbarMenu = z.infer<typeof NavbarConfig_NavbarMenu>;
export const NavbarConfig_NavbarMenu = z.object({
  label: z.string().optional(),
  url: z.string().optional(),
});

export type NavbarConfig = z.infer<typeof NavbarConfig>;
export const NavbarConfig = z.object({
  menus: z.array(NavbarConfig_NavbarMenu).optional(),
});

export type PipelineQueryAttribute = z.infer<typeof PipelineQueryAttribute>;
export const PipelineQueryAttribute = z.union([z.literal('optimized'), z.literal('labels'), z.literal('computeEnv')]);

export type PipelineSchemaAttributes = z.infer<typeof PipelineSchemaAttributes>;
export const PipelineSchemaAttributes = z.union([z.literal('schema'), z.literal('params')]);

export type PipelineSchemaResponse = z.infer<typeof PipelineSchemaResponse>;
export const PipelineSchemaResponse = z.object({
  schema: z.string(),
  params: z.union([z.string(), z.undefined()]).optional(),
});

export type RandomWorkflowNameResponse = z.infer<typeof RandomWorkflowNameResponse>;
export const RandomWorkflowNameResponse = z.object({
  name: z.string().optional(),
});

export type RunId = z.infer<typeof RunId>;
export const RunId = z.object({
  run_id: z.string().optional(),
});

export type State = z.infer<typeof State>;
export const State = z.union([
  z.literal('UNKNOWN'),
  z.literal('QUEUED'),
  z.literal('INITIALIZING'),
  z.literal('RUNNING'),
  z.literal('PAUSED'),
  z.literal('COMPLETE'),
  z.literal('EXECUTOR_ERROR'),
  z.literal('SYSTEM_ERROR'),
  z.literal('CANCELED'),
  z.literal('CANCELING'),
]);

export type RunStatus = z.infer<typeof RunStatus>;
export const RunStatus = z.object({
  run_id: z.string().optional(),
  state: State.optional(),
});

export type RunListResponse = z.infer<typeof RunListResponse>;
export const RunListResponse = z.object({
  runs: z.array(RunStatus).optional(),
  next_page_token: z.string().optional(),
});

export type RunRequest = z.infer<typeof RunRequest>;
export const RunRequest = z.object({
  workflow_params: z.string().optional(),
  workflow_type: z.string().optional(),
  workflow_type_version: z.string().optional(),
  tags: z.unknown().optional(),
  workflow_engine_parameters: z.unknown().optional(),
  workflow_url: z.string().optional(),
});

export type RunLog = z.infer<typeof RunLog>;
export const RunLog = z.object({
  run_id: z.string().optional(),
  request: RunRequest.optional(),
  state: State.optional(),
  run_log: Log.optional(),
  task_logs: z.array(Log).optional(),
  outputs: z.unknown().optional(),
});

export type ServiceInfo = z.infer<typeof ServiceInfo>;
export const ServiceInfo = z.object({
  version: z.string().optional(),
  apiVersion: z.string().optional(),
  commitId: z.string().optional(),
  authTypes: z.array(z.string()).optional(),
  loginPath: z.string().optional(),
  navbar: NavbarConfig.optional(),
  heartbeatInterval: z.number().optional(),
  userWorkspaceEnabled: z.boolean().optional(),
  allowInstanceCredentials: z.boolean().optional(),
  landingUrl: z.string().optional(),
  termsOfUseUrl: z.string().optional(),
  contentUrl: z.string().optional(),
  analytics: Analytics.optional(),
  allowLocalRepos: z.boolean().optional(),
  contentMaxFileSize: z.number().optional(),
  waveEnabled: z.boolean().optional(),
  groundswellEnabled: z.boolean().optional(),
  groundswellAllowedWorkspaces: z.array(z.number()).optional(),
  waveAllowedWorkspaces: z.array(z.number()).optional(),
  forgePrefix: z.string().optional(),
  seqeraCloud: z.boolean().optional(),
  evalWorkspaceIds: z.array(z.number()).optional(),
  contactEmail: z.string().optional(),
  allowNextflowCliLogs: z.boolean().optional(),
});

export type ServiceInfoResponse = z.infer<typeof ServiceInfoResponse>;
export const ServiceInfoResponse = z.object({
  serviceInfo: ServiceInfo.optional(),
});

export type SubmitWorkflowLaunchRequest = z.infer<typeof SubmitWorkflowLaunchRequest>;
export const SubmitWorkflowLaunchRequest = z.object({
  launch: WorkflowLaunchRequest.optional(),
});

export type SubmitWorkflowLaunchResponse = z.infer<typeof SubmitWorkflowLaunchResponse>;
export const SubmitWorkflowLaunchResponse = z.object({
  workflowId: z.string().optional(),
});

export type TraceBeginRequest = z.infer<typeof TraceBeginRequest>;
export const TraceBeginRequest = z.object({
  launchId: z.string().optional(),
  workflow: Workflow.optional(),
  processNames: z.array(z.string()).optional(),
  towerLaunch: z.boolean().optional(),
});

export type TraceProcessingStatus = z.infer<typeof TraceProcessingStatus>;
export const TraceProcessingStatus = z.union([z.literal('OK'), z.literal('KO')]);

export type TraceBeginResponse = z.infer<typeof TraceBeginResponse>;
export const TraceBeginResponse = z.object({
  status: TraceProcessingStatus.optional(),
  workflowId: z.string().optional(),
  watchUrl: z.string().optional(),
});

export type TraceProgressDetail = z.infer<typeof TraceProgressDetail>;
export const TraceProgressDetail = z.object({
  index: z.number().optional(),
  name: z.string().optional(),
  pending: z.number().optional(),
  submitted: z.number().optional(),
  running: z.number().optional(),
  succeeded: z.number().optional(),
  cached: z.number().optional(),
  failed: z.number().optional(),
  aborted: z.number().optional(),
  stored: z.number().optional(),
  ignored: z.number().optional(),
  retries: z.number().optional(),
  terminated: z.boolean().optional(),
  loadCpus: z.number().optional(),
  loadMemory: z.number().optional(),
  peakRunning: z.number().optional(),
  peakCpus: z.number().optional(),
  peakMemory: z.number().optional(),
});

export type TraceProgressData = z.infer<typeof TraceProgressData>;
export const TraceProgressData = z.object({
  pending: z.number().optional(),
  submitted: z.number().optional(),
  running: z.number().optional(),
  succeeded: z.number().optional(),
  cached: z.number().optional(),
  failed: z.number().optional(),
  aborted: z.number().optional(),
  stored: z.number().optional(),
  ignored: z.number().optional(),
  retries: z.number().optional(),
  loadCpus: z.number().optional(),
  loadMemory: z.number().optional(),
  peakRunning: z.number().optional(),
  peakCpus: z.number().optional(),
  peakMemory: z.number().optional(),
  processes: z.array(TraceProgressDetail).optional(),
});

export type TraceCompleteRequest = z.infer<typeof TraceCompleteRequest>;
export const TraceCompleteRequest = z.object({
  workflow: Workflow.optional(),
  metrics: z.array(WorkflowMetrics).optional(),
  progress: TraceProgressData.optional(),
});

export type TraceCompleteResponse = z.infer<typeof TraceCompleteResponse>;
export const TraceCompleteResponse = z.object({
  status: TraceProcessingStatus.optional(),
  workflowId: z.string().optional(),
});

export type TraceCreateRequest = z.infer<typeof TraceCreateRequest>;
export const TraceCreateRequest = z.object({
  launchId: z.string().optional(),
  sessionId: z.string().optional(),
  runName: z.string().optional(),
  projectName: z.string().optional(),
  repository: z.string().optional(),
  workflowId: z.string().optional(),
});

export type TraceCreateResponse = z.infer<typeof TraceCreateResponse>;
export const TraceCreateResponse = z.object({
  message: z.string().optional(),
  workflowId: z.string().optional(),
});

export type TraceHeartbeatRequest = z.infer<typeof TraceHeartbeatRequest>;
export const TraceHeartbeatRequest = z.object({
  progress: TraceProgressData.optional(),
});

export type TraceHeartbeatResponse = z.infer<typeof TraceHeartbeatResponse>;
export const TraceHeartbeatResponse = z.object({
  message: z.string().optional(),
});

export type TraceProgressRequest = z.infer<typeof TraceProgressRequest>;
export const TraceProgressRequest = z.object({
  tasks: z.array(Task).optional(),
  progress: TraceProgressData.optional(),
});

export type TraceProgressResponse = z.infer<typeof TraceProgressResponse>;
export const TraceProgressResponse = z.object({
  status: TraceProcessingStatus.optional(),
  workflowId: z.string().optional(),
});

export type UpdateActionRequest = z.infer<typeof UpdateActionRequest>;
export const UpdateActionRequest = z.object({
  name: z.string().optional(),
  launch: WorkflowLaunchRequest.optional(),
});

export type UpdateComputeEnvRequest = z.infer<typeof UpdateComputeEnvRequest>;
export const UpdateComputeEnvRequest = z.object({
  name: z.string().optional(),
});

export type UpdateCredentialsRequest = z.infer<typeof UpdateCredentialsRequest>;
export const UpdateCredentialsRequest = z.object({
  credentials: Credentials.optional(),
});

export type UpdateDatasetRequest = z.infer<typeof UpdateDatasetRequest>;
export const UpdateDatasetRequest = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

export type UpdateLabelRequest = z.infer<typeof UpdateLabelRequest>;
export const UpdateLabelRequest = z.object({
  name: z.string().optional(),
  value: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export type UpdateLabelResponse = z.infer<typeof UpdateLabelResponse>;
export const UpdateLabelResponse = z.object({
  id: z.number().optional(),
  name: z.string().optional(),
  value: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export type UpdateMemberRoleRequest = z.infer<typeof UpdateMemberRoleRequest>;
export const UpdateMemberRoleRequest = z.object({
  role: OrgRole.optional(),
});

export type UpdateOrganizationRequest = z.infer<typeof UpdateOrganizationRequest>;
export const UpdateOrganizationRequest = z.object({
  fullName: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  website: z.string().optional(),
  logoId: z.string().optional(),
  paying: z.union([z.boolean(), z.null()]).optional(),
});

export type UpdateParticipantRoleRequest = z.infer<typeof UpdateParticipantRoleRequest>;
export const UpdateParticipantRoleRequest = z.object({
  role: WspRole.optional(),
});

export type UpdatePipelineRequest = z.infer<typeof UpdatePipelineRequest>;
export const UpdatePipelineRequest = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  launch: WorkflowLaunchRequest.optional(),
  labelIds: z.array(z.number()).optional(),
});

export type UpdatePipelineResponse = z.infer<typeof UpdatePipelineResponse>;
export const UpdatePipelineResponse = z.object({
  pipeline: PipelineDbDto.optional(),
});

export type UpdatePipelineSecretRequest = z.infer<typeof UpdatePipelineSecretRequest>;
export const UpdatePipelineSecretRequest = z.object({
  value: z.string().optional(),
});

export type UpdateTeamRequest = z.infer<typeof UpdateTeamRequest>;
export const UpdateTeamRequest = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  avatarId: z.string().optional(),
});

export type UpdateWorkspaceRequest = z.infer<typeof UpdateWorkspaceRequest>;
export const UpdateWorkspaceRequest = z.object({
  name: z.string().optional(),
  fullName: z.string().optional(),
  description: z.string().optional(),
  visibility: Visibility.optional(),
});

export type UploadDatasetVersionResponse = z.infer<typeof UploadDatasetVersionResponse>;
export const UploadDatasetVersionResponse = z.object({
  version: DatasetVersionDbDto.optional(),
});

export type WesErrorResponse = z.infer<typeof WesErrorResponse>;
export const WesErrorResponse = z.object({
  msg: z.string().optional(),
  status_code: z.number().optional(),
});

export type WorkflowLogResponse = z.infer<typeof WorkflowLogResponse>;
export const WorkflowLogResponse = z.object({
  log: LogPage.optional(),
});

export type WorkflowQueryAttribute = z.infer<typeof WorkflowQueryAttribute>;
export const WorkflowQueryAttribute = z.union([z.literal('optimized'), z.literal('labels'), z.literal('minimal')]);

export type get_ListActions = typeof get_ListActions;
export const get_ListActions = {
  method: z.literal('GET'),
  path: z.literal('/actions'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
      attributes: z.array(ActionQueryAttribute).optional(),
    }),
  }),
  response: ListActionsResponse,
};

export type post_CreateAction = typeof post_CreateAction;
export const post_CreateAction = {
  method: z.literal('POST'),
  path: z.literal('/actions'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    body: CreateActionRequest,
  }),
  response: CreateActionResponse,
};

export type post_AddLabelsToActions = typeof post_AddLabelsToActions;
export const post_AddLabelsToActions = {
  method: z.literal('POST'),
  path: z.literal('/actions/labels/add'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    body: AssociateActionLabelsRequest,
  }),
  response: z.unknown(),
};

export type post_ApplyLabelsToActions = typeof post_ApplyLabelsToActions;
export const post_ApplyLabelsToActions = {
  method: z.literal('POST'),
  path: z.literal('/actions/labels/apply'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    body: AssociateActionLabelsRequest,
  }),
  response: z.unknown(),
};

export type post_RemoveLabelsFromActions = typeof post_RemoveLabelsFromActions;
export const post_RemoveLabelsFromActions = {
  method: z.literal('POST'),
  path: z.literal('/actions/labels/remove'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    body: AssociateActionLabelsRequest,
  }),
  response: z.unknown(),
};

export type get_ListActionTypes = typeof get_ListActionTypes;
export const get_ListActionTypes = {
  method: z.literal('GET'),
  path: z.literal('/actions/types'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
  }),
  response: ListEventTypesResponse,
};

export type get_ValidateActionName = typeof get_ValidateActionName;
export const get_ValidateActionName = {
  method: z.literal('GET'),
  path: z.literal('/actions/validate'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
      name: z.string().optional(),
    }),
  }),
  response: z.unknown(),
};

export type get_DescribeAction = typeof get_DescribeAction;
export const get_DescribeAction = {
  method: z.literal('GET'),
  path: z.literal('/actions/{actionId}'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
      attributes: z.array(ActionQueryAttribute).optional(),
    }),
    path: z.object({
      actionId: z.string(),
    }),
  }),
  response: DescribeActionResponse,
};

export type put_UpdateAction = typeof put_UpdateAction;
export const put_UpdateAction = {
  method: z.literal('PUT'),
  path: z.literal('/actions/{actionId}'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    path: z.object({
      actionId: z.string(),
    }),
    body: UpdateActionRequest,
  }),
  response: z.unknown(),
};

export type delete_DeleteAction = typeof delete_DeleteAction;
export const delete_DeleteAction = {
  method: z.literal('DELETE'),
  path: z.literal('/actions/{actionId}'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    path: z.object({
      actionId: z.string(),
    }),
  }),
  response: z.unknown(),
};

export type post_LaunchAction = typeof post_LaunchAction;
export const post_LaunchAction = {
  method: z.literal('POST'),
  path: z.literal('/actions/{actionId}/launch'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    path: z.object({
      actionId: z.string(),
    }),
    body: LaunchActionRequest,
  }),
  response: LaunchActionResponse,
};

export type post_PauseAction = typeof post_PauseAction;
export const post_PauseAction = {
  method: z.literal('POST'),
  path: z.literal('/actions/{actionId}/pause'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    path: z.object({
      actionId: z.string(),
    }),
    body: EmptyBodyRequest,
  }),
  response: z.unknown(),
};

export type post_CreateAvatar = typeof post_CreateAvatar;
export const post_CreateAvatar = {
  method: z.literal('POST'),
  path: z.literal('/avatars'),
  parameters: z.object({
    body: z.object({
      image: z.string().optional(),
    }),
  }),
  response: CreateAvatarResponse,
};

export type get_DownloadAvatar = typeof get_DownloadAvatar;
export const get_DownloadAvatar = {
  method: z.literal('GET'),
  path: z.literal('/avatars/{avatarId}'),
  parameters: z.object({
    path: z.object({
      avatarId: z.string(),
    }),
  }),
  response: z.string(),
};

export type get_ListComputeEnvs = typeof get_ListComputeEnvs;
export const get_ListComputeEnvs = {
  method: z.literal('GET'),
  path: z.literal('/compute-envs'),
  parameters: z.object({
    query: z.object({
      status: z.string().optional(),
      workspaceId: z.number().optional(),
    }),
  }),
  response: ListComputeEnvsResponse,
};

export type post_CreateComputeEnv = typeof post_CreateComputeEnv;
export const post_CreateComputeEnv = {
  method: z.literal('POST'),
  path: z.literal('/compute-envs'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    body: CreateComputeEnvRequest,
  }),
  response: CreateComputeEnvResponse,
};

export type get_ValidateComputeEnvName = typeof get_ValidateComputeEnvName;
export const get_ValidateComputeEnvName = {
  method: z.literal('GET'),
  path: z.literal('/compute-envs/validate'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
      name: z.string().optional(),
    }),
  }),
  response: z.unknown(),
};

export type get_DescribeComputeEnv = typeof get_DescribeComputeEnv;
export const get_DescribeComputeEnv = {
  method: z.literal('GET'),
  path: z.literal('/compute-envs/{computeEnvId}'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
      attributes: z.array(ComputeEnvQueryAttribute).optional(),
    }),
    path: z.object({
      computeEnvId: z.string(),
    }),
  }),
  response: DescribeComputeEnvResponse,
};

export type put_UpdateComputeEnv = typeof put_UpdateComputeEnv;
export const put_UpdateComputeEnv = {
  method: z.literal('PUT'),
  path: z.literal('/compute-envs/{computeEnvId}'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    path: z.object({
      computeEnvId: z.string(),
    }),
    body: UpdateComputeEnvRequest,
  }),
  response: z.unknown(),
};

export type delete_DeleteComputeEnv = typeof delete_DeleteComputeEnv;
export const delete_DeleteComputeEnv = {
  method: z.literal('DELETE'),
  path: z.literal('/compute-envs/{computeEnvId}'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    path: z.object({
      computeEnvId: z.string(),
    }),
  }),
  response: z.unknown(),
};

export type post_UpdateComputeEnvPrimary = typeof post_UpdateComputeEnvPrimary;
export const post_UpdateComputeEnvPrimary = {
  method: z.literal('POST'),
  path: z.literal('/compute-envs/{computeEnvId}/primary'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    path: z.object({
      computeEnvId: z.string(),
    }),
    body: EmptyBodyRequest,
  }),
  response: z.unknown(),
};

export type get_ListCredentials = typeof get_ListCredentials;
export const get_ListCredentials = {
  method: z.literal('GET'),
  path: z.literal('/credentials'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
      platformId: z.string().optional(),
    }),
  }),
  response: ListCredentialsResponse,
};

export type post_CreateCredentials = typeof post_CreateCredentials;
export const post_CreateCredentials = {
  method: z.literal('POST'),
  path: z.literal('/credentials'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    body: CreateCredentialsRequest,
  }),
  response: CreateCredentialsResponse,
};

export type get_ValidateCredentialsName = typeof get_ValidateCredentialsName;
export const get_ValidateCredentialsName = {
  method: z.literal('GET'),
  path: z.literal('/credentials/validate'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
      name: z.string().optional(),
    }),
  }),
  response: z.unknown(),
};

export type get_DescribeCredentials = typeof get_DescribeCredentials;
export const get_DescribeCredentials = {
  method: z.literal('GET'),
  path: z.literal('/credentials/{credentialsId}'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    path: z.object({
      credentialsId: z.string(),
    }),
  }),
  response: DescribeCredentialsResponse,
};

export type put_UpdateCredentials = typeof put_UpdateCredentials;
export const put_UpdateCredentials = {
  method: z.literal('PUT'),
  path: z.literal('/credentials/{credentialsId}'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    path: z.object({
      credentialsId: z.string(),
    }),
    body: UpdateCredentialsRequest,
  }),
  response: z.unknown(),
};

export type delete_DeleteCredentials = typeof delete_DeleteCredentials;
export const delete_DeleteCredentials = {
  method: z.literal('DELETE'),
  path: z.literal('/credentials/{credentialsId}'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
      checked: z.boolean().optional(),
    }),
    path: z.object({
      credentialsId: z.string(),
    }),
  }),
  response: z.unknown(),
};

export type get_ListDataLinks = typeof get_ListDataLinks;
export const get_ListDataLinks = {
  method: z.literal('GET'),
  path: z.literal('/data-links'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
      credentialsId: z.string().optional(),
      search: z.string().optional(),
      max: z.number().optional(),
      offset: z.number().optional(),
      visibility: z.string().optional(),
    }),
  }),
  response: DataLinksListResponse,
};

export type post_CreateCustomDataLink = typeof post_CreateCustomDataLink;
export const post_CreateCustomDataLink = {
  method: z.literal('POST'),
  path: z.literal('/data-links'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    body: DataLinkCreateRequest,
  }),
  response: DataLinkDto,
};

export type get_DescribeDataLink = typeof get_DescribeDataLink;
export const get_DescribeDataLink = {
  method: z.literal('GET'),
  path: z.literal('/data-links/{dataLinkId}'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
      credentialsId: z.string().optional(),
    }),
    path: z.object({
      dataLinkId: z.string(),
    }),
  }),
  response: DataLinkResponse,
};

export type put_UpdateCustomDataLink = typeof put_UpdateCustomDataLink;
export const put_UpdateCustomDataLink = {
  method: z.literal('PUT'),
  path: z.literal('/data-links/{dataLinkId}'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    path: z.object({
      dataLinkId: z.string(),
    }),
    body: DataLinkUpdateRequest,
  }),
  response: DataLinkDto,
};

export type delete_DeleteCustomDataLink = typeof delete_DeleteCustomDataLink;
export const delete_DeleteCustomDataLink = {
  method: z.literal('DELETE'),
  path: z.literal('/data-links/{dataLinkId}'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    path: z.object({
      dataLinkId: z.string(),
    }),
  }),
  response: z.unknown(),
};

export type get_ExploreDataLink = typeof get_ExploreDataLink;
export const get_ExploreDataLink = {
  method: z.literal('GET'),
  path: z.literal('/data-links/{dataLinkId}/browse'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
      credentialsId: z.string().optional(),
      search: z.string().optional(),
      nextPageToken: z.string().optional(),
      pageSize: z.number().optional(),
    }),
    path: z.object({
      dataLinkId: z.string(),
    }),
  }),
  response: DataLinkContentResponse,
};

export type get_ExploreDataLink_1 = typeof get_ExploreDataLink_1;
export const get_ExploreDataLink_1 = {
  method: z.literal('GET'),
  path: z.literal('/data-links/{dataLinkId}/browse/{path}'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
      credentialsId: z.string().optional(),
      search: z.string().optional(),
      nextPageToken: z.string().optional(),
      pageSize: z.number().optional(),
    }),
    path: z.object({
      dataLinkId: z.string(),
      path: z.string(),
    }),
  }),
  response: DataLinkContentResponse,
};

export type get_ListDatasetsV2 = typeof get_ListDatasetsV2;
export const get_ListDatasetsV2 = {
  method: z.literal('GET'),
  path: z.literal('/datasets'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
  }),
  response: ListDatasetsResponse,
};

export type post_CreateDatasetV2 = typeof post_CreateDatasetV2;
export const post_CreateDatasetV2 = {
  method: z.literal('POST'),
  path: z.literal('/datasets'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    body: CreateDatasetRequest,
  }),
  response: CreateDatasetResponse,
};

export type get_ListLatestDatasetVersionsV2 = typeof get_ListLatestDatasetVersionsV2;
export const get_ListLatestDatasetVersionsV2 = {
  method: z.literal('GET'),
  path: z.literal('/datasets/versions'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
      mimeType: z.union([z.string(), z.null()]).optional(),
    }),
  }),
  response: ListDatasetVersionsResponse,
};

export type put_UpdateDatasetV2 = typeof put_UpdateDatasetV2;
export const put_UpdateDatasetV2 = {
  method: z.literal('PUT'),
  path: z.literal('/datasets/{datasetId}'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    path: z.object({
      datasetId: z.string(),
    }),
    body: UpdateDatasetRequest,
  }),
  response: z.unknown(),
};

export type delete_DeleteDatasetV2 = typeof delete_DeleteDatasetV2;
export const delete_DeleteDatasetV2 = {
  method: z.literal('DELETE'),
  path: z.literal('/datasets/{datasetId}'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    path: z.object({
      datasetId: z.string(),
    }),
  }),
  response: z.unknown(),
};

export type get_DescribeDatasetV2 = typeof get_DescribeDatasetV2;
export const get_DescribeDatasetV2 = {
  method: z.literal('GET'),
  path: z.literal('/datasets/{datasetId}/metadata'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    path: z.object({
      datasetId: z.string(),
    }),
  }),
  response: DescribeDatasetResponse,
};

export type post_UploadDatasetV2 = typeof post_UploadDatasetV2;
export const post_UploadDatasetV2 = {
  method: z.literal('POST'),
  path: z.literal('/datasets/{datasetId}/upload'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
      header: z.boolean().optional(),
    }),
    path: z.object({
      datasetId: z.string(),
    }),
    body: MultiRequestFileSchema,
  }),
  response: UploadDatasetVersionResponse,
};

export type get_DownloadDatasetV2 = typeof get_DownloadDatasetV2;
export const get_DownloadDatasetV2 = {
  method: z.literal('GET'),
  path: z.literal('/datasets/{datasetId}/v/{version}/n/{fileName}'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    path: z.object({
      datasetId: z.string(),
      version: z.string(),
      fileName: z.string(),
    }),
  }),
  response: z.string(),
};

export type get_ListDatasetVersionsV2 = typeof get_ListDatasetVersionsV2;
export const get_ListDatasetVersionsV2 = {
  method: z.literal('GET'),
  path: z.literal('/datasets/{datasetId}/versions'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
      mimeType: z.string().optional(),
    }),
    path: z.object({
      datasetId: z.string(),
    }),
  }),
  response: ListDatasetVersionsResponse,
};

export type get_GaRunList = typeof get_GaRunList;
export const get_GaRunList = {
  method: z.literal('GET'),
  path: z.literal('/ga4gh/wes/v1/runs'),
  parameters: z.object({
    query: z.object({
      page_size: z.number().optional(),
      page_token: z.string().optional(),
    }),
  }),
  response: RunListResponse,
};

export type post_GaRunCreate = typeof post_GaRunCreate;
export const post_GaRunCreate = {
  method: z.literal('POST'),
  path: z.literal('/ga4gh/wes/v1/runs'),
  parameters: z.object({
    body: RunRequest,
  }),
  response: RunId,
};

export type get_GaRunDescribe = typeof get_GaRunDescribe;
export const get_GaRunDescribe = {
  method: z.literal('GET'),
  path: z.literal('/ga4gh/wes/v1/runs/{run_id}'),
  parameters: z.object({
    path: z.object({
      run_id: z.string(),
    }),
  }),
  response: RunLog,
};

export type post_GaRunCancel = typeof post_GaRunCancel;
export const post_GaRunCancel = {
  method: z.literal('POST'),
  path: z.literal('/ga4gh/wes/v1/runs/{run_id}/cancel'),
  parameters: z.object({
    path: z.object({
      run_id: z.string(),
    }),
    body: EmptyBodyRequest,
  }),
  response: RunId,
};

export type get_GaRunStatus = typeof get_GaRunStatus;
export const get_GaRunStatus = {
  method: z.literal('GET'),
  path: z.literal('/ga4gh/wes/v1/runs/{run_id}/status'),
  parameters: z.object({
    path: z.object({
      run_id: z.string(),
    }),
  }),
  response: RunStatus,
};

export type get_GaServiceInfo = typeof get_GaServiceInfo;
export const get_GaServiceInfo = {
  method: z.literal('GET'),
  path: z.literal('/ga4gh/wes/v1/service-info'),
  parameters: z.never(),
  response: ServiceInfo,
};

export type get_ListLabels = typeof get_ListLabels;
export const get_ListLabels = {
  method: z.literal('GET'),
  path: z.literal('/labels'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
      max: z.number().optional(),
      offset: z.number().optional(),
      search: z.string().optional(),
      type: z.union([z.literal('simple'), z.literal('resource'), z.literal('all')]).optional(),
      isDefault: z.boolean().optional(),
    }),
  }),
  response: ListLabelsResponse,
};

export type post_CreateLabel = typeof post_CreateLabel;
export const post_CreateLabel = {
  method: z.literal('POST'),
  path: z.literal('/labels'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    body: CreateLabelRequest,
  }),
  response: CreateLabelResponse,
};

export type put_UpdateLabel = typeof put_UpdateLabel;
export const put_UpdateLabel = {
  method: z.literal('PUT'),
  path: z.literal('/labels/{labelId}'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    path: z.object({
      labelId: z.number(),
    }),
    body: UpdateLabelRequest,
  }),
  response: UpdateLabelResponse,
};

export type delete_DeleteLabel = typeof delete_DeleteLabel;
export const delete_DeleteLabel = {
  method: z.literal('DELETE'),
  path: z.literal('/labels/{labelId}'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    path: z.object({
      labelId: z.number(),
    }),
  }),
  response: z.unknown(),
};

export type get_DescribeLaunch = typeof get_DescribeLaunch;
export const get_DescribeLaunch = {
  method: z.literal('GET'),
  path: z.literal('/launch/{launchId}'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    path: z.object({
      launchId: z.string(),
    }),
  }),
  response: DescribeLaunchResponse,
};

export type get_ListLaunchDatasetVersions = typeof get_ListLaunchDatasetVersions;
export const get_ListLaunchDatasetVersions = {
  method: z.literal('GET'),
  path: z.literal('/launch/{launchId}/datasets'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    path: z.object({
      launchId: z.string(),
    }),
  }),
  response: DescribeLaunchResponse,
};

export type get_ListOrganizations = typeof get_ListOrganizations;
export const get_ListOrganizations = {
  method: z.literal('GET'),
  path: z.literal('/orgs'),
  parameters: z.object({
    query: z.object({
      role: z.string().optional(),
    }),
  }),
  response: ListOrganizationsResponse,
};

export type post_CreateOrganization = typeof post_CreateOrganization;
export const post_CreateOrganization = {
  method: z.literal('POST'),
  path: z.literal('/orgs'),
  parameters: z.object({
    body: CreateOrganizationRequest,
  }),
  response: CreateOrganizationResponse,
};

export type get_ValidateOrganizationName = typeof get_ValidateOrganizationName;
export const get_ValidateOrganizationName = {
  method: z.literal('GET'),
  path: z.literal('/orgs/validate'),
  parameters: z.object({
    query: z.object({
      name: z.string().optional(),
    }),
  }),
  response: z.unknown(),
};

export type get_DescribeOrganization = typeof get_DescribeOrganization;
export const get_DescribeOrganization = {
  method: z.literal('GET'),
  path: z.literal('/orgs/{orgId}'),
  parameters: z.object({
    path: z.object({
      orgId: z.number(),
    }),
  }),
  response: DescribeOrganizationResponse,
};

export type put_UpdateOrganization = typeof put_UpdateOrganization;
export const put_UpdateOrganization = {
  method: z.literal('PUT'),
  path: z.literal('/orgs/{orgId}'),
  parameters: z.object({
    path: z.object({
      orgId: z.number(),
    }),
    body: UpdateOrganizationRequest,
  }),
  response: z.unknown(),
};

export type delete_DeleteOrganization = typeof delete_DeleteOrganization;
export const delete_DeleteOrganization = {
  method: z.literal('DELETE'),
  path: z.literal('/orgs/{orgId}'),
  parameters: z.object({
    path: z.object({
      orgId: z.number(),
    }),
  }),
  response: z.unknown(),
};

export type get_ListOrganizationCollaborators = typeof get_ListOrganizationCollaborators;
export const get_ListOrganizationCollaborators = {
  method: z.literal('GET'),
  path: z.literal('/orgs/{orgId}/collaborators'),
  parameters: z.object({
    query: z.object({
      max: z.number().optional(),
      offset: z.number().optional(),
      search: z.string().optional(),
    }),
    path: z.object({
      orgId: z.number(),
    }),
  }),
  response: ListMembersResponse,
};

export type get_ListOrganizationMembers = typeof get_ListOrganizationMembers;
export const get_ListOrganizationMembers = {
  method: z.literal('GET'),
  path: z.literal('/orgs/{orgId}/members'),
  parameters: z.object({
    query: z.object({
      max: z.number().optional(),
      offset: z.number().optional(),
      search: z.string().optional(),
    }),
    path: z.object({
      orgId: z.number(),
    }),
  }),
  response: ListMembersResponse,
};

export type put_CreateOrganizationMember = typeof put_CreateOrganizationMember;
export const put_CreateOrganizationMember = {
  method: z.literal('PUT'),
  path: z.literal('/orgs/{orgId}/members/add'),
  parameters: z.object({
    path: z.object({
      orgId: z.number(),
    }),
    body: AddMemberRequest,
  }),
  response: AddMemberResponse,
};

export type delete_LeaveOrganization = typeof delete_LeaveOrganization;
export const delete_LeaveOrganization = {
  method: z.literal('DELETE'),
  path: z.literal('/orgs/{orgId}/members/leave'),
  parameters: z.object({
    path: z.object({
      orgId: z.number(),
    }),
  }),
  response: z.unknown(),
};

export type delete_DeleteOrganizationMember = typeof delete_DeleteOrganizationMember;
export const delete_DeleteOrganizationMember = {
  method: z.literal('DELETE'),
  path: z.literal('/orgs/{orgId}/members/{memberId}'),
  parameters: z.object({
    path: z.object({
      orgId: z.number(),
      memberId: z.number(),
    }),
  }),
  response: z.unknown(),
};

export type put_UpdateOrganizationMemberRole = typeof put_UpdateOrganizationMemberRole;
export const put_UpdateOrganizationMemberRole = {
  method: z.literal('PUT'),
  path: z.literal('/orgs/{orgId}/members/{memberId}/role'),
  parameters: z.object({
    path: z.object({
      orgId: z.number(),
      memberId: z.number(),
    }),
    body: UpdateMemberRoleRequest,
  }),
  response: z.unknown(),
};

export type get_ListOrganizationTeams = typeof get_ListOrganizationTeams;
export const get_ListOrganizationTeams = {
  method: z.literal('GET'),
  path: z.literal('/orgs/{orgId}/teams'),
  parameters: z.object({
    query: z.object({
      max: z.number().optional(),
      offset: z.number().optional(),
      search: z.string().optional(),
    }),
    path: z.object({
      orgId: z.number(),
    }),
  }),
  response: ListTeamResponse,
};

export type post_CreateOrganizationTeam = typeof post_CreateOrganizationTeam;
export const post_CreateOrganizationTeam = {
  method: z.literal('POST'),
  path: z.literal('/orgs/{orgId}/teams'),
  parameters: z.object({
    path: z.object({
      orgId: z.number(),
    }),
    body: CreateTeamRequest,
  }),
  response: CreateTeamResponse,
};

export type get_ValidateTeamName = typeof get_ValidateTeamName;
export const get_ValidateTeamName = {
  method: z.literal('GET'),
  path: z.literal('/orgs/{orgId}/teams/validate'),
  parameters: z.object({
    query: z.object({
      name: z.string().optional(),
    }),
    path: z.object({
      orgId: z.number(),
    }),
  }),
  response: z.unknown(),
};

export type get_DescribeOrganizationTeam = typeof get_DescribeOrganizationTeam;
export const get_DescribeOrganizationTeam = {
  method: z.literal('GET'),
  path: z.literal('/orgs/{orgId}/teams/{teamId}'),
  parameters: z.object({
    path: z.object({
      orgId: z.number(),
      teamId: z.number(),
    }),
  }),
  response: DescribeTeamResponse,
};

export type put_UpdateOrganizationTeam = typeof put_UpdateOrganizationTeam;
export const put_UpdateOrganizationTeam = {
  method: z.literal('PUT'),
  path: z.literal('/orgs/{orgId}/teams/{teamId}'),
  parameters: z.object({
    path: z.object({
      orgId: z.number(),
      teamId: z.number(),
    }),
    body: UpdateTeamRequest,
  }),
  response: z.unknown(),
};

export type delete_DeleteOrganizationTeam = typeof delete_DeleteOrganizationTeam;
export const delete_DeleteOrganizationTeam = {
  method: z.literal('DELETE'),
  path: z.literal('/orgs/{orgId}/teams/{teamId}'),
  parameters: z.object({
    path: z.object({
      orgId: z.number(),
      teamId: z.number(),
    }),
  }),
  response: z.unknown(),
};

export type get_ListOrganizationTeamMembers = typeof get_ListOrganizationTeamMembers;
export const get_ListOrganizationTeamMembers = {
  method: z.literal('GET'),
  path: z.literal('/orgs/{orgId}/teams/{teamId}/members'),
  parameters: z.object({
    query: z.object({
      max: z.union([z.number(), z.null()]).optional(),
      offset: z.union([z.number(), z.null()]).optional(),
      search: z.union([z.string(), z.null()]).optional(),
    }),
    path: z.object({
      orgId: z.number(),
      teamId: z.number(),
    }),
  }),
  response: ListMembersResponse,
};

export type post_CreateOrganizationTeamMember = typeof post_CreateOrganizationTeamMember;
export const post_CreateOrganizationTeamMember = {
  method: z.literal('POST'),
  path: z.literal('/orgs/{orgId}/teams/{teamId}/members'),
  parameters: z.object({
    path: z.object({
      orgId: z.number(),
      teamId: z.number(),
    }),
    body: CreateTeamMemberRequest,
  }),
  response: AddTeamMemberResponse,
};

export type delete_DeleteOrganizationTeamMember = typeof delete_DeleteOrganizationTeamMember;
export const delete_DeleteOrganizationTeamMember = {
  method: z.literal('DELETE'),
  path: z.literal('/orgs/{orgId}/teams/{teamId}/members/{memberId}/delete'),
  parameters: z.object({
    path: z.object({
      orgId: z.number(),
      teamId: z.number(),
      memberId: z.number(),
    }),
  }),
  response: z.unknown(),
};

export type get_ListWorkspacesByTeam = typeof get_ListWorkspacesByTeam;
export const get_ListWorkspacesByTeam = {
  method: z.literal('GET'),
  path: z.literal('/orgs/{orgId}/teams/{teamId}/workspaces'),
  parameters: z.object({
    query: z.object({
      max: z.number().optional(),
      offset: z.number().optional(),
      search: z.string().optional(),
    }),
    path: z.object({
      orgId: z.number(),
      teamId: z.number(),
    }),
  }),
  response: ListWorkspacesResponse,
};

export type get_ListWorkspaces = typeof get_ListWorkspaces;
export const get_ListWorkspaces = {
  method: z.literal('GET'),
  path: z.literal('/orgs/{orgId}/workspaces'),
  parameters: z.object({
    path: z.object({
      orgId: z.number(),
    }),
  }),
  response: ListWorkspacesResponse,
};

export type post_CreateWorkspace = typeof post_CreateWorkspace;
export const post_CreateWorkspace = {
  method: z.literal('POST'),
  path: z.literal('/orgs/{orgId}/workspaces'),
  parameters: z.object({
    path: z.object({
      orgId: z.number(),
    }),
    body: CreateWorkspaceRequest,
  }),
  response: CreateWorkspaceResponse,
};

export type get_WorkspaceValidate = typeof get_WorkspaceValidate;
export const get_WorkspaceValidate = {
  method: z.literal('GET'),
  path: z.literal('/orgs/{orgId}/workspaces/validate'),
  parameters: z.object({
    query: z.object({
      name: z.string().optional(),
    }),
    path: z.object({
      orgId: z.number(),
    }),
  }),
  response: z.unknown(),
};

export type get_DescribeWorkspace = typeof get_DescribeWorkspace;
export const get_DescribeWorkspace = {
  method: z.literal('GET'),
  path: z.literal('/orgs/{orgId}/workspaces/{workspaceId}'),
  parameters: z.object({
    path: z.object({
      orgId: z.number(),
      workspaceId: z.number(),
    }),
  }),
  response: DescribeWorkspaceResponse,
};

export type put_UpdateWorkspace = typeof put_UpdateWorkspace;
export const put_UpdateWorkspace = {
  method: z.literal('PUT'),
  path: z.literal('/orgs/{orgId}/workspaces/{workspaceId}'),
  parameters: z.object({
    path: z.object({
      orgId: z.number(),
      workspaceId: z.number(),
    }),
    body: UpdateWorkspaceRequest,
  }),
  response: DescribeWorkspaceResponse,
};

export type delete_DeleteWorkspace = typeof delete_DeleteWorkspace;
export const delete_DeleteWorkspace = {
  method: z.literal('DELETE'),
  path: z.literal('/orgs/{orgId}/workspaces/{workspaceId}'),
  parameters: z.object({
    path: z.object({
      orgId: z.number(),
      workspaceId: z.number(),
    }),
  }),
  response: z.unknown(),
};

export type get_ListWorkspaceParticipants = typeof get_ListWorkspaceParticipants;
export const get_ListWorkspaceParticipants = {
  method: z.literal('GET'),
  path: z.literal('/orgs/{orgId}/workspaces/{workspaceId}/participants'),
  parameters: z.object({
    query: z.object({
      max: z.number().optional(),
      offset: z.number().optional(),
      search: z.string().optional(),
    }),
    path: z.object({
      orgId: z.number(),
      workspaceId: z.number(),
    }),
  }),
  response: ListParticipantsResponse,
};

export type delete_LeaveWorkspaceParticipant = typeof delete_LeaveWorkspaceParticipant;
export const delete_LeaveWorkspaceParticipant = {
  method: z.literal('DELETE'),
  path: z.literal('/orgs/{orgId}/workspaces/{workspaceId}/participants'),
  parameters: z.object({
    path: z.object({
      orgId: z.number(),
      workspaceId: z.number(),
    }),
  }),
  response: z.unknown(),
};

export type put_CreateWorkspaceParticipant = typeof put_CreateWorkspaceParticipant;
export const put_CreateWorkspaceParticipant = {
  method: z.literal('PUT'),
  path: z.literal('/orgs/{orgId}/workspaces/{workspaceId}/participants/add'),
  parameters: z.object({
    path: z.object({
      orgId: z.number(),
      workspaceId: z.number(),
    }),
    body: AddParticipantRequest,
  }),
  response: AddParticipantResponse,
};

export type delete_DeleteWorkspaceParticipant = typeof delete_DeleteWorkspaceParticipant;
export const delete_DeleteWorkspaceParticipant = {
  method: z.literal('DELETE'),
  path: z.literal('/orgs/{orgId}/workspaces/{workspaceId}/participants/{participantId}'),
  parameters: z.object({
    path: z.object({
      orgId: z.number(),
      workspaceId: z.number(),
      participantId: z.number(),
    }),
  }),
  response: z.unknown(),
};

export type put_UpdateWorkspaceParticipantRole = typeof put_UpdateWorkspaceParticipantRole;
export const put_UpdateWorkspaceParticipantRole = {
  method: z.literal('PUT'),
  path: z.literal('/orgs/{orgId}/workspaces/{workspaceId}/participants/{participantId}/role'),
  parameters: z.object({
    path: z.object({
      orgId: z.number(),
      workspaceId: z.number(),
      participantId: z.number(),
    }),
    body: UpdateParticipantRoleRequest,
  }),
  response: z.unknown(),
};

export type get_ListPipelineSecrets = typeof get_ListPipelineSecrets;
export const get_ListPipelineSecrets = {
  method: z.literal('GET'),
  path: z.literal('/pipeline-secrets'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
  }),
  response: ListPipelineSecretsResponse,
};

export type post_CreatePipelineSecret = typeof post_CreatePipelineSecret;
export const post_CreatePipelineSecret = {
  method: z.literal('POST'),
  path: z.literal('/pipeline-secrets'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    body: CreatePipelineSecretRequest,
  }),
  response: CreatePipelineSecretResponse,
};

export type get_ValidatePipelineSecretName = typeof get_ValidatePipelineSecretName;
export const get_ValidatePipelineSecretName = {
  method: z.literal('GET'),
  path: z.literal('/pipeline-secrets/validate'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
      name: z.string().optional(),
    }),
  }),
  response: z.unknown(),
};

export type get_DescribePipelineSecret = typeof get_DescribePipelineSecret;
export const get_DescribePipelineSecret = {
  method: z.literal('GET'),
  path: z.literal('/pipeline-secrets/{secretId}'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    path: z.object({
      secretId: z.number(),
    }),
  }),
  response: DescribePipelineSecretResponse,
};

export type put_UpdatePipelineSecret = typeof put_UpdatePipelineSecret;
export const put_UpdatePipelineSecret = {
  method: z.literal('PUT'),
  path: z.literal('/pipeline-secrets/{secretId}'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    path: z.object({
      secretId: z.number(),
    }),
    body: UpdatePipelineSecretRequest,
  }),
  response: z.unknown(),
};

export type delete_DeletePipelineSecret = typeof delete_DeletePipelineSecret;
export const delete_DeletePipelineSecret = {
  method: z.literal('DELETE'),
  path: z.literal('/pipeline-secrets/{secretId}'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    path: z.object({
      secretId: z.number(),
    }),
  }),
  response: z.unknown(),
};

export type get_ListPipelines = typeof get_ListPipelines;
export const get_ListPipelines = {
  method: z.literal('GET'),
  path: z.literal('/pipelines'),
  parameters: z.object({
    query: z.object({
      attributes: z.array(PipelineQueryAttribute).optional(),
      workspaceId: z.number().optional(),
      max: z.number().optional(),
      offset: z.number().optional(),
      search: z.string().optional(),
      visibility: z.string().optional(),
    }),
  }),
  response: ListPipelinesResponse,
};

export type post_CreatePipeline = typeof post_CreatePipeline;
export const post_CreatePipeline = {
  method: z.literal('POST'),
  path: z.literal('/pipelines'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    body: CreatePipelineRequest,
  }),
  response: CreatePipelineResponse,
};

export type get_DescribePipelineRepository = typeof get_DescribePipelineRepository;
export const get_DescribePipelineRepository = {
  method: z.literal('GET'),
  path: z.literal('/pipelines/info'),
  parameters: z.object({
    query: z.object({
      name: z.string().optional(),
      revision: z.string().optional(),
      workspaceId: z.number().optional(),
    }),
  }),
  response: DescribePipelineInfoResponse,
};

export type post_AddLabelsToPipelines = typeof post_AddLabelsToPipelines;
export const post_AddLabelsToPipelines = {
  method: z.literal('POST'),
  path: z.literal('/pipelines/labels/add'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    body: AssociatePipelineLabelsRequest,
  }),
  response: z.unknown(),
};

export type post_ApplyLabelsToPipelines = typeof post_ApplyLabelsToPipelines;
export const post_ApplyLabelsToPipelines = {
  method: z.literal('POST'),
  path: z.literal('/pipelines/labels/apply'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    body: AssociatePipelineLabelsRequest,
  }),
  response: z.unknown(),
};

export type post_RemoveLabelsFromPipelines = typeof post_RemoveLabelsFromPipelines;
export const post_RemoveLabelsFromPipelines = {
  method: z.literal('POST'),
  path: z.literal('/pipelines/labels/remove'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    body: AssociatePipelineLabelsRequest,
  }),
  response: z.unknown(),
};

export type get_ListPipelineRepositories = typeof get_ListPipelineRepositories;
export const get_ListPipelineRepositories = {
  method: z.literal('GET'),
  path: z.literal('/pipelines/repositories'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
  }),
  response: ListPipelineInfoResponse,
};

export type get_ValidatePipelineName = typeof get_ValidatePipelineName;
export const get_ValidatePipelineName = {
  method: z.literal('GET'),
  path: z.literal('/pipelines/validate'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
      orgId: z.number().optional(),
      name: z.string().optional(),
    }),
  }),
  response: z.unknown(),
};

export type get_DescribePipeline = typeof get_DescribePipeline;
export const get_DescribePipeline = {
  method: z.literal('GET'),
  path: z.literal('/pipelines/{pipelineId}'),
  parameters: z.object({
    query: z.object({
      attributes: z.array(PipelineQueryAttribute).optional(),
      workspaceId: z.number().optional(),
      sourceWorkspaceId: z.union([z.number(), z.null()]).optional(),
    }),
    path: z.object({
      pipelineId: z.number(),
    }),
  }),
  response: DescribePipelineResponse,
};

export type put_UpdatePipeline = typeof put_UpdatePipeline;
export const put_UpdatePipeline = {
  method: z.literal('PUT'),
  path: z.literal('/pipelines/{pipelineId}'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    path: z.object({
      pipelineId: z.number(),
    }),
    body: UpdatePipelineRequest,
  }),
  response: UpdatePipelineResponse,
};

export type delete_DeletePipeline = typeof delete_DeletePipeline;
export const delete_DeletePipeline = {
  method: z.literal('DELETE'),
  path: z.literal('/pipelines/{pipelineId}'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    path: z.object({
      pipelineId: z.number(),
    }),
  }),
  response: z.unknown(),
};

export type get_DescribePipelineLaunch = typeof get_DescribePipelineLaunch;
export const get_DescribePipelineLaunch = {
  method: z.literal('GET'),
  path: z.literal('/pipelines/{pipelineId}/launch'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
      sourceWorkspaceId: z.union([z.number(), z.null()]).optional(),
    }),
    path: z.object({
      pipelineId: z.number(),
    }),
  }),
  response: DescribeLaunchResponse,
};

export type get_DescribePipelineSchema = typeof get_DescribePipelineSchema;
export const get_DescribePipelineSchema = {
  method: z.literal('GET'),
  path: z.literal('/pipelines/{pipelineId}/schema'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
      sourceWorkspaceId: z.union([z.number(), z.null()]).optional(),
      attributes: z.array(PipelineSchemaAttributes).optional(),
    }),
    path: z.object({
      pipelineId: z.number(),
    }),
  }),
  response: z.unknown(),
};

export type get_ListPlatforms = typeof get_ListPlatforms;
export const get_ListPlatforms = {
  method: z.literal('GET'),
  path: z.literal('/platforms'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
      orgId: z.union([z.string(), z.null()]).optional(),
    }),
  }),
  response: ListPlatformsResponse,
};

export type get_DescribePlatform = typeof get_DescribePlatform;
export const get_DescribePlatform = {
  method: z.literal('GET'),
  path: z.literal('/platforms/{platformId}'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.union([z.number(), z.undefined()]),
      regionId: z.string(),
      credentialsId: z.string(),
    }),
    path: z.object({
      platformId: z.string(),
    }),
  }),
  response: DescribePlatformResponse,
};

export type get_ListPlatformRegions = typeof get_ListPlatformRegions;
export const get_ListPlatformRegions = {
  method: z.literal('GET'),
  path: z.literal('/platforms/{platformId}/regions'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    path: z.object({
      platformId: z.string(),
    }),
  }),
  response: ListRegionsResponse,
};

export type get_Info = typeof get_Info;
export const get_Info = {
  method: z.literal('GET'),
  path: z.literal('/service-info'),
  parameters: z.never(),
  response: ServiceInfoResponse,
};

export type get_TokenList = typeof get_TokenList;
export const get_TokenList = {
  method: z.literal('GET'),
  path: z.literal('/tokens'),
  parameters: z.never(),
  response: ListAccessTokensResponse,
};

export type post_CreateToken = typeof post_CreateToken;
export const post_CreateToken = {
  method: z.literal('POST'),
  path: z.literal('/tokens'),
  parameters: z.object({
    body: CreateAccessTokenRequest,
  }),
  response: CreateAccessTokenResponse,
};

export type delete_DeleteAllTokens = typeof delete_DeleteAllTokens;
export const delete_DeleteAllTokens = {
  method: z.literal('DELETE'),
  path: z.literal('/tokens/delete-all'),
  parameters: z.never(),
  response: z.unknown(),
};

export type delete_DeleteToken = typeof delete_DeleteToken;
export const delete_DeleteToken = {
  method: z.literal('DELETE'),
  path: z.literal('/tokens/{tokenId}'),
  parameters: z.object({
    path: z.object({
      tokenId: z.number(),
    }),
  }),
  response: z.unknown(),
};

export type post_CreateTrace = typeof post_CreateTrace;
export const post_CreateTrace = {
  method: z.literal('POST'),
  path: z.literal('/trace/create'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    body: TraceCreateRequest,
  }),
  response: TraceCreateResponse,
};

export type put_UpdateTraceBegin = typeof put_UpdateTraceBegin;
export const put_UpdateTraceBegin = {
  method: z.literal('PUT'),
  path: z.literal('/trace/{workflowId}/begin'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    path: z.object({
      workflowId: z.string(),
    }),
    body: TraceBeginRequest,
  }),
  response: TraceBeginResponse,
};

export type put_UpdateTraceComplete = typeof put_UpdateTraceComplete;
export const put_UpdateTraceComplete = {
  method: z.literal('PUT'),
  path: z.literal('/trace/{workflowId}/complete'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    path: z.object({
      workflowId: z.string(),
    }),
    body: TraceCompleteRequest,
  }),
  response: TraceCompleteResponse,
};

export type put_UpdateTraceHeartbeat = typeof put_UpdateTraceHeartbeat;
export const put_UpdateTraceHeartbeat = {
  method: z.literal('PUT'),
  path: z.literal('/trace/{workflowId}/heartbeat'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    path: z.object({
      workflowId: z.string(),
    }),
    body: TraceHeartbeatRequest,
  }),
  response: TraceHeartbeatResponse,
};

export type put_UpdateTraceProgress = typeof put_UpdateTraceProgress;
export const put_UpdateTraceProgress = {
  method: z.literal('PUT'),
  path: z.literal('/trace/{workflowId}/progress'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    path: z.object({
      workflowId: z.string(),
    }),
    body: TraceProgressRequest,
  }),
  response: TraceProgressResponse,
};

export type get_UserInfo = typeof get_UserInfo;
export const get_UserInfo = {
  method: z.literal('GET'),
  path: z.literal('/user-info'),
  parameters: z.never(),
  response: DescribeUserResponse,
};

export type get_ListWorkspacesUser = typeof get_ListWorkspacesUser;
export const get_ListWorkspacesUser = {
  method: z.literal('GET'),
  path: z.literal('/user/{userId}/workspaces'),
  parameters: z.object({
    path: z.object({
      userId: z.number(),
    }),
  }),
  response: ListWorkspacesAndOrgResponse,
};

export type get_ValidateUserName = typeof get_ValidateUserName;
export const get_ValidateUserName = {
  method: z.literal('GET'),
  path: z.literal('/users/validate'),
  parameters: z.object({
    query: z.object({
      name: z.string().optional(),
    }),
  }),
  response: z.unknown(),
};

export type get_DescribeUser = typeof get_DescribeUser;
export const get_DescribeUser = {
  method: z.literal('GET'),
  path: z.literal('/users/{userId}'),
  parameters: z.object({
    path: z.object({
      userId: z.number(),
    }),
  }),
  response: DescribeUserResponse,
};

export type post_UpdateUser = typeof post_UpdateUser;
export const post_UpdateUser = {
  method: z.literal('POST'),
  path: z.literal('/users/{userId}'),
  parameters: z.object({
    path: z.object({
      userId: z.number(),
    }),
    body: UserDbDto,
  }),
  response: z.unknown(),
};

export type delete_DeleteUser = typeof delete_DeleteUser;
export const delete_DeleteUser = {
  method: z.literal('DELETE'),
  path: z.literal('/users/{userId}'),
  parameters: z.object({
    path: z.object({
      userId: z.number(),
    }),
  }),
  response: z.unknown(),
};

export type get_ListWorkflows = typeof get_ListWorkflows;
export const get_ListWorkflows = {
  method: z.literal('GET'),
  path: z.literal('/workflow'),
  parameters: z.object({
    query: z.object({
      attributes: z.array(WorkflowQueryAttribute).optional(),
      workspaceId: z.number().optional(),
      max: z.number().optional(),
      offset: z.number().optional(),
      search: z.string().optional(),
    }),
  }),
  response: ListWorkflowsResponse,
};

export type post_DeleteWorkflowMany = typeof post_DeleteWorkflowMany;
export const post_DeleteWorkflowMany = {
  method: z.literal('POST'),
  path: z.literal('/workflow/delete'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
      force: z.boolean().optional(),
    }),
    body: DeleteWorkflowsRequest,
  }),
  response: DeleteWorkflowsResponse,
};

export type post_AddLabelsToWorkflows = typeof post_AddLabelsToWorkflows;
export const post_AddLabelsToWorkflows = {
  method: z.literal('POST'),
  path: z.literal('/workflow/labels/add'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    body: AssociateWorkflowLabelsRequest,
  }),
  response: z.unknown(),
};

export type post_ApplyLabelsToWorkflows = typeof post_ApplyLabelsToWorkflows;
export const post_ApplyLabelsToWorkflows = {
  method: z.literal('POST'),
  path: z.literal('/workflow/labels/apply'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    body: AssociateWorkflowLabelsRequest,
  }),
  response: z.unknown(),
};

export type post_RemoveLabelsFromWorkflows = typeof post_RemoveLabelsFromWorkflows;
export const post_RemoveLabelsFromWorkflows = {
  method: z.literal('POST'),
  path: z.literal('/workflow/labels/remove'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    body: AssociateWorkflowLabelsRequest,
  }),
  response: z.unknown(),
};

export type post_CreateWorkflowLaunch = typeof post_CreateWorkflowLaunch;
export const post_CreateWorkflowLaunch = {
  method: z.literal('POST'),
  path: z.literal('/workflow/launch'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
      sourceWorkspaceId: z.union([z.number(), z.null()]).optional(),
    }),
    body: SubmitWorkflowLaunchRequest,
  }),
  response: SubmitWorkflowLaunchResponse,
};

export type get_GenerateRandomWorkflowName = typeof get_GenerateRandomWorkflowName;
export const get_GenerateRandomWorkflowName = {
  method: z.literal('GET'),
  path: z.literal('/workflow/random-name'),
  parameters: z.never(),
  response: RandomWorkflowNameResponse,
};

export type get_ValidateWorkflowConstraints = typeof get_ValidateWorkflowConstraints;
export const get_ValidateWorkflowConstraints = {
  method: z.literal('GET'),
  path: z.literal('/workflow/validate'),
  parameters: z.object({
    query: z.object({
      runName: z.string().optional(),
      sessionId: z.string().optional(),
    }),
  }),
  response: z.unknown(),
};

export type get_DescribeWorkflow = typeof get_DescribeWorkflow;
export const get_DescribeWorkflow = {
  method: z.literal('GET'),
  path: z.literal('/workflow/{workflowId}'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
      attributes: z.array(WorkflowQueryAttribute).optional(),
    }),
    path: z.object({
      workflowId: z.string(),
    }),
  }),
  response: DescribeWorkflowResponse,
};

export type delete_DeleteWorkflow = typeof delete_DeleteWorkflow;
export const delete_DeleteWorkflow = {
  method: z.literal('DELETE'),
  path: z.literal('/workflow/{workflowId}'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
      force: z.boolean().optional(),
    }),
    path: z.object({
      workflowId: z.string(),
    }),
  }),
  response: z.unknown(),
};

export type post_CancelWorkflow = typeof post_CancelWorkflow;
export const post_CancelWorkflow = {
  method: z.literal('POST'),
  path: z.literal('/workflow/{workflowId}/cancel'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    path: z.object({
      workflowId: z.string(),
    }),
    body: EmptyBodyRequest,
  }),
  response: z.unknown(),
};

export type get_DownloadWorkflowLog = typeof get_DownloadWorkflowLog;
export const get_DownloadWorkflowLog = {
  method: z.literal('GET'),
  path: z.literal('/workflow/{workflowId}/download'),
  parameters: z.object({
    query: z.object({
      fileName: z.string().optional(),
      workspaceId: z.number().optional(),
    }),
    path: z.object({
      workflowId: z.string(),
    }),
  }),
  response: z.string(),
};

export type get_DownloadWorkflowTaskLog = typeof get_DownloadWorkflowTaskLog;
export const get_DownloadWorkflowTaskLog = {
  method: z.literal('GET'),
  path: z.literal('/workflow/{workflowId}/download/{taskId}'),
  parameters: z.object({
    query: z.object({
      fileName: z.string().optional(),
      workspaceId: z.number().optional(),
    }),
    path: z.object({
      workflowId: z.string(),
      taskId: z.number(),
    }),
  }),
  response: z.string(),
};

export type get_DescribeWorkflowLaunch = typeof get_DescribeWorkflowLaunch;
export const get_DescribeWorkflowLaunch = {
  method: z.literal('GET'),
  path: z.literal('/workflow/{workflowId}/launch'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    path: z.object({
      workflowId: z.string(),
    }),
  }),
  response: DescribeWorkflowLaunchResponse,
};

export type get_WorkflowLogs = typeof get_WorkflowLogs;
export const get_WorkflowLogs = {
  method: z.literal('GET'),
  path: z.literal('/workflow/{workflowId}/log'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
      next: z.string().optional(),
    }),
    path: z.object({
      workflowId: z.string(),
    }),
  }),
  response: WorkflowLogResponse,
};

export type get_GetWorkflowTaskLog = typeof get_GetWorkflowTaskLog;
export const get_GetWorkflowTaskLog = {
  method: z.literal('GET'),
  path: z.literal('/workflow/{workflowId}/log/{taskId}'),
  parameters: z.object({
    query: z.object({
      next: z.string().optional(),
      workspaceId: z.number().optional(),
    }),
    path: z.object({
      workflowId: z.string(),
      taskId: z.number(),
    }),
  }),
  response: WorkflowLogResponse,
};

export type get_DescribeWorkflowMetrics = typeof get_DescribeWorkflowMetrics;
export const get_DescribeWorkflowMetrics = {
  method: z.literal('GET'),
  path: z.literal('/workflow/{workflowId}/metrics'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    path: z.object({
      workflowId: z.string(),
    }),
  }),
  response: GetWorkflowMetricsResponse,
};

export type get_DescribeWorkflowProgress = typeof get_DescribeWorkflowProgress;
export const get_DescribeWorkflowProgress = {
  method: z.literal('GET'),
  path: z.literal('/workflow/{workflowId}/progress'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    path: z.object({
      workflowId: z.string(),
    }),
  }),
  response: GetProgressResponse,
};

export type get_DescribeWorkflowStar = typeof get_DescribeWorkflowStar;
export const get_DescribeWorkflowStar = {
  method: z.literal('GET'),
  path: z.literal('/workflow/{workflowId}/star'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    path: z.object({
      workflowId: z.string(),
    }),
  }),
  response: CreateWorkflowStarResponse,
};

export type post_CreateWorkflowStar = typeof post_CreateWorkflowStar;
export const post_CreateWorkflowStar = {
  method: z.literal('POST'),
  path: z.literal('/workflow/{workflowId}/star'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    path: z.object({
      workflowId: z.string(),
    }),
  }),
  response: CreateWorkflowStarResponse,
};

export type delete_DeleteWorkflowStar = typeof delete_DeleteWorkflowStar;
export const delete_DeleteWorkflowStar = {
  method: z.literal('DELETE'),
  path: z.literal('/workflow/{workflowId}/star'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    path: z.object({
      workflowId: z.string(),
    }),
  }),
  response: CreateWorkflowStarResponse,
};

export type get_DescribeWorkflowTask = typeof get_DescribeWorkflowTask;
export const get_DescribeWorkflowTask = {
  method: z.literal('GET'),
  path: z.literal('/workflow/{workflowId}/task/{taskId}'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
    }),
    path: z.object({
      workflowId: z.string(),
      taskId: z.number(),
    }),
  }),
  response: DescribeTaskResponse,
};

export type get_ListWorkflowTasks = typeof get_ListWorkflowTasks;
export const get_ListWorkflowTasks = {
  method: z.literal('GET'),
  path: z.literal('/workflow/{workflowId}/tasks'),
  parameters: z.object({
    query: z.object({
      workspaceId: z.number().optional(),
      max: z.number().optional(),
      offset: z.number().optional(),
      sortBy: z.string().optional(),
      sortDir: z.string().optional(),
      search: z.string().optional(),
    }),
    path: z.object({
      workflowId: z.string(),
    }),
  }),
  response: ListTasksResponse,
};

export type get_DownloadDataset = typeof get_DownloadDataset;
export const get_DownloadDataset = {
  method: z.literal('GET'),
  path: z.literal('/workspaces/{workspaceId}/datasets/{datasetId}/v/{version}/n/{fileName}'),
  parameters: z.object({
    path: z.object({
      workspaceId: z.number(),
      datasetId: z.string(),
      version: z.string(),
      fileName: z.string(),
    }),
  }),
  response: z.string(),
};

// <EndpointByMethod>
export const EndpointByMethod: any = {
  get: {
    '/actions': get_ListActions,
    '/actions/types': get_ListActionTypes,
    '/actions/validate': get_ValidateActionName,
    '/actions/{actionId}': get_DescribeAction,
    '/avatars/{avatarId}': get_DownloadAvatar,
    '/compute-envs': get_ListComputeEnvs,
    '/compute-envs/validate': get_ValidateComputeEnvName,
    '/compute-envs/{computeEnvId}': get_DescribeComputeEnv,
    '/credentials': get_ListCredentials,
    '/credentials/validate': get_ValidateCredentialsName,
    '/credentials/{credentialsId}': get_DescribeCredentials,
    '/data-links': get_ListDataLinks,
    '/data-links/{dataLinkId}': get_DescribeDataLink,
    '/data-links/{dataLinkId}/browse': get_ExploreDataLink,
    '/data-links/{dataLinkId}/browse/{path}': get_ExploreDataLink_1,
    '/datasets': get_ListDatasetsV2,
    '/datasets/versions': get_ListLatestDatasetVersionsV2,
    '/datasets/{datasetId}/metadata': get_DescribeDatasetV2,
    '/datasets/{datasetId}/v/{version}/n/{fileName}': get_DownloadDatasetV2,
    '/datasets/{datasetId}/versions': get_ListDatasetVersionsV2,
    '/ga4gh/wes/v1/runs': get_GaRunList,
    '/ga4gh/wes/v1/runs/{run_id}': get_GaRunDescribe,
    '/ga4gh/wes/v1/runs/{run_id}/status': get_GaRunStatus,
    '/ga4gh/wes/v1/service-info': get_GaServiceInfo,
    '/labels': get_ListLabels,
    '/launch/{launchId}': get_DescribeLaunch,
    '/launch/{launchId}/datasets': get_ListLaunchDatasetVersions,
    '/orgs': get_ListOrganizations,
    '/orgs/validate': get_ValidateOrganizationName,
    '/orgs/{orgId}': get_DescribeOrganization,
    '/orgs/{orgId}/collaborators': get_ListOrganizationCollaborators,
    '/orgs/{orgId}/members': get_ListOrganizationMembers,
    '/orgs/{orgId}/teams': get_ListOrganizationTeams,
    '/orgs/{orgId}/teams/validate': get_ValidateTeamName,
    '/orgs/{orgId}/teams/{teamId}': get_DescribeOrganizationTeam,
    '/orgs/{orgId}/teams/{teamId}/members': get_ListOrganizationTeamMembers,
    '/orgs/{orgId}/teams/{teamId}/workspaces': get_ListWorkspacesByTeam,
    '/orgs/{orgId}/workspaces': get_ListWorkspaces,
    '/orgs/{orgId}/workspaces/validate': get_WorkspaceValidate,
    '/orgs/{orgId}/workspaces/{workspaceId}': get_DescribeWorkspace,
    '/orgs/{orgId}/workspaces/{workspaceId}/participants': get_ListWorkspaceParticipants,
    '/pipeline-secrets': get_ListPipelineSecrets,
    '/pipeline-secrets/validate': get_ValidatePipelineSecretName,
    '/pipeline-secrets/{secretId}': get_DescribePipelineSecret,
    '/pipelines': get_ListPipelines,
    '/pipelines/info': get_DescribePipelineRepository,
    '/pipelines/repositories': get_ListPipelineRepositories,
    '/pipelines/validate': get_ValidatePipelineName,
    '/pipelines/{pipelineId}': get_DescribePipeline,
    '/pipelines/{pipelineId}/launch': get_DescribePipelineLaunch,
    '/pipelines/{pipelineId}/schema': get_DescribePipelineSchema,
    '/platforms': get_ListPlatforms,
    '/platforms/{platformId}': get_DescribePlatform,
    '/platforms/{platformId}/regions': get_ListPlatformRegions,
    '/service-info': get_Info,
    '/tokens': get_TokenList,
    '/user-info': get_UserInfo,
    '/user/{userId}/workspaces': get_ListWorkspacesUser,
    '/users/validate': get_ValidateUserName,
    '/users/{userId}': get_DescribeUser,
    '/workflow': get_ListWorkflows,
    '/workflow/random-name': get_GenerateRandomWorkflowName,
    '/workflow/validate': get_ValidateWorkflowConstraints,
    '/workflow/{workflowId}': get_DescribeWorkflow,
    '/workflow/{workflowId}/download': get_DownloadWorkflowLog,
    '/workflow/{workflowId}/download/{taskId}': get_DownloadWorkflowTaskLog,
    '/workflow/{workflowId}/launch': get_DescribeWorkflowLaunch,
    '/workflow/{workflowId}/log': get_WorkflowLogs,
    '/workflow/{workflowId}/log/{taskId}': get_GetWorkflowTaskLog,
    '/workflow/{workflowId}/metrics': get_DescribeWorkflowMetrics,
    '/workflow/{workflowId}/progress': get_DescribeWorkflowProgress,
    '/workflow/{workflowId}/star': get_DescribeWorkflowStar,
    '/workflow/{workflowId}/task/{taskId}': get_DescribeWorkflowTask,
    '/workflow/{workflowId}/tasks': get_ListWorkflowTasks,
    '/workspaces/{workspaceId}/datasets/{datasetId}/v/{version}/n/{fileName}': get_DownloadDataset,
  },
  post: {
    '/actions': post_CreateAction,
    '/actions/labels/add': post_AddLabelsToActions,
    '/actions/labels/apply': post_ApplyLabelsToActions,
    '/actions/labels/remove': post_RemoveLabelsFromActions,
    '/actions/{actionId}/launch': post_LaunchAction,
    '/actions/{actionId}/pause': post_PauseAction,
    '/avatars': post_CreateAvatar,
    '/compute-envs': post_CreateComputeEnv,
    '/compute-envs/{computeEnvId}/primary': post_UpdateComputeEnvPrimary,
    '/credentials': post_CreateCredentials,
    '/data-links': post_CreateCustomDataLink,
    '/datasets': post_CreateDatasetV2,
    '/datasets/{datasetId}/upload': post_UploadDatasetV2,
    '/ga4gh/wes/v1/runs': post_GaRunCreate,
    '/ga4gh/wes/v1/runs/{run_id}/cancel': post_GaRunCancel,
    '/labels': post_CreateLabel,
    '/orgs': post_CreateOrganization,
    '/orgs/{orgId}/teams': post_CreateOrganizationTeam,
    '/orgs/{orgId}/teams/{teamId}/members': post_CreateOrganizationTeamMember,
    '/orgs/{orgId}/workspaces': post_CreateWorkspace,
    '/pipeline-secrets': post_CreatePipelineSecret,
    '/pipelines': post_CreatePipeline,
    '/pipelines/labels/add': post_AddLabelsToPipelines,
    '/pipelines/labels/apply': post_ApplyLabelsToPipelines,
    '/pipelines/labels/remove': post_RemoveLabelsFromPipelines,
    '/tokens': post_CreateToken,
    '/trace/create': post_CreateTrace,
    '/users/{userId}': post_UpdateUser,
    '/workflow/delete': post_DeleteWorkflowMany,
    '/workflow/labels/add': post_AddLabelsToWorkflows,
    '/workflow/labels/apply': post_ApplyLabelsToWorkflows,
    '/workflow/labels/remove': post_RemoveLabelsFromWorkflows,
    '/workflow/launch': post_CreateWorkflowLaunch,
    '/workflow/{workflowId}/cancel': post_CancelWorkflow,
    '/workflow/{workflowId}/star': post_CreateWorkflowStar,
  },
  put: {
    '/actions/{actionId}': put_UpdateAction,
    '/compute-envs/{computeEnvId}': put_UpdateComputeEnv,
    '/credentials/{credentialsId}': put_UpdateCredentials,
    '/data-links/{dataLinkId}': put_UpdateCustomDataLink,
    '/datasets/{datasetId}': put_UpdateDatasetV2,
    '/labels/{labelId}': put_UpdateLabel,
    '/orgs/{orgId}': put_UpdateOrganization,
    '/orgs/{orgId}/members/add': put_CreateOrganizationMember,
    '/orgs/{orgId}/members/{memberId}/role': put_UpdateOrganizationMemberRole,
    '/orgs/{orgId}/teams/{teamId}': put_UpdateOrganizationTeam,
    '/orgs/{orgId}/workspaces/{workspaceId}': put_UpdateWorkspace,
    '/orgs/{orgId}/workspaces/{workspaceId}/participants/add': put_CreateWorkspaceParticipant,
    '/orgs/{orgId}/workspaces/{workspaceId}/participants/{participantId}/role': put_UpdateWorkspaceParticipantRole,
    '/pipeline-secrets/{secretId}': put_UpdatePipelineSecret,
    '/pipelines/{pipelineId}': put_UpdatePipeline,
    '/trace/{workflowId}/begin': put_UpdateTraceBegin,
    '/trace/{workflowId}/complete': put_UpdateTraceComplete,
    '/trace/{workflowId}/heartbeat': put_UpdateTraceHeartbeat,
    '/trace/{workflowId}/progress': put_UpdateTraceProgress,
  },
  delete: {
    '/actions/{actionId}': delete_DeleteAction,
    '/compute-envs/{computeEnvId}': delete_DeleteComputeEnv,
    '/credentials/{credentialsId}': delete_DeleteCredentials,
    '/data-links/{dataLinkId}': delete_DeleteCustomDataLink,
    '/datasets/{datasetId}': delete_DeleteDatasetV2,
    '/labels/{labelId}': delete_DeleteLabel,
    '/orgs/{orgId}': delete_DeleteOrganization,
    '/orgs/{orgId}/members/leave': delete_LeaveOrganization,
    '/orgs/{orgId}/members/{memberId}': delete_DeleteOrganizationMember,
    '/orgs/{orgId}/teams/{teamId}': delete_DeleteOrganizationTeam,
    '/orgs/{orgId}/teams/{teamId}/members/{memberId}/delete': delete_DeleteOrganizationTeamMember,
    '/orgs/{orgId}/workspaces/{workspaceId}': delete_DeleteWorkspace,
    '/orgs/{orgId}/workspaces/{workspaceId}/participants': delete_LeaveWorkspaceParticipant,
    '/orgs/{orgId}/workspaces/{workspaceId}/participants/{participantId}': delete_DeleteWorkspaceParticipant,
    '/pipeline-secrets/{secretId}': delete_DeletePipelineSecret,
    '/pipelines/{pipelineId}': delete_DeletePipeline,
    '/tokens/delete-all': delete_DeleteAllTokens,
    '/tokens/{tokenId}': delete_DeleteToken,
    '/users/{userId}': delete_DeleteUser,
    '/workflow/{workflowId}': delete_DeleteWorkflow,
    '/workflow/{workflowId}/star': delete_DeleteWorkflowStar,
  },
};
export type EndpointByMethod = typeof EndpointByMethod;
// </EndpointByMethod>

// <EndpointByMethod.Shorthands>
export type GetEndpoints = EndpointByMethod['get'];
export type PostEndpoints = EndpointByMethod['post'];
export type PutEndpoints = EndpointByMethod['put'];
export type DeleteEndpoints = EndpointByMethod['delete'];
export type AllEndpoints = EndpointByMethod[keyof EndpointByMethod];
// </EndpointByMethod.Shorthands>

// <ApiClientTypes>
export type EndpointParameters = {
  body?: unknown;
  query?: Record<string, unknown>;
  header?: Record<string, unknown>;
  path?: Record<string, unknown>;
};

export type MutationMethod = 'post' | 'put' | 'patch' | 'delete';
export type Method = 'get' | 'head' | MutationMethod;

export type DefaultEndpoint = {
  parameters?: EndpointParameters | undefined;
  response: unknown;
};

export type Endpoint<TConfig extends DefaultEndpoint = DefaultEndpoint> = {
  operationId: string;
  method: Method;
  path: string;
  parameters?: TConfig['parameters'];
  meta: {
    alias: string;
    hasParameters: boolean;
    areParametersRequired: boolean;
  };
  response: TConfig['response'];
};
