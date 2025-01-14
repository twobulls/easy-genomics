import {
  UpdateUserDefaultOrganization,
  UpdateUserDefaultOrganizationSchema,
} from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/user';
import { OrganizationUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user';
import { User } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
import { buildErrorResponse, buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import {
  InvalidRequestError,
  RequiredIdNotFoundError,
  UnauthorizedAccessError,
} from '@easy-genomics/shared-lib/src/app/utils/HttpError';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { OrganizationUserService } from '@BE/services/easy-genomics/organization-user-service';
import { UserService } from '@BE/services/easy-genomics/user-service';

const organizationUserService = new OrganizationUserService();
const userService = new UserService();

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    // Get Path Parameter
    const id: string = event.pathParameters?.id || '';
    if (id === '') throw new RequiredIdNotFoundError();

    const userId = event.requestContext.authorizer.claims['cognito:username'];
    if (id !== userId) {
      throw new UnauthorizedAccessError();
    }

    // Only the current User can change their own User details
    const existing: User | undefined = (
      await userService.queryByEmail(event.requestContext.authorizer.claims.email)
    ).shift();

    if (!existing) {
      throw new UnauthorizedAccessError();
    }

    // Put Request Body
    const request: UpdateUserDefaultOrganization = event.isBase64Encoded
      ? JSON.parse(atob(event.body!))
      : JSON.parse(event.body!);
    // Data validation safety check
    if (!UpdateUserDefaultOrganizationSchema.safeParse(request).success) {
      throw new InvalidRequestError();
    }

    const defaultOrganization: string = request.DefaultOrganization ? request.DefaultOrganization : '';
    if (defaultOrganization !== '') {
      // Do not allow updating DefaultOrganization if it is the same
      if (existing.DefaultOrganization === defaultOrganization) {
        throw new InvalidRequestError(`Organization '${existing.DefaultOrganization}' is already set as default`);
      }

      // Do not allow updating DefaultOrganization if the User does not have an existing OrganizationUser access
      const organizationUsers: OrganizationUser[] = await organizationUserService.queryByUserId(existing.UserId);
      if (!organizationUsers.find((_: OrganizationUser) => _.OrganizationId === defaultOrganization)) {
        throw new UnauthorizedAccessError(`Organization '${defaultOrganization}' cannot be set as default`);
      }
    }

    // Update existing User record in Easy-Genomics User table to change DefaultOrganization setting
    const response: User = await userService.update(
      {
        ...existing,
        DefaultOrganization: defaultOrganization,
        ModifiedAt: new Date().toISOString(),
        ModifiedBy: userId,
      },
      existing,
    );

    return buildResponse(200, JSON.stringify(response), event);
  } catch (err: any) {
    console.error(err);
    return buildErrorResponse(err, event);
  }
};
