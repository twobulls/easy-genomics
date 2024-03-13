import { ConditionalCheckFailedException, TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/persistence/easy-genomics/laboratory';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { LaboratoryService } from '../../../services/easy-genomics/laboratory-service';
import { OrganizationService } from '../../../services/easy-genomics/organization-service';

const organizationService = new OrganizationService();
const laboratoryService = new LaboratoryService();

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    // Post Request Body
    const request: Laboratory = (
      event.isBase64Encoded ? JSON.parse(atob(event.body!)) : JSON.parse(event.body!)
    );
    if (request.Name === '') throw new Error('Required Name is missing');
    if (request.OrganizationId === '') throw new Error('Required OrganizationId is missing');
    const userId = event.requestContext.authorizer.claims['cognito:username'];

    // Validate OrganizationId exists before creating Laboratory
    const organization = await organizationService.get(request.OrganizationId);
    if (!organization) {
      throw new Error(`Laboratory OrganizationId '${request.OrganizationId}' not found`);
    }

    const response: Laboratory = await laboratoryService.add({
      ...request,
      LaboratoryId: uuidv4(),
      Status: 'Active',
      AwsHealthOmicsEnabled: organization.AwsHealthOmicsEnabled,
      AwsHealthOmicsWorkflows: [],
      NextFlowTowerEnabled: organization.NextFlowTowerEnabled,
      NextFlowTowerPipelines: [],
      CreatedAt: new Date().toISOString(),
      CreatedBy: userId,
    });
    return buildResponse(200, JSON.stringify(response), event);
  } catch (err: any) {
    console.error(err);
    return {
      statusCode: 400,
      body: JSON.stringify({
        Error: getErrorMessage(err),
      }),
    };
  }
};

// Used for customising error messages by exception types
function getErrorMessage(err: any) {
  if (err instanceof ConditionalCheckFailedException) {
    return 'Laboratory already exists';
  } else if (err instanceof TransactionCanceledException) {
    return 'Laboratory Name already taken';
  } else {
    return err.message;
  }
};
