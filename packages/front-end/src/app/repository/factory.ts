import { useRuntimeConfig } from 'nuxt/app';
const { getToken } = useAuth();

class HttpFactory {
  private baseApiUrl = useRuntimeConfig().public.BASE_API_URL;
  private defaultApiUrl = `${this.baseApiUrl}/easy-genomics`;
  private nfTowerApiUrl = `${this.baseApiUrl}/nf-tower`;

  call<T>(method = 'GET', url: string, data: unknown = ''): Promise<T | undefined> {
    return this.performRequest<T>(method, this.defaultApiUrl + url, data);
  }

  callNfTower<T>(method = 'GET', url: string, data: unknown = ''): Promise<T | undefined> {
    return this.performRequest<T>(method, this.nfTowerApiUrl + url, data);
  }

  private async performRequest<T>(method: string, url: string, data: unknown = ''): Promise<T | undefined> {
    try {
      const headers: HeadersInit = new Headers();
      headers.append('Content-Type', 'application/json');

      // TODO: Consider adding a custom JWT Authorizer to the Public API Gateway for Public APIs
      // The invite/reset password token will be passed as the Bearer token
      // A dedicated custom Lambda authorizer will be run by the API Gateway to validate the token
      // enabling single responsibility and separation of concerns.
      // Possibly further upsides as API Gateway may execute the authorizer for free or cheaply,
      // either way the Lambda resource allocation can be much lower than those that require more complex logic
      // and access to various services and large response payloads.
      let token: string | undefined;
      try {
        token = await getToken();
      } catch (tokenError) {
        console.warn(`Failed to get token; reason: ${tokenError}; continuing without Bearer or X-API header`);
      }
      if (token) {
        headers.append('Authorization', token);
      }
      const settings: RequestInit = {
        method,
        headers,
      };
      if (data) {
        settings.body = JSON.stringify(data);
      }
      const response = await fetch(url, settings);
      if (!response.ok) {
        await this.handleResponseError(response);
      }

      return await ((await response.json()) as Promise<T>);
    } catch (error: any) {
      throw new Error(`Request error: ${error.message}`);
    }
  }

  private async handleResponseError(response: Response): Promise<void> {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorBody: { Error: string } = await response.json();
      errorMessage = errorBody.Error || errorMessage;
    } catch (error) {
      console.error('Error parsing response body', error);
    }
    throw new Error(errorMessage);
  }
}

export default HttpFactory;
