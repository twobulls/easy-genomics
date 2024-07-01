import { AuthenticationLogEvent } from '@easy-genomics/shared-lib/src/app/types/auth/authentication-log-event';
import { APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { AuthenticationLogService } from '../../services/auth/authentication-log-service';

const authenticationLogService = new AuthenticationLogService();

/**
 * This auth lambda function is triggered by the Cognito Post-Authentication Event:
 * https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-post-authentication.html
 *
 * It records the user authentication event into the DynamoDB table 'authentication-log-table'
 * for security auditing purposes, and is automatically cleared by the DynamoDB table's
 * Time-To-Live (TTL) setting.
 *
 * NOTE: The 'authentication-log-table' DynamoDB table's TTL setting has not been implemented yet and
 * will likely require some configuration file changes to support this being a configurable setting.
 *
 * @param event
 */
export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyWithCognitoAuthorizerEvent> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  // @ts-ignore
  await authenticationLogService
    .add(<AuthenticationLogEvent>{
      UserName: event.userName,
      DateTime: Date.now(), // UNIX timestamp
      Event: JSON.stringify(event),
    })
    .catch((err) => {
      console.error(err);
    });
  return event;
};
