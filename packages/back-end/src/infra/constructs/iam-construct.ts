import { MainStackProps } from '@easy-genomics/shared-lib/src/infra/types/main-stack';
import { Effect, Policy, PolicyDocument, PolicyStatement, Role } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface IamConstructProps extends MainStackProps {
  awsCognitoUserPoolArn: string;
}

/**
 * This IAM Construct defines the EasyGenomics IAM Policy Statements, Roles.
 */
export class IamConstruct extends Construct {
  private props: IamConstructProps;

  // Collection of IAM Policy statement definitions - accessed by getPolicyStatement()
  readonly policyStatements = new Map<string, PolicyStatement[]>();

  // Collection of IAM Policy Document definitions - accessed by getPolicyDocument()
  readonly policyDocuments = new Map<string, PolicyDocument>();

  // Collection of IAM Role definitions - accessed by getRole()
  readonly roles = new Map<string, Role>();

  // Collection of IAM Policy definitions - accessed by getPolicy()
  readonly policies = new Map<string, Policy>();

  constructor(scope: Construct, id: string, props: IamConstructProps) {
    super(scope, id);
    this.props = props;

    // The following setup order of IAM definitions is mandatory
    this.setupPolicyStatements();
  }

  public getPolicyStatements(name: string): PolicyStatement[] {
    const policyStatement: PolicyStatement[] | undefined = this.policyStatements.get(name);
    if (!policyStatement) {
      throw new Error(`Unable to retrieve IAM Policy Statement: ${name}`);
    }
    return policyStatement;
  }

  public getPolicyDocument(name: string): PolicyDocument {
    const policyDocument: PolicyDocument | undefined = this.policyDocuments.get(name);
    if (!policyDocument) {
      throw new Error(`Unable to retrieve IAM Policy Document: ${name}`);
    }
    return policyDocument;
  }

  public getRole(name: string): Role {
    const role: Role | undefined = this.roles.get(name);
    if (!role) {
      throw new Error(`Unable to retrieve IAM Role: ${name}`);
    }
    return role;
  }

  public getPolicy(name: string): Policy {
    const policy: Policy | undefined = this.policies.get(name);
    if (!policy) {
      throw new Error(`Unable to retrieve IAM Policy: ${name}`);
    }
    return policy;
  }

  /**
     * The following section defines the IAM Policy Statements, Roles, Policies
     * and adds each definition to their respective collection with a meaningful
     * name reference for easy access.
     *
     * Extend these IAM definitions as necessary to provide the required access
     * controls to AWS services and their resources.
     */

