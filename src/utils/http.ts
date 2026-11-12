import { createAlova } from 'alova';
import adapterFetch from 'alova/fetch';
import vueHook from 'alova/vue';
import router from '@/router';
import { createWeComAuthEntry } from '@/services/api';
import { useUserStore } from '@/stores/user';
import { buildState } from '@/utils/oauth';

async function restartAuthentication() {
  const currentRoute = router.currentRoute.value;
  const redirect = currentRoute.name === 'auth-callback'
    ? '/'
    : currentRoute.fullPath;
  await router.replace({
    path: '/',
    query: { auth: 'expired', redirect },
  });

  const { authorizationUrl } = await createWeComAuthEntry({ redirect });
  const url = new URL(authorizationUrl);
  url.searchParams.set('state', buildState(redirect));
  window.location.assign(url.toString());
}

export const request = createAlova({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  statesHook: vueHook,
  requestAdapter: adapterFetch(),
  timeout: 10000,
  beforeRequest(method) {
    const token = useUserStore().token;
    if (token) {
      method.config.headers.Authorization = `Bearer ${token}`;
    }
  },
  async responded(response) {
    if (response.status === 401) {
      useUserStore().clearSession();
      await restartAuthentication();
    }

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const error = new Error(payload?.message || `HTTP ${response.status}`) as ApiError;
      error.status = response.status;
      error.body = payload;
      throw error;
    }

    return payload;
  },
});
