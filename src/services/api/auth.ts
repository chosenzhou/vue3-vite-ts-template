import type { AuthResponse, LoginRequest } from '@/services/model/auth';
import { request } from '@/services/http';

export function loginWithPassword(payload: LoginRequest) {
  return request.Post<AuthResponse>('/auth/login', payload, {
    meta: { auth: false },
  });
}

export function logout(token: string) {
  return request.Post<void>('/auth/logout', undefined, {
    headers: { Authorization: `Bearer ${token}` },
    meta: { auth: false },
  });
}
