import { Organization } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization';
import { useRuntimeConfig } from 'nuxt/app';
import HttpFactory from '../factory';

class OrgsModule extends HttpFactory {
  $config = useRuntimeConfig();
  private RESOURCE = `${this.$config.public.BASE_API_URL}/easy-genomics/organization`;

  async list(): Promise<Organization[] | undefined> {
    const res = this.call<Organization[]>('GET', `${this.RESOURCE}/list-organizations`);

    if (!res) {
      throw new Error('Failed to retrieve list of Organizations');
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
