import { CreateOrganization, Organization } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization';
import { OrganizationUserDetails } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user-details';
import { useRuntimeConfig } from 'nuxt/app';
import HttpFactory from '../factory';
import { EditOrganizationUserSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/organization-user';

class OrgsModule extends HttpFactory {
  $config = useRuntimeConfig();

  async create(org: CreateOrganization): Promise<Organization | undefined> {
    const res = this.call<Organization>('POST', '/create-organization', org);

    if (!res) {
      throw new Error('Failed to create Organization');
    }

    return res;
  }

  async list(): Promise<Organization[] | undefined> {
    const res = this.call<Organization[]>('GET', '/list-organizations');

    if (!res) {
      throw new Error('Failed to retrieve list of Organizations');
    }

    return res;
  }

  async usersDetailsFromOrgId(orgId: string): Promise<OrganizationUserDetails[]> {
    const res = await this.call<OrganizationUserDetails[]>(
      'GET',
      `/user/list-organization-users-details?organizationId=${orgId}`
    );

    if (!res) {
      throw new Error('Failed to retrieve Organization users details');
    }

    return res;
  }

  async usersDetailsByUserId(userId: string): Promise<OrganizationUserDetails> {
    const res = await this.call<OrganizationUserDetails>(
      'GET',
      `/user/list-organization-users-details?userId=${userId}`
    );

    if (!res) {
      throw new Error('Failed to retrieve Organization users details');
    }

    return res;
  }

  async orgSettings(orgId: string): Promise<Organization | undefined> {
    const res = this.call<Organization>('GET', `/read-organization/${orgId}`);

    if (!res) {
      throw new Error(`Failed to retrieve Organization ${orgId} settings`);
    }

    return res;
  }

  async editUser(orgId: string, userId: string, status: string, val: boolean): Promise<Organization | undefined> {
    const input = {
      'OrganizationId': orgId,
      'UserId': userId,
      'Status': status,
      'OrganizationAdmin': val,
    };

    try {
      EditOrganizationUserSchema.parse(input);
    } catch (error) {
      throw new Error(`Validation failed: ${error}`);
    }

    const res = this.call<Organization>('POST', '/user/edit-organization-user', input);

    if (!res) {
      throw new Error(`Failed to update user's Org Admin access`);
    }
    return res;
  }

  //
  // async orgSettings(orgId: string): Promise<Organization | undefined> {
  //   const res = this.call<Organization>('GET', `/user/edit-organization-user`);
  //
  //   if (!res) {
  //     throw new Error(`Failed to retrieve Organization ${orgId} settings`);
  //   }
  //
  //   return res;
  // }
}

export default OrgsModule;
