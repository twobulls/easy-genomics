import { DeleteItemCommandOutput, GetItemCommandOutput, PutItemCommandOutput, ScanCommandOutput } from '@aws-sdk/client-dynamodb';
import { ResponseMetadata } from '@aws-sdk/types';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { User } from '@easy-genomics/shared-lib/src/app/types/persistence/easy-genomics/user';
import { DynamoDBService } from '../dynamodb-service';

export class UserService extends DynamoDBService {
  readonly TABLE_NAME: string = `${process.env.ENV_NAME}-user-table`;

  public constructor() {
    super();
  }

  public addUser = async (organization: User): Promise<ResponseMetadata> => {
    const result: PutItemCommandOutput = await this.putItem({
      TableName: this.TABLE_NAME,
      Item: marshall(organization),
    });
    return result.$metadata;
  };

  public deleteUser = async (organizationId: string): Promise<ResponseMetadata> => {
    const result: DeleteItemCommandOutput = await this.deleteItem({
      TableName: this.TABLE_NAME,
      Key: {
        UserId: { S: organizationId },
      },
    });
    return result.$metadata;
  };

  public findUser = async (organizationId: string): Promise<User> => {
    const result: GetItemCommandOutput = await this.findItem({
      TableName: this.TABLE_NAME,
      Key: {
        UserId: { S: organizationId },
      },
    });

    if (result.Item) {
      return <User>unmarshall(result.Item);
    } else {
      throw new Error(`Unable to find User: ${organizationId}`);
    }
  };

  public listUsers = async (): Promise<User[]> => {
    const result: ScanCommandOutput = await this.findAll({
      TableName: this.TABLE_NAME,
    });

    if (result.Items) {
      return <User[]>result.Items.map((item) => unmarshall(item));
    } else {
      throw new Error('Unable to list Users');
    }
  };
}
