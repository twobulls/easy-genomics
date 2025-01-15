import {
  OrganizationAccess,
  OrganizationAccessDetails,
} from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
import { defineStore } from 'pinia';

interface UserStoreState {
  currentOrg: {
    // this is a temporary thing while there is no actual multi org handling
    OrganizationId: string | null;
  };
  currentUserPermissions: {
    isSuperuser: boolean | null;
    orgPermissions: OrganizationAccess | null;
  };
  currentUserDetails: {
    id: string | null;
    firstName: string | null;
    lastName: string | null;
    preferredName: string | null;
    email: string | null;
    defaultOrgId: string | null;
  };
}

const initialState = (): UserStoreState => ({
  currentOrg: {
    OrganizationId: null,
  },
  currentUserPermissions: {
    isSuperuser: null,
    orgPermissions: null,
  },
  currentUserDetails: {
    id: null,
    firstName: null,
    lastName: null,
    preferredName: null,
    email: null,
    defaultOrgId: null,
  },
});

/**
 * @description User store to manage current signed-in user state
 */
const useUserStore = defineStore('userStore', {
  state: initialState,

  getters: {
    currentOrgId: (state) => state.currentOrg.OrganizationId,

    // permissions

    isSuperuser: (state: UserStoreState): boolean => !!state.currentUserPermissions.isSuperuser,

    // permissions functions with org id explicitly specified
    // these generally won't be called directly but can be used if the org in question isn't the current org

    isOrgAdminForOrg:
      (state: UserStoreState) =>
      (orgId: string): boolean =>
        useUserStore().isSuperuser || !!state.currentUserPermissions.orgPermissions?.[orgId]?.OrganizationAdmin,

    isLabMemberForOrg:
      (state: UserStoreState) =>
      (orgId: string, labId: string): boolean =>
        !!state.currentUserPermissions.orgPermissions?.[orgId]?.LaboratoryAccess?.[labId],

    isLabManagerForOrg:
      (state: UserStoreState) =>
      (orgId: string, labId: string): boolean =>
        !!state.currentUserPermissions.orgPermissions?.[orgId]?.LaboratoryAccess?.[labId]?.LabManager,

    // currently we don't have any granular org permission logic so this is it
    // you can manage orgs if you're an admin of any org
    canManageOrgsForOrg:
      (state: UserStoreState) =>
      (_orgId: string): boolean =>
        state.currentUserPermissions.isSuperuser ||
        Object.values(state.currentUserPermissions.orgPermissions ?? {}).some(
          (perms: OrganizationAccessDetails) => !!perms.OrganizationAdmin,
        ),

    canCreateLabForOrg:
      (_state: UserStoreState) =>
      (orgId: string): boolean =>
        !useUserStore().isSuperuser && useUserStore().isOrgAdminForOrg(orgId),

    canViewLabForOrg:
      (_state: UserStoreState) =>
      (orgId: string, labId: string): boolean =>
        useUserStore().isOrgAdminForOrg(orgId) || useUserStore().isLabMemberForOrg(orgId, labId),

    canEditLabUsersForOrg:
      (_state: UserStoreState) =>
      (orgId: string, labId: string): boolean =>
        useUserStore().isOrgAdminForOrg(orgId) || useUserStore().isLabManagerForOrg(orgId, labId),

    canEditLabDetailsForOrg:
      (_state: UserStoreState) =>
      (orgId: string): boolean =>
        useUserStore().isOrgAdminForOrg(orgId),

    canDeleteLabForOrg:
      (_state: UserStoreState) =>
      (orgId: string): boolean =>
        useUserStore().isOrgAdminForOrg(orgId),

    canAddLabUsersForOrg:
      (_state: UserStoreState) =>
      (orgId: string, labId: string): boolean =>
        useUserStore().isOrgAdminForOrg(orgId) || useUserStore().isLabManagerForOrg(orgId, labId),

    // permissions functions which use the current org id
    // usually these will be the ones that are used because usually permissions checks apply to the current org

    isOrgAdmin: (state: UserStoreState) => (): boolean =>
      useUserStore().isOrgAdminForOrg(state.currentOrg.OrganizationId),

    isLabMember:
      (state: UserStoreState) =>
      (labId: string): boolean =>
        useUserStore().isLabMemberForOrg(state.currentOrg.OrganizationId, labId),

    isLabManager:
      (state: UserStoreState) =>
      (labId: string): boolean =>
        useUserStore().isLabManagerForOrg(state.currentOrg.OrganizationId, labId),

    canManageOrgs: (state: UserStoreState) => (): boolean =>
      useUserStore().canManageOrgsForOrg(state.currentOrg.OrganizationId),

    canCreateLab: (state: UserStoreState) => (): boolean =>
      useUserStore().canCreateLabForOrg(state.currentOrg.OrganizationId),

    canViewLab:
      (state: UserStoreState) =>
      (labId: string): boolean =>
        useUserStore().canViewLabForOrg(state.currentOrg.OrganizationId, labId),

    canEditLabUsers:
      (state: UserStoreState) =>
      (labId: string): boolean =>
        useUserStore().canEditLabUsersForOrg(state.currentOrg.OrganizationId, labId),

    canEditLabDetails: (state: UserStoreState) => (): boolean =>
      useUserStore().canEditLabDetailsForOrg(state.currentOrg.OrganizationId),

    canDeleteLab: (state: UserStoreState) => (): boolean =>
      useUserStore().canDeleteLabForOrg(state.currentOrg.OrganizationId),

    canAddLabUsers:
      (state: UserStoreState) =>
      (labId: string): boolean =>
        useUserStore().canAddLabUsersForOrg(state.currentOrg.OrganizationId, labId),

    // user details

    currentUserDisplayName: (_state: UserStoreState): string => {
      return useUser().displayName({
        firstName: _state.currentUserDetails.firstName,
        preferredName: _state.currentUserDetails.preferredName,
        lastName: _state.currentUserDetails.lastName,
        email: _state.currentUserDetails.email,
      });
    },

    currentUserInitials: (_state: UserStoreState): string => {
      return useUser().initials(
        {
          firstName: _state.currentUserDetails.firstName,
          preferredName: _state.currentUserDetails.preferredName,
          lastName: _state.currentUserDetails.lastName,
          email: _state.currentUserDetails.email,
        },
        useUserStore().isSuperuser,
      );
    },
  },

  actions: {
    setOrgAccess(val: any) {
      this.currentOrg = val;
    },
    reset() {
      Object.assign(this, initialState());
    },
  },

  persist: true,
});

export default useUserStore;
