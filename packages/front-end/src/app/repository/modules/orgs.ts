import { Organization } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization';
import { useRuntimeConfig } from 'nuxt/app';
import HttpFactory from '../factory';

class OrgsModule extends HttpFactory {
  $config = useRuntimeConfig();
  private RESOURCE = `${this.$config.public.BASE_API_URL}/easy-genomics/organization`;

  async list(): Promise<Organization> {
    return this.call<Organization>('GET', `${this.RESOURCE}/list-organizations`);
  }
}

export default OrgsModule;
