import crypto from 'crypto';
import { ConditionalCheckFailedException, TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import { ListComputeEnvsResponse } from '@easy-genomics/shared-lib/lib/app/types/nf-tower/nextflow-tower-api';
import {
  CreateLaboratory,
  CreateLaboratorySchema,
} from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/laboratory';
import { Organization } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization';
import { buildErrorResponse, buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import {
  InvalidRequestError,
  LaboratoryAlreadyExistsError,
  LaboratoryNameTakenError,
  OrganizationNotFoundError,
  UnauthorizedAccessError,
} from '@easy-genomics/shared-lib/src/app/utils/HttpError';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { LaboratoryService } from '@BE/services/easy-genomics/laboratory-service';
import { OrganizationService } from '@BE/services/easy-genomics/organization-service';
import { SsmService } from '@BE/services/ssm-service';
import { validateOrganizationAdminAccess } from '@BE/utils/auth-utils';
import { httpRequest, REST_API_METHOD } from '@BE/utils/rest-api-utils';

const organizationService = new OrganizationService();
const laboratoryService = new LaboratoryService();
const ssmService = new SsmService();

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    const currentUserId = event.requestContext.authorizer.claims['cognito:username'];
    // Post Request Body
    const request: CreateLaboratory = event.isBase64Encoded ? JSON.parse(atob(event.body!)) : JSON.parse(event.body!);
    // Data validation safety check
    if (!CreateLaboratorySchema.safeParse(request).success) {
      throw new InvalidRequestError();
    }

    // Only Organisation Admins are allowed create laboratories
    if (!validateOrganizationAdminAccess(event, request.OrganizationId)) {
      throw new UnauthorizedAccessError();
    }

    // Validate OrganizationId exists before creating Laboratory
    const organization: Organization = await organizationService.get(request.OrganizationId);
    if (!organization) {
      throw new OrganizationNotFoundError();
    }

    if (!(await validateNewNextFlowIntegration(request.NextFlowTowerWorkspaceId, request.NextFlowTowerAccessToken))) {
      throw new InvalidRequestError();
    }

    // Automatically create an S3 Bucket for this Lab based on the LaboratoryId, and must be less than 63
    const laboratoryId: string = crypto.randomUUID().toLowerCase();

    const response = await laboratoryService
      .add({
        OrganizationId: organization.OrganizationId,
        LaboratoryId: laboratoryId,
        Name: request.Name,
        Description: request.Description,
        Status: 'Active',
        S3Bucket: request.S3Bucket, // S3 Bucket Full Name
        AwsHealthOmicsEnabled: request.AwsHealthOmicsEnabled ?? organization.AwsHealthOmicsEnabled ?? false,
        NextFlowTowerEnabled: request.NextFlowTowerEnabled ?? organization.NextFlowTowerEnabled ?? false,
        NextFlowTowerWorkspaceId: request.NextFlowTowerWorkspaceId,
        CreatedAt: new Date().toISOString(),
        CreatedBy: currentUserId,
      })
      .catch((error: any) => {
        if (error instanceof ConditionalCheckFailedException) {
          throw new LaboratoryAlreadyExistsError();
        } else if (error instanceof TransactionCanceledException) {
          throw new LaboratoryNameTakenError();
        } else {
          throw error;
        }
      });

    // Store NextFlow AccessToken in SSM if value supplied
    if (request.NextFlowTowerAccessToken) {
      await ssmService.putParameter({
        Name: `/easy-genomics/organization/${organization.OrganizationId}/laboratory/${laboratoryId}/nf-access-token`,
        Description: `Easy Genomics Laboratory ${laboratoryId} NF AccessToken`,
        Value: request.NextFlowTowerAccessToken,
        Type: 'SecureString',
        Overwrite: false,
      });
    }

    return buildResponse(200, JSON.stringify(response), event);
  } catch (err: any) {
    console.error(err);
    return buildErrorResponse(err, event);
  }
};

async function validateNewNextFlowIntegration(workspaceId?: string, accessToken?: string): Promise<boolean> {
  if ((!workspaceId && !accessToken) || (workspaceId === '' && accessToken === '')) {
    return true; // If both workspaceId and accessToken are undefined or empty strings, return true to allow Lab to be created without NextFlow Integration
  } else if ((workspaceId && !accessToken) || (workspaceId !== '' && accessToken === '')) {
    return false; // If only workspaceId is specified, then immediately return false because accessToken is required
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
