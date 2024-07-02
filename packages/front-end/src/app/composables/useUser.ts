import { CreateUserInvitationRequestSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/user-invitation';
import { Organization } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization';
import { OrganizationUserDetails } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user-details';
import { CreateUserInvitationRequest } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user-invitation';
import { VALIDATION_MESSAGES } from '~/constants/validation';
import { useToastStore } from '~/stores';
import { decodeJwt } from '~/utils/jwt';

type UserNameOptions = {
  preferredName?: string | undefined;
  firstName?: string | undefined;
  lastName?: string | undefined;
  email: string;
};

/**
 * Composables for any User related functionality
 */
export default function useUser($api?: any) {
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
   * @description Obtains the user's current org id from the auth JWT then sets it as the current org in the user store
   */
  async function setCurrentUserOrg() {
    try {
      const token = await useAuth().getToken();
      const decodedToken: any = decodeJwt(token);
      const parsedOrgAccess = JSON.parse(decodedToken.OrganizationAccess);
      const currentOrgId = Object.keys(parsedOrgAccess)[0];
      const orgs = await $api.orgs.list();
      const currentOrg = orgs.find((org: Organization) => org.OrganizationId === currentOrgId);
      useUserStore().setOrgAccess(currentOrg);
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
    setCurrentUserOrg,
  };
}
