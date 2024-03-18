import {
  DeleteItemCommandOutput,
  GetItemCommandOutput,
  PutItemCommandOutput,
  QueryCommandOutput,
  ScanCommandOutput,
  UpdateItemCommandOutput,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
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
    console.info(`${logRequestMessage}`);

    const response: PutItemCommandOutput = await this.putItem({
      TableName: this.PRIVATE_WORKFLOW_TABLE_NAME,
      Item: marshall(privateWorkflow),
      ConditionExpression: 'attribute_not_exists(#PK) AND attribute_not_exists(#SK)',
      ExpressionAttributeNames: {
        '#PK': 'Url',
        '#SK': 'Version',
      },
    });

    if (response.$metadata.httpStatusCode === 200) {
      return privateWorkflow;
    } else {
      throw new Error(`${logRequestMessage} unsuccessful: HTTP Status Code=${response.$metadata.httpStatusCode}`);
    }
  };

  public get = async (hashKey: string, sortKey: string): Promise<PrivateWorkflow> => {
    const logRequestMessage = `Get Private Workflow Url=${hashKey}, Version=${sortKey} request`;
    console.info(logRequestMessage);

    const response: GetItemCommandOutput = await this.getItem({
      TableName: this.PRIVATE_WORKFLOW_TABLE_NAME,
      Key: {
        Url: { S: hashKey },
        Version: { S: sortKey },
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

  public query = async (gsiId: string): Promise<PrivateWorkflow> => {
    const logRequestMessage = `Query Private Workflow by PrivateWorkflowId=${gsiId} request`;
    console.info(logRequestMessage);

    const response: QueryCommandOutput = await this.queryItems({
      TableName: this.PRIVATE_WORKFLOW_TABLE_NAME,
      IndexName: 'PrivateWorkflowId_Index', // Secondary Global Index
      KeyConditionExpression: 'PrivateWorkflowId = :v_id',
      ExpressionAttributeValues: {
        ':v_id': { S: gsiId },
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
    const logRequestMessage = 'List Private Workflow(s) request';
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

    const response: UpdateItemCommandOutput = await this.updateItem({
      TableName: this.PRIVATE_WORKFLOW_TABLE_NAME,
      Key: {
        Url: { S: privateWorkflow.Url },
        Version: { S: privateWorkflow.Version },
      },
      ConditionExpression: '#PK = :pk AND #SK = :sk',
      ExpressionAttributeNames: {
        '#PK': 'Url',
        '#SK': 'Version',
        '#Status': 'Status',
        '#EfsVolumeUri': 'EfsVolumeUri',
        '#ModifiedAt': 'ModifiedAt',
        '#ModifiedBy': 'ModifiedBy',
      },
      ExpressionAttributeValues: {
        ':pk': {
          S: privateWorkflow.Url,
        },
        ':sk': {
          S: privateWorkflow.Version,
        },
        ':status': {
          S: privateWorkflow.Status || '',
        },
        ':efsVolumeUri': {
          S: privateWorkflow.EfsVolumeUri || '',
        },
        ':modifiedAt': {
          S: privateWorkflow.ModifiedAt || '',
        },
        ':modifiedBy': {
          S: privateWorkflow.ModifiedBy || '',
        },
      },
      UpdateExpression: 'SET #Status = :status, #EfsVolumeUri = :efsVolumeUri, #ModifiedAt = :modifiedAt, #ModifiedBy = :modifiedBy',
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
