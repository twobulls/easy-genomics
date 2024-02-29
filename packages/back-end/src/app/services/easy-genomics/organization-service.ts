import {
  DeleteItemCommandOutput,
  GetItemCommandOutput,
  ScanCommandOutput,
  TransactWriteItemsCommandOutput,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { Organization } from '@easy-genomics/shared-lib/src/app/types/persistence/easy-genomics/organization';
import { Service } from '../../types/service';
import { DynamoDBService } from '../dynamodb-service';

export class OrganizationService extends DynamoDBService implements Service {
  readonly ORGANIZATION_TABLE_NAME: string = `${process.env.ENV_NAME}-organization-table`;
  readonly UNIQUE_REFERENCE_TABLE_NAME: string = `${process.env.ENV_NAME}-unique-reference-table`;

  public constructor() {
    super();
  }

  public add = async (organization: Organization): Promise<Organization> => {
    const logRequestMessage = `Add Organization OrganizationId=${organization.OrganizationId}, Name=${organization.Name} request`;
    console.info(`${logRequestMessage}`);

    const response = await this.transactWriteItems({
      TransactItems: [
        {
          Put: {
            TableName: this.ORGANIZATION_TABLE_NAME,
            ConditionExpression: 'attribute_not_exists(#PK)',
            ExpressionAttributeNames: {
              '#PK': 'OrganizationId',
            },
            Item: marshall(organization),
          },
        },
        {
          Put: {
            TableName: this.UNIQUE_REFERENCE_TABLE_NAME,
            ConditionExpression: 'attribute_not_exists(#PK)',
            ExpressionAttributeNames: {
              '#PK': 'Value',
            },
            Item: marshall({
              Value: organization.Name,
              Type: 'organization-name',
            }),
          },
        },
      ],
    });

    if (response.$metadata.httpStatusCode === 200) {
      return organization;
    } else {
      throw new Error(`${logRequestMessage} unsuccessful: HTTP Status Code=${response.$metadata.httpStatusCode}`);
    }
  };

  public get = async (hashKey: string): Promise<Organization> => {
    const logRequestMessage = `Get Organization OrganizationId=${hashKey} request`;
    console.info(logRequestMessage);

    const response: GetItemCommandOutput = await this.getItem({
      TableName: this.ORGANIZATION_TABLE_NAME,
      Key: {
        OrganizationId: { S: hashKey },
      },
    });

    if (response.$metadata.httpStatusCode === 200) {
      if (response.Item) {
        return <Organization>unmarshall(response.Item);
      } else {
        throw new Error(`${logRequestMessage} unsuccessful: Resource not found`);
      }
    } else {
      throw new Error(`${logRequestMessage} unsuccessful: HTTP Status Code=${response.$metadata.httpStatusCode}`);
    }
  };

  public list = async (): Promise<Organization[]> => {
    const logRequestMessage = 'List Organization(s) request';
    console.info(logRequestMessage);

    const response: ScanCommandOutput = await this.findAll({
      TableName: this.ORGANIZATION_TABLE_NAME,
    });

    if (response.$metadata.httpStatusCode === 200) {
      return <Organization[]>response.Items?.map(item => unmarshall(item));
    } else {
      throw new Error(`${logRequestMessage} unsuccessful: HTTP Status Code=${response.$metadata.httpStatusCode}`);
    }
  };

  public update = async <T>(object: T, hashKey: string, sortKey?: string): Promise<T> => {
    return Promise.resolve(object);
  };

  public delete = async (hashKey: string, uniqueReferenceKey: string): Promise<boolean> => {
    const logRequestMessage = `Delete Organization OrganizationId=${hashKey}, Name=${uniqueReferenceKey} request`;
    console.info(logRequestMessage);

    const response: TransactWriteItemsCommandOutput = await this.transactWriteItems({
      TransactItems: [
        {
          Delete: {
            TableName: this.ORGANIZATION_TABLE_NAME,
            Key: {
              OrganizationId: { S: hashKey },
            },
          },
        },
        {
          Delete: {
            TableName: this.UNIQUE_REFERENCE_TABLE_NAME,
            Key: {
              Value: { S: uniqueReferenceKey },
              Type: { S: 'organization-name' },
            },
          },
        },
      ],
    });

    if (response.$metadata.httpStatusCode === 200) {
      return true;
    } else {
      throw new Error(`${logRequestMessage} unsuccessful: HTTP Status Code=${response.$metadata.httpStatusCode}`);
    }
  };

}
