import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import HttpFactory from '../factory';
const MOCK_ORG_ID = '';

class LabsModule extends HttpFactory {
  private RESOURCE = `${process.env.BASE_API_URL}/easy-genomics/laboratory`;

  async list(): Promise<Laboratory> {
    return this.call<Laboratory>('GET', `${this.RESOURCE}/list-laboratories?organizationId=${MOCK_ORG_ID}`);
  }
}

export default LabsModule;
