import type { LoginRequest } from '@/services/model/auth';
import { createWeComAuthEntry, loginWithPassword } from '@/services/api/auth';
import { useSessionStore } from '@/stores/session';
import { buildState } from '@/utils/oauth';

export async function signIn(credentials: LoginRequest) {
  const response = await loginWithPassword(credentials);
  if (typeof response?.token !== 'string' || !response.token.trim()
    || typeof response.user?.id !== 'string' || !response.user.id.trim()
    || typeof response.user.displayName !== 'string' || !response.user.displayName.trim()) {
    throw new Error('登录响应无效，请重试。');
  }
  useSessionStore().setSession(response.token, response.user);
}

export async function startWeComAuthentication(redirect = '/') {
  const { authorizationUrl } = await createWeComAuthEntry({ redirect });
  const url = new URL(authorizationUrl);
  url.searchParams.set('state', buildState(redirect));
  window.location.assign(url.toString());
}
