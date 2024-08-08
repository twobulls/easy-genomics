import { Environment, StackProps } from 'aws-cdk-lib';

// Defines the BaseStack shared props for Front-End & Back-End subprojects
export interface BaseStackProps extends StackProps {
    env: Environment;
    constructNamespace: string;
    devEnv: boolean;
    envName: string;
    envType: string;
    appDomainName: string;
}

// Defines Front-End Stack props
export interface FrontEndStackProps extends BaseStackProps {
    hostedZoneId: string;
    certificateArn: string;
}

// Defines Back-End Stack props
export interface BackEndStackProps extends BaseStackProps {
    namePrefix: string;
    systemAdminEmail: string;
    systemAdminPassword: string;
    secretKey: string;
    testUserEmail?: string;
    testUserPassword?: string;
    seqeraApiBaseUrl: string;
}
