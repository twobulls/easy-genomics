import { CreateBulkUserInvitationRequestSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/user-invitation';
import { Organization } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization';
import { SnsProcessingEvent } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/sns-processing-event';
import {
  CreateBulkUserInvitationRequest,
  QueuedUserInvitationRequest,
} from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user-invitation';
import { buildErrorResponse, buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { OrganizationNotFoundError } from '@easy-genomics/shared-lib/src/app/utils/HttpError';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { OrganizationService } from '@BE/services/easy-genomics/organization-service';
import { SnsService } from '@BE/services/sns-service';

const organizationService = new OrganizationService();
const snsService = new SnsService();

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    const currentUserId: string = event.requestContext.authorizer.claims['cognito:username'];
    // Post Request Body
    const request: CreateBulkUserInvitationRequest = event.isBase64Encoded
      ? JSON.parse(atob(event.body!))
      : JSON.parse(event.body!);

    // Data validation safety check
    if (!CreateBulkUserInvitationRequestSchema.safeParse(request).success) throw new Error('Invalid request');

    // Check if Organization & User records exists
    const organization: Organization = await organizationService.get(request.OrganizationId); // Throws error if not found

    if (!organization) {
      throw new OrganizationNotFoundError();
    }

    await Promise.all(
      request.Emails.map(async (email: string) => {
        const record: SnsProcessingEvent = {
          Operation: 'CREATE',
          Type: 'UserInvite',
          Record: <QueuedUserInvitationRequest>{
            OrganizationId: organization.OrganizationId,
            Email: email,
            CreatedBy: currentUserId,
          },
        };
        return snsService.publish({
          TopicArn: process.env.SNS_USER_INVITE_TOPIC,
          Message: JSON.stringify(record),
          MessageGroupId: `create-user-invite-${organization.OrganizationId}`,
          MessageDeduplicationId: uuidv4(),
        });
      }),
    );

    return buildResponse(200, JSON.stringify({ Status: 'success' }), event);
  } catch (error: any) {
    console.error(error);
    return buildErrorResponse(error, event);
  }
};
