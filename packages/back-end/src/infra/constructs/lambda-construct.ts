import * as fs from 'fs';
import path from 'path';
import { AssociativeArray } from '@easy-genomics/shared-lib/src/app/utils/common';
import { toPascalCase } from '@easy-genomics/shared-lib/src/app/utils/string-utils';
import { aws_lambda, aws_lambda_nodejs, Duration, StackProps } from 'aws-cdk-lib';
import {
  JsonSchema,
  LambdaIntegration,
  Resource,
  RestApi,
  CognitoUserPoolsAuthorizer,
} from 'aws-cdk-lib/aws-apigateway';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { IEventSource, IFunction, Runtime } from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export interface LambdaConstructProps extends StackProps {
  restApi: RestApi;
  userPool: UserPool;
  lambdaFunctionsDir: string;
  lambdaFunctionsNamespace: string;
  lambdaFunctionsResources: {
    [key: string]: LambdaFunctionsResources;
  };
  lambdaTimeoutInSeconds: number;
  environment?: {
    // Common process.env settings
    [key: string]: string;
  };
}

interface LambdaFunctionsResources {
  policies?: PolicyStatement[];
  schemas?: JsonSchema[];
  events?: IEventSource[];
  misc?: ((fn: IFunction) => void)[];
  environment?: {
    // Specific process.env settings
    [key: string]: string;
  };
}

// List of allowed Lambda Function operation with respective REST API command mapping
export enum ALLOWED_LAMBDA_FUNCTION_OPERATIONS {
  create = 'POST',
  abort = 'POST',
  complete = 'POST',
  request = 'POST',
  list = 'GET', // List multiple records
  read = 'GET', // Read single record
  update = 'PUT',
  cancel = 'PUT',
  patch = 'PATCH',
  delete = 'DELETE',
  process = 'None', // Generic operation not mapped to REST API (e.g. S3 Event Trigger, etc.)
}

export class LambdaConstruct extends Construct {
  private props: LambdaConstructProps;
  private authorizer: CognitoUserPoolsAuthorizer;

  constructor(scope: Construct, id: string, props: LambdaConstructProps) {
    super(scope, id);
    this.props = props;

    this.authorizer = new CognitoUserPoolsAuthorizer(this, `${id}-user-pool-authorizer`, {
      cognitoUserPools: [this.props.userPool],
    });

    // Find all existing Lambda Functions within specified lambdaFunctionsDir
    this.getLambdaFunctions(path.join(__dirname, `../../../${this.props.lambdaFunctionsDir}`)).map(
      (lambdaFunction: AssociativeArray<string>) => {
        // Register Lambda Function with API Gateway REST API
        this.registerLambdaFunction(lambdaFunction);
      },
    );

    // Attach the Schema Models to API Gateway REST API
    for (const [_, value] of Object.entries(this.props.lambdaFunctionsResources)) {
      value.schemas?.map((schema: JsonSchema) => {
        this.props.restApi.addModel(`${toPascalCase(schema.title!)}`, {
          modelName: `${toPascalCase(schema.title!)}`,
          schema: schema,
        });
      });
    }
  }

