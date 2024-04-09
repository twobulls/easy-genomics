import { Auth } from 'aws-amplify';

export default function useAuth() {
  async function hasAuth() {
    return !!(await Auth.currentAuthenticatedUser());
  }

  async function login(username: string, password: string) {
    try {
      const user = await Auth.signIn(username, password);
      if (user) {
        navigateTo('/labs');
      }
    } catch (error) {
      console.log('error signing in', error);
    }
  }

  async function logOut() {
    try {
      await Auth.signOut();
      navigateTo('/login');
    } catch (error) {
      console.log('Error signing out: ', error);
    }
  }

  return {
    hasAuth,
    login,
    logOut,
  };
}
