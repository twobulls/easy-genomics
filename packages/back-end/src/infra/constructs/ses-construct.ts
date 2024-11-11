import { RemovalPolicy, StackProps } from 'aws-cdk-lib';
import { HostedZone, IHostedZone } from 'aws-cdk-lib/aws-route53';
import { CfnTemplate, EmailIdentity, Identity } from 'aws-cdk-lib/aws-ses';
import { Construct } from 'constructs';

export interface SesConstructProps extends StackProps {
  awsAccount: string;
  awsRegion: string;
  appDomainName: string;
  awsHostedZoneId?: string;
  emailSender: string;
}

/**
 * This SES (Simple Email Service) Construct sets up SES Email Identity and email templates.
 */
export class SesConstruct extends Construct {
  readonly props: SesConstructProps;

  constructor(scope: Construct, id: string, props: SesConstructProps) {
    super(scope, id);
    this.props = props;

    if (!this.props.awsHostedZoneId) {
      console.log('Skipping SES configuration - AWS HostedZoneId not configured');
    } else {
      console.log(`Proceeding with SES configuration with AWS HostedZoneId: ${this.props.awsHostedZoneId}`);
      const hostedZone: IHostedZone = HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
        hostedZoneId: this.props.awsHostedZoneId,
        zoneName: this.props.appDomainName,
      });

      const emailDomainIdentity = new EmailIdentity(this, 'VerifiedEmailDomainIdentity', {
        identity: Identity.publicHostedZone(hostedZone),
        mailFromDomain: `mail.${this.props.appDomainName}`,
      });
      emailDomainIdentity.applyRemovalPolicy(RemovalPolicy.DESTROY);

