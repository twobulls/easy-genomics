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
    // @ts-ignore
    this.sesClient = new SESClient({ region: props.region });
  }

  public async sendUserInvitationEmail(
    toAddress: string,
    organizationName: string,
    invitationJwt: string,
  ): Promise<SendTemplatedEmailCommandOutput> {
    const logRequestMessage = `Send User Invitation Email request: ${toAddress}`;
    console.info(logRequestMessage);

    const sendTemplatedEmailCommand = new SendTemplatedEmailCommand({
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
        EASY_GENOMICS_EMAIL_LOGO: `https://${this.props.domainName}/images/easy-genomics-email.png`,
      }),
    });

    try {
      return await this.sesClient.send<SendTemplatedEmailCommand>(sendTemplatedEmailCommand);
    } catch (error: unknown) {
      throw new Error(`${logRequestMessage} unsuccessful: ${error.message}`);
    }
  }
}
