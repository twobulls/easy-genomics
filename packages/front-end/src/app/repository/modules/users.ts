import { User } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
import { useRuntimeConfig } from 'nuxt/app';
import HttpFactory from '../factory';

class UsersModule extends HttpFactory {
  $config = useRuntimeConfig();

  async list(): Promise<User | undefined> {
    return this.call<User>('GET', '/user/list-users');
  }

  async invite(orgId: string, email: string): Promise<User | undefined> {
    return this.call<User>('POST', '/user/create-user-invite', {
      Email: email,
      OrganizationId: orgId,
    });
  }
}

export default UsersModule;
