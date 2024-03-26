import {
  GetItemCommandOutput,
  PutItemCommandOutput,
  QueryCommandOutput,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { OrganizationUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user';
import { Service } from '../../types/service';
import { DynamoDBService } from '../dynamodb-service';

export class OrganizationUserService extends DynamoDBService implements Service {
  readonly ORGANIZATION_USER_TABLE_NAME: string = `${process.env.NAME_PREFIX}-organization-user-table`;

  public constructor() {
    super();
  }

  public add = async (organizationUser: OrganizationUser): Promise<OrganizationUser> => {
    throw new Error('TBD');
  };

  public get = async (organizationId: string, userId: string): Promise<OrganizationUser> => {
    const logRequestMessage = `Get OrganizationUser OrganizationId=${organizationId}, UserId=${userId} request`;
    console.info(logRequestMessage);

    const response: GetItemCommandOutput = await this.getItem({
      TableName: this.ORGANIZATION_USER_TABLE_NAME,
      Key: {
        OrganizationId: { S: organizationId }, // Hash Key / Partition Key
        UserId: { S: userId }, // Sort Key
      },
    });

    if (response.$metadata.httpStatusCode === 200) {
      if (response.Item) {
        return <OrganizationUser>unmarshall(response.Item);
      } else {
        throw new Error(`${logRequestMessage} unsuccessful: Resource not found`);
      }
    } else {
      throw new Error(`${logRequestMessage} unsuccessful: HTTP Status Code=${response.$metadata.httpStatusCode}`);
    }
  };

  public queryByOrganizationId = async (organizationId: string): Promise<OrganizationUser[]> => {
    const logRequestMessage = `Query OrganizationUsers by OrganizationId=${organizationId} request`;
    console.info(logRequestMessage);

    const response: QueryCommandOutput = await this.queryItems({
      TableName: this.ORGANIZATION_USER_TABLE_NAME,
      KeyConditionExpression: '#OrganizationId = :organizationId',
      ExpressionAttributeNames: {
        '#OrganizationId': 'OrganizationId', // Hash / Partition Key
      },
      ExpressionAttributeValues: {
        ':organizationId': { S: organizationId },
      },
      ScanIndexForward: false,
    });

    if (response.$metadata.httpStatusCode === 200) {
      if (response.Items) {
        return response.Items.map(item => <OrganizationUser>unmarshall(item));
      } else {
        throw new Error(`${logRequestMessage} unsuccessful: Resource not found`);
      }
    } else {
      throw new Error(`${logRequestMessage} unsuccessful: HTTP Status Code=${response.$metadata.httpStatusCode}`);
    }
  };

  public queryByUserId = async (userId: string): Promise<OrganizationUser[]> => {
    const logRequestMessage = `Query OrganizationUsers by UserId=${userId} request`;
    console.info(logRequestMessage);

    const response: QueryCommandOutput = await this.queryItems({
      TableName: this.ORGANIZATION_USER_TABLE_NAME,
      IndexName: 'UserId_Index', // Global Secondary Index
      KeyConditionExpression: '#UserId = :userId',
      ExpressionAttributeNames: {
        '#UserId': 'UserId',
      },
      ExpressionAttributeValues: {
        ':userId': { S: userId },
      },
      ScanIndexForward: false,
    });

    if (response.$metadata.httpStatusCode === 200) {
      if (response.Items) {
        return response.Items.map(item => <OrganizationUser>unmarshall(item));
      } else {
        throw new Error(`${logRequestMessage} unsuccessful: Resource not found`);
      }
    } else {
      throw new Error(`${logRequestMessage} unsuccessful: HTTP Status Code=${response.$metadata.httpStatusCode}`);
    }
  };

  public update = async (organizationUser: OrganizationUser): Promise<OrganizationUser> => {
    throw new Error('TBD');
  };

  public delete = async (organizationUser: OrganizationUser): Promise<boolean> => {
    throw new Error('TBD');
  };
}
