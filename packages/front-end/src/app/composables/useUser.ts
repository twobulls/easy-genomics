import { CreateUserInvitationRequestSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/user-invitation';
import { OrganizationUserDetails } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user-details';
import { CreateUserInvitationRequest } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user-invitation';
import { VALIDATION_MESSAGES } from '@FE/constants/validation';
import { useToastStore } from '@FE/stores';
import { decodeJwt } from '@FE/utils/jwt-utils';

type UserNameOptions = {
  preferredName?: string | undefined;
  firstName?: string | undefined;
  lastName?: string | undefined;
  email: string;
};

/**
 * Composables for any User related functionality
 */
export default function useUser() {
  /**
   * Returns the display name of a user
   */
  function displayName(nameOptions: UserNameOptions): string {
    const { preferredName, firstName, lastName, email } = nameOptions;
    const preferredOrFirstName = preferredName || firstName;

    if (preferredOrFirstName) {
      return `${preferredOrFirstName} ${lastName}`;
    } else {
      return email;
    }
  }

  async function handleInvite(reqBody: CreateUserInvitationRequest, action: 'resend' | 'send') {
    const { $api } = useNuxtApp();
    const result = CreateUserInvitationRequestSchema.safeParse(reqBody);
    if (!result.success) {
      console.error('Zod validation failed', result.error);
      return;
    }

    const { OrganizationId: orgId, Email: email } = result.data;
    const toastSuccessMessage =
      action === 'send' ? `${email} has been sent an invite` : `${email} has been resent an invite`;
    const toastErrorMessage = VALIDATION_MESSAGES.network;

    try {
      await $api.users.invite(orgId, email);
      useToastStore().success(toastSuccessMessage);
    } catch (error) {
      useToastStore().error(toastErrorMessage);
      console.error(error);
    }
  }

  async function resendInvite(user: { OrganizationId: string; UserEmail: string }) {
    const { OrganizationId: orgId, UserEmail: email } = user;
    await handleInvite(
      {
        OrganizationId: orgId,
        Email: email,
      },
      'resend',
    );
  }

  async function invite(reqBody: CreateUserInvitationRequest) {
    await handleInvite(reqBody, 'send');
  }

  /**
   * Count the number of labs a user has access to; default to 0 if no access
   * @param user
   */
  function labsCount(user: OrganizationUserDetails) {
    const labsAccess = Object.values(user?.OrganizationAccess || {}).flatMap((orgAccess) =>
      Object.values(orgAccess?.LaboratoryAccess || {}),
    );
    return labsAccess.filter((labAccess) => labAccess.Status === 'Active').length;
  }

  /**
   * @description Obtains details about the current user from the auth JWT then sets them in the user store
   */
  async function setCurrentUserDataFromToken() {
    try {
      const userStore = useUserStore();

      // decode token
      const token = await useAuth().getToken();
      const decodedToken: any = decodeJwt(token);

      // retrieve and set account email
      userStore.currentUserDetails.email = decodedToken.email;

      // check and set superuser status
      userStore.currentUserPermissions.isSuperuser = decodedToken['cognito:groups']?.includes('SystemAdmin');

      // if superuser, quit now, as su accounts won't have any of the details retrieved in the rest of this function
      if (userStore.currentUserPermissions.isSuperuser) {
        return;
      }

      // retrieve and set current org id and org access
      const parsedOrgAccess = JSON.parse(decodedToken.OrganizationAccess);

      const currentOrgId = Object.keys(parsedOrgAccess)[0];
      userStore.currentOrg.OrganizationId = currentOrgId;

      userStore.currentUserPermissions.orgPermissions = {
        [currentOrgId]: parsedOrgAccess[currentOrgId],
      };

      // retrieve and set personal details
      userStore.currentUserDetails.firstName = decodedToken.FirstName;
      userStore.currentUserDetails.lastName = decodedToken.LastName;
      userStore.currentUserDetails.preferredName = decodedToken.PreferredName;
    } catch (error) {
      console.error('Error occurred setting the current organisation.', error);
      throw error;
    }
  }

  return {
    displayName,
    labsCount,
    invite,
    resendInvite,
    setCurrentUserDataFromToken,
  };
}
