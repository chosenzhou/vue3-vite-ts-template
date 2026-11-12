import type { UserProfile } from '@/services/model';
import { defineStore } from 'pinia';
import { ref } from 'vue';

const TOKEN_STORAGE_KEY = 'wechat-wecom-h5:token';

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_STORAGE_KEY));
  const user = ref<UserProfile | null>(null);
  const loggedIn = ref(Boolean(token.value));

  function setSession(nextToken: string, nextUser: UserProfile) {
    token.value = nextToken;
    user.value = nextUser;
    loggedIn.value = true;
    localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
  }

  function setUser(nextUser: UserProfile) {
    user.value = nextUser;
    loggedIn.value = true;
  }

  function clearSession() {
    token.value = null;
    user.value = null;
    loggedIn.value = false;
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  return {
    token,
    user,
    loggedIn,
    setSession,
    setUser,
    clearSession,
  };
});
