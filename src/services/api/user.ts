import type { UserProfile } from '@/services/model';
import { request } from '@/utils/http';

export function getCurrentUser() {
  return request.Get<UserProfile>('/users/me');
}
