import {
  QueryCommandOutput,
} from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { LaboratoryUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-user';
import { Service } from '../../types/service';
import { DynamoDBService } from '../dynamodb-service';

export class LaboratoryUserService extends DynamoDBService implements Service {
  readonly LABORATORY_USER_TABLE_NAME: string = `${process.env.NAME_PREFIX}-laboratory-user-table`;

  public constructor() {
    super();
  }

  public add = async (laboratoryUser: LaboratoryUser): Promise<LaboratoryUser> => {
    throw new Error('TBD');
  };

  public get = async (hashKey: string, sortKey: string): Promise<LaboratoryUser> => {
    throw new Error('TBD');
  };

  public query = async (hashKey: string): Promise<LaboratoryUser[]> => {
    const logRequestMessage = `Query LaboratoryUser(s) by LaboratoryId=${hashKey} request`;
    console.info(logRequestMessage);

    const response: QueryCommandOutput = await this.queryItems({
      TableName: this.LABORATORY_USER_TABLE_NAME,
      KeyConditionExpression: '#PK = :pk',
      ExpressionAttributeNames: {
        '#PK': 'LaboratoryId',
      },
      ExpressionAttributeValues: {
        ':pk': { S: hashKey },
      },
      ScanIndexForward: false,
    });

    if (response.$metadata.httpStatusCode === 200) {
      if (response.Items) {
        return response.Items.map(item => <LaboratoryUser>unmarshall(item));
      } else {
        throw new Error(`${logRequestMessage} unsuccessful: Resource not found`);
      }
    } else {
      throw new Error(`${logRequestMessage} unsuccessful: HTTP Status Code=${response.$metadata.httpStatusCode}`);
    }
  };

  public list = async (): Promise<LaboratoryUser[]> => {
    throw new Error('TBD');
  };

  public update = async (laboratoryUser: LaboratoryUser): Promise<LaboratoryUser> => {
    throw new Error('TBD');
  };

  public delete = async (laboratoryUser: LaboratoryUser): Promise<boolean> => {
    throw new Error('TBD');
  };
}
