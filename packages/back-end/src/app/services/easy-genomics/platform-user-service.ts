import { marshall } from '@aws-sdk/util-dynamodb';
import { LaboratoryUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-user';
import { OrganizationUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user';
import {
  LaboratoryAccess,
  User,
} from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
import { DynamoDBService } from '../dynamodb-service';

export class PlatformUserService extends DynamoDBService {
  readonly LABORATORY_USER_TABLE_NAME: string = `${process.env.NAME_PREFIX}-laboratory-user-table`;
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
    const logRequestMessage = `Add New User To Organization UserId=${user.UserId} OrganizationId=${organizationUser.OrganizationId} request`;
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
   *
   * @param user
   * @param organizationUser
   */
  async addExistingUserToOrganization(user: User, organizationUser: OrganizationUser): Promise<Boolean> {
    const logRequestMessage = `Add Existing User To Organization UserId=${user.UserId} OrganizationId=${organizationUser.OrganizationId} request`;
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

  /**
   * This function creates a DynamoDB transaction to:
   *  - update the existing User to remove the OrganizationAccess meta-data to remove the tracking for the Organization
   *  - delete the Organization-User access mapping record for the existing User to remove access to the Organization
   *  - delete the existing Laboratory-User access mappings records associated with the removed Organization access
   *
   * If any part of the transaction fails, the whole transaction will be rejected in order to avoid
   * data inconsistency.
   *
   * @param user
   * @param organizationUser
   */
  async removeExistingUserFromOrganization(user: User, organizationUser: OrganizationUser): Promise<Boolean> {
    const logRequestMessage = `Remove Existing User From Organization UserId=${user.UserId} OrganizationId=${organizationUser.OrganizationId} request`;
    console.info(logRequestMessage);

    // Find the current OrganizationAccess to identify the existing associated LaboratoryIds to remove
    const laboratoryAccess: LaboratoryAccess =
      (user.OrganizationAccess && user.OrganizationAccess[organizationUser.OrganizationId].LaboratoryAccess)
        ? user.OrganizationAccess[organizationUser.OrganizationId].LaboratoryAccess
        : {};

    // Generate array of Delete transaction items to remove the User's associated LaboratoryUser mappings
    const laboratoryUserDeletions = (laboratoryAccess)
      ? Object.keys(laboratoryAccess)
        .map(laboratoryId => {
          return {
            Delete: {
              TableName: this.LABORATORY_USER_TABLE_NAME,
              Key: {
                LaboratoryId: { S: laboratoryId },
                UserId: { S: user.UserId },
              },
            },
          };
        })
      : [];

    // Update the current Organization Access to exclude the Organization to remove
    (user.OrganizationAccess) ? (delete user.OrganizationAccess[organizationUser.OrganizationId]) : false;

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
          Delete: {
            TableName: this.ORGANIZATION_USER_TABLE_NAME,
            Key: {
              OrganizationId: { S: organizationUser.OrganizationId },
              UserId: { S: user.UserId },
            },
          },
        },
        ...laboratoryUserDeletions,
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
   *  - update the existing User to update the OrganizationAccess meta-data Status to 'Active' or 'Inactive'
   *  - update the Organization-User access mapping record Status to 'Active' or 'Inactive'
   *
   * This function is dependent on the caller to supply the User's details updated OrganizationAccess details for
   * writing the User record.
   *
   * If any part of the transaction fails, the whole transaction will be rejected in order to avoid
   * data inconsistency.
   *
   * @param user
   * @param organizationUser
   */
  async editExistingUserAccessToOrganization(user: User, organizationUser: OrganizationUser): Promise<Boolean> {
    const logRequestMessage = `Edit Existing User To Organization UserId=${user.UserId} OrganizationId=${organizationUser.OrganizationId} request`;
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
        { // Using PutItem request to update the existing OrganizationUser record for marshalling convenience instead of UpdateItem
          Put: {
            TableName: this.ORGANIZATION_USER_TABLE_NAME,
            ConditionExpression: 'attribute_exists(#OrganizationId) AND attribute_exists(#UserId)',
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
   *  - update the existing User to update the OrganizationAccess meta-data LaboratoryIds list by adding the LaboratoryId
   *  - add a Laboratory-User access mapping record for the existing User to access the Laboratory
   *
   * This function is dependent on the caller to supply the User's details updated OrganizationAccess details for
   * writing the User record.
   *
   * If any part of the transaction fails, the whole transaction will be rejected in order to avoid
   * data inconsistency.
   *
   * @param user
   * @param laboratoryUser
   */
  async addExistingUserToLaboratory(user: User, laboratoryUser: LaboratoryUser): Promise<Boolean> {
    const logRequestMessage = `Add Existing User To Laboratory UserId=${user.UserId} LaboratoryId=${laboratoryUser.LaboratoryId} request`;
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
            TableName: this.LABORATORY_USER_TABLE_NAME,
            ConditionExpression: 'attribute_not_exists(#LaboratoryId) AND attribute_not_exists(#UserId)',
            ExpressionAttributeNames: {
              '#LaboratoryId': 'LaboratoryId',
              '#UserId': 'UserId',
            },
            Item: marshall(laboratoryUser),
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
   *  - update the existing User to update the OrganizationAccess meta-data LaboratoryIds list by removing the LaboratoryId
   *  - remove the Laboratory-User access mapping record for the existing User to remove access to the Laboratory
   *
   * This function is dependent on the caller to supply the User's details updated OrganizationAccess details for
   * writing the User record.
   *
   * If any part of the transaction fails, the whole transaction will be rejected in order to avoid
   * data inconsistency.
   *
   * @param user
   * @param LaboratoryUser
   */
  async removeExistingUserFromLaboratory(user: User, laboratoryUser: LaboratoryUser): Promise<Boolean> {
    const logRequestMessage = `Remove Existing User From Laboratory UserId=${user.UserId} LaboratoryId=${laboratoryUser.LaboratoryId} request`;
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
          Delete: {
            TableName: this.LABORATORY_USER_TABLE_NAME,
            Key: {
              LaboratoryId: { S: laboratoryUser.LaboratoryId },
              UserId: { S: user.UserId },
            },
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
   *  - update the existing User to update the LaboratoryAccess meta-data Status to 'Active' or 'Inactive'
   *  - update the Laboratory-User access mapping record Status to 'Active' or 'Inactive'
   *
   * This function is dependent on the caller to supply the User's details updated OrganizationAccess details for
   * writing the User record.
   *
   * If any part of the transaction fails, the whole transaction will be rejected in order to avoid
   * data inconsistency.
   *
   * @param user
   * @param LaboratoryUser
   */
  async editExistingUserAccessToLaboratory(user: User, laboratoryUser: LaboratoryUser): Promise<Boolean> {
    const logRequestMessage = `Edit Existing User To Laboratory UserId=${user.UserId} OrganizationId=${laboratoryUser.LaboratoryId} request`;
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
        { // Using PutItem request to update the existing LaboratoryUser record for marshalling convenience instead of UpdateItem
          Put: {
            TableName: this.LABORATORY_USER_TABLE_NAME,
            ConditionExpression: 'attribute_exists(#LaboratoryId) AND attribute_exists(#UserId)',
            ExpressionAttributeNames: {
              '#LaboratoryId': 'LaboratoryId',
              '#UserId': 'UserId',
            },
            Item: marshall(laboratoryUser),
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
