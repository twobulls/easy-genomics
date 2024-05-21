import { CreateUserInviteSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/user-invite';
import { CreateUserInvite } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user-invite';
import { useToastStore } from '~/stores/stores';
import { ERRORS } from '~/constants/validation';
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

  async function handleInvite(reqBody: CreateUserInvite, action: 'resend' | 'send') {
    const result = CreateUserInviteSchema.safeParse(reqBody);
    if (!result.success) {
      console.error('Zod validation failed', result.error);
      return;
    }

    const { OrganizationId: orgId, Email: email } = result.data;
    const toastSuccessMessage =
      action === 'send' ? `${email} has been sent an invite` : `${email} has been resent an invite`;
    const toastErrorMessage = ERRORS.network;

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
