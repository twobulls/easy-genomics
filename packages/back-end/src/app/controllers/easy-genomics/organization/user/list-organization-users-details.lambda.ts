import { OrganizationUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user';
import {
  OrganizationUserDetails,
} from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user-details';
import { User } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { OrganizationUserService } from '../../../../services/easy-genomics/organization-user-service';
import { UserService } from '../../../../services/easy-genomics/user-service';

const organizationUserService = new OrganizationUserService();
const userService = new UserService();

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    // Get Query Parameter
    const organizationId: string | undefined = event.queryStringParameters?.organizationId;
    const userId: string | undefined = event.queryStringParameters?.userId;

    const organizationUsers: OrganizationUser[] = await listOrganizationUsers(organizationId, userId);

    if (organizationUsers.length === 0) {
      return buildResponse(200, JSON.stringify([]), event);
    }

    // Retrieve User Details for the list of OrganizationUsers for display
    const userIds: string[] = organizationUsers.map(orgUser => orgUser.UserId);
    const users: User[] = await userService.listUsers(userIds);

    const response: OrganizationUserDetails[] = organizationUsers.map(orgUser => {
      const user: User | undefined = users.filter(u => u.UserId === orgUser.UserId).shift();
      if (user) {
        return <OrganizationUserDetails> {
          UserId: orgUser.UserId,
          OrganizationId: orgUser.OrganizationId,
          OrganizationUserStatus: orgUser.Status,
          OrganizationAdmin: orgUser.OrganizationAdmin,
          UserDisplayName: `${user.PreferredName ? user.PreferredName : user.FirstName} ${user.LastName}`.trim(),
          UserEmail: user.Email,
        };
      } else {
        return <OrganizationUserDetails> {
          UserId: orgUser.UserId,
          OrganizationId: orgUser.OrganizationId,
          OrganizationUserStatus: orgUser.Status,
          OrganizationAdmin: orgUser.OrganizationAdmin,
        };
      }
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

const listOrganizationUsers = async (organizationId?: string, userId?: string): Promise<OrganizationUser[]> => {
  if (organizationId && !userId) {
    return organizationUserService.queryByOrganizationId(organizationId);
  } else if (!organizationId && userId) {
    return organizationUserService.queryByUserId(userId);
  } else {
    throw new Error('Specify either organizationId or userId query parameter to retrieve the list of organization-users');
  }
};

// Used for customising error messages by exception types
function getErrorMessage(err: any) {
  return err.message;
};
