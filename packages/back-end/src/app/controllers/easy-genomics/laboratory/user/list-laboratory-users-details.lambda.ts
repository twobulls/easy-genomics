import { LaboratoryUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-user';
import { LaboratoryUserDetails } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-user-details';
import { User } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { LaboratoryUserService } from '../../../../services/easy-genomics/laboratory-user-service';
import { UserService } from '../../../../services/easy-genomics/user-service';

const laboratoryUserService = new LaboratoryUserService();
const userService = new UserService();

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    // Get Query Parameter
    const laboratoryId: string | undefined = event.queryStringParameters?.laboratoryId;
    const userId: string | undefined = event.queryStringParameters?.userId;

    const laboratoryUsers: LaboratoryUser[] = await listLaboratoryUsers(laboratoryId, userId);

    if (laboratoryUsers.length === 0) {
      return buildResponse(200, JSON.stringify([]), event);
    }

    // Retrieve User Details for the list of LaboratoryUsers for display
    const userIds: string[] = laboratoryUsers.map(labUser => labUser.UserId);
    const users: User[] = await userService.listUsers(userIds);

    const response: LaboratoryUserDetails[] = laboratoryUsers.map(labUser => {
      const user: User | undefined = users.filter(u => u.UserId === labUser.UserId).shift();
      if (user) {
        return <LaboratoryUserDetails>{
          UserId: labUser.UserId,
          LaboratoryId: labUser.LaboratoryId,
          LabManager: labUser.LabManager,
          LabTechnician: labUser.LabTechnician,
          PreferredName: user.PreferredName,
          FirstName: user.FirstName,
          LastName: user.LastName,
          UserEmail: user.Email,
        };
      }
    }).flat();

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

const listLaboratoryUsers = async (laboratoryId?: string, userId?: string): Promise<LaboratoryUser[]> => {
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
};
