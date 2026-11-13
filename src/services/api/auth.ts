import type { AuthResponse, LoginRequest } from '@/services/model/auth';
import { request } from '@/services/http';

export function loginWithPassword(payload: LoginRequest) {
  return request.Post<AuthResponse>('/auth/login', payload, {
    meta: { auth: false },
  });
}

export function logout() {
  return request.Post<void>('/auth/logout');
}
