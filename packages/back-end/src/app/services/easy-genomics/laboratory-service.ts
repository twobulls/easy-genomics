import { ScanCommandOutput } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/persistence/easy-genomics/laboratory';
import { DynamoDBService } from '../dynamodb-service';

export class LaboratoryService extends DynamoDBService {
  readonly TABLE_NAME: string = `${process.env.ENV_NAME}-laboratory-table`;

  public constructor() {
    super();
  }

  public listLaboratories = async (): Promise<Laboratory[]> => {
    const result: ScanCommandOutput = await this.findAll({
      TableName: this.TABLE_NAME,
    });

    if (result.Items) {
      return <Laboratory[]>result.Items.map((item) => unmarshall(item));
    } else {
      throw new Error('Unable to list Laboratories');
    }
  };
}
