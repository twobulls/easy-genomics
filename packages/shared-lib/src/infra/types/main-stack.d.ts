import { Environment, StackProps } from 'aws-cdk-lib';

// Defines the BaseStack shared props for Front-End & Back-End subprojects
export interface BaseStackProps extends StackProps {
  env: Environment;
  constructNamespace: string;
  devEnv: boolean;
  envName: string;
  envType: string;
  appDomainName: string;
  awsHostedZoneId?: string;
  awsCertificateArn?: string;
}

// Defines Front-End Stack props
export interface FrontEndStackProps extends BaseStackProps {}

export interface VpcPeering {
  externalVpcId: string;
  externalAwsAccountId: string;
  externalAwsRegion: string;
  externalRoleArn: string;
  externalCidrBlock: string;
}

// Defines Back-End Stack props
export interface BackEndStackProps extends BaseStackProps {
  namePrefix: string;
  jwtSecretKey: string;
  sysAdminEmail?: string;
  sysAdminPassword?: string;
  orgAdminEmail?: string;
  orgAdminPassword?: string;
  seqeraApiBaseUrl: string;
  vpcPeering?: VpcPeering;
}
