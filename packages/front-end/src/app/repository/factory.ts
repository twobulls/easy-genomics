import { Auth } from 'aws-amplify';

class HttpFactory {
  /**
   * @param method
   * @param url
   * @param data
   * @param extras
   */
  async call<T>(method = 'GET', url: string, data?: unknown): Promise<T | undefined> {
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

      const response = await fetch(url, settings);

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      return await (response.json() as Promise<T>);
    } catch (error) {
      // TODO: handle error message via toast
      console.error('Request error:', error);
      throw error;
    }
  }

  private async getToken(): Promise<string> {
    const session = await Auth.currentSession();
    const idToken = session.getIdToken().getJwtToken();
    return `Bearer ${idToken}`;
  }
}

export default HttpFactory;
