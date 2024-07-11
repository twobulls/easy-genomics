import { defineNuxtPlugin } from '#app';
import LabsModule from '~/repository/modules/labs';
import OrgsModule from '~/repository/modules/orgs';
import PipelinesModule from '~/repository/modules/pipeline';
import UsersModule from '~/repository/modules/users';

interface IApiInstance {
  labs: LabsModule;
  orgs: OrgsModule;
  users: UsersModule;
  pipelines: PipelinesModule;
}

class FetchOptions {}

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
    pipelines: new PipelinesModule(apiFetcher),
  };

  return {
    provide: {
      api: modules,
    },
  };
});
