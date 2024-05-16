import { useToastStore, useUiStore } from '~/stores/stores';
import { OrganizationUserDetails } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user-details';

type UserNameOptions = {
  preferredName: string | undefined;
  firstName: string | undefined;
  lastName: string | undefined;
};

export default function useUser() {
  const { $api } = useNuxtApp();

  /**
   * Returns the display name of a user
   * @param nameOptions
   */
  function displayName(nameOptions: UserNameOptions) {
    const { preferredName, firstName, lastName } = nameOptions;

    const preferredOrFirstName = preferredName || firstName;
    return preferredOrFirstName ? `${preferredOrFirstName} ${lastName}` : '';
  }

  type inviteReqBody = {
    OrganizationId: string;
    UserEmail: string;
  };

  async function handleInvite(reqBody: inviteReqBody, action: 'resend' | 'send') {
    const { OrganizationId: orgId, UserEmail: email } = reqBody;
    const toastSuccessMessage = action === 'send' ? 'Invite sent' : 'Invite resent';
    const toastErrorMessage = action === 'send' ? 'Failed to send invite' : 'Failed to resend invite';

    try {
      await $api.users.invite(orgId, email);
      useToastStore().success(toastSuccessMessage);
    } catch (error) {
      useToastStore().error(toastErrorMessage);
      console.error(error);
    }
  }

  async function resendInvite(user: OrganizationUserDetails) {
    const { OrganizationId: orgId, UserEmail: email } = user;
    await handleInvite(
      {
        OrganizationId: orgId,
        UserEmail: email,
      },
      'resend'
    );
  }

  async function invite(reqBody: inviteReqBody) {
    await handleInvite(reqBody, 'send');
  }

  return {
    displayName,
    resendInvite,
    invite,
  };
}
