import { startWeComAuthentication } from '@/services/auth';

export function useOAuth() {
  return { start: startWeComAuthentication };
}
