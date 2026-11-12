import { createWeComAuthEntry } from '@/services/api';
import { buildState } from '@/utils/oauth';

export function useOAuth() {
  async function start(redirect = '/') {
    const { authorizationUrl } = await createWeComAuthEntry({ redirect });
    const url = new URL(authorizationUrl);
    url.searchParams.set('state', buildState(redirect));
    window.location.assign(url.toString());
  }

  return { start };
}
