import { RemoveLaboratoryUserSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/laboratory-user';
import { CreateLaboratory, Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import { LaboratoryUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-user';
import { LaboratoryUserDetails } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-user-details';
import { useRuntimeConfig } from 'nuxt/app';
import HttpFactory from '../factory';
import { DeletedResponse, EditUserResponse } from '~/types/api';

class LabsModule extends HttpFactory {
  $config = useRuntimeConfig();

  async create(org: CreateLaboratory): Promise<Laboratory | undefined> {
    const res = this.call<Laboratory>('POST', '/laboratory/create-laboratory', org);

    if (!res) {
      console.error('Error calling create Laboratory API');
      throw new Error('Failed to create Laboratory');
    }

    return res;
  }

  async list(orgId: string): Promise<Laboratory[]> {
    const res = await this.call<Laboratory[]>('GET', `/laboratory/list-laboratories?organizationId=${orgId}`);

    if (!res) {
      console.error('Error calling list Laboratories API');
      throw new Error('Failed to retrieve Laboratory');
    }

    return res;
  }

  async delete(labId: string) {
    const res = await this.call<DeletedResponse>('DELETE', `/laboratory/delete-laboratory/${labId}`);

    if (!res) {
      console.error('Error calling delete Laboratory API');
      throw new Error('Failed to delete Laboratory');
    }

    return res;
  }

  /**
   * Add a user to a laboratory
   * @param labId
   * @param userId
   */
  async addLabUser(labId: string, userId: string): Promise<EditUserResponse> {
    const res = await this.call<EditUserResponse>('POST', '/laboratory/user/add-laboratory-user', {
      LaboratoryId: labId,
      UserId: userId,
      Status: 'Active',
      LabManager: false,
      LabTechnician: true,
    });

    if (!res) {
      throw new Error('Failed to edit Laboratory user');
    }

    return res;
  }

  /**
   * Edit a user's access in a laboratory
   * @param labId
   * @param userId
   * @param isLabManager
   */
  async editUserLabAccess(labId: string, userId: string, isLabManager: boolean): Promise<EditUserResponse> {
    const res = await this.call<EditUserResponse>('POST', '/laboratory/user/edit-laboratory-user', {
      LaboratoryId: labId,
      UserId: userId,
      Status: 'Active',
      LabManager: isLabManager,
      LabTechnician: !isLabManager,
    });

    if (!res) {
      throw new Error("Failed to edit user's Laboratory access");
    }

    return res;
  }

  async listLabUsersByLabId(labId: string): Promise<LaboratoryUser[]> {
    const res = await this.call<LaboratoryUser[]>(
      'GET',
      `/laboratory/user/list-laboratory-users?laboratoryId=${labId}`
    );

    if (!res) {
      console.error('Error calling list Laboratory users API');
      throw new Error('Failed to retrieve Laboratory users');
    }

    return res;
  }

  async listLabUsersByUserId(userId: string): Promise<LaboratoryUser[]> {
    const res = await this.call<LaboratoryUser[]>('GET', `/laboratory/user/list-laboratory-users?userId=${userId}`);

    if (!res) {
      throw new Error('Failed to retrieve Laboratory users');
    }

    return res;
  }

  async removeUser(labId: string, userId: string): Promise<DeletedResponse> {
    const input = {
      LaboratoryId: labId,
      UserId: userId,
    };

    try {
      RemoveLaboratoryUserSchema.parse(input);
    } catch (error) {
      throw new Error(`Validation failed: ${error}`);
    }

    const res = await this.call<DeletedResponse>('POST', '/laboratory/user/remove-laboratory-user', {
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
      `/laboratory/user/list-laboratory-users-details?laboratoryId=${labId}`
    );

    if (!res) {
      console.error('Error calling list Laboratory users details API');
      throw new Error('Failed to retrieve Laboratory users details');
    }

    return res;
  }
}

export default LabsModule;
