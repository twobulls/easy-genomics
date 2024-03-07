import { Environment, StackProps } from 'aws-cdk-lib';

// Defines the Main Stack shared props for Front-End & Back-End subprojects
export interface MainStackProps extends StackProps {
    constructNamespace: string;
    env: Environment;
    envType: string;
    devEnv?: boolean;
    lambdaTimeoutInSeconds: number;
    namePrefix: string;
    /**
     * The deployment of the frontend application
     */
    siteDistribution: {
        /**
         * the application uri for the frontend application deployment
         */
        applicationUri: string;
        hostedZoneId: string;
        hostedZoneName: string;
        certificateArn: string;
    }
}