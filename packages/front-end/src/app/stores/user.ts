import { OrganizationAccess } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
import { defineStore } from 'pinia';

interface UserStoreState {
  currentOrg: {
    // this is a temporary thing while there is no actual multi org handling
    OrganizationId: string;
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
  };
}

const initialState = (): UserStoreState => ({
  currentOrg: {
    OrganizationId: '',
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

    isOrgAdmin: (state: UserStoreState) => (): boolean =>
      useUserStore().isSuperuser ||
      !!state.currentUserPermissions.orgPermissions?.[useUserStore().currentOrgId]?.OrganizationAdmin,

    isLabMember:
      (state: UserStoreState) =>
      (labId: string): boolean =>
        !!state.currentUserPermissions.orgPermissions?.[useUserStore().currentOrgId]?.LaboratoryAccess?.[labId],

    isLabManager:
      (state: UserStoreState) =>
      (labId: string): boolean =>
        !!state.currentUserPermissions.orgPermissions?.[useUserStore().currentOrgId]?.LaboratoryAccess?.[labId]
          ?.LabManager,

    // currently we don't have any granular org permission logic so this is it
    canManageOrgs: (_state: UserStoreState) => (): boolean => useUserStore().isOrgAdmin(),

    canCreateLab: (_state: UserStoreState) => (): boolean => !useUserStore().isSuperuser && useUserStore().isOrgAdmin(),

    canViewLab:
      (_state: UserStoreState) =>
      (labId: string): boolean =>
        useUserStore().isOrgAdmin() || useUserStore().isLabMember(labId),

    canEditLabUsers:
      (_state: UserStoreState) =>
      (labId: string): boolean =>
        useUserStore().isOrgAdmin() || useUserStore().isLabManager(labId),

    canEditLabDetails: (_state: UserStoreState) => (): boolean => useUserStore().isOrgAdmin(),

    canDeleteLab: (_state: UserStoreState) => (): boolean => useUserStore().isOrgAdmin(),

    canAddLabUsers:
      (_state: UserStoreState) =>
      (labId: string): boolean =>
        useUserStore().isOrgAdmin() || useUserStore().isLabManager(labId),

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
