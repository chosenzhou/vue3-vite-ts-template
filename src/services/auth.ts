import { createWeComAuthEntry } from '@/services/api/auth';
import { buildState } from '@/utils/oauth';

export async function startWeComAuthentication(redirect = '/') {
  const { authorizationUrl } = await createWeComAuthEntry({ redirect });
  const url = new URL(authorizationUrl);
  url.searchParams.set('state', buildState(redirect));
  window.location.assign(url.toString());
}
