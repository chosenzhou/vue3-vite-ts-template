import type { UserProfile } from '@/services/model/user';
import { request } from '@/services/http';

export function getCurrentUser() {
  return request.Get<UserProfile>('/users/me', { cache: 'no-store' });
}
