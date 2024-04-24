import { Environment, StackProps } from 'aws-cdk-lib';

// Defines the BaseStack shared props for Front-End & Back-End subprojects
export interface BaseStackProps extends StackProps {
    env: Environment;
    constructNamespace: string;
    devEnv?: boolean;
    envName: string;
    envType: string;
}

// Defines Front-End Stack props
export interface FrontEndStackProps extends BaseStackProps {
    applicationUrl: string;
    baseApiUrl: string;
    certificateArn: string;
    cognitoClientId: string;
    cognitoUserPoolId: string;
    hostedZoneId: string;
    hostedZoneName: string;
}

// Defines Back-End Stack props
export interface BackEndStackProps extends BaseStackProps {
    namePrefix: string;
    lambdaTimeoutInSeconds: number;
    systemAdminEmail?: string;
}
