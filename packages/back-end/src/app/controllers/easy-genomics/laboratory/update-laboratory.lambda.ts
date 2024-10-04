import { TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import { GetParameterCommandOutput } from '@aws-sdk/client-ssm';
import { ListComputeEnvsResponse } from '@easy-genomics/shared-lib/lib/app/types/nf-tower/nextflow-tower-api';
import {
  UpdateLaboratory,
  UpdateLaboratorySchema,
} from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/laboratory';
import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import { buildErrorResponse, buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import {
  InvalidRequestError,
  LaboratoryNameTakenError,
  RequiredIdNotFoundError,
} from '@easy-genomics/shared-lib/src/app/utils/HttpError';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { LaboratoryService } from '@BE/services/easy-genomics/laboratory-service';
import { SsmService } from '@BE/services/ssm-service';
import { httpRequest, REST_API_METHOD } from '@BE/utils/rest-api-utils';

const laboratoryService = new LaboratoryService();
const ssmService = new SsmService();

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    // Get Path Parameter
    const id: string = event.pathParameters?.id || '';
    if (id === '') throw new RequiredIdNotFoundError();

    const userId: string = event.requestContext.authorizer.claims['cognito:username'];
    // Put Request Body
    const request: UpdateLaboratory = event.isBase64Encoded ? JSON.parse(atob(event.body!)) : JSON.parse(event.body!);
    // Data validation safety check
    if (!UpdateLaboratorySchema.safeParse(request).success) {
      throw new InvalidRequestError();
    }

    // Lookup by LaboratoryId to confirm existence before updating
    const existing: Laboratory = await laboratoryService.queryByLaboratoryId(id);

    if (
      !(await validateExistingNextFlowIntegration(
        existing,
        request.NextFlowTowerWorkspaceId,
        request.NextFlowTowerAccessToken,
      ))
    ) {
      throw new InvalidRequestError();
    }

    const response = await laboratoryService
      .update(
        {
          ...existing,
          Name: request.Name,
          Description: request.Description,
          Status: 'Active',
          S3Bucket: request.S3Bucket, // S3 Bucket Full Name
          AwsHealthOmicsEnabled: request.AwsHealthOmicsEnabled,
          NextFlowTowerEnabled: request.NextFlowTowerEnabled,
          NextFlowTowerWorkspaceId: request.NextFlowTowerWorkspaceId,
          ModifiedAt: new Date().toISOString(),
          ModifiedBy: userId,
        },
        existing,
      )
      .catch((error: any) => {
        if (error instanceof TransactionCanceledException) {
          throw new LaboratoryNameTakenError();
        } else {
          throw error;
        }
      });

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
    return buildErrorResponse(err, event);
  }
};

async function validateExistingNextFlowIntegration(
  laboratory: Laboratory,
  workspaceId?: string,
  accessToken?: string,
): Promise<boolean> {
  if (!accessToken || accessToken === '') {
    const getNextFlowAccessToken: GetParameterCommandOutput = await ssmService.getParameter({
      Name: `/easy-genomics/organization/${laboratory.OrganizationId}/laboratory/${laboratory.LaboratoryId}/nf-access-token`,
      WithDecryption: true,
    });
    if (!getNextFlowAccessToken.Parameter || !getNextFlowAccessToken.Parameter.Value) {
      throw new InvalidRequestError();
    }
    accessToken = getNextFlowAccessToken.Parameter.Value;
  }

  // Build Query Parameters for calling NextFlow Tower
  const apiParameters: URLSearchParams = new URLSearchParams();
  apiParameters.set('workspaceId', `${workspaceId || ''}`); // WorkspaceId can be empty

  const nfResponse: ListComputeEnvsResponse = await httpRequest<ListComputeEnvsResponse>(
    `${process.env.SEQERA_API_BASE_URL}/compute-envs?${apiParameters.toString()}`,
    REST_API_METHOD.GET,
    { Authorization: `Bearer ${accessToken}` },
  );
  return !!nfResponse;
}
