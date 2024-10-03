import {
  LaboratoryAccess,
  LaboratoryAccessDetails,
  OrganizationAccess,
  OrganizationAccessDetails,
} from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
import { APIGatewayProxyWithCognitoAuthorizerEvent } from 'aws-lambda';
import { APIGatewayProxyEvent } from 'aws-lambda/trigger/api-gateway-proxy';

/**
 * Helper function to check if the current User's Cognito session belongs to
 * System Admin user in order to allow access to restricted APIs.
 * @param event
 */
export function validateSystemAdminAccess(event: APIGatewayProxyWithCognitoAuthorizerEvent): Boolean {
  const cognitoGroup: string = event.requestContext.authorizer.claims['cognito:groups'];
  return cognitoGroup === 'SystemAdmin';
}

/**
 * Helper function to return the User's OrganizationAccess OrganizationIds.
 * @param event
 */
export function getOrganizationAccessOrganizationIds(event: APIGatewayProxyEvent): string[] {
  const orgAccessMetadata: string | undefined = event.requestContext.authorizer?.claims.OrganizationAccess;
  if (!orgAccessMetadata) {
    return [];
  }

  const organizationAccess: OrganizationAccess = JSON.parse(orgAccessMetadata);
  return Object.keys(organizationAccess);
}

/**
 * Helper function to check if an authenticated User's JWT OrganizationAccess
 * metadata allows access to administrate the requested Organization
 * @param event
 * @param organizationId
 */
export function validateOrganizationAdminAccess(event: APIGatewayProxyEvent, organizationId: string): Boolean {
  try {
    const orgAccessMetadata: string | undefined = event.requestContext.authorizer?.claims.OrganizationAccess;
    if (!orgAccessMetadata) {
      return false;
    }

    const organizationAccess: OrganizationAccess = JSON.parse(orgAccessMetadata);
    const organizationAccessDetails: OrganizationAccessDetails | undefined = organizationAccess[organizationId];
    if (
      !organizationAccessDetails ||
      (organizationAccessDetails && organizationAccessDetails.OrganizationAdmin !== true)
    ) {
      return false;
    }
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

/**
 * Helper function to check if an authenticated User's JWT OrganizationAccess
 * metadata allows access to Laboratory Management
 * @param event
 * @param organizationId
 * @param laboratoryId
 */
export function validateLaboratoryManagerAccess(
  event: APIGatewayProxyEvent,
  organizationId: string,
  laboratoryId: string,
): Boolean {
  try {
    const orgAccessMetadata: string | undefined = event.requestContext.authorizer?.claims.OrganizationAccess;
    if (!orgAccessMetadata) {
      return false;
    }

    const organizationAccess: OrganizationAccess = JSON.parse(orgAccessMetadata);
    const organizationAccessDetails: OrganizationAccessDetails | undefined = organizationAccess[organizationId];
    if (!organizationAccessDetails) {
      return false;
    }

    const laboratoryAccess: LaboratoryAccess | undefined = organizationAccessDetails.LaboratoryAccess;
    if (!laboratoryAccess) {
      return false;
    }

    const laboratoryAccessDetails: LaboratoryAccessDetails | undefined = laboratoryAccess[laboratoryId];
    if (
      !laboratoryAccessDetails ||
      (laboratoryAccessDetails && laboratoryAccessDetails.Status !== 'Active') ||
      (laboratoryAccessDetails && laboratoryAccessDetails.LabManager)
    ) {
      return false;
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

/**
 * Helper function to check if an authenticated User's JWT OrganizationAccess
 * metadata allows access to Laboratory Technician
 * @param event
 * @param organizationId
 * @param laboratoryId
 */
export function validateLaboratoryTechnicianAccess(
  event: APIGatewayProxyEvent,
  organizationId: string,
  laboratoryId: string,
): Boolean {
  try {
    const orgAccessMetadata: string | undefined = event.requestContext.authorizer?.claims.OrganizationAccess;
    if (!orgAccessMetadata) {
      return false;
    }

    const organizationAccess: OrganizationAccess = JSON.parse(orgAccessMetadata);
    const organizationAccessDetails: OrganizationAccessDetails | undefined = organizationAccess[organizationId];
    if (!organizationAccessDetails) {
      return false;
    }

    const laboratoryAccess: LaboratoryAccess | undefined = organizationAccessDetails.LaboratoryAccess;
    if (!laboratoryAccess) {
      return false;
    }

    const laboratoryAccessDetails: LaboratoryAccessDetails | undefined = laboratoryAccess[laboratoryId];
    if (
      !laboratoryAccessDetails ||
      (laboratoryAccessDetails && laboratoryAccessDetails.Status !== 'Active') ||
      (laboratoryAccessDetails && laboratoryAccessDetails.LabTechnician)
    ) {
      return false;
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

/**
 * Helper function to check if an authenticated User's JWT OrganizationAccess
 * metadata allows access to the requested Organization / Laboratory.
 * @param event
 * @param organizationId
 * @param laboratoryId
 */
export function validateOrganizationAccess(
  event: APIGatewayProxyEvent,
  organizationId: string,
  laboratoryId?: string,
): Boolean {
  try {
    const orgAccessMetadata: string | undefined = event.requestContext.authorizer?.claims.OrganizationAccess;
    if (!orgAccessMetadata) {
      return false;
    }

    const organizationAccess: OrganizationAccess = JSON.parse(orgAccessMetadata);
    const organizationAccessDetails: OrganizationAccessDetails | undefined = organizationAccess[organizationId];
    if (!organizationAccessDetails || (organizationAccessDetails && organizationAccessDetails.Status !== 'Active')) {
      return false;
    }

    if (laboratoryId) {
      const laboratoryAccess: LaboratoryAccess | undefined = organizationAccessDetails.LaboratoryAccess;
      if (!laboratoryAccess) {
        return false;
      }

      const laboratoryAccessDetails: LaboratoryAccessDetails | undefined = laboratoryAccess[laboratoryId];
      if (!laboratoryAccessDetails || (laboratoryAccessDetails && laboratoryAccessDetails.Status !== 'Active')) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
