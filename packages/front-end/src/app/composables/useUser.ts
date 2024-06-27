import { CreateUserInvitationRequestSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/user-invitation';
import { OrganizationUserDetails } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user-details';
import { CreateUserInvitationRequest } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user-invitation';
import { ERRORS } from '~/constants/validation';
import { useToastStore } from '~/stores/stores';

type UserNameOptions = {
  preferredName?: string | undefined;
  firstName?: string | undefined;
  lastName?: string | undefined;
  email: string;
};

/**
 * Composables for any User related functions
 */
export default function useUser() {
  const { $api } = useNuxtApp();

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
    const result = CreateUserInvitationRequestSchema.safeParse(reqBody);
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

  async function resendInvite(user: { OrganizationId: string; UserEmail: string }) {
    const { OrganizationId: orgId, UserEmail: email } = user;
    await handleInvite(
      {
        OrganizationId: orgId,
        Email: email,
      },
      'resend'
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
      Object.values(orgAccess?.LaboratoryAccess || {})
    );
    return labsAccess.filter((labAccess) => labAccess.Status === 'Active').length;
  }

  return {
    displayName,
    labsCount,
    invite,
    resendInvite,
  };
}
