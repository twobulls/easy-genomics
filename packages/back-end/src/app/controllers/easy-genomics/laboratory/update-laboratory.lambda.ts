import { TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import {
  UpdateLaboratory,
  UpdateLaboratorySchema,
} from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/laboratory';
import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { LaboratoryService } from '../../../services/easy-genomics/laboratory-service';
import { SsmService } from '../../../services/ssm-service';

const laboratoryService = new LaboratoryService();
const ssmService = new SsmService();

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    // Get Path Parameter
    const id: string = event.pathParameters?.id || '';
    if (id === '') throw new Error('Required id is missing');

    const userId: string = event.requestContext.authorizer.claims['cognito:username'];
    // Put Request Body
    const request: UpdateLaboratory = event.isBase64Encoded ? JSON.parse(atob(event.body!)) : JSON.parse(event.body!);
    // Data validation safety check
    if (!UpdateLaboratorySchema.safeParse(request).success) {
      throw new Error('Invalid request');
    }

    // Lookup by LaboratoryId to confirm existence before updating
    const existing: Laboratory = await laboratoryService.queryByLaboratoryId(id);

    const response: Laboratory = await laboratoryService.update(
      {
        ...existing,
        Name: request.Name,
        Description: request.Description,
        // 2024-08-08 EG-612: S3Bucket is now created automatically at creation time and no longer editable for now. Functionality will be added in future to select and manage S3Buckets for a lab.
        // S3Bucket: request.S3Bucket,
        Status: 'Active',
        AwsHealthOmicsEnabled: request.AwsHealthOmicsEnabled,
        NextFlowTowerEnabled: request.NextFlowTowerEnabled,
        NextFlowTowerWorkspaceId: request.NextFlowTowerWorkspaceId,
        ModifiedAt: new Date().toISOString(),
        ModifiedBy: userId,
      },
      existing,
    );

    // Update NextFlow AccessToken in SSM if new value supplied
    if (request.NextFlowTowerAccessToken) {
      await ssmService.putParameter({
        Name: `/easy-genomics/organization/${existing.OrganizationId}/laboratory/${existing.LaboratoryId}/nf-access-token`,
        Description: `Easy Genomics Laboratory ${existing.LaboratoryId} NF AccessToken`,
        Value: request.NextFlowTowerAccessToken,
        Type: 'SecureString',
        Overwrite: true,
      });
    }

    return buildResponse(200, JSON.stringify(response), event);
  } catch (err: any) {
    console.error(err);
    return buildResponse(400, JSON.stringify({ Error: getErrorMessage(err) }), event);
  }
};

// Used for customizing error messages by exception types
function getErrorMessage(err: any) {
  if (err instanceof TransactionCanceledException) {
    return 'Laboratory Name already taken';
  } else {
    return err.message;
  }
}