  /**
   * Registers the Lambda function with the supplied API Gateway REST API.
   * @param lambdaFunction
   */
  private registerLambdaFunction = (lambdaFunction: AssociativeArray<string>) => {
    const lambdaPath: string = path.parse(lambdaFunction.path).dir;
    const lambdaHandlerName: string = path.parse(lambdaFunction.path).name; // Removes .ts
    const lambdaName: string = path.parse(lambdaHandlerName).name; // Removes .lambda
    const lambdaId: string = `${this.props.lambdaFunctionsNamespace}-${lambdaName}`;
    const lambdaApiDir = `${lambdaPath.split(this.props.lambdaFunctionsDir)[1]}`;
    const lambdaApiEndpoint: string = `${lambdaApiDir}/${lambdaName}`;

    const commonProcessEnv = this.props.environment || undefined;
    const lambdaProcessEnv = this.props.lambdaFunctionsResources[lambdaApiEndpoint]?.environment || undefined;

    const lambdaHandler: IFunction = new aws_lambda_nodejs.NodejsFunction(this, `${lambdaId}`, {
      runtime: Runtime.NODEJS_18_X,
      timeout: Duration.seconds(this.props.lambdaTimeoutInSeconds),
      functionName: `${this.props.lambdaFunctionsNamespace}-${lambdaName}`.slice(0, 64),
      entry: `${lambdaFunction.path}`,
      handler: 'handler',
      tracing: aws_lambda.Tracing.ACTIVE,
      bundling: {
        externalModules: ['aws-sdk'],
        loader: { '.hbs': 'text' },
      },
      logRetention: RetentionDays.ONE_DAY,
      logRetentionRetryOptions: {
        // Attempt to avoid LogRetention creation failure due to throttling
        maxRetries: 10, // AWS default is 3
      },
      environment: {
        ...commonProcessEnv, // Common process.env settings
        ...lambdaProcessEnv, // Specific process.env settings
      },
    });

    // Attach relevant IAM policies to Lambda Function matching specific API Endpoint or the associated parent API Dir
    if (this.props.lambdaFunctionsResources[lambdaApiEndpoint]) {
      // e.g. /omics-storage/create-reference-store
      this.props.lambdaFunctionsResources[lambdaApiEndpoint].policies?.map((policyStatement: PolicyStatement) => {
        lambdaHandler.addToRolePolicy(policyStatement);
      });

      if (lambdaFunction.command === 'process') {
        this.props.lambdaFunctionsResources[lambdaApiEndpoint].events?.map((eventSource: IEventSource) => {
          // Register Lambda Function Event Source Listeners/Triggers
          lambdaHandler.addEventSource(eventSource);
        });
      }

      this.props.lambdaFunctionsResources[lambdaApiEndpoint].misc?.forEach((callback) => {
        callback(lambdaHandler);
      });
    } else if (this.props.lambdaFunctionsResources[lambdaApiDir]) {
      // e.g. /omics-storage
      this.props.lambdaFunctionsResources[lambdaApiDir].policies?.map((policyStatement: PolicyStatement) => {
        lambdaHandler.addToRolePolicy(policyStatement);
      });
    }

    if (lambdaFunction.command !== 'process') {
      // Register Lambda Function Endpoint with API Gateway REST API
      const pathResource = this.props.restApi.root.resourceForPath(lambdaApiEndpoint);
      // Attach REST API Request methods for the respective Lambda function
      switch (lambdaFunction.command) {
        case 'create': {
          pathResource.addMethod(ALLOWED_LAMBDA_FUNCTION_OPERATIONS.create, new LambdaIntegration(lambdaHandler), {
            authorizer: this.authorizer,
          });
          break;
        }
        case 'abort': {
          pathResource.addMethod(ALLOWED_LAMBDA_FUNCTION_OPERATIONS.abort, new LambdaIntegration(lambdaHandler), {
            authorizer: this.authorizer,
          });
          break;
        }
        case 'complete': {
          pathResource.addMethod(ALLOWED_LAMBDA_FUNCTION_OPERATIONS.complete, new LambdaIntegration(lambdaHandler), {
            authorizer: this.authorizer,
          });
          break;
        }
        case 'request': {
          pathResource.addMethod(ALLOWED_LAMBDA_FUNCTION_OPERATIONS.request, new LambdaIntegration(lambdaHandler), {
            authorizer: this.authorizer,
          });
          break;
        }
        case 'list': {
          pathResource.addMethod(ALLOWED_LAMBDA_FUNCTION_OPERATIONS.list, new LambdaIntegration(lambdaHandler), {
            authorizer: this.authorizer,
          });
          break;
        }
        case 'read': {
          const pathResourceWithId: Resource = pathResource.addResource('{id}');
          pathResourceWithId.addMethod(ALLOWED_LAMBDA_FUNCTION_OPERATIONS.read, new LambdaIntegration(lambdaHandler), {
            authorizer: this.authorizer,
          });
          break;
        }
        case 'update': {
          const pathResourceWithId: Resource = pathResource.addResource('{id}');
          pathResourceWithId.addMethod(
            ALLOWED_LAMBDA_FUNCTION_OPERATIONS.update,
            new LambdaIntegration(lambdaHandler),
            {
              authorizer: this.authorizer,
            },
          );
          break;
        }
        case 'cancel': {
          const pathResourceWithId: Resource = pathResource.addResource('{id}');
          pathResourceWithId.addMethod(
            ALLOWED_LAMBDA_FUNCTION_OPERATIONS.cancel,
            new LambdaIntegration(lambdaHandler),
            {
              authorizer: this.authorizer,
            },
          );
          break;
        }
        case 'patch': {
          const pathResourceWithId: Resource = pathResource.addResource('{id}');
          pathResourceWithId.addMethod(ALLOWED_LAMBDA_FUNCTION_OPERATIONS.patch, new LambdaIntegration(lambdaHandler), {
            authorizer: this.authorizer,
          });
          break;
        }
        case 'delete': {
          const pathResourceWithId: Resource = pathResource.addResource('{id}');
          pathResourceWithId.addMethod(
            ALLOWED_LAMBDA_FUNCTION_OPERATIONS.delete,
            new LambdaIntegration(lambdaHandler),
            { authorizer: this.authorizer },
          );
          break;
        }
        default:
          throw new Error(`Unsupported REST API Command: ${lambdaFunction.command}`);
      }
    }
  };

  /**
   * Recursive function that finds the paths of each existing Lambda function
   * within the specified directory and resolves the REST API request type for
   * registering with API Gateway.
   *
   * The Lambda function definitions must start with a support REST API command
   * as defined by ALLOWED_LAMBDA_FUNCTION_OPERATIONS and end with '.lambda.ts'.
   *
   * @param directory
   * @param lambdaFunctions
   */
  private getLambdaFunctions = (
    directory: string,
    lambdaFunctions: AssociativeArray<string>[] = [],
  ): AssociativeArray<string>[] => {
    const filesInDirectory: string[] = fs.readdirSync(directory);
    for (const file of filesInDirectory) {
      const absolute: string = path.join(directory, file);
      if (fs.statSync(absolute).isDirectory()) {
        this.getLambdaFunctions(absolute, lambdaFunctions);
      } else {
        if (file.endsWith('.lambda.ts')) {
          const lambdaRestApiCommand: string = file.split('-', 1).pop()!;
          if (lambdaRestApiCommand in ALLOWED_LAMBDA_FUNCTION_OPERATIONS) {
            lambdaFunctions.push({
              path: absolute,
              command: lambdaRestApiCommand,
            });
          }
        }
      }
    }
    return lambdaFunctions;
  };
}
