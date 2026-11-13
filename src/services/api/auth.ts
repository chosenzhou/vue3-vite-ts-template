import type { AuthEntryRequest, AuthEntryResponse, AuthResponse } from '@/services/model';
import { request } from '@/services/http';

export function createWeComAuthEntry(payload: AuthEntryRequest) {
  return request.Post<AuthEntryResponse>('/auth/entry', payload, {
    meta: { auth: false },
  });
}

export function loginWithWeCom(code: string) {
  return request.Post<AuthResponse>('/auth/wecom', { code }, {
    meta: { auth: false },
  });
}

export function logout() {
  return request.Post<void>('/auth/logout');
}
