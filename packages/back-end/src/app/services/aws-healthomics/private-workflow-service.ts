import {
  DeleteItemCommandOutput,
  GetItemCommandOutput,
  PutItemCommandOutput,
  QueryCommandOutput,
  ScanCommandOutput,
  UpdateItemCommandOutput,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { PrivateWorkflowSchema } from '@easy-genomics/shared-lib/src/app/schema/aws-healthomics/private-workflow';
import { PrivateWorkflow } from '@easy-genomics/shared-lib/src/app/types/aws-healthomics/private-workflow';
import { Service } from '../../types/service';
import { DynamoDBService } from '../dynamodb-service';

export class PrivateWorkflowService extends DynamoDBService implements Service {
  readonly PRIVATE_WORKFLOW_TABLE_NAME: string = `${process.env.NAME_PREFIX}-healthomics-private-workflow-table`;

  public constructor() {
    super();
  }

  public add = async (privateWorkflow: PrivateWorkflow): Promise<PrivateWorkflow> => {
    const logRequestMessage = `Add Private Workflow Url=${privateWorkflow.Url}, Version=${privateWorkflow.Url} request`;
    console.info(logRequestMessage);

    // Data validation safety check
    if (!PrivateWorkflowSchema.safeParse(privateWorkflow).success) throw new Error('Invalid request');

    const response: PutItemCommandOutput = await this.putItem({
      TableName: this.PRIVATE_WORKFLOW_TABLE_NAME,
      ConditionExpression: 'attribute_not_exists(#Url) AND attribute_not_exists(#Version)',
      ExpressionAttributeNames: {
        '#Url': 'Url',
        '#Version': 'Version',
      },
      Item: marshall(privateWorkflow),
    });

    if (response.$metadata.httpStatusCode === 200) {
      return privateWorkflow;
    } else {
      throw new Error(`${logRequestMessage} unsuccessful: HTTP Status Code=${response.$metadata.httpStatusCode}`);
    }
  };

  public get = async (url: string, version: string): Promise<PrivateWorkflow> => {
    const logRequestMessage = `Get Private Workflow Url=${url}, Version=${version} request`;
    console.info(logRequestMessage);

    const response: GetItemCommandOutput = await this.getItem({
      TableName: this.PRIVATE_WORKFLOW_TABLE_NAME,
      Key: {
        Url: { S: url }, // Hash Key / Partition Key
        Version: { S: version }, // Sort Key
      },
    });

    if (response.$metadata.httpStatusCode === 200) {
      if (response.Item) {
        return <PrivateWorkflow>unmarshall(response.Item);
      } else {
        throw new Error(`${logRequestMessage} unsuccessful: Resource not found`);
      }
    } else {
      throw new Error(`${logRequestMessage} unsuccessful: HTTP Status Code=${response.$metadata.httpStatusCode}`);
    }
  };

  public query = async (privateWorkflowId: string): Promise<PrivateWorkflow> => {
    const logRequestMessage = `Query Private Workflow by PrivateWorkflowId=${privateWorkflowId} request`;
    console.info(logRequestMessage);

    const response: QueryCommandOutput = await this.queryItems({
      TableName: this.PRIVATE_WORKFLOW_TABLE_NAME,
      IndexName: 'PrivateWorkflowId_Index', // Global Secondary Index
      KeyConditionExpression: '#PrivateWorkflowId = :privateWorkflowId',
      ExpressionAttributeNames: {
        '#PrivateWorkflowId': 'PrivateWorkflowId',
      },
      ExpressionAttributeValues: {
        ':privateWorkflowId': { S: privateWorkflowId },
      },

      ScanIndexForward: false,
    });

    if (response.$metadata.httpStatusCode === 200) {
      if (response.Items) {
        if (response.Items.length === 1) {
          return <PrivateWorkflow>unmarshall(response.Items.shift()!);
        } else if (response.Items.length === 0) {
          throw new Error(`${logRequestMessage} unsuccessful: Resource not found`);
        } else {
          throw new Error(`${logRequestMessage} unsuccessful: Returned unexpected ${response.Items.length} items`);
        }
      } else {
        throw new Error(`${logRequestMessage} unsuccessful: Resource not found`);
      }
    } else {
      throw new Error(`${logRequestMessage} unsuccessful: HTTP Status Code=${response.$metadata.httpStatusCode}`);
    }
  };

  public list = async (): Promise<PrivateWorkflow[]> => {
    const logRequestMessage = 'List Private Workflows request';
    console.info(logRequestMessage);

    const response: ScanCommandOutput = await this.findAll({
      TableName: this.PRIVATE_WORKFLOW_TABLE_NAME,
    });

    if (response.$metadata.httpStatusCode === 200) {
      return <PrivateWorkflow[]>response.Items?.map(item => unmarshall(item));
    } else {
      throw new Error(`${logRequestMessage} unsuccessful: HTTP Status Code=${response.$metadata.httpStatusCode}`);
    }
  };

  public update = async (privateWorkflow: PrivateWorkflow): Promise<PrivateWorkflow> => {
    const logRequestMessage = `Update Private Workflow Url=${privateWorkflow.Url}, Version=${privateWorkflow.Version} request`;
    console.info(logRequestMessage);

    // Data validation safety check
    if (!PrivateWorkflowSchema.safeParse(privateWorkflow).success) throw new Error('Invalid request');

    const updateExclusions: string[] = ['Url', 'Version', 'PrivateWorkflowId', 'CreatedAt', 'CreatedBy'];

    const expressionAttributeNames: {[p: string]: string} = this.getExpressionAttributeNamesDefinition(privateWorkflow, updateExclusions);
    const expressionAttributeValues: {[p: string]: any} = this.getExpressionAttributeValuesDefinition(privateWorkflow, updateExclusions);
    const updateExpression: string = this.getUpdateExpression(expressionAttributeNames, expressionAttributeValues);

    const response: UpdateItemCommandOutput = await this.updateItem({
      TableName: this.PRIVATE_WORKFLOW_TABLE_NAME,
      Key: {
        Url: { S: privateWorkflow.Url },
        Version: { S: privateWorkflow.Version },
      },
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      UpdateExpression: updateExpression,
      ReturnValues: 'ALL_NEW',
    });

    if (response.$metadata.httpStatusCode === 200) {
      if (response.Attributes) {
        return <PrivateWorkflow>unmarshall(response.Attributes);
      } else {
        throw new Error(`${logRequestMessage} unsuccessful: Returned unexpected response`);
      }
    } else {
      throw new Error(`${logRequestMessage} unsuccessful: HTTP Status Code=${response.$metadata.httpStatusCode}`);
    }
  };

  public delete = async (privateWorkflow: PrivateWorkflow): Promise<boolean> => {
    const logRequestMessage = `Delete Private Workflow Url=${privateWorkflow.Url}, Version=${privateWorkflow.Version} request`;
    console.info(logRequestMessage);

    const response: DeleteItemCommandOutput = await this.deleteItem({
      TableName: this.PRIVATE_WORKFLOW_TABLE_NAME,
      Key: {
        Url: { S: privateWorkflow.Url },
        Version: { S: privateWorkflow.Version },
      },
    });

    if (response.$metadata.httpStatusCode === 200) {
      return true;
    } else {
      throw new Error(`${logRequestMessage} unsuccessful: HTTP Status Code=${response.$metadata.httpStatusCode}`);
    }
  };
}
