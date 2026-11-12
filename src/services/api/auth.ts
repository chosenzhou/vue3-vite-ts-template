import type { AuthEntryRequest, AuthEntryResponse, AuthResponse } from '@/services/model';
import { request } from '@/utils/http';

export function createWeComAuthEntry(payload: AuthEntryRequest) {
  return request.Post<AuthEntryResponse>('/auth/entry', payload);
}

export function loginWithWeCom(code: string) {
  return request.Post<AuthResponse>('/auth/wecom', { code });
}

export function logout() {
  return request.Post<void>('/auth/logout');
}
