import {
  GetItemCommandOutput,
  QueryCommandOutput,
  ScanCommandOutput,
  TransactWriteItemsCommandOutput,
  UpdateItemCommandOutput,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { LaboratorySchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/laboratory';
import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import { Service } from '../../types/service';
import { DynamoDBService } from '../dynamodb-service';

export class LaboratoryService extends DynamoDBService implements Service {
  readonly LABORATORY_TABLE_NAME: string = `${process.env.NAME_PREFIX}-laboratory-table`;
  readonly UNIQUE_REFERENCE_TABLE_NAME: string = `${process.env.NAME_PREFIX}-unique-reference-table`;

  public constructor() {
    super();
  }

  public add = async (laboratory: Laboratory): Promise<Laboratory> => {
    const logRequestMessage = `Add Laboratory OrganizationId=${laboratory.OrganizationId}, LaboratoryId=${laboratory.LaboratoryId}, Name=${laboratory.Name} request`;
    console.info(`${logRequestMessage}`);

    // Data validation safety check
    if (!LaboratorySchema.safeParse(laboratory).success) throw new Error('Invalid request');

    const response = await this.transactWriteItems({
      TransactItems: [
        {
          Put: {
            TableName: this.LABORATORY_TABLE_NAME,
            ConditionExpression: 'attribute_not_exists(#OrganizationId) AND attribute_not_exists(#LaboratoryId)',
            ExpressionAttributeNames: {
              '#OrganizationId': 'OrganizationId',
              '#LaboratoryId': 'LaboratoryId',
            },
            Item: marshall(laboratory),
          },
        },
        {
          Put: {
            TableName: this.UNIQUE_REFERENCE_TABLE_NAME,
            ConditionExpression: 'attribute_not_exists(#Value) AND attribute_not_exists(#Type)',
            ExpressionAttributeNames: {
              '#Value': 'Value',
              '#Type': 'Type',
            },
            Item: marshall({
              Value: laboratory.Name,
              Type: `organization-${laboratory.OrganizationId}-laboratory-name`,
            }),
          },
        },
      ],
    });

    if (response.$metadata.httpStatusCode === 200) {
      return laboratory;
    } else {
      throw new Error(`${logRequestMessage} unsuccessful: HTTP Status Code=${response.$metadata.httpStatusCode}`);
    }
  };

  public get = async (organizationId: string, laboratoryId: string): Promise<Laboratory> => {
    const logRequestMessage = `Get Laboratory OrganizationId=${organizationId}, LaboratoryId=${laboratoryId} request`;
    console.info(logRequestMessage);

    const response: GetItemCommandOutput = await this.getItem({
      TableName: this.LABORATORY_TABLE_NAME,
      Key: {
        OrganizationId: { S: organizationId }, // Hash Key / Partition Key
        LaboratoryId: { S: laboratoryId }, // Sort Key
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

  public query = async (laboratoryId: string): Promise<Laboratory> => {
    const logRequestMessage = `Query Laboratory by LaboratoryId=${laboratoryId} request`;
    console.info(logRequestMessage);

    const response: QueryCommandOutput = await this.queryItems({
      TableName: this.LABORATORY_TABLE_NAME,
      IndexName: 'LaboratoryId_Index', // Global Secondary Index
      KeyConditionExpression: '#LaboratoryId = :laboratoryId',
      ExpressionAttributeNames: {
        '#LaboratoryId': 'LaboratoryId',
      },
      ExpressionAttributeValues: {
        ':laboratoryId': { S: laboratoryId },
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
    const logRequestMessage = 'List Laboratories request';
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
    const logRequestMessage = `Update Laboratory OrganizationId=${laboratory.OrganizationId}, LaboratoryId=${laboratory.LaboratoryId}, Name=${laboratory.Name} request`;
    console.info(logRequestMessage);

    // Data validation safety check
    if (!LaboratorySchema.safeParse(laboratory).success) throw new Error('Invalid request');

    const updateExclusions: string[] = ['OrganizationId', 'LaboratoryId', 'CreatedAt', 'CreatedBy'];

    const expressionAttributeNames: {[p: string]: string} = this.getExpressionAttributeNamesDefinition(laboratory, updateExclusions);
    const expressionAttributeValues: {[p: string]: any} = this.getExpressionAttributeValuesDefinition(laboratory, updateExclusions);
    const updateExpression: string = this.getUpdateExpression(expressionAttributeNames, expressionAttributeValues);

    // Check if Laboratory Name is unchanged
    if (laboratory.Name === existing.Name) {
      // Perform normal update request
      const response: UpdateItemCommandOutput = await this.updateItem({
        TableName: this.LABORATORY_TABLE_NAME,
        Key: {
          OrganizationId: { S: laboratory.OrganizationId },
          LaboratoryId: { S: laboratory.LaboratoryId },
        },
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        UpdateExpression: updateExpression,
        ReturnValues: 'ALL_NEW',
      });
      if (response.$metadata.httpStatusCode === 200) {
        if (response.Attributes) {
          return <Laboratory>unmarshall(response.Attributes);
        } else {
          throw new Error(`${logRequestMessage} unsuccessful: Returned unexpected response`);
        }
      } else {
        throw new Error(`${logRequestMessage} unsuccessful: HTTP Status Code=${response.$metadata.httpStatusCode}`);
      }
    } else {
      // Perform transaction update request to include updating the Laboratory Name and enforce uniqueness
      const response: TransactWriteItemsCommandOutput = await this.transactWriteItems({
        TransactItems: [
          {
            Update: {
              TableName: this.LABORATORY_TABLE_NAME,
              Key: {
                OrganizationId: { S: laboratory.OrganizationId },
                LaboratoryId: { S: laboratory.LaboratoryId },
              },
              ExpressionAttributeNames: expressionAttributeNames,
              ExpressionAttributeValues: expressionAttributeValues,
              UpdateExpression: updateExpression,
              ReturnValues: 'ALL_NEW',
            },
          },
          {
            Delete: {
              TableName: this.UNIQUE_REFERENCE_TABLE_NAME,
              Key: {
                Value: { S: existing.Name },
                Type: { S: `organization-${existing.OrganizationId}-laboratory-name` },
              },
            },
          },
          {
            Put: {
              TableName: this.UNIQUE_REFERENCE_TABLE_NAME,
              ConditionExpression: 'attribute_not_exists(#Value) AND attribute_not_exists(#Type)',
              ExpressionAttributeNames: {
                '#Value': 'Value',
                '#Type': 'Type',
              },
              Item: marshall({
                Value: laboratory.Name,
                Type: `organization-${laboratory.OrganizationId}-laboratory-name`,
              }),
            },
          },
        ],
      });
      if (response.$metadata.httpStatusCode === 200) {
        // Transaction Updates do not return the updated Organization details, so explicitly retrieve it
        return this.query(laboratory.LaboratoryId);
      } else {
        throw new Error(`${logRequestMessage} unsuccessful: HTTP Status Code=${response.$metadata.httpStatusCode}`);
      }
    }
  };

  public delete = async (laboratory: Laboratory): Promise<boolean> => {
    const logRequestMessage = `Delete Laboratory OrganizationId=${laboratory.OrganizationId}, LaboratoryId=${laboratory.LaboratoryId}, Name=${laboratory.Name} request`;
    console.info(logRequestMessage);

    const response: TransactWriteItemsCommandOutput = await this.transactWriteItems({
      TransactItems: [
        {
          Delete: {
            TableName: this.LABORATORY_TABLE_NAME,
            Key: {
              OrganizationId: { S: laboratory.OrganizationId },
              LaboratoryId: { S: laboratory.LaboratoryId },
            },
          },
        },
        {
          Delete: {
            TableName: this.UNIQUE_REFERENCE_TABLE_NAME,
            Key: {
              Value: { S: laboratory.Name },
              Type: { S: `organization-${laboratory.OrganizationId}-laboratory-name` },
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
