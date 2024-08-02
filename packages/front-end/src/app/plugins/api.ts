import { defineNuxtPlugin } from '#app';
import LabsModule from '~/repository/modules/labs';
import OrgsModule from '~/repository/modules/orgs';
import PipelinesModule from '~/repository/modules/pipelines';
import UploadsModule from '~/repository/modules/uploads';
import UsersModule from '~/repository/modules/users';
import WorkflowsModules from '~/repository/modules/workflows';

interface IApiInstance {
  labs: LabsModule;
  orgs: OrgsModule;
  pipelines: PipelinesModule;
  uploads: UploadsModule;
  users: UsersModule;
  workflows: WorkflowsModules;
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
    pipelines: new PipelinesModule(apiFetcher),
    uploads: new UploadsModule(apiFetcher),
    users: new UsersModule(apiFetcher),
    workflows: new WorkflowsModules(apiFetcher),
  };

  return {
    provide: {
      api: modules,
    },
  };
});
