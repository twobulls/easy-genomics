import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import { LaboratoryUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-user';
import { useRuntimeConfig } from 'nuxt/app';
import HttpFactory from '../factory';

class LabsModule extends HttpFactory {
  $config = useRuntimeConfig();
  private RESOURCE = `${this.$config.public.BASE_API_URL}/easy-genomics/laboratory`;

  async list(orgId: string): Promise<Laboratory> {
    const res = await this.call<Laboratory>('GET', `${this.RESOURCE}/list-laboratories?organizationId=${orgId}`);

    if (!res) {
      throw new Error('Failed to retrieve Laboratory');
    }

    return res;
  }

  async users(labId: string): Promise<LaboratoryUser> {
    const res = await this.call<LaboratoryUser>(
      'GET',
      `${this.RESOURCE}/user/list-laboratory-users?laboratoryId=${labId}`
    );

    if (!res) {
      throw new Error('Failed to retrieve Laboratory users');
    }

    return res;
  }

  async usersDetails(labId: string): Promise<LaboratoryUser> {
    const res = await this.call<LaboratoryUser>(
      'GET',
      `${this.RESOURCE}/user/list-laboratory-users-details?laboratoryId=${labId}`
    );

    if (!res) {
      throw new Error('Failed to retrieve Laboratory users details');
    }

    return res;
  }
}

export default LabsModule;
