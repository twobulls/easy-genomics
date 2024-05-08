import { Auth } from 'aws-amplify';

export default function useAuth() {
  async function hasAuth() {
    try {
      const authenticatedUser = await Auth.currentAuthenticatedUser();
      return !!authenticatedUser;
    } catch (error) {
      console.error('Error occurred getting the authenticated user.', error);
      throw error;
    }
  }

  async function login(username: string, password: string) {
    try {
      const user = await Auth.signIn(username, password);
      if (user) {
        await navigateTo('/labs');
      }
    } catch (error) {
      console.error('Error occurred during sign in.', error);
      throw error;
    }
  }

  async function logOut() {
    try {
      await Auth.signOut();
      await navigateTo('/login');
    } catch (error) {
      console.error('Error occurred during sign out.', error);
      throw error;
    }
  }
  return {
    hasAuth,
    login,
    logOut,
  };
}
