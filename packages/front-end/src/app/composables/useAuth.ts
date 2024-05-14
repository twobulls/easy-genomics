import { Auth } from 'aws-amplify';
import { useToastStore, useUiStore } from '~/stores/stores';

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
      useUiStore().setRequestPending(true);
      const user = await Auth.signIn(username, password);
      if (user) {
        await navigateTo('/labs');
      }
    } catch (error: any) {
      if (error.code === 'NotAuthorizedException') {
        useToastStore().error('Incorrect email or password. Please try again.');
      } else {
        useToastStore().error('Huh, something went wrong. Please check your connection and try again');
      }
      console.error('Error occurred during sign in.', error);
      throw error;
    } finally {
      useUiStore().setRequestPending(false);
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
