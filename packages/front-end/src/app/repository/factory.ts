import { Auth } from 'aws-amplify';
import { useRuntimeConfig } from 'nuxt/app';

class HttpFactory {
  private baseRequestUrl = `${useRuntimeConfig().public.BASE_API_URL}/easy-genomics`;

  /**
   * @description Call API with token and handle response errors
   * @param method
   * @param url
   * @param data
   * @param successMsg
   * @returns {Promise<T | undefined>}
   */

  async call<T>(method = 'GET', url: string, data?: unknown): Promise<T | undefined> {
    const requestUrl = `${this.baseRequestUrl}${url}`;

    try {
      const token = await this.getToken();
      const headers = {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
      };
      const settings = {
        method,
        ...headers,
        body: JSON.stringify(data),
      };
      const response = await fetch(requestUrl, settings);

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
      const errorBody: any = await response.json();
      errorMessage = errorBody.message || errorMessage;
    } catch (error) {
      console.error('Error parsing response body', error);
    }
    throw new Error(errorMessage);
  }

  private async getToken(): Promise<string> {
    const session = await Auth.currentSession();
    const idToken = session.getIdToken().getJwtToken();
    return `Bearer ${idToken}`;
  }
}

export default HttpFactory;
