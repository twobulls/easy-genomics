import { DeleteItemCommandOutput, GetItemCommandOutput, PutItemCommandOutput, ScanCommandOutput } from '@aws-sdk/client-dynamodb';
import { ResponseMetadata } from '@aws-sdk/types';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/persistence/laboratory';
import { DynamoDBService } from '../dynamodb-service';

export class LaboratoryService extends DynamoDBService {
  readonly TABLE_NAME: string = `${process.env.ENV_NAME}-laboratory-table`;

  public constructor() {
    super();
  }

  public addLaboratory = async (organization: Laboratory): Promise<ResponseMetadata> => {
    const result: PutItemCommandOutput = await this.putItem({
      TableName: this.TABLE_NAME,
      Item: marshall(organization),
    });
    return result.$metadata;
  };

  public deleteLaboratory = async (organizationId: string): Promise<ResponseMetadata> => {
    const result: DeleteItemCommandOutput = await this.deleteItem({
      TableName: this.TABLE_NAME,
      Key: {
        LaboratoryId: { S: organizationId },
      },
    });
    return result.$metadata;
  };

  public findLaboratory = async (organizationId: string): Promise<Laboratory> => {
    const result: GetItemCommandOutput = await this.findItem({
      TableName: this.TABLE_NAME,
      Key: {
        LaboratoryId: { S: organizationId },
      },
    });

    if (result.Item) {
      return <Laboratory>unmarshall(result.Item);
    } else {
      throw new Error(`Unable to find Laboratory: ${organizationId}`);
    }
  };

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
