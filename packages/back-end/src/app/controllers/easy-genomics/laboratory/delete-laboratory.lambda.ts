import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/persistence/easy-genomics/laboratory';
import { LaboratoryUser } from '@easy-genomics/shared-lib/src/app/types/persistence/easy-genomics/laboratory-user';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { LaboratoryService } from '../../../services/easy-genomics/laboratory-service';
import { LaboratoryUserService } from '../../../services/easy-genomics/laboratory-user-service';

const laboratoryService = new LaboratoryService();
const laboratoryUserService = new LaboratoryUserService();

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    // Get Path Parameter
    const id: string = event.pathParameters?.id || '';
    if (id === '') throw new Error('Required id is missing');

    // Lookup by LaboratoryId to confirm existence before deletion
    const existingLaboratory: Laboratory = await laboratoryService.query(id);

    // Check LaboratoryUsers are empty before deletion
    const existingLaboratoryUser: LaboratoryUser[] = await laboratoryUserService.query(existingLaboratory.LaboratoryId);
    if (existingLaboratoryUser.length > 0) {
      throw new Error(`Laboratory deletion error, ${existingLaboratoryUser.length} Users exists.`);
    }

    const isDeleted: boolean = await laboratoryService.delete(existingLaboratory);
    return buildResponse(200, JSON.stringify({
      deleted: isDeleted,
    }), event);
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
  return err.message;
};
