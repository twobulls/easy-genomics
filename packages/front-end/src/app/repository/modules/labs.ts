import { EditLaboratoryUser } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/laboratory-user';
import { CreateLaboratory, Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import { LaboratoryUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-user';
import { LaboratoryUserDetails } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-user-details';
import { useRuntimeConfig } from 'nuxt/app';
import HttpFactory from '../factory';
import { DeletedResponse } from '~/types/api';

class LabsModule extends HttpFactory {
  $config = useRuntimeConfig();
  private RESOURCE = `${this.$config.public.BASE_API_URL}/easy-genomics/laboratory`;

  async create(org: CreateLaboratory): Promise<Laboratory | undefined> {
    const res = this.call<Laboratory>('POST', `${this.RESOURCE}/create-laboratory`, org);

    if (!res) {
      console.error('Error calling create Laboratory API');
      throw new Error('Failed to create Laboratory');
    }

    return res;
  }

  async list(orgId: string): Promise<Laboratory[]> {
    const res = await this.call<Laboratory[]>('GET', `${this.RESOURCE}/list-laboratories?organizationId=${orgId}`);

    if (!res) {
      console.error('Error calling list Laboratories API');
      throw new Error('Failed to retrieve Laboratory');
    }

    return res;
  }

  async users(labId: string): Promise<LaboratoryUser[]> {
    const res = await this.call<LaboratoryUser[]>(
      'GET',
      `${this.RESOURCE}/user/list-laboratory-users?laboratoryId=${labId}`
    );

    if (!res) {
      console.error('Error calling list Laboratory users API');
      throw new Error('Failed to retrieve Laboratory users');
    }

    return res;
  }

  async removeUser(labId: string, userId: string): Promise<DeletedResponse> {
    console.log(`removeUser; labId: ${labId}; userId: ${userId}`);
    const res = await this.call<DeletedResponse>('POST', `${this.RESOURCE}/user/remove-laboratory-user`, {
      LaboratoryId: labId,
      UserId: userId,
    });

    if (!res) {
      console.error('Error calling remove user from Laboratory API');
      throw new Error('Failed to remove user from Laboratory');
    }

    return res;
  }

  async usersDetails(labId: string): Promise<LaboratoryUserDetails[]> {
    const res = await this.call<LaboratoryUserDetails[]>(
      'GET',
      `${this.RESOURCE}/user/list-laboratory-users-details?laboratoryId=${labId}`
    );

    if (!res) {
      console.error('Error calling list Laboratory users details API');
      throw new Error('Failed to retrieve Laboratory users details');
    }

    return res;
  }

  async editLabUser(userDetails: EditLaboratoryUser): Promise<LaboratoryUser> {
    const { LaboratoryId, UserId, LabManager, LabTechnician } = userDetails;
    const res = await this.call<LaboratoryUser>('POST', `${this.RESOURCE}/user/edit-laboratory-user`, {
      LaboratoryId,
      UserId,
      Status: 'Active',
      LabManager,
      LabTechnician,
    });

    if (!res) {
      console.error('Error calling edit Lab user API');
      throw new Error('Failed to edit Lab user');
    }

    return res;
  }
}

export default LabsModule;
