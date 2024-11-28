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
    firstName: string | null;
    lastName: string | null;
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
    firstName: null,
    lastName: null,
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

    initials: (_state: UserStoreState): string =>
      (_state.currentUserDetails.firstName?.charAt(0) || '?') + (_state.currentUserDetails.lastName?.charAt(0) || '?'),
  },

  actions: {
    setOrgAccess(val: any) {
      this.currentOrg = val;
    },
    reset() {
      Object.assign(this, initialState());
    },

    async loadCurrentUserPermissions(): Promise<void> {
      const token = await useAuth().getToken();
      const decodedToken: any = decodeJwt(token);

      if (decodedToken['cognito:groups']?.includes('SystemAdmin')) {
        this.currentUserPermissions.isSuperuser = true;
        return;
      }

      this.currentUserPermissions.isSuperuser = false;

      const parsedOrgAccess = JSON.parse(decodedToken.OrganizationAccess);
      this.currentUserPermissions.orgPermissions = parsedOrgAccess;
    },

    async loadCurrentUserDetails(): Promise<void> {
      const token = await useAuth().getToken();
      const decodedToken: any = decodeJwt(token);

      this.currentUserDetails.firstName = decodedToken.FirstName;
      this.currentUserDetails.lastName = decodedToken.LastName;
    },
  },

  persist: true,
});

export default useUserStore;
