import { useToastStore } from '~/stores/stores';
import { OrganizationUserDetails } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user-details';
import { CreateUserInvite } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user-invite';
import { CreateUserInviteSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/user-invite';

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

  async function handleInvite(reqBody: CreateUserInvite, action: 'resend' | 'send') {
    const result = CreateUserInviteSchema.safeParse(reqBody);
    if (!result.success) {
      console.error('Zod validation failed', result.error);
      return;
    }

    const { OrganizationId: orgId, Email: email } = result.data;
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
    const { OrganizationId: orgId, Email: email } = user;
    await handleInvite(
      {
        OrganizationId: orgId,
        Email: email,
      },
      'resend'
    );
  }

  async function invite(reqBody: CreateUserInvite) {
    await handleInvite(reqBody, 'send');
  }

  return {
    displayName,
    resendInvite,
    invite,
  };
}
