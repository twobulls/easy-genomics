import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { AddOrganizationUserSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/organization-user';
import { Status } from '@easy-genomics/shared-lib/src/app/types/base-entity';
import { Organization } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization';
import { OrganizationUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user';
import { User } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { OrganizationService } from '../../../../services/easy-genomics/organization-service';
import { OrganizationUserService } from '../../../../services/easy-genomics/organization-user-service';
import { PlatformUserService } from '../../../../services/easy-genomics/platform-user-service';
import { UserService } from '../../../../services/easy-genomics/user-service';

const organizationUserService = new OrganizationUserService();
const organizationService = new OrganizationService();
const platformUserService = new PlatformUserService();
const userService = new UserService();

// TODO: Replace the following logic and with create-user-invite API logic
export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    const currentUserId: string = event.requestContext.authorizer.claims['cognito:username'];
    // Post Request Body
    const request: OrganizationUser = (
      event.isBase64Encoded ? JSON.parse(atob(event.body!)) : JSON.parse(event.body!)
    );
    // Data validation safety check
    if (!AddOrganizationUserSchema.safeParse(request).success) throw new Error('Invalid request');

    const organizationUser: OrganizationUser | void =
      await organizationUserService.get(request.OrganizationId, request.UserId).catch((error: any) => {
        if (error.message.endsWith('Resource not found')) { // TODO - improve error to handle ResourceNotFoundException instead of checking error message
          // Do nothing - allow new Organization-User access mapping to proceed.
        } else {
          throw error;
        }
      });

    if (organizationUser) {
      throw new Error('Organization User already exists');
    }

    // Check if Organization & User records exists
    const organization: Organization = await organizationService.get(request.OrganizationId);
    const user: User = await userService.get(request.UserId);

    // Attempt to add the User to the Organization in one transaction
    if (await platformUserService.addExistingUserToOrganization({
      ...user,
      OrganizationAccess: {
        ...user.OrganizationAccess,
        [organization.OrganizationId]: {
          Status: request.Status,
          LaboratoryAccess: {},
        },
      },
      ModifiedAt: new Date().toISOString(),
      ModifiedBy: currentUserId,
    }, {
      ...request,
      CreatedAt: new Date().toISOString(),
      CreatedBy: currentUserId,
    })) {
      return buildResponse(200, JSON.stringify({ Status: 'Success' }), event);
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

// Used for customising error messages by exception types
function getErrorMessage(err: any) {
  if (err instanceof ConditionalCheckFailedException) {
    return 'Organization User already exists';
  } else {
    return err.message;
  }
};
