import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import { Organization } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization';
import { OrganizationUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user';
import { buildErrorResponse, buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { RequiredIdNotFoundError, UnauthorizedAccessError } from '@easy-genomics/shared-lib/src/app/utils/HttpError';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { LaboratoryService } from '@BE/services/easy-genomics/laboratory-service';
import { OrganizationService } from '@BE/services/easy-genomics/organization-service';
import { OrganizationUserService } from '@BE/services/easy-genomics/organization-user-service';
import { SnsService } from '@BE/services/sns-service';
import { validateSystemAdminAccess } from '@BE/utils/auth-utils';

const organizationService = new OrganizationService();
const organizationUserService = new OrganizationUserService();
const laboratoryService = new LaboratoryService();
const snsService = new SnsService();

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    if (!validateSystemAdminAccess(event)) {
      throw new UnauthorizedAccessError();
    }
    // Get Path Parameter
    const id: string = event.pathParameters?.id || '';
    if (id === '') throw new RequiredIdNotFoundError();

    // Lookup by OrganizationId to confirm existence before deletion
    const organization: Organization = await organizationService.get(id);

    // Publish FIFO asynchronous events to delete the Organization's associated Users, Labs, and finally the Organization
    await publishDeleteOrganizationUsers(id);
    await publishDeleteOrganizationLabs(id);
    await publishDeleteOrganization(organization);

    return buildResponse(200, JSON.stringify({ Status: 'Success' }), event);
  } catch (err: any) {
    console.error(err);
    return buildErrorResponse(err, event);
  }
};

/**
 * Publishes SNS notification messages to delete the Organization Users
 * @param organizationId
 */
async function publishDeleteOrganizationUsers(organizationId: string): Promise<void> {
  const organizationUsers: OrganizationUser[] = await organizationUserService.queryByOrganizationId(organizationId);

  await Promise.all(
    organizationUsers.map(async (organizationUser: OrganizationUser) => {
      return snsService.publish({
        TopicArn: process.env.SNS_ORGANIZATION_DELETION_TOPIC,
        Message: JSON.stringify({
          Operation: 'DELETE',
          Type: 'OrganizationUser',
          Record: organizationUser,
        }),
        MessageGroupId: `delete-organization-${organizationId}`,
        MessageDeduplicationId: uuidv4(),
      });
    }),
  );
}

/**
 * Publishes SNS notification messages to delete the Organization Laboratories
 * @param organizationId
 */
async function publishDeleteOrganizationLabs(organizationId: string): Promise<void> {
  const laboratories: Laboratory[] = await laboratoryService.queryByOrganizationId(organizationId);

  await Promise.all(
    laboratories.map(async (laboratory: Laboratory) => {
      return snsService.publish({
        TopicArn: process.env.SNS_ORGANIZATION_DELETION_TOPIC,
        Message: JSON.stringify({
          Operation: 'DELETE',
          Type: 'Laboratory',
          Record: laboratory,
        }),
        MessageGroupId: `delete-organization-${organizationId}`,
        MessageDeduplicationId: uuidv4(),
      });
    }),
  );
}

/**
 * Publishes SNS notification message to delete the Organization
 * @param organization
 */
async function publishDeleteOrganization(organization: Organization): Promise<void> {
  await snsService.publish({
    TopicArn: process.env.SNS_ORGANIZATION_DELETION_TOPIC,
    Message: JSON.stringify({
      Operation: 'DELETE',
      Type: 'Organization',
      Record: organization,
    }),
    MessageGroupId: `delete-organization-${organization.OrganizationId}`,
    MessageDeduplicationId: uuidv4(),
  });
}