      this.setupNewUserInvitationEmailTemplate();
      this.setupExistingUserInvitationEmailTemplate();
      this.setupUserForgotPasswordEmailTemplate();
    }
  }

  private setupNewUserInvitationEmailTemplate() {
    const newUserInvitationEmailTemplate: CfnTemplate = new CfnTemplate(this, 'NewUserInvitationEmailTemplate', {
      template: {
        templateName: 'NewUserInvitationEmailTemplate',
        subjectPart: 'You’ve been invited to Easy Genomics',
        htmlPart: `
         <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html style="margin: 0px; padding: 0px; height: 100%;" xmlns="http://www.w3.org/1999/xhtml">
   <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <title></title>
      <!--[if !mso]><!-->
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <!--<![endif]-->
      <meta name="viewport" content="width=device-width">
      <style type="text/css">
         @media only screen and (min-width: 620px){.column{}.wrapper{min-width:600px !important}.wrapper h1{}.wrapper h1{font-size:36px !important;line-height:43px !important}.wrapper h2{}.wrapper h2{font-size:22px !important;line-height:31px !important}.wrapper h3{}.wrapper h3{font-size:18px !important;line-height:26px !important}.wrapper .size-8,.wrapper .size-8-m,.wrapper .size-8-l{font-size:8px !important;line-height:14px !important}.wrapper .size-8-m{line-height:16px !important}.wrapper .size-8-l{line-height:24px !important}.wrapper .size-9,.wrapper .size-9-m,.wrapper .size-9-l{font-size:9px !important;line-height:16px !important}.wrapper .size-9-m{line-height:18px !important}.wrapper .size-9-l{line-height:27px !important}.wrapper .size-10,.wrapper .size-10-m,.wrapper .size-10-l{font-size:10px !important;line-height:18px !important}.wrapper .size-10-m{line-height:20px !important}.wrapper
         .size-10-l{line-height:30px !important}.wrapper .size-11,.wrapper .size-11-m,.wrapper .size-11-l{font-size:11px !important;line-height:19px !important}.wrapper .size-11-m{line-height:22px !important}.wrapper .size-11-l{line-height:33px !important}.wrapper .size-12,.wrapper .size-12-m,.wrapper .size-12-l{font-size:12px !important;line-height:19px !important}.wrapper .size-12-m{line-height:24px !important}.wrapper .size-12-l{line-height:36px !important}.wrapper .size-13,.wrapper .size-13-m,.wrapper .size-13-l{font-size:13px !important;line-height:21px !important}.wrapper .size-13-m{line-height:26px !important}.wrapper .size-13-l{line-height:39px !important}.wrapper .size-14,.wrapper .size-14-m,.wrapper .size-14-l{font-size:14px !important;line-height:21px !important}.wrapper .size-14-m{line-height:28px !important}.wrapper .size-14-l{line-height:42px !important}.wrapper .size-15,.wrapper
         .size-15-m,.wrapper .size-15-l{font-size:15px !important;line-height:23px !important}.wrapper .size-15-m{line-height:30px !important}.wrapper .size-15-l{line-height:45px !important}.wrapper .size-16,.wrapper .size-16-m,.wrapper .size-16-l{font-size:16px !important;line-height:24px !important}.wrapper .size-16-m{line-height:32px !important}.wrapper .size-16-l{line-height:48px !important}.wrapper .size-17,.wrapper .size-17-m,.wrapper .size-17-l{font-size:17px !important;line-height:26px !important}.wrapper .size-17-m{line-height:34px !important}.wrapper .size-17-l{line-height:51px !important}.wrapper .size-18,.wrapper .size-18-m,.wrapper .size-18-l{font-size:18px !important;line-height:26px !important}.wrapper .size-18-m{line-height:36px !important}.wrapper .size-18-l{line-height:54px !important}.wrapper .size-20,.wrapper .size-20-m,.wrapper .size-20-l{font-size:20px
         !important;line-height:28px !important}.wrapper .size-20-m{line-height:40px !important}.wrapper .size-20-l{line-height:60px !important}.wrapper .size-22,.wrapper .size-22-m,.wrapper .size-22-l{font-size:22px !important;line-height:31px !important}.wrapper .size-22-m{line-height:44px !important}.wrapper .size-22-l{line-height:66px !important}.wrapper .size-24,.wrapper .size-24-m,.wrapper .size-24-l{font-size:24px !important;line-height:32px !important}.wrapper .size-24-m{line-height:48px !important}.wrapper .size-24-l{line-height:72px !important}.wrapper .size-26,.wrapper .size-26-m,.wrapper .size-26-l{font-size:26px !important;line-height:34px !important}.wrapper .size-26-m{line-height:52px !important}.wrapper .size-26-l{line-height:78px !important}.wrapper .size-28,.wrapper .size-28-m,.wrapper .size-28-l{font-size:28px !important;line-height:36px !important}.wrapper
         .size-28-m{line-height:56px !important}.wrapper .size-28-l{line-height:84px !important}.wrapper .size-30,.wrapper .size-30-m,.wrapper .size-30-l{font-size:30px !important;line-height:38px !important}.wrapper .size-30-m{line-height:60px !important}.wrapper .size-30-l{line-height:90px !important}.wrapper .size-32,.wrapper .size-32-m,.wrapper .size-32-l{font-size:32px !important;line-height:40px !important}.wrapper .size-32-m{line-height:64px !important}.wrapper .size-32-l{line-height:96px !important}.wrapper .size-34,.wrapper .size-34-m,.wrapper .size-34-l{font-size:34px !important;line-height:43px !important}.wrapper .size-34-m{line-height:68px !important}.wrapper .size-34-l{line-height:102px !important}.wrapper .size-36,.wrapper .size-36-m,.wrapper .size-36-l{font-size:36px !important;line-height:43px !important}.wrapper .size-36-m{line-height:72px !important}.wrapper
         .size-36-l{line-height:108px !important}.wrapper .size-40,.wrapper .size-40-m,.wrapper .size-40-l{font-size:40px !important;line-height:47px !important}.wrapper .size-40-m{line-height:80px !important}.wrapper .size-40-l{line-height:120px !important}.wrapper .size-44,.wrapper .size-44-m,.wrapper .size-44-l{font-size:44px !important;line-height:50px !important}.wrapper .size-44-m{line-height:88px !important}.wrapper .size-44-l{line-height:132px !important}.wrapper .size-48,.wrapper .size-48-m,.wrapper .size-48-l{font-size:48px !important;line-height:54px !important}.wrapper .size-48-m{line-height:96px !important}.wrapper .size-48-l{line-height:144px !important}.wrapper .size-56,.wrapper .size-56-m,.wrapper .size-56-l{font-size:56px !important;line-height:60px !important}.wrapper .size-56-m{line-height:112px !important}.wrapper .size-56-l{line-height:168px !important}.wrapper
         .size-64,.wrapper .size-64-m,.wrapper .size-64-l{font-size:64px !important;line-height:68px !important}.wrapper .size-64-m{line-height:128px !important}.wrapper .size-64-l{line-height:192px !important}.wrapper .size-72,.wrapper .size-72-m,.wrapper .size-72-l{font-size:72px !important;line-height:76px !important}.wrapper .size-72-m{line-height:144px !important}.wrapper .size-72-l{line-height:216px !important}.wrapper .size-80,.wrapper .size-80-m,.wrapper .size-80-l{font-size:80px !important;line-height:84px !important}.wrapper .size-80-m{line-height:160px !important}.wrapper .size-80-l{line-height:240px !important}.wrapper .size-96,.wrapper .size-96-m,.wrapper .size-96-l{font-size:96px !important;line-height:100px !important}.wrapper .size-96-m{line-height:192px !important}.wrapper .size-96-l{line-height:288px !important}.wrapper .size-112,.wrapper .size-112-m,.wrapper
         .size-112-l{font-size:112px !important;line-height:116px !important}.wrapper .size-112-m{line-height:224px !important}.wrapper .size-112-l{line-height:336px !important}.wrapper .size-128,.wrapper .size-128-m,.wrapper .size-128-l{font-size:128px !important;line-height:132px !important}.wrapper .size-128-m{line-height:256px !important}.wrapper .size-128-l{line-height:384px !important}.wrapper .size-144,.wrapper .size-144-m,.wrapper .size-144-l{font-size:144px !important;line-height:148px !important}.wrapper .size-144-m{line-height:288px !important}.wrapper .size-144-l{line-height:432px !important}}
      </style>
      <meta name="x-apple-disable-message-reformatting">
      <style type="text/css">
         .main, .mso {
         margin: 0;
         padding: 0;
         }
         table {
         border-collapse: collapse;
         table-layout: fixed;
         }
         * {
         line-height: inherit;
         }
         [x-apple-data-detectors] {
         color: inherit !important;
         text-decoration: none !important;
         }
         .wrapper .footer__share-button a:hover,
         .wrapper .footer__share-button a:focus {
         color: #ffffff !important;
         }
         .wrapper .footer__share-button a.icon-white:hover,
         .wrapper .footer__share-button a.icon-white:focus {
         color: #ffffff !important;
         }
         .wrapper .footer__share-button a.icon-black:hover,
         .wrapper .footer__share-button a.icon-black:focus {
         color: #000000 !important;
         }
         .btn a:hover,
         .btn a:focus,
         .footer__share-button a:hover,
         .footer__share-button a:focus,
         .email-footer__links a:hover,
         .email-footer__links a:focus {
         opacity: 1;
         }
         .btn a:hover {
         background-color: #451DB7 !important;
         }
         .btn a:focus {
         background-color: #371792 !important;
         }
         .preheader,
         .header,
         .layout,
         .column {
         transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out;
         }
         .preheader td {
         padding-bottom: 8px;
         }
         .layout,
         div.header {
         max-width: 400px !important;
         -fallback-width: 95% !important;
         width: calc(100% - 20px) !important;
         }
         div.preheader {
         max-width: 360px !important;
         -fallback-width: 90% !important;
         width: calc(100% - 60px) !important;
         }
         .snippet,
         .webversion {
         Float: none !important;
         }
         .stack .column {
         max-width: 400px !important;
         width: 100% !important;
         }
         .fixed-width.has-border {
         max-width: 402px !important;
         }
         .fixed-width.has-border .layout__inner {
         box-sizing: border-box;
         }
         .snippet,
         .webversion {
         width: 50% !important;
         }
         .mso .layout__edges {
         font-size: 0;
         }
         .layout-fixed-width,
         .mso .layout-full-width {
         background-color: #ffffff;
         }
         @media only screen and (min-width: 620px) {
         .column,
         .gutter {
         display: table-cell;
         Float: none !important;
         vertical-align: top;
         }
         div.preheader,
         .email-footer {
         max-width: 560px !important;
         width: 560px !important;
         }
         .snippet,
         .webversion {
         width: 280px !important;
         }
         div.header,
         .layout,
         .one-col .column {
         max-width: 600px !important;
         width: 600px !important;
         }
         .fixed-width.has-border,
         .fixed-width.x_has-border,
         .has-gutter.has-border,
         .has-gutter.x_has-border {
         max-width: 602px !important;
         width: 602px !important;
         }
         .two-col .column {
         max-width: 300px !important;
         width: 300px !important;
         }
         .three-col .column,
         .column.narrow,
         .column.x_narrow {
         max-width: 200px !important;
         width: 200px !important;
         }
         .column.wide,
         .column.x_wide {
         width: 400px !important;
         }
         .two-col.has-gutter .column,
         .two-col.x_has-gutter .column {
         max-width: 290px !important;
         width: 290px !important;
         }
         .three-col.has-gutter .column,
         .three-col.x_has-gutter .column,
         .has-gutter .narrow {
         max-width: 188px !important;
         width: 188px !important;
         }
         .has-gutter .wide {
         max-width: 394px !important;
         width: 394px !important;
         }
         .two-col.has-gutter.has-border .column,
         .two-col.x_has-gutter.x_has-border .column {
         max-width: 292px !important;
         width: 292px !important;
         }
         .three-col.has-gutter.has-border .column,
         .three-col.x_has-gutter.x_has-border .column,
         .has-gutter.has-border .narrow,
         .has-gutter.x_has-border .narrow {
         max-width: 190px !important;
         width: 190px !important;
         }
         .has-gutter.has-border .wide,
         .has-gutter.x_has-border .wide {
         max-width: 396px !important;
         width: 396px !important;
         }
         }
         @supports (display: flex) {
         @media only screen and (min-width: 620px) {
         .fixed-width.has-border .layout__inner {
         display: flex !important;
         }
         }
         }
         /***
         * Mobile Styles
         *
         * 1. Overriding inline styles
         */
         @media(max-width: 619px) {
         .email-flexible-footer .left-aligned-footer .column,
         .email-flexible-footer .center-aligned-footer,
         .email-flexible-footer .right-aligned-footer .column {
         max-width: 100% !important; /* [1] */
         text-align: center !important; /* [1] */
         width: 100% !important; /* [1] */
         }
         .flexible-footer-logo {
         margin-left: 0px !important; /* [1] */
         margin-right: 0px !important; /* [1] */
         }
         .email-flexible-footer .left-aligned-footer .flexible-footer__share-button__container,
         .email-flexible-footer .center-aligned-footer .flexible-footer__share-button__container,
         .email-flexible-footer .right-aligned-footer .flexible-footer__share-button__container {
         display: inline-block;
         margin-left: 5px !important; /* [1] */
         margin-right: 5px !important; /* [1] */
         }
         .email-flexible-footer__additionalinfo--center {
         text-align: center !important; /* [1] */
         }
         .email-flexible-footer .left-aligned-footer table,
         .email-flexible-footer .center-aligned-footer table,
         .email-flexible-footer .right-aligned-footer table {
         display: table !important; /* [1] */
         width: 100% !important; /* [1] */
         }
         .email-flexible-footer .footer__share-button,
         .email-flexible-footer .email-footer__additional-info {
         margin-left: 20px;
         margin-right: 20px;
         }
         }
         @media (max-width: 321px) {
         .fixed-width.has-border .layout__inner {
         border-width: 1px 0 !important;
         }
         .layout,
         .stack .column {
         min-width: 320px !important;
         width: 320px !important;
         }
         .border {
         display: none;
         }
         .has-gutter .border {
         display: table-cell;
         }
         }
         .cmctbl--inline table {
         border-collapse: collapse;
         }
      </style>
      <!--[if !mso]><!-->
      <!--<![endif]-->
      <style type="text/css">
         .main,.mso{background-color:#fff}.logo a:hover,.logo a:focus{color:#859bb1 !important}.footer-logo a:hover,.footer-logo a:focus{color:#372d1b !important}.mso .layout-has-border{border-top:1px solid #ccc;border-bottom:1px solid #ccc}.mso .layout-has-bottom-border{border-bottom:1px solid #ccc}.mso .border{background-color:#ccc}.mso h1{}.mso h1{font-size:36px !important;line-height:43px !important}.mso h2{}.mso h2{font-size:22px !important;line-height:31px !important}.mso h3{}.mso h3{font-size:18px !important;line-height:26px !important}.mso .layout__inner{}.mso .footer__share-button p{}.mso .footer__share-button p{font-family:sans-serif}
      </style>
      <!--[if mso]>
      <style type="text/css" emb-not-inline>
         .mso div{border:0 none white !important}.mso .w560 .divider{}.mso .w560 .divider{Margin-left:260px !important;Margin-right:260px !important}.mso .w360 .divider{}.mso .w360 .divider{Margin-left:160px !important;Margin-right:160px !important}.mso .w260 .divider{}.mso .w260 .divider{Margin-left:110px !important;Margin-right:110px !important}.mso .w160 .divider{}.mso .w160 .divider{Margin-left:60px !important;Margin-right:60px !important}.mso .w60 .divider{}.mso .w60 .divider{Margin-left:10px !important;Margin-right:10px !important}.mso .w354 .divider{}.mso .w354 .divider{Margin-left:157px !important;Margin-right:157px !important}.mso .w250 .divider{}.mso .w250 .divider{Margin-left:105px !important;Margin-right:105px !important}.mso .w148 .divider{}.mso .w148 .divider{Margin-left:54px !important;Margin-right:54px !important}.mso .size-8,.mso .size-8-m,.mso .size-8-l{font-size:8px
         !important;line-height:14px !important}.mso .size-8-m{line-height:16px !important}.mso .size-8-l{line-height:24px !important}.mso .size-9,.mso .size-9-m,.mso .size-9-l{font-size:9px !important;line-height:16px !important}.mso .size-9-m{line-height:18px !important}.mso .size-9-l{line-height:27px !important}.mso .size-10,.mso .size-10-m,.mso .size-10-l{font-size:10px !important;line-height:18px !important}.mso .size-10-m{line-height:20px !important}.mso .size-10-l{line-height:30px !important}.mso .size-11,.mso .size-11-m,.mso .size-11-l{font-size:11px !important;line-height:19px !important}.mso .size-11-m{line-height:22px !important}.mso .size-11-l{line-height:33px !important}.mso .size-12,.mso .size-12-m,.mso .size-12-l{font-size:12px !important;line-height:19px !important}.mso .size-12-m{line-height:24px !important}.mso .size-12-l{line-height:36px !important}.mso .size-13,.mso
         .size-13-m,.mso .size-13-l{font-size:13px !important;line-height:21px !important}.mso .size-13-m{line-height:26px !important}.mso .size-13-l{line-height:39px !important}.mso .size-14,.mso .size-14-m,.mso .size-14-l{font-size:14px !important;line-height:21px !important}.mso .size-14-m{line-height:28px !important}.mso .size-14-l{line-height:42px !important}.mso .size-15,.mso .size-15-m,.mso .size-15-l{font-size:15px !important;line-height:23px !important}.mso .size-15-m{line-height:30px !important}.mso .size-15-l{line-height:45px !important}.mso .size-16,.mso .size-16-m,.mso .size-16-l{font-size:16px !important;line-height:24px !important}.mso .size-16-m{line-height:32px !important}.mso .size-16-l{line-height:48px !important}.mso .size-17,.mso .size-17-m,.mso .size-17-l{font-size:17px !important;line-height:26px !important}.mso .size-17-m{line-height:34px !important}.mso
         .size-17-l{line-height:51px !important}.mso .size-18,.mso .size-18-m,.mso .size-18-l{font-size:18px !important;line-height:26px !important}.mso .size-18-m{line-height:36px !important}.mso .size-18-l{line-height:54px !important}.mso .size-20,.mso .size-20-m,.mso .size-20-l{font-size:20px !important;line-height:28px !important}.mso .size-20-m{line-height:40px !important}.mso .size-20-l{line-height:60px !important}.mso .size-22,.mso .size-22-m,.mso .size-22-l{font-size:22px !important;line-height:31px !important}.mso .size-22-m{line-height:44px !important}.mso .size-22-l{line-height:66px !important}.mso .size-24,.mso .size-24-m,.mso .size-24-l{font-size:24px !important;line-height:32px !important}.mso .size-24-m{line-height:48px !important}.mso .size-24-l{line-height:72px !important}.mso .size-26,.mso .size-26-m,.mso .size-26-l{font-size:26px !important;line-height:34px !important}.mso
         .size-26-m{line-height:52px !important}.mso .size-26-l{line-height:78px !important}.mso .size-28,.mso .size-28-m,.mso .size-28-l{font-size:28px !important;line-height:36px !important}.mso .size-28-m{line-height:56px !important}.mso .size-28-l{line-height:84px !important}.mso .size-30,.mso .size-30-m,.mso .size-30-l{font-size:30px !important;line-height:38px !important}.mso .size-30-m{line-height:60px !important}.mso .size-30-l{line-height:90px !important}.mso .size-32,.mso .size-32-m,.mso .size-32-l{font-size:32px !important;line-height:40px !important}.mso .size-32-m{line-height:64px !important}.mso .size-32-l{line-height:96px !important}.mso .size-34,.mso .size-34-m,.mso .size-34-l{font-size:34px !important;line-height:43px !important}.mso .size-34-m{line-height:68px !important}.mso .size-34-l{line-height:102px !important}.mso .size-36,.mso .size-36-m,.mso .size-36-l{font-size:36px
         !important;line-height:43px !important}.mso .size-36-m{line-height:72px !important}.mso .size-36-l{line-height:108px !important}.mso .size-40,.mso .size-40-m,.mso .size-40-l{font-size:40px !important;line-height:47px !important}.mso .size-40-m{line-height:80px !important}.mso .size-40-l{line-height:120px !important}.mso .size-44,.mso .size-44-m,.mso .size-44-l{font-size:44px !important;line-height:50px !important}.mso .size-44-m{line-height:88px !important}.mso .size-44-l{line-height:132px !important}.mso .size-48,.mso .size-48-m,.mso .size-48-l{font-size:48px !important;line-height:54px !important}.mso .size-48-m{line-height:96px !important}.mso .size-48-l{line-height:144px !important}.mso .size-56,.mso .size-56-m,.mso .size-56-l{font-size:56px !important;line-height:60px !important}.mso .size-56-m{line-height:112px !important}.mso .size-56-l{line-height:168px !important}.mso
         .size-64,.mso .size-64-m,.mso .size-64-l{font-size:64px !important;line-height:68px !important}.mso .size-64-m{line-height:128px !important}.mso .size-64-l{line-height:192px !important}.mso .size-72,.mso .size-72-m,.mso .size-72-l{font-size:72px !important;line-height:76px !important}.mso .size-72-m{line-height:144px !important}.mso .size-72-l{line-height:216px !important}.mso .size-80,.mso .size-80-m,.mso .size-80-l{font-size:80px !important;line-height:84px !important}.mso .size-80-m{line-height:160px !important}.mso .size-80-l{line-height:240px !important}.mso .size-96,.mso .size-96-m,.mso .size-96-l{font-size:96px !important;line-height:100px !important}.mso .size-96-m{line-height:192px !important}.mso .size-96-l{line-height:288px !important}.mso .size-112,.mso .size-112-m,.mso .size-112-l{font-size:112px !important;line-height:116px !important}.mso .size-112-m{line-height:224px 
         !important}.mso .size-112-l{line-height:336px !important}.mso .size-128,.mso .size-128-m,.mso .size-128-l{font-size:128px !important;line-height:132px !important}.mso .size-128-m{line-height:256px !important}.mso .size-128-l{line-height:384px !important}.mso .size-144,.mso .size-144-m,.mso .size-144-l{font-size:144px !important;line-height:148px !important}.mso .size-144-m{line-height:288px !important}.mso .size-144-l{line-height:432px !important}.mso .cmctbl table td,.mso .cmctbl table th{Margin-left:20px !important;Margin-right:20px !important}.mso .cmctbl- -inline,.mso .cmctbl{padding-left:20px !important;padding-right:20px !important}.mso .cmctbl- -inline table,.mso .cmctbl
         table{mso-table-lspace:0pt;mso-table-rspace:0pt;mso-line-height-rule:exactly}.size-8,.size-9{mso-text-raise:9px}.size-34,h1{mso-text-raise:13px}.size-36{mso-text-raise:14px}.size-40{mso-text-raise:16px}.size-44{mso-text-raise:17px}.size-48{mso-text-raise:18px}.size-56{mso-text-raise:22px}.size-64{mso-text-raise:25px}.size-72{mso-text-raise:28px}.size-80{mso-text-raise:32px}.size-96{mso-text-raise:40px}.size-112{mso-text-raise:46px}.size-128{mso-text-raise:54px}.size-144{mso-text-raise:58px}.size-11-m,.size-12-m{mso-text-raise:6px}.size-13-m,.size-14-m{mso-text-raise:7px}.size-15-m,.size-16-m,.size-8-l{mso-text-raise:8px}.size-17-m,.size-18-m{mso-text-raise:9px}.size-20-m,.size-10-l{mso-text-raise:10px}.size-22-m,.size-11-l{mso-text-raise:11px}.size-24-m,.size-12-l{mso-text-raise:12px}.size-26-m,.size-13-l{mso-text-raise:13px}.size-28-m,.size-14-l{mso-text-raise:14px}.size-30-m,.size-15-l{mso-text-raise:15px}.size-32-m,.size-16-l{mso-text-raise:16px}.size-34-m,.size-17-l{mso-text-raise:17px}.size-36-m,.size-18-l{mso-text-raise:18px}.size-40-m,.size-20-l{mso-text-raise:20px}.size-44-m,.size-22-l{mso-text-raise:22px}.size-48-m,.size-24-l{mso-text-raise:24px}.size-26-l{mso-text-raise:26px}.size-56-m,.size-28-l{mso-text-raise:28px}.size-30-l{mso-text-raise:30px}.size-64-m,.size-32-l{mso-text-raise:32px}.size-34-l{mso-text-raise:34px}.size-72-m,.size-36-l{mso-text-raise:36px}.size-80-m,.size-40-l{mso-text-raise:40px}.size-44-l{mso-text-raise:44px}.size-96-m,.size-48-l{mso-text-raise:48px}.size-112-m,.size-56-l{mso-text-raise:56px}.size-128-m,.size-64-l{mso-text-raise:64px}.size-144-m,.size-72-l{mso-text-raise:72px}.size-80-l{mso-text-raise:80px}.size-96-l{mso-text-raise:96px}.size-112-l{mso-text-raise:112px}.size-128-l{mso-text-raise:128px}.size-144-l{mso-text-raise:144px}
      </style>
      <![endif]-->
      <meta name="robots" content="noindex,nofollow">
      <meta property="og:title" content="">
   </head>
   <!--[if mso]>
   <body class="mso">
      <![endif]-->
      <!--[if !mso]><!-->
      <body class="main full-padding" style="margin: 0px; padding: 0px; text-size-adjust: 100%; height: 584px; overflow-y: hidden;">
         <!--<![endif]-->
         <table class="wrapper" style="border-collapse: collapse;table-layout: fixed;min-width: 320px;width: 100%;background-color: #fff;" cellpadding="0" cellspacing="0" role="presentation">
         <tbody>
            <tr>
               <td>
                  <div role="banner">
                     <div class="preheader" style="Margin: 0 auto;max-width: 560px;min-width: 280px; width: 280px;width: calc(28000% - 167440px);">
                        <div style="border-collapse: collapse;display: table;width: 100%;">
                           <!--[if mso]>
                           <table align="center" class="preheader" cellpadding="0" cellspacing="0" role="presentation">
                              <tr>
                                 <td style="width: 280px" valign="top">
                                    <![endif]-->
                                    <div class="snippet" style="display: table-cell;Float: left;font-size: 12px;line-height: 19px;max-width: 280px;min-width: 140px; width: 140px;width: calc(14000% - 78120px);padding: 10px 0 5px 0;color: #787778;font-family: sans-serif;">
                                    </div>
                                    <!--[if mso]>
                                 </td>
                                 <td style="width: 280px" valign="top">
                                    <![endif]-->
                                    <div class="webversion" style="display: table-cell;Float: left;font-size: 12px;line-height: 19px;max-width: 280px;min-width: 139px; width: 139px;width: calc(14100% - 78680px);padding: 10px 0 5px 0;text-align: right;color: #787778;font-family: sans-serif;">
                                    </div>
                                    <!--[if mso]>
                                 </td>
                              </tr>
                           </table>
                           <![endif]-->
                        </div>
                     </div>
                     <div class="header" style="Margin: 0 auto;max-width: 600px;min-width: 320px; width: 320px;width: calc(28000% - 167400px);" id="emb-email-header-container">
                        <!--[if mso]>
                        <table align="center" class="header" cellpadding="0" cellspacing="0" role="presentation">
                           <tr>
                              <td style="width: 600px">
                                 <![endif]-->
                                 <div class="logo emb-logo-margin-box" style="font-size: 26px;line-height: 32px;Margin-top: 6px;Margin-bottom: 20px;color: #c3ced9;font-family: Helvetica,Arial,sans-serif;Margin-left: 20px;Margin-right: 20px;" align="center">
                                    <div class="logo-center" align="center" id="emb-email-header"><img style="display: block;height: auto;width: 100%;border: 0;max-width: 200px;" src="{{EASY_GENOMICS_EMAIL_LOGO}}" alt="" width="200"></div>
                                 </div>
                                 <!--[if mso]>
                              </td>
                           </tr>
                        </table>
                        <![endif]-->
                     </div>
                  </div>
                  <div>
                     <div style="background-color: #fafafa;">
                        <div class="layout one-col stack" style="Margin: 0 auto;max-width: 600px;min-width: 320px; width: 320px;width: calc(28000% - 167400px);overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;">
                           <div class="layout__inner" style="border-collapse: collapse;display: table;width: 100%;">
                              <!--[if mso]>
                              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                 <tr class="layout-full-width" style="background-color: #fafafa;">
                                    <td class="layout__edges">&nbsp;</td>
                                    <td style="width: 600px" class="w560">
                                       <![endif]-->
                                       <div class="column" style="text-align: left;color: #787778;font-size: 16px;line-height: 24px;font-family: Helvetica,Arial,sans-serif;">
                                          <div style="Margin-left: 20px;Margin-right: 20px;Margin-top: 24px;">
                                             <div style="mso-line-height-rule: exactly;line-height: 20px;font-size: 1px;">&nbsp;</div>
                                          </div>
                                          <div style="Margin-left: 20px;Margin-right: 20px;">
                                             <div style="mso-line-height-rule: exactly;mso-text-raise: 11px;vertical-align: middle;">
                                                <h1 class="size-32" style="Margin-top: 0;Margin-bottom: 0;font-style: normal;font-weight: normal;color: #565656;font-size: 28px;line-height: 36px;font-family: sans-serif;text-align: center;" lang="x-size-32"><span class="font-sans-serif" style="text-decoration: inherit;"><span style="text-decoration: inherit;color: #12181f;">You've been invited</span></span></h1>
                                                <p class="size-14" style="Margin-top: 20px;Margin-bottom: 20px;font-family: sans-serif;font-size: 14px;line-height: 21px;text-align: center;" lang="x-size-14"><span class="font-sans-serif" style="text-decoration: inherit;"><span style="text-decoration: inherit;color: #323840;">to {{ ORGANIZATION_NAME }}, click the link below to set up your account and get started. This link will expire in 7 days.</span></span></p>
                                             </div>
                                          </div>
                                          <div style="Margin-left: 20px;Margin-right: 20px;">
                                             <div style="mso-line-height-rule: exactly;line-height: 10px;font-size: 1px;">&nbsp;</div>
                                          </div>
                                          <div style="Margin-left: 20px;Margin-right: 20px;">
                                             <div class="btn btn--flat btn--large" style="Margin-bottom: 20px;text-align: center;">
                                                <!--[if !mso]><!--><a style="border-radius: 4px;display: inline-block;font-size: 14px;font-weight: bold;line-height: 24px;padding: 12px 24px;text-align: center;text-decoration: none !important;transition: opacity 0.1s ease-in;color: #ffffff !important;background-color: #5524e0;font-family: sans-serif;" href="https://{{DOMAIN_NAME}}/accept-invitation?invite={{INVITATION_JWT}}" target="_blank">Accept Invite</a><!--<![endif]-->
                                                <!--[if mso]>
                                                <p style="line-height:0;margin:0;">&nbsp;</p>
                                                <![endif]-->
                                             </div>
                                          </div>
                                          <div style="Margin-left: 20px;Margin-right: 20px;">
                                             <div style="mso-line-height-rule: exactly;line-height: 10px;font-size: 1px;">&nbsp;</div>
                                          </div>
                                          <div style="Margin-left: 20px;Margin-right: 20px;">
                                             <div style="mso-line-height-rule: exactly;line-height: 20px;font-size: 1px;">&nbsp;</div>
                                          </div>
                                          <div style="Margin-left: 20px;Margin-right: 20px;">
                                             <div style="mso-line-height-rule: exactly;line-height: 1px;font-size: 1px;">&nbsp;</div>
                                          </div>
                                          <div style="Margin-left: 20px;Margin-right: 20px;Margin-bottom: 16px;">
                                             <div class="divider" style="display: block;font-size: 2px;line-height: 1px;Margin-left: auto;Margin-right: auto;background-color: #e5e5e5;">&nbsp;</div>
                                          </div>
                                       </div>
                                       <!--[if mso]>
                                    </td>
                                    <td class="layout__edges">&nbsp;</td>
                                 </tr>
                              </table>
                              <![endif]-->
                           </div>
                        </div>
                     </div>
                     <div style="background-color: #fafafa;">
                        <div class="layout one-col stack" style="Margin: 0 auto;max-width: 600px;min-width: 320px; width: 320px;width: calc(28000% - 167400px);overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;">
                           <div class="layout__inner" style="border-collapse: collapse;display: table;width: 100%;">
                              <!--[if mso]>
                              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                 <tr class="layout-full-width" style="background-color: #fafafa;">
                                    <td class="layout__edges">&nbsp;</td>
                                    <td style="width: 600px" class="w560">
                                       <![endif]-->
                                       <div class="column" style="text-align: left;color: #787778;font-size: 16px;line-height: 24px;font-family: Helvetica,Arial,sans-serif;">
                                          <div style="Margin-left: 20px;Margin-right: 20px;Margin-top: 0;">
                                             <div style="mso-line-height-rule: exactly;mso-text-raise: 11px;vertical-align: middle;">
                                                <p style="Margin-top: 0;Margin-bottom: 20px;font-family: sans-serif;text-align: left;"><span class="font-sans-serif" style="text-decoration: inherit;"><span style="text-decoration: inherit;color: #323840;">Sent from Easy Genomics</span></span></p>
                                             </div>
                                          </div>
                                          <div style="Margin-left: 20px;Margin-right: 20px;Margin-bottom: 24px;">
                                             <div style="mso-line-height-rule: exactly;mso-text-raise: 11px;vertical-align: middle;">
                                                <p class="size-12" style="Margin-top: 0;Margin-bottom: 0;font-family: sans-serif;font-size: 12px;line-height: 19px;text-align: left;" lang="x-size-12"><span class="font-sans-serif" style="text-decoration: inherit;">© {{COPYRIGHT_YEAR}} Easy Genomics, Inc. All rights reserved.</span></p>
                                             </div>
                                          </div>
                                       </div>
                                       <!--[if mso]>
                                    </td>
                                    <td class="layout__edges">&nbsp;</td>
                                 </tr>
                              </table>
                              <![endif]-->
                           </div>
                        </div>
                     </div>
                  </div>
                  <div role="contentinfo">
                     <div style="line-height:4px;font-size:4px;" id="footer-top-spacing">&nbsp;</div>
                     <div class="layout email-flexible-footer email-footer" style="Margin: 0 auto;max-width: 600px;min-width: 320px; width: 320px;width: calc(28000% - 167400px);overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;" dir="rtl" id="footer-content">
                        <div class="layout__inner right-aligned-footer" style="border-collapse: collapse;display: table;width: 100%;">
                           <!--[if mso]>
                           <table align="center" cellpadding="0" cellspacing="0" role="presentation">
            <tr class="layout-email-footer"><![endif]-->
            <!--[if mso]><td><table cellpadding="0" cellspacing="0"><![endif]-->
            <!--[if mso]><td valign="top"><![endif]-->
            <div class="column" style="text-align: right;font-size: 12px;line-height: 19px;color: #787778;font-family: sans-serif;display: none;" dir="ltr">
            </div>
            </div>
            </div><div style="line-height:40px;font-size:40px;" id="footer-bottom-spacing">&nbsp;</div></div>
            </td></tr></tbody></table>
            <style type="text/css">
            @media (max-width:619px){.email-flexible-footer .left-aligned-footer .column,.email-flexible-footer .center-aligned-footer,.email-flexible-footer .right-aligned-footer .column{max-width:100% !important;text-align:center !important;width:100% !important}.flexible-footer-logo{margin-left:0px !important;margin-right:0px !important}.email-flexible-footer .left-aligned-footer .flexible-footer__share-button__container,.email-flexible-footer .center-aligned-footer .flexible-footer__share-button__container,.email-flexible-footer .right-aligned-footer .flexible-footer__share-button__container{display:inline-block;margin-left:5px !important;margin-right:5px !important}.email-flexible-footer__additionalinfo--center{text-align:center !important}.email-flexible-footer .left-aligned-footer table,.email-flexible-footer .center-aligned-footer table,.email-flexible-footer .right-aligned-footer 
            table{display:table !important;width:100% !important}.email-flexible-footer .footer__share-button,.email-flexible-footer .email-footer__additional-info{margin-left:20px;margin-right:20px}}
            </style>
   </body>
</html>
        `,
      },
    });
    newUserInvitationEmailTemplate.applyRemovalPolicy(RemovalPolicy.DESTROY);

    return newUserInvitationEmailTemplate;
  }

  private setupExistingUserInvitationEmailTemplate() {
    const invitationEmailTemplate: CfnTemplate = new CfnTemplate(this, 'ExistingUserInvitationEmailTemplate', {
      template: {
        templateName: 'ExistingUserInvitationEmailTemplate',
        subjectPart: 'You’ve been invited to Easy Genomics',
        htmlPart: `
         <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html style="margin: 0px; padding: 0px; height: 100%;" xmlns="http://www.w3.org/1999/xhtml">
   <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <title></title>
      <!--[if !mso]><!-->
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <!--<![endif]-->
      <meta name="viewport" content="width=device-width">
      <style type="text/css">
         @media only screen and (min-width: 620px){.column{}.wrapper{min-width:600px !important}.wrapper h1{}.wrapper h1{font-size:36px !important;line-height:43px !important}.wrapper h2{}.wrapper h2{font-size:22px !important;line-height:31px !important}.wrapper h3{}.wrapper h3{font-size:18px !important;line-height:26px !important}.wrapper .size-8,.wrapper .size-8-m,.wrapper .size-8-l{font-size:8px !important;line-height:14px !important}.wrapper .size-8-m{line-height:16px !important}.wrapper .size-8-l{line-height:24px !important}.wrapper .size-9,.wrapper .size-9-m,.wrapper .size-9-l{font-size:9px !important;line-height:16px !important}.wrapper .size-9-m{line-height:18px !important}.wrapper .size-9-l{line-height:27px !important}.wrapper .size-10,.wrapper .size-10-m,.wrapper .size-10-l{font-size:10px !important;line-height:18px !important}.wrapper .size-10-m{line-height:20px !important}.wrapper
         .size-10-l{line-height:30px !important}.wrapper .size-11,.wrapper .size-11-m,.wrapper .size-11-l{font-size:11px !important;line-height:19px !important}.wrapper .size-11-m{line-height:22px !important}.wrapper .size-11-l{line-height:33px !important}.wrapper .size-12,.wrapper .size-12-m,.wrapper .size-12-l{font-size:12px !important;line-height:19px !important}.wrapper .size-12-m{line-height:24px !important}.wrapper .size-12-l{line-height:36px !important}.wrapper .size-13,.wrapper .size-13-m,.wrapper .size-13-l{font-size:13px !important;line-height:21px !important}.wrapper .size-13-m{line-height:26px !important}.wrapper .size-13-l{line-height:39px !important}.wrapper .size-14,.wrapper .size-14-m,.wrapper .size-14-l{font-size:14px !important;line-height:21px !important}.wrapper .size-14-m{line-height:28px !important}.wrapper .size-14-l{line-height:42px !important}.wrapper .size-15,.wrapper
         .size-15-m,.wrapper .size-15-l{font-size:15px !important;line-height:23px !important}.wrapper .size-15-m{line-height:30px !important}.wrapper .size-15-l{line-height:45px !important}.wrapper .size-16,.wrapper .size-16-m,.wrapper .size-16-l{font-size:16px !important;line-height:24px !important}.wrapper .size-16-m{line-height:32px !important}.wrapper .size-16-l{line-height:48px !important}.wrapper .size-17,.wrapper .size-17-m,.wrapper .size-17-l{font-size:17px !important;line-height:26px !important}.wrapper .size-17-m{line-height:34px !important}.wrapper .size-17-l{line-height:51px !important}.wrapper .size-18,.wrapper .size-18-m,.wrapper .size-18-l{font-size:18px !important;line-height:26px !important}.wrapper .size-18-m{line-height:36px !important}.wrapper .size-18-l{line-height:54px !important}.wrapper .size-20,.wrapper .size-20-m,.wrapper .size-20-l{font-size:20px
         !important;line-height:28px !important}.wrapper .size-20-m{line-height:40px !important}.wrapper .size-20-l{line-height:60px !important}.wrapper .size-22,.wrapper .size-22-m,.wrapper .size-22-l{font-size:22px !important;line-height:31px !important}.wrapper .size-22-m{line-height:44px !important}.wrapper .size-22-l{line-height:66px !important}.wrapper .size-24,.wrapper .size-24-m,.wrapper .size-24-l{font-size:24px !important;line-height:32px !important}.wrapper .size-24-m{line-height:48px !important}.wrapper .size-24-l{line-height:72px !important}.wrapper .size-26,.wrapper .size-26-m,.wrapper .size-26-l{font-size:26px !important;line-height:34px !important}.wrapper .size-26-m{line-height:52px !important}.wrapper .size-26-l{line-height:78px !important}.wrapper .size-28,.wrapper .size-28-m,.wrapper .size-28-l{font-size:28px !important;line-height:36px !important}.wrapper
         .size-28-m{line-height:56px !important}.wrapper .size-28-l{line-height:84px !important}.wrapper .size-30,.wrapper .size-30-m,.wrapper .size-30-l{font-size:30px !important;line-height:38px !important}.wrapper .size-30-m{line-height:60px !important}.wrapper .size-30-l{line-height:90px !important}.wrapper .size-32,.wrapper .size-32-m,.wrapper .size-32-l{font-size:32px !important;line-height:40px !important}.wrapper .size-32-m{line-height:64px !important}.wrapper .size-32-l{line-height:96px !important}.wrapper .size-34,.wrapper .size-34-m,.wrapper .size-34-l{font-size:34px !important;line-height:43px !important}.wrapper .size-34-m{line-height:68px !important}.wrapper .size-34-l{line-height:102px !important}.wrapper .size-36,.wrapper .size-36-m,.wrapper .size-36-l{font-size:36px !important;line-height:43px !important}.wrapper .size-36-m{line-height:72px !important}.wrapper
         .size-36-l{line-height:108px !important}.wrapper .size-40,.wrapper .size-40-m,.wrapper .size-40-l{font-size:40px !important;line-height:47px !important}.wrapper .size-40-m{line-height:80px !important}.wrapper .size-40-l{line-height:120px !important}.wrapper .size-44,.wrapper .size-44-m,.wrapper .size-44-l{font-size:44px !important;line-height:50px !important}.wrapper .size-44-m{line-height:88px !important}.wrapper .size-44-l{line-height:132px !important}.wrapper .size-48,.wrapper .size-48-m,.wrapper .size-48-l{font-size:48px !important;line-height:54px !important}.wrapper .size-48-m{line-height:96px !important}.wrapper .size-48-l{line-height:144px !important}.wrapper .size-56,.wrapper .size-56-m,.wrapper .size-56-l{font-size:56px !important;line-height:60px !important}.wrapper .size-56-m{line-height:112px !important}.wrapper .size-56-l{line-height:168px !important}.wrapper
         .size-64,.wrapper .size-64-m,.wrapper .size-64-l{font-size:64px !important;line-height:68px !important}.wrapper .size-64-m{line-height:128px !important}.wrapper .size-64-l{line-height:192px !important}.wrapper .size-72,.wrapper .size-72-m,.wrapper .size-72-l{font-size:72px !important;line-height:76px !important}.wrapper .size-72-m{line-height:144px !important}.wrapper .size-72-l{line-height:216px !important}.wrapper .size-80,.wrapper .size-80-m,.wrapper .size-80-l{font-size:80px !important;line-height:84px !important}.wrapper .size-80-m{line-height:160px !important}.wrapper .size-80-l{line-height:240px !important}.wrapper .size-96,.wrapper .size-96-m,.wrapper .size-96-l{font-size:96px !important;line-height:100px !important}.wrapper .size-96-m{line-height:192px !important}.wrapper .size-96-l{line-height:288px !important}.wrapper .size-112,.wrapper .size-112-m,.wrapper
         .size-112-l{font-size:112px !important;line-height:116px !important}.wrapper .size-112-m{line-height:224px !important}.wrapper .size-112-l{line-height:336px !important}.wrapper .size-128,.wrapper .size-128-m,.wrapper .size-128-l{font-size:128px !important;line-height:132px !important}.wrapper .size-128-m{line-height:256px !important}.wrapper .size-128-l{line-height:384px !important}.wrapper .size-144,.wrapper .size-144-m,.wrapper .size-144-l{font-size:144px !important;line-height:148px !important}.wrapper .size-144-m{line-height:288px !important}.wrapper .size-144-l{line-height:432px !important}}
      </style>
      <meta name="x-apple-disable-message-reformatting">
      <style type="text/css">
         .main, .mso {
         margin: 0;
         padding: 0;
         }
         table {
         border-collapse: collapse;
         table-layout: fixed;
         }
         * {
         line-height: inherit;
         }
         [x-apple-data-detectors] {
         color: inherit !important;
         text-decoration: none !important;
         }
         .wrapper .footer__share-button a:hover,
         .wrapper .footer__share-button a:focus {
         color: #ffffff !important;
         }
         .wrapper .footer__share-button a.icon-white:hover,
         .wrapper .footer__share-button a.icon-white:focus {
         color: #ffffff !important;
         }
         .wrapper .footer__share-button a.icon-black:hover,
         .wrapper .footer__share-button a.icon-black:focus {
         color: #000000 !important;
         }
         .btn a:hover,
         .btn a:focus,
         .footer__share-button a:hover,
         .footer__share-button a:focus,
         .email-footer__links a:hover,
         .email-footer__links a:focus {
         opacity: 1;
         }
         .btn a:hover {
         background-color: #451DB7 !important;
         }
         .btn a:focus {
         background-color: #371792 !important;
         }
         .preheader,
         .header,
         .layout,
         .column {
         transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out;
         }
         .preheader td {
         padding-bottom: 8px;
         }
         .layout,
         div.header {
         max-width: 400px !important;
         -fallback-width: 95% !important;
         width: calc(100% - 20px) !important;
         }
         div.preheader {
         max-width: 360px !important;
         -fallback-width: 90% !important;
         width: calc(100% - 60px) !important;
         }
         .snippet,
         .webversion {
         Float: none !important;
         }
         .stack .column {
         max-width: 400px !important;
         width: 100% !important;
         }
         .fixed-width.has-border {
         max-width: 402px !important;
         }
         .fixed-width.has-border .layout__inner {
         box-sizing: border-box;
         }
         .snippet,
         .webversion {
         width: 50% !important;
         }
         .mso .layout__edges {
         font-size: 0;
         }
         .layout-fixed-width,
         .mso .layout-full-width {
         background-color: #ffffff;
         }
         @media only screen and (min-width: 620px) {
         .column,
         .gutter {
         display: table-cell;
         Float: none !important;
         vertical-align: top;
         }
         div.preheader,
         .email-footer {
         max-width: 560px !important;
         width: 560px !important;
         }
         .snippet,
         .webversion {
         width: 280px !important;
         }
         div.header,
         .layout,
         .one-col .column {
         max-width: 600px !important;
         width: 600px !important;
         }
         .fixed-width.has-border,
         .fixed-width.x_has-border,
         .has-gutter.has-border,
         .has-gutter.x_has-border {
         max-width: 602px !important;
         width: 602px !important;
         }
         .two-col .column {
         max-width: 300px !important;
         width: 300px !important;
         }
         .three-col .column,
         .column.narrow,
         .column.x_narrow {
         max-width: 200px !important;
         width: 200px !important;
         }
         .column.wide,
         .column.x_wide {
         width: 400px !important;
         }
         .two-col.has-gutter .column,
         .two-col.x_has-gutter .column {
         max-width: 290px !important;
         width: 290px !important;
         }
         .three-col.has-gutter .column,
         .three-col.x_has-gutter .column,
         .has-gutter .narrow {
         max-width: 188px !important;
         width: 188px !important;
         }
         .has-gutter .wide {
         max-width: 394px !important;
         width: 394px !important;
         }
         .two-col.has-gutter.has-border .column,
         .two-col.x_has-gutter.x_has-border .column {
         max-width: 292px !important;
         width: 292px !important;
         }
         .three-col.has-gutter.has-border .column,
         .three-col.x_has-gutter.x_has-border .column,
         .has-gutter.has-border .narrow,
         .has-gutter.x_has-border .narrow {
         max-width: 190px !important;
         width: 190px !important;
         }
         .has-gutter.has-border .wide,
         .has-gutter.x_has-border .wide {
         max-width: 396px !important;
         width: 396px !important;
         }
         }
         @supports (display: flex) {
         @media only screen and (min-width: 620px) {
         .fixed-width.has-border .layout__inner {
         display: flex !important;
         }
         }
         }
         /***
         * Mobile Styles
         *
         * 1. Overriding inline styles
         */
         @media(max-width: 619px) {
         .email-flexible-footer .left-aligned-footer .column,
         .email-flexible-footer .center-aligned-footer,
         .email-flexible-footer .right-aligned-footer .column {
         max-width: 100% !important; /* [1] */
         text-align: center !important; /* [1] */
         width: 100% !important; /* [1] */
         }
         .flexible-footer-logo {
         margin-left: 0px !important; /* [1] */
         margin-right: 0px !important; /* [1] */
         }
         .email-flexible-footer .left-aligned-footer .flexible-footer__share-button__container,
         .email-flexible-footer .center-aligned-footer .flexible-footer__share-button__container,
         .email-flexible-footer .right-aligned-footer .flexible-footer__share-button__container {
         display: inline-block;
         margin-left: 5px !important; /* [1] */
         margin-right: 5px !important; /* [1] */
         }
         .email-flexible-footer__additionalinfo--center {
         text-align: center !important; /* [1] */
         }
         .email-flexible-footer .left-aligned-footer table,
         .email-flexible-footer .center-aligned-footer table,
         .email-flexible-footer .right-aligned-footer table {
         display: table !important; /* [1] */
         width: 100% !important; /* [1] */
         }
         .email-flexible-footer .footer__share-button,
         .email-flexible-footer .email-footer__additional-info {
         margin-left: 20px;
         margin-right: 20px;
         }
         }
         @media (max-width: 321px) {
         .fixed-width.has-border .layout__inner {
         border-width: 1px 0 !important;
         }
         .layout,
         .stack .column {
         min-width: 320px !important;
         width: 320px !important;
         }
         .border {
         display: none;
         }
         .has-gutter .border {
         display: table-cell;
         }
         }
         .cmctbl--inline table {
         border-collapse: collapse;
         }
      </style>
      <!--[if !mso]><!-->
      <!--<![endif]-->
      <style type="text/css">
         .main,.mso{background-color:#fff}.logo a:hover,.logo a:focus{color:#859bb1 !important}.footer-logo a:hover,.footer-logo a:focus{color:#372d1b !important}.mso .layout-has-border{border-top:1px solid #ccc;border-bottom:1px solid #ccc}.mso .layout-has-bottom-border{border-bottom:1px solid #ccc}.mso .border{background-color:#ccc}.mso h1{}.mso h1{font-size:36px !important;line-height:43px !important}.mso h2{}.mso h2{font-size:22px !important;line-height:31px !important}.mso h3{}.mso h3{font-size:18px !important;line-height:26px !important}.mso .layout__inner{}.mso .footer__share-button p{}.mso .footer__share-button p{font-family:sans-serif}
      </style>
      <!--[if mso]>
      <style type="text/css" emb-not-inline>
         .mso div{border:0 none white !important}.mso .w560 .divider{}.mso .w560 .divider{Margin-left:260px !important;Margin-right:260px !important}.mso .w360 .divider{}.mso .w360 .divider{Margin-left:160px !important;Margin-right:160px !important}.mso .w260 .divider{}.mso .w260 .divider{Margin-left:110px !important;Margin-right:110px !important}.mso .w160 .divider{}.mso .w160 .divider{Margin-left:60px !important;Margin-right:60px !important}.mso .w60 .divider{}.mso .w60 .divider{Margin-left:10px !important;Margin-right:10px !important}.mso .w354 .divider{}.mso .w354 .divider{Margin-left:157px !important;Margin-right:157px !important}.mso .w250 .divider{}.mso .w250 .divider{Margin-left:105px !important;Margin-right:105px !important}.mso .w148 .divider{}.mso .w148 .divider{Margin-left:54px !important;Margin-right:54px !important}.mso .size-8,.mso .size-8-m,.mso .size-8-l{font-size:8px
         !important;line-height:14px !important}.mso .size-8-m{line-height:16px !important}.mso .size-8-l{line-height:24px !important}.mso .size-9,.mso .size-9-m,.mso .size-9-l{font-size:9px !important;line-height:16px !important}.mso .size-9-m{line-height:18px !important}.mso .size-9-l{line-height:27px !important}.mso .size-10,.mso .size-10-m,.mso .size-10-l{font-size:10px !important;line-height:18px !important}.mso .size-10-m{line-height:20px !important}.mso .size-10-l{line-height:30px !important}.mso .size-11,.mso .size-11-m,.mso .size-11-l{font-size:11px !important;line-height:19px !important}.mso .size-11-m{line-height:22px !important}.mso .size-11-l{line-height:33px !important}.mso .size-12,.mso .size-12-m,.mso .size-12-l{font-size:12px !important;line-height:19px !important}.mso .size-12-m{line-height:24px !important}.mso .size-12-l{line-height:36px !important}.mso .size-13,.mso
         .size-13-m,.mso .size-13-l{font-size:13px !important;line-height:21px !important}.mso .size-13-m{line-height:26px !important}.mso .size-13-l{line-height:39px !important}.mso .size-14,.mso .size-14-m,.mso .size-14-l{font-size:14px !important;line-height:21px !important}.mso .size-14-m{line-height:28px !important}.mso .size-14-l{line-height:42px !important}.mso .size-15,.mso .size-15-m,.mso .size-15-l{font-size:15px !important;line-height:23px !important}.mso .size-15-m{line-height:30px !important}.mso .size-15-l{line-height:45px !important}.mso .size-16,.mso .size-16-m,.mso .size-16-l{font-size:16px !important;line-height:24px !important}.mso .size-16-m{line-height:32px !important}.mso .size-16-l{line-height:48px !important}.mso .size-17,.mso .size-17-m,.mso .size-17-l{font-size:17px !important;line-height:26px !important}.mso .size-17-m{line-height:34px !important}.mso
         .size-17-l{line-height:51px !important}.mso .size-18,.mso .size-18-m,.mso .size-18-l{font-size:18px !important;line-height:26px !important}.mso .size-18-m{line-height:36px !important}.mso .size-18-l{line-height:54px !important}.mso .size-20,.mso .size-20-m,.mso .size-20-l{font-size:20px !important;line-height:28px !important}.mso .size-20-m{line-height:40px !important}.mso .size-20-l{line-height:60px !important}.mso .size-22,.mso .size-22-m,.mso .size-22-l{font-size:22px !important;line-height:31px !important}.mso .size-22-m{line-height:44px !important}.mso .size-22-l{line-height:66px !important}.mso .size-24,.mso .size-24-m,.mso .size-24-l{font-size:24px !important;line-height:32px !important}.mso .size-24-m{line-height:48px !important}.mso .size-24-l{line-height:72px !important}.mso .size-26,.mso .size-26-m,.mso .size-26-l{font-size:26px !important;line-height:34px !important}.mso
         .size-26-m{line-height:52px !important}.mso .size-26-l{line-height:78px !important}.mso .size-28,.mso .size-28-m,.mso .size-28-l{font-size:28px !important;line-height:36px !important}.mso .size-28-m{line-height:56px !important}.mso .size-28-l{line-height:84px !important}.mso .size-30,.mso .size-30-m,.mso .size-30-l{font-size:30px !important;line-height:38px !important}.mso .size-30-m{line-height:60px !important}.mso .size-30-l{line-height:90px !important}.mso .size-32,.mso .size-32-m,.mso .size-32-l{font-size:32px !important;line-height:40px !important}.mso .size-32-m{line-height:64px !important}.mso .size-32-l{line-height:96px !important}.mso .size-34,.mso .size-34-m,.mso .size-34-l{font-size:34px !important;line-height:43px !important}.mso .size-34-m{line-height:68px !important}.mso .size-34-l{line-height:102px !important}.mso .size-36,.mso .size-36-m,.mso .size-36-l{font-size:36px
         !important;line-height:43px !important}.mso .size-36-m{line-height:72px !important}.mso .size-36-l{line-height:108px !important}.mso .size-40,.mso .size-40-m,.mso .size-40-l{font-size:40px !important;line-height:47px !important}.mso .size-40-m{line-height:80px !important}.mso .size-40-l{line-height:120px !important}.mso .size-44,.mso .size-44-m,.mso .size-44-l{font-size:44px !important;line-height:50px !important}.mso .size-44-m{line-height:88px !important}.mso .size-44-l{line-height:132px !important}.mso .size-48,.mso .size-48-m,.mso .size-48-l{font-size:48px !important;line-height:54px !important}.mso .size-48-m{line-height:96px !important}.mso .size-48-l{line-height:144px !important}.mso .size-56,.mso .size-56-m,.mso .size-56-l{font-size:56px !important;line-height:60px !important}.mso .size-56-m{line-height:112px !important}.mso .size-56-l{line-height:168px !important}.mso
         .size-64,.mso .size-64-m,.mso .size-64-l{font-size:64px !important;line-height:68px !important}.mso .size-64-m{line-height:128px !important}.mso .size-64-l{line-height:192px !important}.mso .size-72,.mso .size-72-m,.mso .size-72-l{font-size:72px !important;line-height:76px !important}.mso .size-72-m{line-height:144px !important}.mso .size-72-l{line-height:216px !important}.mso .size-80,.mso .size-80-m,.mso .size-80-l{font-size:80px !important;line-height:84px !important}.mso .size-80-m{line-height:160px !important}.mso .size-80-l{line-height:240px !important}.mso .size-96,.mso .size-96-m,.mso .size-96-l{font-size:96px !important;line-height:100px !important}.mso .size-96-m{line-height:192px !important}.mso .size-96-l{line-height:288px !important}.mso .size-112,.mso .size-112-m,.mso .size-112-l{font-size:112px !important;line-height:116px !important}.mso .size-112-m{line-height:224px
         !important}.mso .size-112-l{line-height:336px !important}.mso .size-128,.mso .size-128-m,.mso .size-128-l{font-size:128px !important;line-height:132px !important}.mso .size-128-m{line-height:256px !important}.mso .size-128-l{line-height:384px !important}.mso .size-144,.mso .size-144-m,.mso .size-144-l{font-size:144px !important;line-height:148px !important}.mso .size-144-m{line-height:288px !important}.mso .size-144-l{line-height:432px !important}.mso .cmctbl table td,.mso .cmctbl table th{Margin-left:20px !important;Margin-right:20px !important}.mso .cmctbl- -inline,.mso .cmctbl{padding-left:20px !important;padding-right:20px !important}.mso .cmctbl- -inline table,.mso .cmctbl
         table{mso-table-lspace:0pt;mso-table-rspace:0pt;mso-line-height-rule:exactly}.size-8,.size-9{mso-text-raise:9px}.size-34,h1{mso-text-raise:13px}.size-36{mso-text-raise:14px}.size-40{mso-text-raise:16px}.size-44{mso-text-raise:17px}.size-48{mso-text-raise:18px}.size-56{mso-text-raise:22px}.size-64{mso-text-raise:25px}.size-72{mso-text-raise:28px}.size-80{mso-text-raise:32px}.size-96{mso-text-raise:40px}.size-112{mso-text-raise:46px}.size-128{mso-text-raise:54px}.size-144{mso-text-raise:58px}.size-11-m,.size-12-m{mso-text-raise:6px}.size-13-m,.size-14-m{mso-text-raise:7px}.size-15-m,.size-16-m,.size-8-l{mso-text-raise:8px}.size-17-m,.size-18-m{mso-text-raise:9px}.size-20-m,.size-10-l{mso-text-raise:10px}.size-22-m,.size-11-l{mso-text-raise:11px}.size-24-m,.size-12-l{mso-text-raise:12px}.size-26-m,.size-13-l{mso-text-raise:13px}.size-28-m,.size-14-l{mso-text-raise:14px}.size-30-m,.size-15-l{mso-text-raise:15px}.size-32-m,.size-16-l{mso-text-raise:16px}.size-34-m,.size-17-l{mso-text-raise:17px}.size-36-m,.size-18-l{mso-text-raise:18px}.size-40-m,.size-20-l{mso-text-raise:20px}.size-44-m,.size-22-l{mso-text-raise:22px}.size-48-m,.size-24-l{mso-text-raise:24px}.size-26-l{mso-text-raise:26px}.size-56-m,.size-28-l{mso-text-raise:28px}.size-30-l{mso-text-raise:30px}.size-64-m,.size-32-l{mso-text-raise:32px}.size-34-l{mso-text-raise:34px}.size-72-m,.size-36-l{mso-text-raise:36px}.size-80-m,.size-40-l{mso-text-raise:40px}.size-44-l{mso-text-raise:44px}.size-96-m,.size-48-l{mso-text-raise:48px}.size-112-m,.size-56-l{mso-text-raise:56px}.size-128-m,.size-64-l{mso-text-raise:64px}.size-144-m,.size-72-l{mso-text-raise:72px}.size-80-l{mso-text-raise:80px}.size-96-l{mso-text-raise:96px}.size-112-l{mso-text-raise:112px}.size-128-l{mso-text-raise:128px}.size-144-l{mso-text-raise:144px}
      </style>
      <![endif]-->
      <meta name="robots" content="noindex,nofollow">
      <meta property="og:title" content="">
   </head>
   <!--[if mso]>
   <body class="mso">
      <![endif]-->
      <!--[if !mso]><!-->
      <body class="main full-padding" style="margin: 0px; padding: 0px; text-size-adjust: 100%; height: 584px; overflow-y: hidden;">
         <!--<![endif]-->
         <table class="wrapper" style="border-collapse: collapse;table-layout: fixed;min-width: 320px;width: 100%;background-color: #fff;" cellpadding="0" cellspacing="0" role="presentation">
         <tbody>
            <tr>
               <td>
                  <div role="banner">
                     <div class="preheader" style="Margin: 0 auto;max-width: 560px;min-width: 280px; width: 280px;width: calc(28000% - 167440px);">
                        <div style="border-collapse: collapse;display: table;width: 100%;">
                           <!--[if mso]>
                           <table align="center" class="preheader" cellpadding="0" cellspacing="0" role="presentation">
                              <tr>
                                 <td style="width: 280px" valign="top">
                                    <![endif]-->
                                    <div class="snippet" style="display: table-cell;Float: left;font-size: 12px;line-height: 19px;max-width: 280px;min-width: 140px; width: 140px;width: calc(14000% - 78120px);padding: 10px 0 5px 0;color: #787778;font-family: sans-serif;">
                                    </div>
                                    <!--[if mso]>
                                 </td>
                                 <td style="width: 280px" valign="top">
                                    <![endif]-->
                                    <div class="webversion" style="display: table-cell;Float: left;font-size: 12px;line-height: 19px;max-width: 280px;min-width: 139px; width: 139px;width: calc(14100% - 78680px);padding: 10px 0 5px 0;text-align: right;color: #787778;font-family: sans-serif;">
                                    </div>
                                    <!--[if mso]>
                                 </td>
                              </tr>
                           </table>
                           <![endif]-->
                        </div>
                     </div>
                     <div class="header" style="Margin: 0 auto;max-width: 600px;min-width: 320px; width: 320px;width: calc(28000% - 167400px);" id="emb-email-header-container">
                        <!--[if mso]>
                        <table align="center" class="header" cellpadding="0" cellspacing="0" role="presentation">
                           <tr>
                              <td style="width: 600px">
                                 <![endif]-->
                                 <div class="logo emb-logo-margin-box" style="font-size: 26px;line-height: 32px;Margin-top: 6px;Margin-bottom: 20px;color: #c3ced9;font-family: Helvetica,Arial,sans-serif;Margin-left: 20px;Margin-right: 20px;" align="center">
                                    <div class="logo-center" align="center" id="emb-email-header"><img style="display: block;height: auto;width: 100%;border: 0;max-width: 200px;" src="{{EASY_GENOMICS_EMAIL_LOGO}}" alt="" width="200"></div>
                                 </div>
                                 <!--[if mso]>
                              </td>
                           </tr>
                        </table>
                        <![endif]-->
                     </div>
                  </div>
                  <div>
                     <div style="background-color: #fafafa;">
                        <div class="layout one-col stack" style="Margin: 0 auto;max-width: 600px;min-width: 320px; width: 320px;width: calc(28000% - 167400px);overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;">
                           <div class="layout__inner" style="border-collapse: collapse;display: table;width: 100%;">
                              <!--[if mso]>
                              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                 <tr class="layout-full-width" style="background-color: #fafafa;">
                                    <td class="layout__edges">&nbsp;</td>
                                    <td style="width: 600px" class="w560">
                                       <![endif]-->
                                       <div class="column" style="text-align: left;color: #787778;font-size: 16px;line-height: 24px;font-family: Helvetica,Arial,sans-serif;">
                                          <div style="Margin-left: 20px;Margin-right: 20px;Margin-top: 24px;">
                                             <div style="mso-line-height-rule: exactly;line-height: 20px;font-size: 1px;">&nbsp;</div>
                                          </div>
                                          <div style="Margin-left: 20px;Margin-right: 20px;">
                                             <div style="mso-line-height-rule: exactly;mso-text-raise: 11px;vertical-align: middle;">
                                                <h1 class="size-32" style="Margin-top: 0;Margin-bottom: 0;font-style: normal;font-weight: normal;color: #565656;font-size: 28px;line-height: 36px;font-family: sans-serif;text-align: center;" lang="x-size-32"><span class="font-sans-serif" style="text-decoration: inherit;"><span style="text-decoration: inherit;color: #12181f;">You've been added</span></span></h1>
                                                <p class="size-14" style="Margin-top: 20px;Margin-bottom: 20px;font-family: sans-serif;font-size: 14px;line-height: 21px;text-align: center;" lang="x-size-14"><span class="font-sans-serif" style="text-decoration: inherit;"><span style="text-decoration: inherit;color: #323840;">to {{ ORGANIZATION_NAME }}. This is a courtesy notification and no action is required.</span></span></p>
                                             </div>
                                          </div>
                                          <div style="Margin-left: 20px;Margin-right: 20px;">
                                             <div style="mso-line-height-rule: exactly;line-height: 10px;font-size: 1px;">&nbsp;</div>
                                          </div>
                                          <div style="Margin-left: 20px;Margin-right: 20px;">
                                             <div style="mso-line-height-rule: exactly;line-height: 10px;font-size: 1px;">&nbsp;</div>
                                          </div>
                                          <div style="Margin-left: 20px;Margin-right: 20px;">
                                             <div style="mso-line-height-rule: exactly;line-height: 20px;font-size: 1px;">&nbsp;</div>
                                          </div>
                                          <div style="Margin-left: 20px;Margin-right: 20px;">
                                             <div style="mso-line-height-rule: exactly;line-height: 1px;font-size: 1px;">&nbsp;</div>
                                          </div>
                                          <div style="Margin-left: 20px;Margin-right: 20px;Margin-bottom: 16px;">
                                             <div class="divider" style="display: block;font-size: 2px;line-height: 1px;Margin-left: auto;Margin-right: auto;background-color: #e5e5e5;">&nbsp;</div>
                                          </div>
                                       </div>
                                       <!--[if mso]>
                                    </td>
                                    <td class="layout__edges">&nbsp;</td>
                                 </tr>
                              </table>
                              <![endif]-->
                           </div>
                        </div>
                     </div>
                     <div style="background-color: #fafafa;">
                        <div class="layout one-col stack" style="Margin: 0 auto;max-width: 600px;min-width: 320px; width: 320px;width: calc(28000% - 167400px);overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;">
                           <div class="layout__inner" style="border-collapse: collapse;display: table;width: 100%;">
                              <!--[if mso]>
                              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                 <tr class="layout-full-width" style="background-color: #fafafa;">
                                    <td class="layout__edges">&nbsp;</td>
                                    <td style="width: 600px" class="w560">
                                       <![endif]-->
                                       <div class="column" style="text-align: left;color: #787778;font-size: 16px;line-height: 24px;font-family: Helvetica,Arial,sans-serif;">
                                          <div style="Margin-left: 20px;Margin-right: 20px;Margin-top: 0;">
                                             <div style="mso-line-height-rule: exactly;mso-text-raise: 11px;vertical-align: middle;">
                                                <p style="Margin-top: 0;Margin-bottom: 20px;font-family: sans-serif;text-align: left;"><span class="font-sans-serif" style="text-decoration: inherit;"><span style="text-decoration: inherit;color: #323840;">Sent from Easy Genomics</span></span></p>
                                             </div>
                                          </div>
                                          <div style="Margin-left: 20px;Margin-right: 20px;Margin-bottom: 24px;">
                                             <div style="mso-line-height-rule: exactly;mso-text-raise: 11px;vertical-align: middle;">
                                                <p class="size-12" style="Margin-top: 0;Margin-bottom: 0;font-family: sans-serif;font-size: 12px;line-height: 19px;text-align: left;" lang="x-size-12"><span class="font-sans-serif" style="text-decoration: inherit;">© {{COPYRIGHT_YEAR}} Easy Genomics, Inc. All rights reserved.</span></p>
                                             </div>
                                          </div>
                                       </div>
                                       <!--[if mso]>
                                    </td>
                                    <td class="layout__edges">&nbsp;</td>
                                 </tr>
                              </table>
                              <![endif]-->
                           </div>
                        </div>
                     </div>
                  </div>
                  <div role="contentinfo">
                     <div style="line-height:4px;font-size:4px;" id="footer-top-spacing">&nbsp;</div>
                     <div class="layout email-flexible-footer email-footer" style="Margin: 0 auto;max-width: 600px;min-width: 320px; width: 320px;width: calc(28000% - 167400px);overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;" dir="rtl" id="footer-content">
                        <div class="layout__inner right-aligned-footer" style="border-collapse: collapse;display: table;width: 100%;">
                           <!--[if mso]>
                           <table align="center" cellpadding="0" cellspacing="0" role="presentation">
            <tr class="layout-email-footer"><![endif]-->
            <!--[if mso]><td><table cellpadding="0" cellspacing="0"><![endif]-->
            <!--[if mso]><td valign="top"><![endif]-->
            <div class="column" style="text-align: right;font-size: 12px;line-height: 19px;color: #787778;font-family: sans-serif;display: none;" dir="ltr">
            </div>
            </div>
            </div><div style="line-height:40px;font-size:40px;" id="footer-bottom-spacing">&nbsp;</div></div>
            </td></tr></tbody></table>
            <style type="text/css">
            @media (max-width:619px){.email-flexible-footer .left-aligned-footer .column,.email-flexible-footer .center-aligned-footer,.email-flexible-footer .right-aligned-footer .column{max-width:100% !important;text-align:center !important;width:100% !important}.flexible-footer-logo{margin-left:0px !important;margin-right:0px !important}.email-flexible-footer .left-aligned-footer .flexible-footer__share-button__container,.email-flexible-footer .center-aligned-footer .flexible-footer__share-button__container,.email-flexible-footer .right-aligned-footer .flexible-footer__share-button__container{display:inline-block;margin-left:5px !important;margin-right:5px !important}.email-flexible-footer__additionalinfo--center{text-align:center !important}.email-flexible-footer .left-aligned-footer table,.email-flexible-footer .center-aligned-footer table,.email-flexible-footer .right-aligned-footer
            table{display:table !important;width:100% !important}.email-flexible-footer .footer__share-button,.email-flexible-footer .email-footer__additional-info{margin-left:20px;margin-right:20px}}
            </style>
   </body>
</html>
        `,
      },
    });
    invitationEmailTemplate.applyRemovalPolicy(RemovalPolicy.DESTROY);

    return invitationEmailTemplate;
  }

  private setupUserForgotPasswordEmailTemplate() {
    const forgotPasswordEmailTemplate: CfnTemplate = new CfnTemplate(this, 'UserForgotPasswordEmailTemplate', {
      template: {
        templateName: 'UserForgotPasswordEmailTemplate',
        subjectPart: 'Reset Your Easy Genomics Password',
        htmlPart: `
         <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html style="margin: 0px; padding: 0px; height: 100%;" xmlns="http://www.w3.org/1999/xhtml">
   <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <title></title>
      <!--[if !mso]><!-->
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <!--<![endif]-->
      <meta name="viewport" content="width=device-width">
      <style type="text/css">
         @media only screen and (min-width: 620px){.column{}.wrapper{min-width:600px !important}.wrapper h1{}.wrapper h1{font-size:36px !important;line-height:43px !important}.wrapper h2{}.wrapper h2{font-size:22px !important;line-height:31px !important}.wrapper h3{}.wrapper h3{font-size:18px !important;line-height:26px !important}.wrapper .size-8,.wrapper .size-8-m,.wrapper .size-8-l{font-size:8px !important;line-height:14px !important}.wrapper .size-8-m{line-height:16px !important}.wrapper .size-8-l{line-height:24px !important}.wrapper .size-9,.wrapper .size-9-m,.wrapper .size-9-l{font-size:9px !important;line-height:16px !important}.wrapper .size-9-m{line-height:18px !important}.wrapper .size-9-l{line-height:27px !important}.wrapper .size-10,.wrapper .size-10-m,.wrapper .size-10-l{font-size:10px !important;line-height:18px !important}.wrapper .size-10-m{line-height:20px !important}.wrapper
         .size-10-l{line-height:30px !important}.wrapper .size-11,.wrapper .size-11-m,.wrapper .size-11-l{font-size:11px !important;line-height:19px !important}.wrapper .size-11-m{line-height:22px !important}.wrapper .size-11-l{line-height:33px !important}.wrapper .size-12,.wrapper .size-12-m,.wrapper .size-12-l{font-size:12px !important;line-height:19px !important}.wrapper .size-12-m{line-height:24px !important}.wrapper .size-12-l{line-height:36px !important}.wrapper .size-13,.wrapper .size-13-m,.wrapper .size-13-l{font-size:13px !important;line-height:21px !important}.wrapper .size-13-m{line-height:26px !important}.wrapper .size-13-l{line-height:39px !important}.wrapper .size-14,.wrapper .size-14-m,.wrapper .size-14-l{font-size:14px !important;line-height:21px !important}.wrapper .size-14-m{line-height:28px !important}.wrapper .size-14-l{line-height:42px !important}.wrapper .size-15,.wrapper
         .size-15-m,.wrapper .size-15-l{font-size:15px !important;line-height:23px !important}.wrapper .size-15-m{line-height:30px !important}.wrapper .size-15-l{line-height:45px !important}.wrapper .size-16,.wrapper .size-16-m,.wrapper .size-16-l{font-size:16px !important;line-height:24px !important}.wrapper .size-16-m{line-height:32px !important}.wrapper .size-16-l{line-height:48px !important}.wrapper .size-17,.wrapper .size-17-m,.wrapper .size-17-l{font-size:17px !important;line-height:26px !important}.wrapper .size-17-m{line-height:34px !important}.wrapper .size-17-l{line-height:51px !important}.wrapper .size-18,.wrapper .size-18-m,.wrapper .size-18-l{font-size:18px !important;line-height:26px !important}.wrapper .size-18-m{line-height:36px !important}.wrapper .size-18-l{line-height:54px !important}.wrapper .size-20,.wrapper .size-20-m,.wrapper .size-20-l{font-size:20px
         !important;line-height:28px !important}.wrapper .size-20-m{line-height:40px !important}.wrapper .size-20-l{line-height:60px !important}.wrapper .size-22,.wrapper .size-22-m,.wrapper .size-22-l{font-size:22px !important;line-height:31px !important}.wrapper .size-22-m{line-height:44px !important}.wrapper .size-22-l{line-height:66px !important}.wrapper .size-24,.wrapper .size-24-m,.wrapper .size-24-l{font-size:24px !important;line-height:32px !important}.wrapper .size-24-m{line-height:48px !important}.wrapper .size-24-l{line-height:72px !important}.wrapper .size-26,.wrapper .size-26-m,.wrapper .size-26-l{font-size:26px !important;line-height:34px !important}.wrapper .size-26-m{line-height:52px !important}.wrapper .size-26-l{line-height:78px !important}.wrapper .size-28,.wrapper .size-28-m,.wrapper .size-28-l{font-size:28px !important;line-height:36px !important}.wrapper
         .size-28-m{line-height:56px !important}.wrapper .size-28-l{line-height:84px !important}.wrapper .size-30,.wrapper .size-30-m,.wrapper .size-30-l{font-size:30px !important;line-height:38px !important}.wrapper .size-30-m{line-height:60px !important}.wrapper .size-30-l{line-height:90px !important}.wrapper .size-32,.wrapper .size-32-m,.wrapper .size-32-l{font-size:32px !important;line-height:40px !important}.wrapper .size-32-m{line-height:64px !important}.wrapper .size-32-l{line-height:96px !important}.wrapper .size-34,.wrapper .size-34-m,.wrapper .size-34-l{font-size:34px !important;line-height:43px !important}.wrapper .size-34-m{line-height:68px !important}.wrapper .size-34-l{line-height:102px !important}.wrapper .size-36,.wrapper .size-36-m,.wrapper .size-36-l{font-size:36px !important;line-height:43px !important}.wrapper .size-36-m{line-height:72px !important}.wrapper
         .size-36-l{line-height:108px !important}.wrapper .size-40,.wrapper .size-40-m,.wrapper .size-40-l{font-size:40px !important;line-height:47px !important}.wrapper .size-40-m{line-height:80px !important}.wrapper .size-40-l{line-height:120px !important}.wrapper .size-44,.wrapper .size-44-m,.wrapper .size-44-l{font-size:44px !important;line-height:50px !important}.wrapper .size-44-m{line-height:88px !important}.wrapper .size-44-l{line-height:132px !important}.wrapper .size-48,.wrapper .size-48-m,.wrapper .size-48-l{font-size:48px !important;line-height:54px !important}.wrapper .size-48-m{line-height:96px !important}.wrapper .size-48-l{line-height:144px !important}.wrapper .size-56,.wrapper .size-56-m,.wrapper .size-56-l{font-size:56px !important;line-height:60px !important}.wrapper .size-56-m{line-height:112px !important}.wrapper .size-56-l{line-height:168px !important}.wrapper
         .size-64,.wrapper .size-64-m,.wrapper .size-64-l{font-size:64px !important;line-height:68px !important}.wrapper .size-64-m{line-height:128px !important}.wrapper .size-64-l{line-height:192px !important}.wrapper .size-72,.wrapper .size-72-m,.wrapper .size-72-l{font-size:72px !important;line-height:76px !important}.wrapper .size-72-m{line-height:144px !important}.wrapper .size-72-l{line-height:216px !important}.wrapper .size-80,.wrapper .size-80-m,.wrapper .size-80-l{font-size:80px !important;line-height:84px !important}.wrapper .size-80-m{line-height:160px !important}.wrapper .size-80-l{line-height:240px !important}.wrapper .size-96,.wrapper .size-96-m,.wrapper .size-96-l{font-size:96px !important;line-height:100px !important}.wrapper .size-96-m{line-height:192px !important}.wrapper .size-96-l{line-height:288px !important}.wrapper .size-112,.wrapper .size-112-m,.wrapper
         .size-112-l{font-size:112px !important;line-height:116px !important}.wrapper .size-112-m{line-height:224px !important}.wrapper .size-112-l{line-height:336px !important}.wrapper .size-128,.wrapper .size-128-m,.wrapper .size-128-l{font-size:128px !important;line-height:132px !important}.wrapper .size-128-m{line-height:256px !important}.wrapper .size-128-l{line-height:384px !important}.wrapper .size-144,.wrapper .size-144-m,.wrapper .size-144-l{font-size:144px !important;line-height:148px !important}.wrapper .size-144-m{line-height:288px !important}.wrapper .size-144-l{line-height:432px !important}}
      </style>
      <meta name="x-apple-disable-message-reformatting">
      <style type="text/css">
         .main, .mso {
         margin: 0;
         padding: 0;
         }
         table {
         border-collapse: collapse;
         table-layout: fixed;
         }
         * {
         line-height: inherit;
         }
         [x-apple-data-detectors] {
         color: inherit !important;
         text-decoration: none !important;
         }
         .wrapper .footer__share-button a:hover,
         .wrapper .footer__share-button a:focus {
         color: #ffffff !important;
         }
         .wrapper .footer__share-button a.icon-white:hover,
         .wrapper .footer__share-button a.icon-white:focus {
         color: #ffffff !important;
         }
         .wrapper .footer__share-button a.icon-black:hover,
         .wrapper .footer__share-button a.icon-black:focus {
         color: #000000 !important;
         }
         .btn a:hover,
         .btn a:focus,
         .footer__share-button a:hover,
         .footer__share-button a:focus,
         .email-footer__links a:hover,
         .email-footer__links a:focus {
         opacity: 1;
         }
         .btn a:hover {
         background-color: #451DB7 !important;
         }
         .btn a:focus {
         background-color: #371792 !important;
         }
         .preheader,
         .header,
         .layout,
         .column {
         transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out;
         }
         .preheader td {
         padding-bottom: 8px;
         }
         .layout,
         div.header {
         max-width: 400px !important;
         -fallback-width: 95% !important;
         width: calc(100% - 20px) !important;
         }
         div.preheader {
         max-width: 360px !important;
         -fallback-width: 90% !important;
         width: calc(100% - 60px) !important;
         }
         .snippet,
         .webversion {
         Float: none !important;
         }
         .stack .column {
         max-width: 400px !important;
         width: 100% !important;
         }
         .fixed-width.has-border {
         max-width: 402px !important;
         }
         .fixed-width.has-border .layout__inner {
         box-sizing: border-box;
         }
         .snippet,
         .webversion {
         width: 50% !important;
         }
         .mso .layout__edges {
         font-size: 0;
         }
         .layout-fixed-width,
         .mso .layout-full-width {
         background-color: #ffffff;
         }
         @media only screen and (min-width: 620px) {
         .column,
         .gutter {
         display: table-cell;
         Float: none !important;
         vertical-align: top;
         }
         div.preheader,
         .email-footer {
         max-width: 560px !important;
         width: 560px !important;
         }
         .snippet,
         .webversion {
         width: 280px !important;
         }
         div.header,
         .layout,
         .one-col .column {
         max-width: 600px !important;
         width: 600px !important;
         }
         .fixed-width.has-border,
         .fixed-width.x_has-border,
         .has-gutter.has-border,
         .has-gutter.x_has-border {
         max-width: 602px !important;
         width: 602px !important;
         }
         .two-col .column {
         max-width: 300px !important;
         width: 300px !important;
         }
         .three-col .column,
         .column.narrow,
         .column.x_narrow {
         max-width: 200px !important;
         width: 200px !important;
         }
         .column.wide,
         .column.x_wide {
         width: 400px !important;
         }
         .two-col.has-gutter .column,
         .two-col.x_has-gutter .column {
         max-width: 290px !important;
         width: 290px !important;
         }
         .three-col.has-gutter .column,
         .three-col.x_has-gutter .column,
         .has-gutter .narrow {
         max-width: 188px !important;
         width: 188px !important;
         }
         .has-gutter .wide {
         max-width: 394px !important;
         width: 394px !important;
         }
         .two-col.has-gutter.has-border .column,
         .two-col.x_has-gutter.x_has-border .column {
         max-width: 292px !important;
         width: 292px !important;
         }
         .three-col.has-gutter.has-border .column,
         .three-col.x_has-gutter.x_has-border .column,
         .has-gutter.has-border .narrow,
         .has-gutter.x_has-border .narrow {
         max-width: 190px !important;
         width: 190px !important;
         }
         .has-gutter.has-border .wide,
         .has-gutter.x_has-border .wide {
         max-width: 396px !important;
         width: 396px !important;
         }
         }
         @supports (display: flex) {
         @media only screen and (min-width: 620px) {
         .fixed-width.has-border .layout__inner {
         display: flex !important;
         }
         }
         }
         /***
         * Mobile Styles
         *
         * 1. Overriding inline styles
         */
         @media(max-width: 619px) {
         .email-flexible-footer .left-aligned-footer .column,
         .email-flexible-footer .center-aligned-footer,
         .email-flexible-footer .right-aligned-footer .column {
         max-width: 100% !important; /* [1] */
         text-align: center !important; /* [1] */
         width: 100% !important; /* [1] */
         }
         .flexible-footer-logo {
         margin-left: 0px !important; /* [1] */
         margin-right: 0px !important; /* [1] */
         }
         .email-flexible-footer .left-aligned-footer .flexible-footer__share-button__container,
         .email-flexible-footer .center-aligned-footer .flexible-footer__share-button__container,
         .email-flexible-footer .right-aligned-footer .flexible-footer__share-button__container {
         display: inline-block;
         margin-left: 5px !important; /* [1] */
         margin-right: 5px !important; /* [1] */
         }
         .email-flexible-footer__additionalinfo--center {
         text-align: center !important; /* [1] */
         }
         .email-flexible-footer .left-aligned-footer table,
         .email-flexible-footer .center-aligned-footer table,
         .email-flexible-footer .right-aligned-footer table {
         display: table !important; /* [1] */
         width: 100% !important; /* [1] */
         }
         .email-flexible-footer .footer__share-button,
         .email-flexible-footer .email-footer__additional-info {
         margin-left: 20px;
         margin-right: 20px;
         }
         }
         @media (max-width: 321px) {
         .fixed-width.has-border .layout__inner {
         border-width: 1px 0 !important;
         }
         .layout,
         .stack .column {
         min-width: 320px !important;
         width: 320px !important;
         }
         .border {
         display: none;
         }
         .has-gutter .border {
         display: table-cell;
         }
         }
         .cmctbl--inline table {
         border-collapse: collapse;
         }
      </style>
      <!--[if !mso]><!-->
      <!--<![endif]-->
      <style type="text/css">
         .main,.mso{background-color:#fff}.logo a:hover,.logo a:focus{color:#859bb1 !important}.footer-logo a:hover,.footer-logo a:focus{color:#372d1b !important}.mso .layout-has-border{border-top:1px solid #ccc;border-bottom:1px solid #ccc}.mso .layout-has-bottom-border{border-bottom:1px solid #ccc}.mso .border{background-color:#ccc}.mso h1{}.mso h1{font-size:36px !important;line-height:43px !important}.mso h2{}.mso h2{font-size:22px !important;line-height:31px !important}.mso h3{}.mso h3{font-size:18px !important;line-height:26px !important}.mso .layout__inner{}.mso .footer__share-button p{}.mso .footer__share-button p{font-family:sans-serif}
      </style>
      <!--[if mso]>
      <style type="text/css" emb-not-inline>
         .mso div{border:0 none white !important}.mso .w560 .divider{}.mso .w560 .divider{Margin-left:260px !important;Margin-right:260px !important}.mso .w360 .divider{}.mso .w360 .divider{Margin-left:160px !important;Margin-right:160px !important}.mso .w260 .divider{}.mso .w260 .divider{Margin-left:110px !important;Margin-right:110px !important}.mso .w160 .divider{}.mso .w160 .divider{Margin-left:60px !important;Margin-right:60px !important}.mso .w60 .divider{}.mso .w60 .divider{Margin-left:10px !important;Margin-right:10px !important}.mso .w354 .divider{}.mso .w354 .divider{Margin-left:157px !important;Margin-right:157px !important}.mso .w250 .divider{}.mso .w250 .divider{Margin-left:105px !important;Margin-right:105px !important}.mso .w148 .divider{}.mso .w148 .divider{Margin-left:54px !important;Margin-right:54px !important}.mso .size-8,.mso .size-8-m,.mso .size-8-l{font-size:8px
         !important;line-height:14px !important}.mso .size-8-m{line-height:16px !important}.mso .size-8-l{line-height:24px !important}.mso .size-9,.mso .size-9-m,.mso .size-9-l{font-size:9px !important;line-height:16px !important}.mso .size-9-m{line-height:18px !important}.mso .size-9-l{line-height:27px !important}.mso .size-10,.mso .size-10-m,.mso .size-10-l{font-size:10px !important;line-height:18px !important}.mso .size-10-m{line-height:20px !important}.mso .size-10-l{line-height:30px !important}.mso .size-11,.mso .size-11-m,.mso .size-11-l{font-size:11px !important;line-height:19px !important}.mso .size-11-m{line-height:22px !important}.mso .size-11-l{line-height:33px !important}.mso .size-12,.mso .size-12-m,.mso .size-12-l{font-size:12px !important;line-height:19px !important}.mso .size-12-m{line-height:24px !important}.mso .size-12-l{line-height:36px !important}.mso .size-13,.mso
         .size-13-m,.mso .size-13-l{font-size:13px !important;line-height:21px !important}.mso .size-13-m{line-height:26px !important}.mso .size-13-l{line-height:39px !important}.mso .size-14,.mso .size-14-m,.mso .size-14-l{font-size:14px !important;line-height:21px !important}.mso .size-14-m{line-height:28px !important}.mso .size-14-l{line-height:42px !important}.mso .size-15,.mso .size-15-m,.mso .size-15-l{font-size:15px !important;line-height:23px !important}.mso .size-15-m{line-height:30px !important}.mso .size-15-l{line-height:45px !important}.mso .size-16,.mso .size-16-m,.mso .size-16-l{font-size:16px !important;line-height:24px !important}.mso .size-16-m{line-height:32px !important}.mso .size-16-l{line-height:48px !important}.mso .size-17,.mso .size-17-m,.mso .size-17-l{font-size:17px !important;line-height:26px !important}.mso .size-17-m{line-height:34px !important}.mso
         .size-17-l{line-height:51px !important}.mso .size-18,.mso .size-18-m,.mso .size-18-l{font-size:18px !important;line-height:26px !important}.mso .size-18-m{line-height:36px !important}.mso .size-18-l{line-height:54px !important}.mso .size-20,.mso .size-20-m,.mso .size-20-l{font-size:20px !important;line-height:28px !important}.mso .size-20-m{line-height:40px !important}.mso .size-20-l{line-height:60px !important}.mso .size-22,.mso .size-22-m,.mso .size-22-l{font-size:22px !important;line-height:31px !important}.mso .size-22-m{line-height:44px !important}.mso .size-22-l{line-height:66px !important}.mso .size-24,.mso .size-24-m,.mso .size-24-l{font-size:24px !important;line-height:32px !important}.mso .size-24-m{line-height:48px !important}.mso .size-24-l{line-height:72px !important}.mso .size-26,.mso .size-26-m,.mso .size-26-l{font-size:26px !important;line-height:34px !important}.mso
         .size-26-m{line-height:52px !important}.mso .size-26-l{line-height:78px !important}.mso .size-28,.mso .size-28-m,.mso .size-28-l{font-size:28px !important;line-height:36px !important}.mso .size-28-m{line-height:56px !important}.mso .size-28-l{line-height:84px !important}.mso .size-30,.mso .size-30-m,.mso .size-30-l{font-size:30px !important;line-height:38px !important}.mso .size-30-m{line-height:60px !important}.mso .size-30-l{line-height:90px !important}.mso .size-32,.mso .size-32-m,.mso .size-32-l{font-size:32px !important;line-height:40px !important}.mso .size-32-m{line-height:64px !important}.mso .size-32-l{line-height:96px !important}.mso .size-34,.mso .size-34-m,.mso .size-34-l{font-size:34px !important;line-height:43px !important}.mso .size-34-m{line-height:68px !important}.mso .size-34-l{line-height:102px !important}.mso .size-36,.mso .size-36-m,.mso .size-36-l{font-size:36px
         !important;line-height:43px !important}.mso .size-36-m{line-height:72px !important}.mso .size-36-l{line-height:108px !important}.mso .size-40,.mso .size-40-m,.mso .size-40-l{font-size:40px !important;line-height:47px !important}.mso .size-40-m{line-height:80px !important}.mso .size-40-l{line-height:120px !important}.mso .size-44,.mso .size-44-m,.mso .size-44-l{font-size:44px !important;line-height:50px !important}.mso .size-44-m{line-height:88px !important}.mso .size-44-l{line-height:132px !important}.mso .size-48,.mso .size-48-m,.mso .size-48-l{font-size:48px !important;line-height:54px !important}.mso .size-48-m{line-height:96px !important}.mso .size-48-l{line-height:144px !important}.mso .size-56,.mso .size-56-m,.mso .size-56-l{font-size:56px !important;line-height:60px !important}.mso .size-56-m{line-height:112px !important}.mso .size-56-l{line-height:168px !important}.mso
         .size-64,.mso .size-64-m,.mso .size-64-l{font-size:64px !important;line-height:68px !important}.mso .size-64-m{line-height:128px !important}.mso .size-64-l{line-height:192px !important}.mso .size-72,.mso .size-72-m,.mso .size-72-l{font-size:72px !important;line-height:76px !important}.mso .size-72-m{line-height:144px !important}.mso .size-72-l{line-height:216px !important}.mso .size-80,.mso .size-80-m,.mso .size-80-l{font-size:80px !important;line-height:84px !important}.mso .size-80-m{line-height:160px !important}.mso .size-80-l{line-height:240px !important}.mso .size-96,.mso .size-96-m,.mso .size-96-l{font-size:96px !important;line-height:100px !important}.mso .size-96-m{line-height:192px !important}.mso .size-96-l{line-height:288px !important}.mso .size-112,.mso .size-112-m,.mso .size-112-l{font-size:112px !important;line-height:116px !important}.mso .size-112-m{line-height:224px
         !important}.mso .size-112-l{line-height:336px !important}.mso .size-128,.mso .size-128-m,.mso .size-128-l{font-size:128px !important;line-height:132px !important}.mso .size-128-m{line-height:256px !important}.mso .size-128-l{line-height:384px !important}.mso .size-144,.mso .size-144-m,.mso .size-144-l{font-size:144px !important;line-height:148px !important}.mso .size-144-m{line-height:288px !important}.mso .size-144-l{line-height:432px !important}.mso .cmctbl table td,.mso .cmctbl table th{Margin-left:20px !important;Margin-right:20px !important}.mso .cmctbl- -inline,.mso .cmctbl{padding-left:20px !important;padding-right:20px !important}.mso .cmctbl- -inline table,.mso .cmctbl
         table{mso-table-lspace:0pt;mso-table-rspace:0pt;mso-line-height-rule:exactly}.size-8,.size-9{mso-text-raise:9px}.size-34,h1{mso-text-raise:13px}.size-36{mso-text-raise:14px}.size-40{mso-text-raise:16px}.size-44{mso-text-raise:17px}.size-48{mso-text-raise:18px}.size-56{mso-text-raise:22px}.size-64{mso-text-raise:25px}.size-72{mso-text-raise:28px}.size-80{mso-text-raise:32px}.size-96{mso-text-raise:40px}.size-112{mso-text-raise:46px}.size-128{mso-text-raise:54px}.size-144{mso-text-raise:58px}.size-11-m,.size-12-m{mso-text-raise:6px}.size-13-m,.size-14-m{mso-text-raise:7px}.size-15-m,.size-16-m,.size-8-l{mso-text-raise:8px}.size-17-m,.size-18-m{mso-text-raise:9px}.size-20-m,.size-10-l{mso-text-raise:10px}.size-22-m,.size-11-l{mso-text-raise:11px}.size-24-m,.size-12-l{mso-text-raise:12px}.size-26-m,.size-13-l{mso-text-raise:13px}.size-28-m,.size-14-l{mso-text-raise:14px}.size-30-m,.size-15-l{mso-text-raise:15px}.size-32-m,.size-16-l{mso-text-raise:16px}.size-34-m,.size-17-l{mso-text-raise:17px}.size-36-m,.size-18-l{mso-text-raise:18px}.size-40-m,.size-20-l{mso-text-raise:20px}.size-44-m,.size-22-l{mso-text-raise:22px}.size-48-m,.size-24-l{mso-text-raise:24px}.size-26-l{mso-text-raise:26px}.size-56-m,.size-28-l{mso-text-raise:28px}.size-30-l{mso-text-raise:30px}.size-64-m,.size-32-l{mso-text-raise:32px}.size-34-l{mso-text-raise:34px}.size-72-m,.size-36-l{mso-text-raise:36px}.size-80-m,.size-40-l{mso-text-raise:40px}.size-44-l{mso-text-raise:44px}.size-96-m,.size-48-l{mso-text-raise:48px}.size-112-m,.size-56-l{mso-text-raise:56px}.size-128-m,.size-64-l{mso-text-raise:64px}.size-144-m,.size-72-l{mso-text-raise:72px}.size-80-l{mso-text-raise:80px}.size-96-l{mso-text-raise:96px}.size-112-l{mso-text-raise:112px}.size-128-l{mso-text-raise:128px}.size-144-l{mso-text-raise:144px}
      </style>
      <![endif]-->
      <meta name="robots" content="noindex,nofollow">
      <meta property="og:title" content="">
   </head>
   <!--[if mso]>
   <body class="mso">
      <![endif]-->
      <!--[if !mso]><!-->
      <body class="main full-padding" style="margin: 0px; padding: 0px; text-size-adjust: 100%; height: 584px; overflow-y: hidden;">
         <!--<![endif]-->
         <table class="wrapper" style="border-collapse: collapse;table-layout: fixed;min-width: 320px;width: 100%;background-color: #fff;" cellpadding="0" cellspacing="0" role="presentation">
         <tbody>
            <tr>
               <td>
                  <div role="banner">
                     <div class="preheader" style="Margin: 0 auto;max-width: 560px;min-width: 280px; width: 280px;width: calc(28000% - 167440px);">
                        <div style="border-collapse: collapse;display: table;width: 100%;">
                           <!--[if mso]>
                           <table align="center" class="preheader" cellpadding="0" cellspacing="0" role="presentation">
                              <tr>
                                 <td style="width: 280px" valign="top">
                                    <![endif]-->
                                    <div class="snippet" style="display: table-cell;Float: left;font-size: 12px;line-height: 19px;max-width: 280px;min-width: 140px; width: 140px;width: calc(14000% - 78120px);padding: 10px 0 5px 0;color: #787778;font-family: sans-serif;">
                                    </div>
                                    <!--[if mso]>
                                 </td>
                                 <td style="width: 280px" valign="top">
                                    <![endif]-->
                                    <div class="webversion" style="display: table-cell;Float: left;font-size: 12px;line-height: 19px;max-width: 280px;min-width: 139px; width: 139px;width: calc(14100% - 78680px);padding: 10px 0 5px 0;text-align: right;color: #787778;font-family: sans-serif;">
                                    </div>
                                    <!--[if mso]>
                                 </td>
                              </tr>
                           </table>
                           <![endif]-->
                        </div>
                     </div>
                     <div class="header" style="Margin: 0 auto;max-width: 600px;min-width: 320px; width: 320px;width: calc(28000% - 167400px);" id="emb-email-header-container">
                        <!--[if mso]>
                        <table align="center" class="header" cellpadding="0" cellspacing="0" role="presentation">
                           <tr>
                              <td style="width: 600px">
                                 <![endif]-->
                                 <div class="logo emb-logo-margin-box" style="font-size: 26px;line-height: 32px;Margin-top: 6px;Margin-bottom: 20px;color: #c3ced9;font-family: Helvetica,Arial,sans-serif;Margin-left: 20px;Margin-right: 20px;" align="center">
                                    <div class="logo-center" align="center" id="emb-email-header"><img style="display: block;height: auto;width: 100%;border: 0;max-width: 200px;" src="{{EASY_GENOMICS_EMAIL_LOGO}}" alt="" width="200"></div>
                                 </div>
                                 <!--[if mso]>
                              </td>
                           </tr>
                        </table>
                        <![endif]-->
                     </div>
                  </div>
                  <div>
                     <div style="background-color: #fafafa;">
                        <div class="layout one-col stack" style="Margin: 0 auto;max-width: 600px;min-width: 320px; width: 320px;width: calc(28000% - 167400px);overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;">
                           <div class="layout__inner" style="border-collapse: collapse;display: table;width: 100%;">
                              <!--[if mso]>
                              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                 <tr class="layout-full-width" style="background-color: #fafafa;">
                                    <td class="layout__edges">&nbsp;</td>
                                    <td style="width: 600px" class="w560">
                                       <![endif]-->
                                       <div class="column" style="text-align: left;color: #787778;font-size: 16px;line-height: 24px;font-family: Helvetica,Arial,sans-serif;">
                                          <div style="Margin-left: 20px;Margin-right: 20px;Margin-top: 24px;">
                                             <div style="mso-line-height-rule: exactly;line-height: 20px;font-size: 1px;">&nbsp;</div>
                                          </div>
                                          <div style="font-size: 12px;font-style: normal;font-weight: normal;line-height: 19px;" align="center">
          <img style="border: 0;display: block;height: auto;width: 100%;max-width: 48px;" alt="" width="48" src="{{LOCK_IMAGE}}">
        </div>
                                          <div style="Margin-left: 20px;Margin-right: 20px;">
                                             <div style="mso-line-height-rule: exactly;mso-text-raise: 11px;vertical-align: middle;">
                                                <h1 class="size-32" style="Margin-top: 0;Margin-bottom: 0;font-style: normal;font-weight: normal;color: #565656;font-size: 28px;line-height: 36px;font-family: sans-serif;text-align: center;" lang="x-size-32"><span class="font-sans-serif" style="text-decoration: inherit;"><span style="text-decoration: inherit;color: #12181f;">Forgot your password?</span></span></h1>
                                                <p class="size-14" style="Margin-top: 20px;Margin-bottom: 20px;font-family: sans-serif;font-size: 14px;line-height: 21px;text-align: center;" lang="x-size-14"><span class="font-sans-serif" style="text-decoration: inherit;"><span style="text-decoration: inherit;color: #323840;">Please click the button below to reset your password. This link will expire in 1 hour.</span></span></p>
                                             </div>
                                          </div>
                                          <div style="Margin-left: 20px;Margin-right: 20px;">
                                             <div style="mso-line-height-rule: exactly;line-height: 10px;font-size: 1px;">&nbsp;</div>
                                          </div>
                                          <div style="Margin-left: 20px;Margin-right: 20px;">
                                             <div class="btn btn--flat btn--large" style="Margin-bottom: 20px;text-align: center;">
                                                <!--[if !mso]><!--><a style="border-radius: 4px;display: inline-block;font-size: 14px;font-weight: bold;line-height: 24px;padding: 12px 24px;text-align: center;text-decoration: none !important;transition: opacity 0.1s ease-in;color: #ffffff !important;background-color: #5524e0;font-family: sans-serif;" href="https://{{DOMAIN_NAME}}/reset-password?forgot-password={{FORGOT_PASSWORD_JWT}}" target="_blank">Reset Password</a><!--<![endif]-->
                                                <!--[if mso]>
                                                <p style="line-height:0;margin:0;">&nbsp;</p>
                                                <![endif]-->
                                             </div>
                                          </div>
                                          <div style="Margin-left: 20px;Margin-right: 20px;">
                                             <div style="mso-line-height-rule: exactly;line-height: 10px;font-size: 1px;">&nbsp;</div>
                                          </div>
                                          <div style="Margin-left: 20px;Margin-right: 20px;">
                                             <div style="mso-line-height-rule: exactly;line-height: 20px;font-size: 1px;">&nbsp;</div>
                                          </div>
                                          <div style="Margin-left: 20px;Margin-right: 20px;">
                                             <div style="mso-line-height-rule: exactly;line-height: 1px;font-size: 1px;">&nbsp;</div>
                                          </div>
                                          <div style="Margin-left: 20px;Margin-right: 20px;Margin-bottom: 16px;">
                                             <div class="divider" style="display: block;font-size: 2px;line-height: 1px;Margin-left: auto;Margin-right: auto;background-color: #e5e5e5;">&nbsp;</div>
                                          </div>
                                       </div>
                                       <!--[if mso]>
                                    </td>
                                    <td class="layout__edges">&nbsp;</td>
                                 </tr>
                              </table>
                              <![endif]-->
                           </div>
                        </div>
                     </div>
                     <div style="background-color: #fafafa;">
                        <div class="layout one-col stack" style="Margin: 0 auto;max-width: 600px;min-width: 320px; width: 320px;width: calc(28000% - 167400px);overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;">
                           <div class="layout__inner" style="border-collapse: collapse;display: table;width: 100%;">
                              <!--[if mso]>
                              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                 <tr class="layout-full-width" style="background-color: #fafafa;">
                                    <td class="layout__edges">&nbsp;</td>
                                    <td style="width: 600px" class="w560">
                                       <![endif]-->
                                       <div class="column" style="text-align: left;color: #787778;font-size: 16px;line-height: 24px;font-family: Helvetica,Arial,sans-serif;">
                                          <div style="Margin-left: 20px;Margin-right: 20px;Margin-top: 0;">
                                             <div style="mso-line-height-rule: exactly;mso-text-raise: 11px;vertical-align: middle;">
                                                <p style="Margin-top: 0;Margin-bottom: 20px;font-family: sans-serif;text-align: left;"><span class="font-sans-serif" style="text-decoration: inherit;"><span style="text-decoration: inherit;color: #323840;">Sent from Easy Genomics</span></span></p>
                                             </div>
                                          </div>
                                          <div style="Margin-left: 20px;Margin-right: 20px;Margin-bottom: 24px;">
                                             <div style="mso-line-height-rule: exactly;mso-text-raise: 11px;vertical-align: middle;">
                                                <p class="size-12" style="Margin-top: 0;Margin-bottom: 0;font-family: sans-serif;font-size: 12px;line-height: 19px;text-align: left;" lang="x-size-12"><span class="font-sans-serif" style="text-decoration: inherit;">© {{COPYRIGHT_YEAR}} Easy Genomics, Inc. All rights reserved.</span></p>
                                             </div>
                                          </div>
                                       </div>
                                       <!--[if mso]>
                                    </td>
                                    <td class="layout__edges">&nbsp;</td>
                                 </tr>
                              </table>
                              <![endif]-->
                           </div>
                        </div>
                     </div>
                  </div>
                  <div role="contentinfo">
                     <div style="line-height:4px;font-size:4px;" id="footer-top-spacing">&nbsp;</div>
                     <div class="layout email-flexible-footer email-footer" style="Margin: 0 auto;max-width: 600px;min-width: 320px; width: 320px;width: calc(28000% - 167400px);overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;" dir="rtl" id="footer-content">
                        <div class="layout__inner right-aligned-footer" style="border-collapse: collapse;display: table;width: 100%;">
                           <!--[if mso]>
                           <table align="center" cellpadding="0" cellspacing="0" role="presentation">
            <tr class="layout-email-footer"><![endif]-->
            <!--[if mso]><td><table cellpadding="0" cellspacing="0"><![endif]-->
            <!--[if mso]><td valign="top"><![endif]-->
            <div class="column" style="text-align: right;font-size: 12px;line-height: 19px;color: #787778;font-family: sans-serif;display: none;" dir="ltr">
            </div>
            </div>
            </div><div style="line-height:40px;font-size:40px;" id="footer-bottom-spacing">&nbsp;</div></div>
            </td></tr></tbody></table>
            <style type="text/css">
            @media (max-width:619px){.email-flexible-footer .left-aligned-footer .column,.email-flexible-footer .center-aligned-footer,.email-flexible-footer .right-aligned-footer .column{max-width:100% !important;text-align:center !important;width:100% !important}.flexible-footer-logo{margin-left:0px !important;margin-right:0px !important}.email-flexible-footer .left-aligned-footer .flexible-footer__share-button__container,.email-flexible-footer .center-aligned-footer .flexible-footer__share-button__container,.email-flexible-footer .right-aligned-footer .flexible-footer__share-button__container{display:inline-block;margin-left:5px !important;margin-right:5px !important}.email-flexible-footer__additionalinfo--center{text-align:center !important}.email-flexible-footer .left-aligned-footer table,.email-flexible-footer .center-aligned-footer table,.email-flexible-footer .right-aligned-footer
            table{display:table !important;width:100% !important}.email-flexible-footer .footer__share-button,.email-flexible-footer .email-footer__additional-info{margin-left:20px;margin-right:20px}}
            </style>
   </body>
</html>
        `,
      },
    });
    forgotPasswordEmailTemplate.applyRemovalPolicy(RemovalPolicy.DESTROY);

    return forgotPasswordEmailTemplate;
  }
}
