import { Auth } from 'aws-amplify';
import { ERRORS } from '~/constants/validation';
import { useToastStore, useUiStore } from '~/stores';
import { decodeJwt } from '~/utils/jwt';

export default function useAuth($api) {
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

  async function getToken(): Promise<string> {
    const session = await Auth.currentSession();
    return session.getIdToken().getJwtToken();
  }

  /**
   * @description Obtains the user's current org id from the auth JWT then sets it as the current org in the user store
   */
  async function setUserOrg() {
    try {
      const token = await getToken();
      const decodedToken = decodeJwt(token);
      const parsedOrgAccess = JSON.parse(decodedToken.OrganizationAccess);
      const currentOrgId = Object.keys(parsedOrgAccess)[0];
      const orgs = await $api.orgs.list();
      const currentOrg = orgs.find((org) => org.OrganizationId === currentOrgId);
      useUserStore().setOrgAccess(currentOrg);
    } catch (error) {
      console.error('Error occurred setting the current organisation.', error);
      throw error;
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
    getToken,
    isAuthed,
    setUserOrg,
    signIn,
    signOut,
  };
}
