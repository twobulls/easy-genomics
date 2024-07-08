import {
  LaboratoryAccess,
  LaboratoryAccessDetails,
  OrganizationAccess,
  OrganizationAccessDetails,
} from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
import { APIGatewayProxyEvent } from 'aws-lambda/trigger/api-gateway-proxy';

export const enum REST_API_METHOD {
  // CRUD operations
  POST = 'POST',
  GET = 'GET',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

/**
 * Helper utility function to perform HTTP REST API requests and return the
 * expected JSON response object type.
 * @param url
 * @param method
 * @param headers
 * @param body
 */
export async function httpRequest<T>(
  url: string,
  method: string,
  headers?: Record<string, string>,
  body?: object | {},
): Promise<T> {
  try {
    const request: RequestInit = {
      method: method,
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'cache-control': 'no-cache',
        ...headers,
      },
      ...(method === REST_API_METHOD.POST || method === REST_API_METHOD.PUT || method === REST_API_METHOD.PATCH
        ? { body: JSON.stringify(body) }
        : {}),
    };

    return await fetch(url, request)
      .then(async (response) => response.json())
      .then((json) => <T>json);
  } catch (error: any) {
    console.error(error.message);
    throw error;
  }
}

/**
 * Helper utility function to retrieve common basic query parameters from the
 * Easy Genomics FE which are supported by Seqera Cloud / NextFlow Tower APIs.
 * @param event
 */
export function getApiParameters(event: APIGatewayProxyEvent): URLSearchParams {
  const parameters: URLSearchParams = new URLSearchParams();

  const max: string | undefined = event.queryStringParameters?.max;
  if (max && parseInt(max) > 0) {
    parameters.set('max', max);
  }
  const offset: string | undefined = event.queryStringParameters?.offset;
  if (offset && parseInt(offset) > 0) {
    parameters.set('offset', offset);
  }
  const search: string | undefined = event.queryStringParameters?.search;
  if (search) {
    parameters.set('search', search);
  }

  return parameters;
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
