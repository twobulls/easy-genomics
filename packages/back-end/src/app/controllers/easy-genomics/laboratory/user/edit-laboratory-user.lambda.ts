import { EditLaboratoryUserSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/laboratory-user';
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
import { InvalidRequestError, UnauthorizedAccessError } from '@easy-genomics/shared-lib/src/app/utils/HttpError';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { LaboratoryService } from '@BE/services/easy-genomics/laboratory-service';
import { LaboratoryUserService } from '@BE/services/easy-genomics/laboratory-user-service';
import { PlatformUserService } from '@BE/services/easy-genomics/platform-user-service';
import { UserService } from '@BE/services/easy-genomics/user-service';
import { validateLaboratoryManagerAccess, validateOrganizationAdminAccess } from '@BE/utils/auth-utils';

const laboratoryUserService = new LaboratoryUserService();
const laboratoryService = new LaboratoryService();
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
    if (!EditLaboratoryUserSchema.safeParse(request).success) throw new InvalidRequestError();

    // Verify User has access to the Laboratory - throws error if not found
    const laboratoryUser: LaboratoryUser = await laboratoryUserService.get(request.LaboratoryId, request.UserId);

    // Lookup by LaboratoryId & UserId to confirm existence before updating
    const laboratory: Laboratory = await laboratoryService.queryByLaboratoryId(request.LaboratoryId);
    const user: User = await userService.get(request.UserId);

    // Only Organisation Admins and Laboratory Managers are allowed to edit a Laboratory-User mapping's details
    if (
      !(
        validateOrganizationAdminAccess(event, laboratory.OrganizationId) ||
        validateLaboratoryManagerAccess(event, laboratory.OrganizationId, laboratory.LaboratoryId)
      )
    ) {
      throw new UnauthorizedAccessError();
    }

    // Retrieve the User's OrganizationAccess metadata to update
    const organizationAccess: OrganizationAccess | undefined = user.OrganizationAccess;
    // Retrieve the current Organization's OrganizationAccessDetails for use in the update
    const organizationAccessDetails: OrganizationAccessDetails | undefined =
      organizationAccess && organizationAccess[laboratory.OrganizationId]
        ? organizationAccess[laboratory.OrganizationId]
        : undefined;
    // Retrieve the current Organization's LaboratoryAccess details for use in the update
    const laboratoryAccess: LaboratoryAccess | undefined = organizationAccessDetails
      ? organizationAccessDetails.LaboratoryAccess
      : undefined;

    const response: boolean = await platformUserService.editExistingUserAccessToLaboratory(
      {
        ...user,
        OrganizationAccess: <OrganizationAccess>{
          ...organizationAccess,
          [laboratory.OrganizationId]: <OrganizationAccessDetails>{
            ...organizationAccessDetails,
            LaboratoryAccess: <LaboratoryAccess>{
              ...laboratoryAccess,
              [laboratory.LaboratoryId]: <LaboratoryAccessDetails>{
                Status: request.Status,
                LabManager: request.LabManager,
                LabTechnician: request.LabTechnician,
              },
            },
          },
        },
        ModifiedAt: new Date().toISOString(),
        ModifiedBy: currentUserId,
      },
      {
        ...laboratoryUser,
        ...request,
        ModifiedAt: new Date().toISOString(),
        ModifiedBy: currentUserId,
      },
    );

    if (response) {
      return buildResponse(200, JSON.stringify({ Status: 'Success' }), event);
    }
  } catch (err: any) {
    console.error(err);
    return buildErrorResponse(err, event);
  }
};
