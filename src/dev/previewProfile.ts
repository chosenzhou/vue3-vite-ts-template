import type { UserProfile } from '@/services/model';

// Imported only by the development preview; never stored as an authenticated session.
export const previewProfile: UserProfile = {
  id: 'design-preview',
  displayName: '陈志远',
  provider: 'wecom',
};
