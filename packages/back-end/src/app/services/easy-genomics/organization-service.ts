import { DeleteItemCommandOutput, GetItemCommandOutput, PutItemCommandOutput, ScanCommandOutput } from '@aws-sdk/client-dynamodb';
import { ResponseMetadata } from '@aws-sdk/types';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { Organization } from '@easy-genomics/shared-lib/src/app/types/persistence/organization';
import { DynamoDBService } from '../dynamodb-service';

export class OrganizationService extends DynamoDBService {
  readonly TABLE_NAME: string = `${process.env.ENV_NAME}-organization-table`;

  public constructor() {
    super();
  }

  public addOrganization = async (organization: Organization): Promise<ResponseMetadata> => {
    const result: PutItemCommandOutput = await this.putItem({
      TableName: this.TABLE_NAME,
      Item: marshall(organization),
    });
    return result.$metadata;
  };

  public deleteOrganization = async (organizationId: string): Promise<ResponseMetadata> => {
    const result: DeleteItemCommandOutput = await this.deleteItem({
      TableName: this.TABLE_NAME,
      Key: {
        OrganizationId: { S: organizationId },
      },
    });
    return result.$metadata;
  };

  public findOrganization = async (organizationId: string): Promise<Organization> => {
    const result: GetItemCommandOutput = await this.findItem({
      TableName: this.TABLE_NAME,
      Key: {
        OrganizationId: { S: organizationId },
      },
    });

    if (result.Item) {
      return <Organization>unmarshall(result.Item);
    } else {
      throw new Error(`Unable to find Organization: ${organizationId}`);
    }
  };

  public listOrganizations = async (): Promise<Organization[]> => {
    const result: ScanCommandOutput = await this.findAll({
      TableName: this.TABLE_NAME,
    });

    if (result.Items) {
      return <Organization[]>result.Items.map((item) => unmarshall(item));
    } else {
      throw new Error('Unable to list Organizations');
    }
  };
}
