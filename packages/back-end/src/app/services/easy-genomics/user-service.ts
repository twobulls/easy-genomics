import { GetItemCommandOutput, ScanCommandOutput } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { User } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
import { Service } from '../../types/service';
import { DynamoDBService } from '../dynamodb-service';

export class UserService extends DynamoDBService implements Service {
  readonly USER_TABLE_NAME: string = `${process.env.NAME_PREFIX}-user-table`;

  public constructor() {
    super();
  }

  async add(user: User): Promise<User> {
    throw new Error('TBD');
  }

  public listUsers = async (): Promise<User[]> => {
    const result: ScanCommandOutput = await this.findAll({
      TableName: this.USER_TABLE_NAME,
    });

    if (result.Items) {
      return <User[]>result.Items.map((item) => unmarshall(item));
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
