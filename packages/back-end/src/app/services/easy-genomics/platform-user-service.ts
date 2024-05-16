import { marshall } from '@aws-sdk/util-dynamodb';
import { OrganizationUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user';
import { User } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
import { DynamoDBService } from '../dynamodb-service';

export class PlatformUserService extends DynamoDBService {
  readonly USER_TABLE_NAME: string = `${process.env.NAME_PREFIX}-user-table`;
  readonly UNIQUE_REFERENCE_TABLE_NAME: string = `${process.env.NAME_PREFIX}-unique-reference-table`;
  readonly ORGANIZATION_USER_TABLE_NAME: string = `${process.env.NAME_PREFIX}-organization-user-table`;

  public constructor() {
    super();
  }

  /**
   * This function creates a DynamoDB transaction to:
   *  - add a new User record
   *  - add an Unique-Reference record to reserve the new User's email as taken
   *  - add an Organization-User access mapping record for the new User to access the Organization
   *
   * This function is dependent on the caller to supply the User's details updated OrganizationAccess details for
   * writing the User record.
   *
   * If any part of the transaction fails, the whole transaction will be rejected in order to avoid data inconsistency.
   *
   * @param user
   * @param organizationUser
   */
  async addNewUserToOrganization(user: User, organizationUser: OrganizationUser): Promise<Boolean> {
    const logRequestMessage = `Invite New User To Organization UserId=${user.UserId} to OrganizationId=${organizationUser.OrganizationId} request`;
    console.info(logRequestMessage);

    const response = await this.transactWriteItems({
      TransactItems: [
        {
          Put: {
            TableName: this.USER_TABLE_NAME,
            ConditionExpression: 'attribute_not_exists(#UserId)',
            ExpressionAttributeNames: {
              '#UserId': 'UserId',
            },
            Item: marshall(user),
          },
        },
        {
          Put: {
            TableName: this.UNIQUE_REFERENCE_TABLE_NAME,
            ConditionExpression: 'attribute_not_exists(#Value) AND attribute_not_exists(#Type)',
            ExpressionAttributeNames: {
              '#Value': 'Value',
              '#Type': 'Type',
            },
            Item: marshall({
              Value: user.Email,
              Type: 'user-email',
            }),
          },
        },
        {
          Put: {
            TableName: this.ORGANIZATION_USER_TABLE_NAME,
            ConditionExpression: 'attribute_not_exists(#OrganizationId) AND attribute_not_exists(#UserId)',
            ExpressionAttributeNames: {
              '#OrganizationId': 'OrganizationId',
              '#UserId': 'UserId',
            },
            Item: marshall(organizationUser),
          },
        },
      ],
    });

    if (response.$metadata.httpStatusCode === 200) {
      return true;
    } else {
      throw new Error(`${logRequestMessage} unsuccessful: HTTP Status Code=${response.$metadata.httpStatusCode}`);
    }
  }

  /**
   * This function creates a DynamoDB transaction to:
   *  - update the existing User to add OrganizationAccess meta-data simplify and improve data retrieval
   *  - add an Organization-User access mapping record for the existing User to access the Organization
   *
   * This function is dependent on the caller to supply the User's details updated OrganizationAccess details for
   * writing the User record.
   *
   * If any part of the transaction fails, the whole transaction will be rejected in order to avoid
   * data inconsistency.
   * @param user
   * @param organizationUser
   */
  async addExistingUserToOrganization(user: User, organizationUser: OrganizationUser): Promise<Boolean> {
    const logRequestMessage = `Invite Existing User To Organization UserId=${user.UserId} to OrganizationId=${organizationUser.OrganizationId} request`;
    console.info(logRequestMessage);

    const response = await this.transactWriteItems({
      TransactItems: [
        { // Using PutItem request to update the existing User record for marshalling convenience instead of UpdateItem
          Put: {
            TableName: this.USER_TABLE_NAME,
            ConditionExpression: 'attribute_exists(#UserId)',
            ExpressionAttributeNames: {
              '#UserId': 'UserId',
            },
            Item: marshall(user),
          },
        },
        {
          Put: {
            TableName: this.ORGANIZATION_USER_TABLE_NAME,
            ConditionExpression: 'attribute_not_exists(#OrganizationId) AND attribute_not_exists(#UserId)',
            ExpressionAttributeNames: {
              '#OrganizationId': 'OrganizationId',
              '#UserId': 'UserId',
            },
            Item: marshall(organizationUser),
          },
        },
      ],
    });

    if (response.$metadata.httpStatusCode === 200) {
      return true;
    } else {
      throw new Error(`${logRequestMessage} unsuccessful: HTTP Status Code=${response.$metadata.httpStatusCode}`);
    }
  }

}
