import { Environment, StackProps } from 'aws-cdk-lib';

// Defines the Main Stack shared props for Front-End & Back-End subprojects
export interface MainStackProps extends StackProps {
    constructNamespace: string;
    env: Environment;
    envName: string;
    devEnv?: boolean;
    lambdaTimeoutInSeconds: number;
    /**
     * The deployment of the frontend application
     */
    siteDistribution: {
        /**
         * the domain of the frontend application deployment
         */
        domainName: string;
        hostedZoneId: string;
        hostedZoneName: string;
        certificateArn: string;
    }
}