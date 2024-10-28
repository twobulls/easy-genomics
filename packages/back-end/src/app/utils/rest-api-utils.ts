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
    const requestHeaders: Record<string, string> = {
      'Accept': '*/*',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      ...headers,
    };

    const request: RequestInit = {
      method: method,
      headers: requestHeaders,
      ...(method === REST_API_METHOD.POST || method === REST_API_METHOD.PUT || method === REST_API_METHOD.PATCH
        ? { body: JSON.stringify(body) }
        : {}),
      ...(requestHeaders['Content-Type'] === 'application/octet-stream' ? { responseType: 'arraybuffer' } : {}),
    };

    const response = await fetch(url, request);
    switch (response.status) {
      case 200:
        if (requestHeaders['Content-Type'] === 'application/octet-stream') {
          const data: ArrayBuffer = await response.arrayBuffer();
          return <T>data;
        } else {
          return await response.json().then((data) => <T>data);
        }
      case 204: // No Content
        return <T>{};
      default:
        throw new Error(`${response.status} ${JSON.stringify(response.body)}`.trim());
    }
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
 * Helper utility function to set the NextFlow Tower API query parameters.
 * @param event
 * @param workspaceId
 */
export function getNextFlowApiQueryParameters(event: APIGatewayProxyEvent, workspaceId?: string): string {
  const apiParameters: URLSearchParams = getApiParameters(event);
  if (workspaceId) {
    apiParameters.set('workspaceId', workspaceId);
  }
  return apiParameters.toString();
}
