import { BackEndStackProps } from '@easy-genomics/shared-lib/src/infra/types/main-stack';
import { NestedStackProps } from 'aws-cdk-lib';
import { Policy, PolicyDocument, PolicyStatement, Role } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface IamConstructProps extends BackEndStackProps, NestedStackProps { }

/**
 * This IAM Construct defines the EasyGenomics IAM Policy Statements, Roles.
 */
export class IamConstruct extends Construct {
  readonly props: IamConstructProps;

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
  }

  /**
   * This function allows IAM policies to be defined in the appropriate nested stack
   * and added to this construct's policyStatements map collection for easy retrieval.
   *
   * @param name
   * @param policyStatement
   */
  public addPolicyStatements(name: string, policyStatement: PolicyStatement[]) {
    this.policyStatements.set(name, policyStatement);
  }

  /**
   * This function allows existing IAM policies for be easily retrieved from this
   * construct's policyStatements map collection by the name value (e.g. REST API URI).
   *
   * @param name
   */
  public getPolicyStatements(name: string): PolicyStatement[] {
    const policyStatement: PolicyStatement[] | undefined = this.policyStatements.get(name);
    if (!policyStatement) {
      throw new Error(`Unable to retrieve IAM Policy Statement: ${name}`);
    }
    return policyStatement;
  }

  /**
   * This function allows IAM documents to be defined in the appropriate nested stack
   * and added to this construct's policyDocuments map collection for easy retrieval.
   *
   * @param name
   * @param policyDocument
   */
  public addPolicyDocument(name: string, policyDocument: PolicyDocument) {
    this.policyDocuments.set(name, policyDocument);
  }

  /**
   * This function allows existing IAM documents for be easily retrieved from this
   * construct's policyDocuments map collection by the name value.
   *
   * @param name
   */
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

}
