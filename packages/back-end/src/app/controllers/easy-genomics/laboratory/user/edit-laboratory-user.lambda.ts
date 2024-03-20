import { TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import { EditLaboratoryUserSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/laboratory-user';
import { LaboratoryUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-user';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { LaboratoryUserService } from '../../../../services/easy-genomics/laboratory-user-service';

const laboratoryUserService = new LaboratoryUserService();

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    const userId: string = event.requestContext.authorizer.claims['cognito:username'];
    // Post Request Body
    const request: LaboratoryUser = (
      event.isBase64Encoded ? JSON.parse(atob(event.body!)) : JSON.parse(event.body!)
    );
    // Data validation safety check
    if (!EditLaboratoryUserSchema.safeParse(request).success) throw new Error('Invalid request');

    // Lookup by LaboratoryId & UserId to confirm existence before updating
    const existing: LaboratoryUser = await laboratoryUserService.get(request.LaboratoryId, request.UserId);
    const updated: LaboratoryUser = await laboratoryUserService.update({
      ...existing,
      ...request,
      ModifiedAt: new Date().toISOString(),
      ModifiedBy: userId,
    });
    return buildResponse(200, JSON.stringify(updated), event);
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
  return err.message;
};
