import { TransactWriteItemsCommandOutput } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { LaboratorySchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/laboratory';
import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import { LaboratoryService } from './laboratory-service';

export class LaboratoryPipelineService extends LaboratoryService {
  readonly LABORATORY_TABLE_NAME: string = `${process.env.NAME_PREFIX}-laboratory-table`;
  readonly LABORATORY_PIPELINE_TABLE_NAME: string = `${process.env.NAME_PREFIX}-laboratory-pipeline-table`;

  public constructor() {
    super();
  }

  public updateLaboratoryPipelines = async (laboratory: Laboratory): Promise<Laboratory> => {
    const logRequestMessage = `Update Laboratory Pipelines LaboratoryId=${laboratory.LaboratoryId}, Name=${laboratory.Name} request`;
    console.info(logRequestMessage);

    // Data validation safety check
    if (!LaboratorySchema.safeParse(laboratory).success) throw new Error('Invalid request');

    // Perform transaction update request
    const response: TransactWriteItemsCommandOutput = await this.transactWriteItems({
      TransactItems: [
        {
          Put: {
            TableName: this.LABORATORY_TABLE_NAME,
            ConditionExpression: 'attribute_exists(#OrganizationId) AND attribute_exists(#LaboratoryId)',
            ExpressionAttributeNames: {
              '#OrganizationId': 'OrganizationId',
              '#LaboratoryId': 'LaboratoryId',
            },
            Item: marshall(laboratory, { removeUndefinedValues: true }),
          },
        },
      ],
    });

    if (response.$metadata.httpStatusCode === 200) {
      // Transaction Updates do not return the updated Laboratory details, so explicitly retrieve it
      return this.get(laboratory.OrganizationId, laboratory.LaboratoryId);
    } else {
      throw new Error(`${logRequestMessage} unsuccessful: HTTP Status Code=${response.$metadata.httpStatusCode}`);
    }
  };
}
