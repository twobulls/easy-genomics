import { defineNuxtPlugin } from '#app';
import FileModule from '@FE/repository/modules/file';
import InfraModules from '@FE/repository/modules/infra';
import LabsModule from '@FE/repository/modules/labs';
import OrgsModule from '@FE/repository/modules/orgs';
import PipelinesModule from '@FE/repository/modules/pipelines';
import UploadsModule from '@FE/repository/modules/uploads';
import UsersModule from '@FE/repository/modules/users';
import WorkflowsModules from '@FE/repository/modules/workflows';

interface IApiInstance {
  file: FileModule;
  infra: InfraModules;
  labs: LabsModule;
  orgs: OrgsModule;
  pipelines: PipelinesModule;
  uploads: UploadsModule;
  users: UsersModule;
  workflows: WorkflowsModules;
}

interface FetchOptions {
  baseURL: string;
}

const createFetchOptions = (nuxtApp): FetchOptions => ({
  baseURL: nuxtApp.$config.public.BASE_API_URL,
});

const createApiInstance = (apiFetcher: any): IApiInstance => ({
  file: new FileModule(apiFetcher),
  infra: new InfraModules(apiFetcher),
  labs: new LabsModule(apiFetcher),
  orgs: new OrgsModule(apiFetcher),
  pipelines: new PipelinesModule(apiFetcher),
  uploads: new UploadsModule(apiFetcher),
  users: new UsersModule(apiFetcher),
  workflows: new WorkflowsModules(apiFetcher),
});

export default defineNuxtPlugin((nuxtApp) => {
  const fetchOptions: FetchOptions = createFetchOptions(nuxtApp);
  const apiFetcher = $fetch.create(fetchOptions);
  const modules: IApiInstance = createApiInstance(apiFetcher);

  return {
    provide: {
      api: modules,
    },
  };
});
