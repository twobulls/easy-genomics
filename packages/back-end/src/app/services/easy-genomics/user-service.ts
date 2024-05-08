import { BatchGetItemCommandOutput, GetItemCommandOutput, ScanCommandOutput } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { UserSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/user';
import { User } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
import { Service } from '../../types/service';
import { DynamoDBService } from '../dynamodb-service';

export class UserService extends DynamoDBService implements Service {
  readonly USER_TABLE_NAME: string = `${process.env.NAME_PREFIX}-user-table`;
  readonly UNIQUE_REFERENCE_TABLE_NAME: string = `${process.env.NAME_PREFIX}-unique-reference-table`;

  public constructor() {
    super();
  }

  async add(user: User): Promise<User> {
    const logRequestMessage = `Add User UserId=${user.UserId} request`;
    console.info(logRequestMessage);

    // Data validation safety check
    if (!UserSchema.safeParse(user).success) throw new Error('Invalid request');

    const response = await this.transactWriteItems({
      TransactItems: [
        {
          Put: {
            TableName: this.USER_TABLE_NAME,
            ConditionExpression: 'attribute_not_exists(#UserId)',
            ExpressionAttributeNames: {
              '#UserId': 'UserId',
            },
            Item: marshall(user),
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
              Value: user.Email,
              Type: 'user-email',
            }),
          },
        },
      ],
    });

    if (response.$metadata.httpStatusCode === 200) {
      return user;
    } else {
      throw new Error(`${logRequestMessage} unsuccessful: HTTP Status Code=${response.$metadata.httpStatusCode}`);
    }
  }

  public listAllUsers = async (): Promise<User[]> => {
    const result: ScanCommandOutput = await this.findAll({
      TableName: this.USER_TABLE_NAME,
    });

    if (result.Items) {
      return <User[]>result.Items.map((item) => unmarshall(item));
    } else {
      throw new Error('Unable to list Users');
    }
  };

  public listUsers = async (userIds: string[]): Promise<User[]> => {
    const requestItemKeys: {UserId: {S: string}}[] = userIds.map(userId => {
      return {
        ['UserId']: { S: userId },
      };
    });

    const result: BatchGetItemCommandOutput = await this.batchGetItem({
      RequestItems: {
        [this.USER_TABLE_NAME]: {
          Keys: requestItemKeys,
        },
      },
    });

    if (result.Responses) {
      return <User[]>result.Responses[this.USER_TABLE_NAME].map((item) => unmarshall(item));
    } else {
      throw new Error('Unable to list Users');
    }
  };

  async get(userId: string): Promise<User> {
    const logRequestMessage = `Get User UserId=${userId} request`;
    console.info(logRequestMessage);

    const response: GetItemCommandOutput = await this.getItem({
      TableName: this.USER_TABLE_NAME,
      Key: {
        UserId: { S: userId }, // Hash Key / Partition Key
      },
    });

    if (response.$metadata.httpStatusCode === 200) {
      if (response.Item) {
        return <User>unmarshall(response.Item);
      } else {
        throw new Error(`${logRequestMessage} unsuccessful: Resource not found`);
      }
    } else {
      throw new Error(`${logRequestMessage} unsuccessful: HTTP Status Code=${response.$metadata.httpStatusCode}`);
    }
  }

  async update(user: User, existing?: User): Promise<User> {
    throw new Error('TBD');
  }

  async delete(user: User): Promise<boolean> {
    throw new Error('TBD');
  }
}
