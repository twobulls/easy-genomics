import { ScanCommandOutput } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { User } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
import { DynamoDBService } from '../dynamodb-service';

export class UserService extends DynamoDBService {
  readonly USER_TABLE_NAME: string = `${process.env.NAME_PREFIX}-user-table`;

  public constructor() {
    super();
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
}
