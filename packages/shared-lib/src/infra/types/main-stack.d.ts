import { Environment, StackProps } from 'aws-cdk-lib';

// Defines the BaseStack shared props for Front-End & Back-End subprojects
export interface BaseStackProps extends StackProps {
    env: Environment;
    constructNamespace: string;
    devEnv: boolean;
    envName: string;
    envType: string;
    appDomainName: string;
    hostedZoneId?: string;
}

// Defines Front-End Stack props
export interface FrontEndStackProps extends BaseStackProps {
    certificateArn: string;
}

// Defines Back-End Stack props
export interface BackEndStackProps extends BaseStackProps {
    namePrefix: string;
    secretKey: string;
    systemAdminEmail: string;
    systemAdminPassword: string;
    testUserEmail?: string;
    testUserPassword?: string;
    seqeraApiBaseUrl: string;
}
