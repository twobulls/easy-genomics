import { defineNuxtPlugin } from '#app';
import LabsModule from '~/repository/modules/labs';

interface IApiInstance {
  labs: LabsModule;
}

export default defineNuxtPlugin((nuxtApp) => {
  const fetchOptions: FetchOptions = {
    baseURL: nuxtApp.$config.API_BASE_URL,
  };

  const apiFetcher = $fetch.create(fetchOptions);

  // expose any repositories here
  const modules: IApiInstance = {
    labs: new LabsModule(apiFetcher),
  };

  return {
    provide: {
      api: modules,
    },
  };
});
