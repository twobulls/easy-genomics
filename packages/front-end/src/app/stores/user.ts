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
}

const initialState = (): UserStoreState => ({
  currentOrg: {
    OrganizationId: '',
  },
  currentUserPermissions: {
    isSuperuser: null,
    orgPermissions: null,
  },
});

/**
 * @description User store to manage current signed-in user state
 */
const useUserStore = defineStore('userStore', {
  state: initialState,

  getters: {
    currentOrgId: (state) => state.currentOrg.OrganizationId,

    isSuperuser: (state: UserStoreState): boolean => !!state.currentUserPermissions.isSuperuser,

    isOrgAdmin:
      (state: UserStoreState) =>
      (orgId: string): boolean => {
        return useUserStore().isSuperuser || !!state.currentUserPermissions.orgPermissions?.[orgId]?.OrganizationAdmin;
      },

    isLabMember:
      (state: UserStoreState) =>
      (orgId: string, labId: string): boolean =>
        !!state.currentUserPermissions.orgPermissions?.[orgId]?.LaboratoryAccess?.[labId],

    isLabManager:
      (state: UserStoreState) =>
      (orgId: string, labId: string): boolean =>
        !!state.currentUserPermissions.orgPermissions?.[orgId]?.LaboratoryAccess?.[labId]?.LabManager,
    // currently we don't have any granular org permission logic so this is it
    canManageOrgs: (_state: UserStoreState) => (): boolean => useUserStore().isOrgAdmin(useUserStore().currentOrgId),

    canCreateLab: (_state: UserStoreState) => (): boolean =>
      !useUserStore().isSuperuser && useUserStore().isOrgAdmin(useUserStore().currentOrgId),

    canViewLab:
      (_state: UserStoreState) =>
      (orgId: string, labId: string): boolean =>
        useUserStore().isOrgAdmin(orgId) || useUserStore().isLabMember(orgId, labId),

    canEditLabUsers:
      (_state: UserStoreState) =>
      (orgId: string, labId: string): boolean =>
        useUserStore().isOrgAdmin(orgId) || useUserStore().isLabManager(orgId, labId),

    canEditLabDetails:
      (_state: UserStoreState) =>
      (orgId: string): boolean =>
        useUserStore().isOrgAdmin(orgId),

    canDeleteLab:
      (_state: UserStoreState) =>
      (orgId: string): boolean =>
        useUserStore().isOrgAdmin(orgId),

    canAddLabUsers:
      (_state: UserStoreState) =>
      (orgId: string, labId: string): boolean =>
        useUserStore().isOrgAdmin(orgId) || useUserStore().isLabManager(orgId, labId),
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
  },

  persist: true,
});

export default useUserStore;
