import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { AddLaboratoryUserSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/laboratory-user';
import { Status } from '@easy-genomics/shared-lib/src/app/types/base-entity';
import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import { LaboratoryUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-user';
import {
  LaboratoryAccess,
  LaboratoryAccessDetails,
  OrganizationAccess,
  OrganizationAccessDetails,
  User,
} from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
import { buildErrorResponse, buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import {
  InvalidRequestError,
  LaboratoryUserAlreadyExistsError,
  LaboratoryUserNotFoundError,
  OrganizationUserNotFoundError,
  UnauthorizedAccessError,
  UserNotInOrganizationError,
} from '@easy-genomics/shared-lib/src/app/utils/HttpError';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { LaboratoryService } from '@BE/services/easy-genomics/laboratory-service';
import { LaboratoryUserService } from '@BE/services/easy-genomics/laboratory-user-service';
import { OrganizationUserService } from '@BE/services/easy-genomics/organization-user-service';
import { PlatformUserService } from '@BE/services/easy-genomics/platform-user-service';
import { UserService } from '@BE/services/easy-genomics/user-service';
import { validateLaboratoryManagerAccess, validateOrganizationAdminAccess } from '@BE/utils/auth-utils';

const laboratoryService = new LaboratoryService();
const laboratoryUserService = new LaboratoryUserService();
const organizationUserService = new OrganizationUserService();
const platformUserService = new PlatformUserService();
const userService = new UserService();

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    const currentUserId: string = event.requestContext.authorizer.claims['cognito:username'];
    // Post Request Body
    const request: LaboratoryUser = event.isBase64Encoded ? JSON.parse(atob(event.body!)) : JSON.parse(event.body!);
    // Data validation safety check
    if (!AddLaboratoryUserSchema.safeParse(request).success) throw new InvalidRequestError();

    // Retrieve existing Laboratory and User record details
    const laboratory: Laboratory = await laboratoryService.queryByLaboratoryId(request.LaboratoryId);
    const user: User = await userService.get(request.UserId);

    // Only Organisation Admins and Laboratory Managers are allowed to edit laboratories
    if (
      !(
        validateOrganizationAdminAccess(event, laboratory.OrganizationId) ||
        validateLaboratoryManagerAccess(event, laboratory.OrganizationId, laboratory.LaboratoryId)
      )
    ) {
      throw new UnauthorizedAccessError();
    }

    const status: Status = request.Status === 'Inactive' ? 'Inactive' : 'Active';

    // Verify User does not have an existing LaboratoryUser access mapping
    const laboratoryUser: LaboratoryUser | void = await laboratoryUserService
      .get(request.LaboratoryId, request.UserId)
      .catch((error: unknown) => {
        if (error instanceof LaboratoryUserNotFoundError) {
          // Do nothing - allow new Laboratory-User access mapping to proceed.
        } else {
          throw error;
        }
      });

    if (laboratoryUser) {
      throw new LaboratoryUserAlreadyExistsError();
    }

    // Verify User has access to the Organization - throws error if not found
    await organizationUserService.get(laboratory.OrganizationId, user.UserId).catch((error: unknown) => {
      if (error instanceof OrganizationUserNotFoundError) {
        throw new UserNotInOrganizationError();
      } else {
        throw error;
      }
    });

    // Retrieve the User's OrganizationAccess metadata to update
    const organizationAccess: OrganizationAccess | undefined = user.OrganizationAccess;
    const organizationStatus =
      organizationAccess && organizationAccess[laboratory.OrganizationId]
        ? organizationAccess[laboratory.OrganizationId].Status
        : 'Inactive'; // Fallback default

    const laboratoryAccess: LaboratoryAccess | undefined =
      user.OrganizationAccess && user.OrganizationAccess[laboratory.OrganizationId]
        ? user.OrganizationAccess[laboratory.OrganizationId].LaboratoryAccess
        : undefined;

    const response: boolean = await platformUserService
      .addExistingUserToLaboratory(
        {
          ...user,
          OrganizationAccess: {
            ...user.OrganizationAccess,
            [laboratory.OrganizationId]: <OrganizationAccessDetails>{
              Status: organizationStatus,
              LaboratoryAccess: <LaboratoryAccessDetails>{
                ...(laboratoryAccess ? laboratoryAccess : {}),
                [laboratory.LaboratoryId]: { Status: status },
              },
            },
          },
          ModifiedAt: new Date().toISOString(),
          ModifiedBy: currentUserId,
        },
        {
          ...request,
          CreatedAt: new Date().toISOString(),
          CreatedBy: currentUserId,
        },
      )
      .catch((error: any) => {
        if (error instanceof ConditionalCheckFailedException) {
          throw new LaboratoryUserAlreadyExistsError();
        } else {
          throw error;
        }
      });

    if (response) {
      return buildResponse(200, JSON.stringify({ Status: 'Success' }), event);
    }
  } catch (err: any) {
    console.error(err);
    return buildErrorResponse(err, event);
  }
};
