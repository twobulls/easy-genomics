import { defineNuxtPlugin } from '#app';
import FileModule from '@FE/repository/modules/file';
import InfraModules from '@FE/repository/modules/infra';
import LabsModule from '@FE/repository/modules/labs';
import NextFlowPipelinesModule from '@FE/repository/modules/nextflow-pipelines';
import NextFlowRunsModules from '@FE/repository/modules/nextflow-runs';
import OrgsModule from '@FE/repository/modules/orgs';
import UploadsModule from '@FE/repository/modules/uploads';
import UsersModule from '@FE/repository/modules/users';

interface IApiInstance {
  file: FileModule;
  infra: InfraModules;
  labs: LabsModule;
  orgs: OrgsModule;
  nextFlowPipelines: NextFlowPipelinesModule;
  nextFlowRuns: NextFlowRunsModules;
  uploads: UploadsModule;
  users: UsersModule;
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
  nextFlowPipelines: new NextFlowPipelinesModule(apiFetcher),
  nextFlowRuns: new NextFlowRunsModules(apiFetcher),
  uploads: new UploadsModule(apiFetcher),
  users: new UsersModule(apiFetcher),
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