  private setupPolicyStatements() {
    // cognito-policy-statement
    this.policyStatements.set(
      'cognito-policy-statement',
      [
        new PolicyStatement({
          resources: [this.props.awsCognitoUserPoolArn],
          actions: ['cognito-idp:ListUsers'],
          effect: Effect.ALLOW,
        }),
      ],
    );

    // iam-get-role-pass-role-policy-statement
    this.policyStatements.set(
      'iam-get-role-pass-role-policy-statement',
      [
        new PolicyStatement({
          resources: ['arn:aws:iam:::role/*', `arn:aws:iam::${this.props.env.account!}:role/*`],
          actions: ['iam:GetRole', 'iam:PassRole'],
          effect: Effect.ALLOW,
        }),
      ],
    );

    // /easy-genomics/organization/create-organization
    this.policyStatements.set(
      '/easy-genomics/organization/create-organization',
      [
        new PolicyStatement({
          resources: [
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-table`,
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-unique-reference-table`,
          ],
          actions: ['dynamodb:PutItem'],
          effect: Effect.ALLOW,
        }),
      ],
    );
    // /easy-genomics/organization/read-organization
    this.policyStatements.set(
      '/easy-genomics/organization/read-organization',
      [
        new PolicyStatement({
          resources: [`arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-table`],
          actions: ['dynamodb:GetItem'],
          effect: Effect.ALLOW,
        }),
      ],
    );
    // /easy-genomics/organization/list-organizations
    this.policyStatements.set(
      '/easy-genomics/organization/list-organizations',
      [
        new PolicyStatement({
          resources: [`arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-table`],
          actions: ['dynamodb:Scan'],
          effect: Effect.ALLOW,
        }),
      ],
    );
    // /easy-genomics/organization/update-organization
    this.policyStatements.set(
      '/easy-genomics/organization/update-organization',
      [
        new PolicyStatement({
          resources: [`arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-table`],
          actions: ['dynamodb:GetItem', 'dynamodb:UpdateItem'],
          effect: Effect.ALLOW,
        }),
        new PolicyStatement({
          resources: [`arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-unique-reference-table`],
          actions: ['dynamodb:DeleteItem', 'dynamodb:PutItem'],
          effect: Effect.ALLOW,
        }),
      ],
    );
    // /easy-genomics/organization/delete-organization
    this.policyStatements.set(
      '/easy-genomics/organization/delete-organization',
      [
        new PolicyStatement({
          resources: [`arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-table`],
          actions: ['dynamodb:DeleteItem', 'dynamodb:GetItem'],
          effect: Effect.ALLOW,
        }),
        new PolicyStatement({
          resources: [`arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-unique-reference-table`],
          actions: ['dynamodb:DeleteItem'],
          effect: Effect.ALLOW,
        }),
      ],
    );

    // /easy-genomics/organization/user/add-organization-user
    this.policyStatements.set(
      '/easy-genomics/organization/user/add-organization-user',
      [
        new PolicyStatement({
          resources: [
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-user-table`,
          ],
          actions: ['dynamodb:PutItem'],
        }),
        new PolicyStatement({
          resources: [
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-table`,
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-user-table`,
          ],
          actions: ['dynamodb:GetItem'],
        }),
      ],
    );
    // /easy-genomics/organization/user/edit-organization-user
    this.policyStatements.set(
      '/easy-genomics/organization/user/edit-organization-user',
      [
        new PolicyStatement({
          resources: [
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-user-table`,
          ],
          actions: ['dynamodb:GetItem', 'dynamodb:UpdateItem'],
          effect: Effect.ALLOW,
        }),
      ],
    );
    // /easy-genomics/organization/user/list-organization-users
    this.policyStatements.set(
      '/easy-genomics/organization/user/list-organization-users',
      [
        new PolicyStatement({
          resources: [
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-user-table`,
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-user-table/index/*`,
          ],
          actions: ['dynamodb:Query'],
        }),
      ],
    );
    // /easy-genomics/organization/user/list-organization-users-details
    this.policyStatements.set(
      '/easy-genomics/organization/user/list-organization-users-details',
      [
        new PolicyStatement({
          resources: [
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-user-table`,
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-user-table/index/*`,
          ],
          actions: ['dynamodb:Query'],
        }),
        new PolicyStatement({
          resources: [
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-user-table`,
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-user-table/index/*`,
          ],
          actions: ['dynamodb:BatchGetItem'],
        }),
      ],
    );
    // /easy-genomics/organization/user/request-organization-user
    this.policyStatements.set(
      '/easy-genomics/organization/user/request-organization-user',
      [
        new PolicyStatement({
          resources: [
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-user-table`,
          ],
          actions: ['dynamodb:GetItem'],
        }),
      ],
    );
    // /easy-genomics/organization/user/remove-organization-user
    this.policyStatements.set(
      '/easy-genomics/organization/user/remove-organization-user',
      [
        new PolicyStatement({
          resources: [
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-user-table`,
          ],
          actions: ['dynamodb:GetItem', 'dynamodb:DeleteItem'],
          effect: Effect.ALLOW,
        }),
      ],
    );

    // /easy-genomics/laboratory/create-laboratory
    this.policyStatements.set(
      '/easy-genomics/laboratory/create-laboratory',
      [
        new PolicyStatement({
          resources: [
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-table`,
          ],
          actions: ['dynamodb:GetItem'],
          effect: Effect.ALLOW,
        }),
        new PolicyStatement({
          resources: [
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table`,
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-unique-reference-table`,
          ],
          actions: ['dynamodb:PutItem'],
          effect: Effect.ALLOW,
        }),
      ],
    );
    // /easy-genomics/laboratory/read-laboratory
    this.policyStatements.set(
      '/easy-genomics/laboratory/read-laboratory',
      [
        new PolicyStatement({
          resources: [
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table`,
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table/index/*`,
          ],
          actions: ['dynamodb:Query'],
          effect: Effect.ALLOW,
        }),
      ],
    );
    // /easy-genomics/laboratory/request-laboratory
    this.policyStatements.set(
      '/easy-genomics/laboratory/request-laboratory',
      [
        new PolicyStatement({
          resources: [`arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table`],
          actions: ['dynamodb:GetItem'],
          effect: Effect.ALLOW,
        }),
      ],
    );
    // /easy-genomics/laboratory/list-laboratories
    this.policyStatements.set(
      '/easy-genomics/laboratory/list-laboratories',
      [
        new PolicyStatement({
          resources: [
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table`,
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table/index/*`,
          ],
          actions: ['dynamodb:Query'],
          effect: Effect.ALLOW,
        }),
      ],
    );
    // /easy-genomics/laboratory/update-laboratory
    this.policyStatements.set(
      '/easy-genomics/laboratory/update-laboratory',
      [
        new PolicyStatement({
          resources: [
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table`,
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table/index/*`,
          ],
          actions: ['dynamodb:Query', 'dynamodb:UpdateItem'],
          effect: Effect.ALLOW,
        }),
        new PolicyStatement({
          resources: [`arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-unique-reference-table`],
          actions: ['dynamodb:DeleteItem', 'dynamodb:PutItem'],
          effect: Effect.ALLOW,
        }),
      ],
    );
    // /easy-genomics/laboratory/delete-laboratory
    this.policyStatements.set(
      '/easy-genomics/laboratory/delete-laboratory',
      [
        new PolicyStatement({
          resources: [
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-user-table`,
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-user-table/index/*`,
          ],
          actions: ['dynamodb:Query'],
          effect: Effect.ALLOW,
        }),
        new PolicyStatement({
          resources: [
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table`,
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table/index/*`,
          ],
          actions: ['dynamodb:DeleteItem', 'dynamodb:Query'],
          effect: Effect.ALLOW,
        }),
        new PolicyStatement({
          resources: [`arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-unique-reference-table`],
          actions: ['dynamodb:DeleteItem'],
          effect: Effect.ALLOW,
        }),
      ],
    );

    // /easy-genomics/laboratory/user/add-laboratory-user
    this.policyStatements.set(
      '/easy-genomics/laboratory/user/add-laboratory-user',
      [
        new PolicyStatement({
          resources: [
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table`,
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table/index/*`,
          ],
          actions: ['dynamodb:Query'],
          effect: Effect.ALLOW,
        }),
        new PolicyStatement({
          resources: [`arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-user-table`],
          actions: ['dynamodb:GetItem'],
          effect: Effect.ALLOW,
        }),
        new PolicyStatement({
          resources: [`arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-user-table`],
          actions: ['dynamodb:PutItem'],
          effect: Effect.ALLOW,
        }),
      ],
    );
    // /easy-genomics/laboratory/user/edit-laboratory-user
    this.policyStatements.set(
      '/easy-genomics/laboratory/user/edit-laboratory-user',
      [
        new PolicyStatement({
          resources: [
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-user-table`,
          ],
          actions: ['dynamodb:GetItem', 'dynamodb:UpdateItem'],
          effect: Effect.ALLOW,
        }),
      ],
    );
    // /easy-genomics/laboratory/user/list-laboratory-users
    this.policyStatements.set(
      '/easy-genomics/laboratory/user/list-laboratory-users',
      [
        new PolicyStatement({
          resources: [
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-user-table`,
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-user-table/index/*`,
          ],
          actions: ['dynamodb:Query'],
        }),
      ],
    );
    // /easy-genomics/laboratory/user/list-laboratory-users-details
    this.policyStatements.set(
      '/easy-genomics/laboratory/user/list-laboratory-users-details',
      [
        new PolicyStatement({
          resources: [
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-user-table`,
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-user-table/index/*`,
          ],
          actions: ['dynamodb:Query'],
        }),
        new PolicyStatement({
          resources: [
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-user-table`,
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-user-table/index/*`,
          ],
          actions: ['dynamodb:BatchGetItem'],
        }),
      ],
    );
    // /easy-genomics/laboratory/user/remove-laboratory-user
    this.policyStatements.set(
      '/easy-genomics/laboratory/user/remove-laboratory-user',
      [
        new PolicyStatement({
          resources: [
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-user-table`,
          ],
          actions: ['dynamodb:GetItem', 'dynamodb:DeleteItem'],
          effect: Effect.ALLOW,
        }),
      ],
    );
    // /easy-genomics/laboratory/user/request-laboratory-user
    this.policyStatements.set(
      '/easy-genomics/laboratory/user/request-laboratory-user',
      [
        new PolicyStatement({
          resources: [
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-user-table`,
          ],
          actions: ['dynamodb:GetItem'],
        }),
      ],
    );

    // /easy-genomics/user/create-user
    this.policyStatements.set(
      '/easy-genomics/user/create-user',
      [
        new PolicyStatement({
          resources: [
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-user-table`,
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-unique-reference-table`,
          ],
          actions: ['dynamodb:PutItem'],
          effect: Effect.ALLOW,
        }),
      ],
    );
    // /easy-genomics/user/list-all-users
    this.policyStatements.set(
      '/easy-genomics/user/list-all-users',
      [
        new PolicyStatement({
          resources: [`arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-user-table`],
          actions: ['dynamodb:Scan'],
          effect: Effect.ALLOW,
        }),
      ],
    );

    // /aws-healthomics/private-workflow/create-private-workflow
    this.policyStatements.set(
      '/aws-healthomics/private-workflow/create-private-workflow',
      [
        new PolicyStatement({
          resources: [`arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-healthomics-private-workflow-table`],
          actions: ['dynamodb:PutItem'],
          effect: Effect.ALLOW,
        }),
      ],
    );
    // /aws-healthomics/private-workflow/list-private-workflows
    this.policyStatements.set(
      '/aws-healthomics/private-workflow/list-private-workflows',
      [
        new PolicyStatement({
          resources: [`arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-healthomics-private-workflow-table`],
          actions: ['dynamodb:Scan'],
          effect: Effect.ALLOW,
        }),
      ],
    );
    // /aws-healthomics/private-workflow/request-private-workflow
    this.policyStatements.set(
      '/aws-healthomics/private-workflow/request-private-workflow',
      [
        new PolicyStatement({
          resources: [`arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-healthomics-private-workflow-table`],
          actions: ['dynamodb:GetItem'],
          effect: Effect.ALLOW,
        }),
      ],
    );
    // /aws-healthomics/private-workflow/read-private-workflow
    this.policyStatements.set(
      '/aws-healthomics/private-workflow/read-private-workflow',
      [
        new PolicyStatement({
          resources: [
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-healthomics-private-workflow-table`,
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-healthomics-private-workflow-table/index/*`,
          ],
          actions: ['dynamodb:Query'],
          effect: Effect.ALLOW,
        }),
      ],
    );
    // /aws-healthomics/private-workflow/update-private-workflow
    this.policyStatements.set(
      '/aws-healthomics/private-workflow/update-private-workflow',
      [
        new PolicyStatement({
          resources: [
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-healthomics-private-workflow-table`,
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-healthomics-private-workflow-table/index/*`,
          ],
          actions: ['dynamodb:Query', 'dynamodb:UpdateItem'],
          effect: Effect.ALLOW,
        }),
      ],
    );
    // /aws-healthomics/private-workflow/delete-private-workflow
    this.policyStatements.set(
      '/aws-healthomics/private-workflow/delete-private-workflow',
      [
        new PolicyStatement({
          resources: [
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-healthomics-private-workflow-table`,
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-healthomics-private-workflow-table/index/*`,
          ],
          actions: ['dynamodb:DeleteItem', 'dynamodb:Query'],
          effect: Effect.ALLOW,
        }),
      ],
    );
  }
}
