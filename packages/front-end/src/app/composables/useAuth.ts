import { Auth } from 'aws-amplify';
import { VALIDATION_MESSAGES } from '@FE/constants/validation';
import { useToastStore, useUiStore } from '@FE/stores';

export default function useAuth() {
  async function isAuthed() {
    try {
      const authenticatedUser = await Auth.currentAuthenticatedUser();
      return !!authenticatedUser;
    } catch (error) {
      console.error('Error occurred getting the authenticated user.', error);
      throw error;
    }
  }

  async function signIn(username: string, password: string) {
    try {
      useUiStore().setRequestPending('signIn');
      const user = await Auth.signIn(username, password);
      if (user) {
        await useUserStore().loadCurrentUserPermissions();
        await useOrgsStore().loadOrgs();
        await navigateTo('/labs');
      }
    } catch (error: any) {
      if (error.code === 'NotAuthorizedException') {
        useToastStore().error('Incorrect email or password. Please try again.');
      } else {
        useToastStore().error(VALIDATION_MESSAGES.network);
      }
      console.error('Error occurred during sign in.', error);
      throw error;
    } finally {
      useUiStore().setRequestComplete('signIn');
    }
  }

  async function getToken(): Promise<string> {
    const session = await Auth.currentSession();
    return session.getIdToken().getJwtToken();
  }

  async function signOut() {
    try {
      await Auth.signOut();
      await useUserStore().reset();
      await navigateTo('/signin');
      useToastStore().success('You have been signed out.');
    } catch (error) {
      console.error('Error occurred during sign out.', error);
      throw error;
    }
  }
  return {
    getToken,
    isAuthed,
    signIn,
    signOut,
  };
}
