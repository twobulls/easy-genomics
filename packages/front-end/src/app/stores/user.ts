import { OrganizationAccess } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
import { defineStore } from 'pinia';

interface UserStoreState {
  currentOrg: {
    OrganizationId: string;
    OrganizationName: string;
  };
  currentUserPermissions: {
    isSuperuser: boolean | null;
    orgPermissions: OrganizationAccess | null;
  };
}

const initialState = (): UserStoreState => ({
  currentOrg: {
    OrganizationId: '',
    OrganizationName: '',
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
    currentOrgName: (state) => state.currentOrg.OrganizationName,
    currentOrgId: (state) => state.currentOrg.OrganizationId,
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
      this.currentUserPermissions = parsedOrgAccess;
    },

    isSuperuser(): boolean {
      return !!this.currentUserPermissions.isSuperuser;
    },
    isOrgAdmin(orgId: string): boolean {
      return !!this.currentUserPermissions.orgPermissions?.[orgId].OrganizationAdmin;
    },
    isLabMember(orgId: string, labId: string): boolean {
      return !!this.currentUserPermissions.orgPermissions?.[orgId].LaboratoryAccess?.[labId];
    },
    isLabManager(orgId: string, labId: string): boolean {
      return !!this.currentUserPermissions.orgPermissions?.[orgId].LaboratoryAccess?.[labId].LabManager;
    },
    mayEditOrg(orgId: string): boolean {
      return this.isSuperuser() || this.isOrgAdmin(orgId);
    },
    mayCreateLab(orgId: string): boolean {
      return this.isSuperuser() || this.isOrgAdmin(orgId);
    },
    mayViewLab(orgId: string, labId: string): boolean {
      return this.isSuperuser() || this.isLabMember(orgId, labId);
    },
    mayEditLab(orgId: string, labId: string): boolean {
      return this.isSuperuser() || this.isLabManager(orgId, labId);
    },
    mayDeleteLab(orgId: string): boolean {
      return this.isSuperuser() || this.isOrgAdmin(orgId);
    },
  },

  persist: true,
});

export default useUserStore;
