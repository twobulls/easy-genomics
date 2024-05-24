import { RemovalPolicy, StackProps } from 'aws-cdk-lib';
import { HostedZone, IHostedZone } from 'aws-cdk-lib/aws-route53';
import { CfnTemplate, EmailIdentity, Identity } from 'aws-cdk-lib/aws-ses';
import { Construct } from 'constructs';

export interface SesConstructProps extends StackProps {
  awsAccount: string;
  awsRegion: string;
  domainName: string;
  emailSender: string;
}

/**
 * This SES (Simple Email Service) Construct sets up SES Email Identity and email templates.
 */
export class SesConstruct extends Construct {
  readonly props: SesConstructProps;
  readonly emailDomainIdentity: EmailIdentity;

  constructor(scope: Construct, id: string, props: SesConstructProps) {
    super(scope, id);
    this.props = props;

    const hostedZone: IHostedZone = HostedZone.fromLookup(this, 'Zone', { domainName: this.props.domainName });

    this.emailDomainIdentity = new EmailIdentity(this, 'VerifiedEmailDomainIdentity', {
      identity: Identity.publicHostedZone(hostedZone),
      mailFromDomain: `mail.${this.props.domainName}`,
    });
    this.emailDomainIdentity.applyRemovalPolicy(RemovalPolicy.DESTROY);

    this.setupUserInvitationEmailTemplate();
  }

  private setupUserInvitationEmailTemplate() {
    const invitationEmailTemplate: CfnTemplate = new CfnTemplate(this, 'UserInvitationEmailTemplate', {
      template: {
        templateName: 'UserInvitationEmailTemplate',
        subjectPart: 'You’ve been invited to Easy Genomics',
        htmlPart: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="initial-scale=1, width=device-width">
            <link rel="stylesheet"  href="./index.css" />
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Helvetica Neue:wght@400;500&display=swap" />
            <style>.youve-been-invited{width:440px;position:relative;line-height:40px;font-weight:500;display:inline-block}.to-organisation-name{width:430px;position:relative;font-size:14px;line-height:150%;color:#323840;display:inline-block}.content{display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-start;padding:0 80px;gap:12px;font-size:32px}.button-label{position:relative;font-weight:500}.button{width:216px;border-radius:8px;background-color:#5524e0;height:48px;display:flex;flex-direction:row;align-items:center;justify-content:center;padding:16px 24px;box-sizing:border-box;color:#fff;cursor:pointer}.button:hover{width:216px;border-radius:8px;background-color:#451db7;height:48px;display:flex;flex-direction:row;align-items:center;justify-content:center;padding:16px 24px;box-sizing:border-box;color:#fff;cursor:pointer}.button:click{width:216px;border-radius:8px;background-color:#371792;height:48px;display:flex;flex-direction:row;align-items:center;justify-content:center;padding:16px 24px;box-sizing:border-box;color:#fff;cursor:pointer}.footer-content-child{width:440px;position:relative;background-color:#e5e5e5;height:1px}.sent-from-easy{width:438px;position:relative;line-height:150%;display:inline-block}.easy-genomics-inc{width:438px;position:relative;font-size:12px;line-height:150%;color:#818181;display:inline-block}.footer{display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-start;padding:0 80px;gap:12px}.footer-content{display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:16px;text-align:left;color:#323840}.email-content{position:relative;width:100%;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:64px 0;box-sizing:border-box;gap:48px;text-align:center;font-size:14px;color:#12181f;font-family:'Helvetica Neue'}</style>
          </head>
          <body>
            <div class="email-content">
              <div class="content">
                <div class="youve-been-invited">You’ve been invited</div>
                <div class="to-organisation-name">to {{ORGANIZATION_NAME}}, click the link below to set up your account and get started. This link will expire in 7 Days.</div>
              </div>
              <a href="https://{{DOMAIN_NAME}}/accept-invitation?invite={{INVITATION_JWT}}">
                  <div class="button"><div class="button-label">Accept Invite</div></div>
              </a>
              <div class="footer-content">
                <div class="footer-content-child"></div>
                <div class="footer">
                  <div class="sent-from-easy">Sent from Easy Genomics</div>
                  <div class="easy-genomics-inc">© {{COPYRIGHT_YEAR}} Easy Genomics, Inc. All rights reserved.</div>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
      },
    });
    invitationEmailTemplate.applyRemovalPolicy(RemovalPolicy.DESTROY);

    return invitationEmailTemplate;
  }
}
