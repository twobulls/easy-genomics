import { LaboratoryUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-user';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { LaboratoryUserService } from '@BE/services/easy-genomics/laboratory-user-service';

const laboratoryUserService = new LaboratoryUserService();

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    // Get Query Parameter
    const laboratoryId: string | undefined = event.queryStringParameters?.laboratoryId;
    const userId: string | undefined = event.queryStringParameters?.userId;

    const response: LaboratoryUser[] = await listLaboratoryUsers(laboratoryId, userId);

    if (response) {
      return buildResponse(200, JSON.stringify(response), event);
    } else {
      throw new Error(`Unable to find Laboratory Users: ${JSON.stringify(response)}`);
    }
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

const listLaboratoryUsers = (laboratoryId?: string, userId?: string): Promise<LaboratoryUser[]> => {
  if (laboratoryId && !userId) {
    return laboratoryUserService.queryByLaboratoryId(laboratoryId);
  } else if (!laboratoryId && userId) {
    return laboratoryUserService.queryByUserId(userId);
  } else {
    throw new Error('Specify either laboratoryId or userId query parameter to retrieve the list of laboratory-users');
  }
};

// Used for customising error messages by exception types
function getErrorMessage(err: any) {
  return err.message;
}
