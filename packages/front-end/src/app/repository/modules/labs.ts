import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import { useRuntimeConfig } from 'nuxt/app';
import HttpFactory from '../factory';

class LabsModule extends HttpFactory {
  $config = useRuntimeConfig();
  private RESOURCE = `${this.$config.public.BASE_API_URL}/easy-genomics/laboratory`;

  async list(orgId: string): Promise<Laboratory> {
    return this.call<Laboratory>('GET', `${this.RESOURCE}/list-laboratories?organizationId=${orgId}`);
  }
}

export default LabsModule;
