import { defineNuxtPlugin } from '#app';
import LabsModule from '~/repository/modules/labs';
import OrgsModule from '~/repository/modules/orgs';
import UsersModule from '~/repository/modules/users';

interface IApiInstance {
  labs: LabsModule;
  orgs: OrgsModule;
  users: UsersModule;
}

export default defineNuxtPlugin((nuxtApp) => {
  const fetchOptions: FetchOptions = {
    baseURL: nuxtApp.$config.API_BASE_URL,
  };

  const apiFetcher = $fetch.create(fetchOptions);

  // expose any repositories here
  const modules: IApiInstance = {
    labs: new LabsModule(apiFetcher),
    orgs: new OrgsModule(apiFetcher),
    users: new UsersModule(apiFetcher),
  };

  return {
    provide: {
      api: modules,
    },
  };
});
