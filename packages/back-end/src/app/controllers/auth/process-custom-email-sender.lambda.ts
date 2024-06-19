import { createHmac } from 'crypto';
import { UserForgotPasswordJwt } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user-verification-jwt';
import { Handler } from 'aws-lambda';
import { CustomEmailSenderTriggerEvent } from 'aws-lambda/trigger/cognito-user-pool-trigger/custom-email-sender';
import { SesService } from '../../services/ses-service';
import { generateJwt } from '../../utils/jwt-utils';

const sesService = new SesService({
  accountId: process.env.ACCOUNT_ID,
  domainName: process.env.DOMAIN_NAME,
  region: process.env.REGION,
});

/**
 * This auth lambda function is triggered by the Cognito Custom-Email-Sender Event:
 * https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-custom-message.html
 *
 * @param event
 */
export const handler: Handler = async (
  event: CustomEmailSenderTriggerEvent,
): Promise<CustomEmailSenderTriggerEvent> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));

  if (event.triggerSource === 'CustomEmailSender_ForgotPassword') {
    const email: string = event.request.userAttributes.email;
    const userId: string = event.userName;
    const code: string = event.request.code || ''; // Auto encrypted by Cognito

    const forgotPasswordJwt: string = generateUserForgotPasswordJwt(email, userId, code);
    await sesService.sendUserForgotPasswordEmail(email, forgotPasswordJwt);
  }

  return event;
};

/**
 * Helper function to generate User Forgot Password JWT to send in email
 * and used to verify User Forgot Password request.
 *
 * The JWT is set to expire in 1 hour to match Cognito's ForgotPassword expiry.
 * @param email
 * @param username
 * @param code
 */
function generateUserForgotPasswordJwt(email: string, username: string, code: string): string {
  const createdAt: number = Date.now(); // Salt
  const userForgotPasswordJwt: UserForgotPasswordJwt = {
    RequestType: 'UserForgotPassword',
    Verification: createHmac('sha256', process.env.JWT_SECRET_KEY + createdAt)
      .update(username + code)
      .digest('hex'),
    Email: email,
    Code: code,
    CreatedAt: createdAt,
  };
  return generateJwt(userForgotPasswordJwt, process.env.JWT_SECRET_KEY, '1 h');
}
