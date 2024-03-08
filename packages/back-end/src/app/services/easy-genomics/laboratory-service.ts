import { GetItemCommandOutput, QueryCommandOutput, ScanCommandOutput } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/persistence/easy-genomics/laboratory';
import { Service } from '../../types/service';
import { DynamoDBService } from '../dynamodb-service';

export class LaboratoryService extends DynamoDBService implements Service {
  readonly LABORATORY_TABLE_NAME: string = `${process.env.NAME_PREFIX}-laboratory-table`;
  readonly UNIQUE_REFERENCE_TABLE_NAME: string = `${process.env.NAME_PREFIX}-unique-reference-table`;

  public constructor() {
    super();
  }

  public add = async (laboratory: Laboratory): Promise<Laboratory> => {
    throw new Error('TBD');
  };

  public get = async (hashKey: string, sortKey: string): Promise<Laboratory> => {
    const logRequestMessage = `Get Laboratory OrganizationId=${hashKey}, LaboratoryId=${sortKey} request`;
    console.info(logRequestMessage);

    const response: GetItemCommandOutput = await this.getItem({
      TableName: this.LABORATORY_TABLE_NAME,
      Key: {
        OrganizationId: { S: hashKey },
        LaboratoryId: { S: sortKey },
      },
    });

    if (response.$metadata.httpStatusCode === 200) {
      if (response.Item) {
        return <Laboratory>unmarshall(response.Item);
      } else {
        throw new Error(`${logRequestMessage} unsuccessful: Resource not found`);
      }
    } else {
      throw new Error(`${logRequestMessage} unsuccessful: HTTP Status Code=${response.$metadata.httpStatusCode}`);
    }
  };

  public query = async (gsiId: string): Promise<Laboratory> => {
    const logRequestMessage = `Query Laboratory by LaboratoryId=${gsiId} request`;
    console.info(logRequestMessage);

    const response: QueryCommandOutput = await this.queryItems({
      TableName: this.LABORATORY_TABLE_NAME,
      IndexName: 'LaboratoryId_Index', // Secondary Global Index
      KeyConditionExpression: 'LaboratoryId = :v_id',
      ExpressionAttributeValues: {
        ':v_id': { S: gsiId },
      },
      ScanIndexForward: false,
    });

    if (response.$metadata.httpStatusCode === 200) {
      if (response.Items) {
        if (response.Items.length === 1) {
          return <Laboratory>unmarshall(response.Items.shift()!);
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

  public list = async (): Promise<Laboratory[]> => {
    const logRequestMessage = 'List Laboratories(s) request';
    console.info(logRequestMessage);

    const response: ScanCommandOutput = await this.findAll({
      TableName: this.LABORATORY_TABLE_NAME,
    });

    if (response.$metadata.httpStatusCode === 200) {
      return <Laboratory[]>response.Items?.map(item => unmarshall(item));
    } else {
      throw new Error(`${logRequestMessage} unsuccessful: HTTP Status Code=${response.$metadata.httpStatusCode}`);
    }
  };

  public update = async (laboratory: Laboratory, existing: Laboratory): Promise<Laboratory> => {
    throw new Error('TBD');
  };

  public delete = async (laboratory: Laboratory): Promise<boolean> => {
    throw new Error('TBD');
  };
}
