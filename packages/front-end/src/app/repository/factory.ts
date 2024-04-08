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
  async call<T>(method: string, url: string, data?: object, extras = {}): Promise<T> {
    // How to get a token from aws Cognito using aws-amplify
    const session = await Auth.currentSession();
    const idToken = session.getIdToken().getJwtToken();
    const token = `Bearer ${idToken}`;

    const $res: T = await this.$fetch(url, {
      method: 'GET',
      headers: {
        Authorization: token,
      },
    });
    console.warn($res);
    return $res;
  }
}

export default HttpFactory;
