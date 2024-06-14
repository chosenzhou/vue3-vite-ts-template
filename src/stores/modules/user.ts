import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useAuthStore } from './auth';

interface UserState {
  id?: string | number
}

export const useUserStore = defineStore('UserStore', () => {
  const user = ref<UserState>({});

  const authStore = useAuthStore();
  async function login(params: LoginParams) {
    try {
      await authStore.login(params);
    } catch (error) {
      console.log(error);
    }
  }

  return {
    user,
    login,
  };
});
