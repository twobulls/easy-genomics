import { Auth } from 'aws-amplify';

class HttpFactory {
  private $fetch: $Fetch;

  constructor(fetcher: $Fetch) {
    this.$fetch = fetcher;
  }

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
          Authorization: token,
        },
      };
      const settings = {
        method,
        ...headers,
        body: JSON.stringify(data),
      };
      const $res: T = await this.$fetch(url, settings);
      return $res;
    } catch (error) {
      console.error('An error occurred:', error);
      return undefined;
    }
  }

  private async getToken(): Promise<string> {
    const session = await Auth.currentSession();
    const idToken = session.getIdToken().getJwtToken();
    return `Bearer ${idToken}`;
  }
}

export default HttpFactory;
