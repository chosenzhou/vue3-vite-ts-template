import type { UserProfile } from '@/services/model/user';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

const TOKEN_STORAGE_KEY = 'h5_session_token';
type SessionStatus = 'anonymous' | 'unverified' | 'authenticated';

export const useSessionStore = defineStore('session', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_STORAGE_KEY));
  const user = ref<UserProfile | null>(null);
  const status = ref<SessionStatus>(token.value ? 'unverified' : 'anonymous');
  const version = ref(0);
  const loggedIn = computed(() => status.value === 'authenticated');

  function setSession(nextToken: string, nextUser: UserProfile) {
    version.value += 1;
    token.value = nextToken;
    user.value = nextUser;
    status.value = 'authenticated';
    localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
  }

  function clearSession() {
    version.value += 1;
    token.value = null;
    user.value = null;
    status.value = 'anonymous';
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  return {
    token,
    user,
    status,
    version,
    loggedIn,
    setSession,
    clearSession,
  };
});
