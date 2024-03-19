import { User } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { UserService } from '../../../services/easy-genomics/user-service';

const userService = new UserService();

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    const response: User[] = await userService.listUsers();

    if (response) {
      return buildResponse(200, JSON.stringify(response), event);
    } else {
      throw new Error(`Unable to find Users: ${JSON.stringify(response)}`);
    }
  } catch (err: any) {
    console.error(err);
    return {
      statusCode: 400,
      body: `Error: ${err.message}`,
    };
  }
};
