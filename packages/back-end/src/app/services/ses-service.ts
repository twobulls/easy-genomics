import {
  SendEmailCommand,
  SendTemplatedEmailCommand,
  SendTemplatedEmailCommandOutput,
  SESClient,
} from '@aws-sdk/client-ses';

export interface SesServiceProps {
  accountId: string;
  region: string;
  domainName: string;
}

export class SesService {
  readonly sesClient;
  readonly props: SesServiceProps;

  public constructor(props: SesServiceProps) {
    this.props = props;
    this.sesClient = new SESClient();
  }

  public async sendUserInvitationEmail(
    toAddress: string,
    organizationName: string,
    invitationJwt: string,
  ): Promise<SendTemplatedEmailCommandOutput> {
    const logRequestMessage = `Send User Invitation Email request: ${toAddress}`;
    console.info(logRequestMessage);

    const sendTemplatedEmailCommand: SendTemplatedEmailCommand = new SendTemplatedEmailCommand({
      Source: `no.reply@${this.props.domainName}`,
      Destination: {
        ToAddresses: [toAddress],
      },
      ReplyToAddresses: [`no.reply@${this.props.domainName}`],
      ReturnPath: `no.reply@${this.props.domainName}`,
      SourceArn: `arn:aws:ses:${this.props.region}:${this.props.accountId}:identity/${this.props.domainName}`,
      Template: 'UserInvitationEmailTemplate',
      TemplateData: JSON.stringify({
        COPYRIGHT_YEAR: `${new Date().getFullYear()}`,
        DOMAIN_NAME: this.props.domainName,
        INVITATION_JWT: invitationJwt,
        ORGANIZATION_NAME: organizationName,
        EASY_GENOMICS_EMAIL_LOGO: `https://${this.props.domainName}/images/email/easy-genomics.png`,
      }),
    });

    try {
      const response = await this.sesClient.send<SendTemplatedEmailCommand>(sendTemplatedEmailCommand);
      console.info(`Send User Invitation Email to ${toAddress} response: `, response);
      return response;
    } catch (error: unknown) {
      throw new Error(`${logRequestMessage} unsuccessful: ${error.message}`);
    }
  }

  public async sendUserForgotPasswordEmail(
    toAddress: string,
    forgotPasswordJwt: string,
  ): Promise<SendTemplatedEmailCommandOutput> {
    const logRequestMessage = `Send User Forgot Password Email request: ${toAddress}`;
    console.info(logRequestMessage);

    const sendTemplatedEmailCommand: SendTemplatedEmailCommand = new SendTemplatedEmailCommand({
      Source: `no.reply@${this.props.domainName}`,
      Destination: {
        ToAddresses: [toAddress],
      },
      ReplyToAddresses: [`no.reply@${this.props.domainName}`],
      ReturnPath: `no.reply@${this.props.domainName}`,
      SourceArn: `arn:aws:ses:${this.props.region}:${this.props.accountId}:identity/${this.props.domainName}`,
      Template: 'UserForgotPasswordEmailTemplate',
      TemplateData: JSON.stringify({
        COPYRIGHT_YEAR: `${new Date().getFullYear()}`,
        DOMAIN_NAME: this.props.domainName,
        FORGOT_PASSWORD_JWT: forgotPasswordJwt,
        EASY_GENOMICS_EMAIL_LOGO: `https://${this.props.domainName}/images/email/easy-genomics.png`,
        LOCK_IMAGE: `https://${this.props.domainName}/images/email/lock.png`,
      }),
    });

    try {
      const response = await this.sesClient.send<SendTemplatedEmailCommand>(sendTemplatedEmailCommand);
      console.info(`Send User Forgot Password Email to ${toAddress} response: `, response);
      return response;
    } catch (error: unknown) {
      throw new Error(`${logRequestMessage} unsuccessful: ${error.message}`);
    }
  }
}
