import { User } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
import { useRuntimeConfig } from 'nuxt/app';
import HttpFactory from '../factory';

class UsersModule extends HttpFactory {
  $config = useRuntimeConfig();
  private RESOURCE = `${this.$config.public.BASE_API_URL}/easy-genomics/user`;

  async list(): Promise<User> {
    return this.call<User>('GET', `${this.RESOURCE}/list-users`);
  }
}

export default UsersModule;
