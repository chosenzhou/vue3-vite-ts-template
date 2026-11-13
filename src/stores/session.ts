import type { UserProfile } from '@/services/model/user';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

const TOKEN_STORAGE_KEY = 'h5_session_token';
type SessionStatus = 'anonymous' | 'unverified' | 'restoring' | 'authenticated';

export const useSessionStore = defineStore('session', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_STORAGE_KEY));
  const user = ref<UserProfile | null>(null);
  const status = ref<SessionStatus>(token.value ? 'unverified' : 'anonymous');
  const version = ref(0);
  const restoreError = ref('');
  const loggedIn = computed(() => status.value === 'authenticated');

  function setSession(nextToken: string, nextUser: UserProfile) {
    version.value += 1;
    token.value = nextToken;
    user.value = nextUser;
    status.value = 'authenticated';
    restoreError.value = '';
    localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
  }

  function clearSession() {
    version.value += 1;
    token.value = null;
    user.value = null;
    status.value = 'anonymous';
    restoreError.value = '';
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  function beginRestore() {
    status.value = 'restoring';
    restoreError.value = '';
  }

  function completeRestore(nextUser: UserProfile) {
    user.value = nextUser;
    status.value = 'authenticated';
  }

  function failRestore(message: string) {
    status.value = 'unverified';
    restoreError.value = message;
  }

  return {
    token,
    user,
    status,
    version,
    restoreError,
    loggedIn,
    setSession,
    clearSession,
    beginRestore,
    completeRestore,
    failRestore,
  };
});
