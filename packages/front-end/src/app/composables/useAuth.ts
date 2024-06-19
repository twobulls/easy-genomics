import { Auth } from 'aws-amplify';
import { ERRORS } from '~/constants/validation';
import { useToastStore, useUiStore } from '~/stores/stores';

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
      useUiStore().setRequestPending(true);
      const user = await Auth.signIn(username, password);
      if (user) {
        await navigateTo('/labs');
      }
    } catch (error: any) {
      if (error.code === 'NotAuthorizedException') {
        useToastStore().error('Incorrect email or password. Please try again.');
      } else {
        useToastStore().error(ERRORS.network);
      }
      console.error('Error occurred during sign in.', error);
      throw error;
    } finally {
      useUiStore().setRequestPending(false);
    }
  }

  async function signOut() {
    try {
      await Auth.signOut();
      await navigateTo('/signin');
    } catch (error) {
      console.error('Error occurred during sign out.', error);
      throw error;
    }
  }
  return {
    isAuthed,
    signIn,
    signOut,
  };
}
