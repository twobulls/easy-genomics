import { CreateOrganization, Organization } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization';
import { useRuntimeConfig } from 'nuxt/app';
import HttpFactory from '../factory';
import { OrganizationUserDetails } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user-details';

class OrgsModule extends HttpFactory {
  $config = useRuntimeConfig();
  private RESOURCE = `${this.$config.public.BASE_API_URL}/easy-genomics/organization`;

  async create(org: CreateOrganization): Promise<Organization | undefined> {
    const res = this.call<Organization>('POST', `${this.RESOURCE}/create-organization`, org);

    if (!res) {
      throw new Error('Failed to create Organization');
    }

    return res;
  }

  async list(): Promise<Organization[] | undefined> {
    const res = this.call<Organization[]>('GET', `${this.RESOURCE}/list-organizations`);

    if (!res) {
      throw new Error('Failed to retrieve list of Organizations');
    }

    return res;
  }

  async usersDetails(orgId: string): Promise<OrganizationUserDetails[]> {
    const res = await this.call<OrganizationUserDetails[]>(
      'GET',
      `${this.RESOURCE}/user/list-organization-users-details?organizationId=${orgId}`
    );

    if (!res) {
      throw new Error('Failed to retrieve Organization users details');
    }

    return res;
  }

  async orgSettings(orgId: string): Promise<Organization | undefined> {
    const res = this.call<Organization>('GET', `${this.RESOURCE}/read-organization/${orgId}`);

    if (!res) {
      throw new Error(`Failed to retrieve Organization ${orgId} settings`);
    }

    return res;
  }
}

export default OrgsModule;
