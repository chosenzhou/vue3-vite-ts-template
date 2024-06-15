import { defineStore } from 'pinia';
import { useRequest } from 'alova';
import { useAuthStore } from './auth';
import { getUserInfoApi } from '@/services/api/user';
import type { UserInfoModel } from '@/services/model/userModel';

export const useUserStore = defineStore('UserStore', () => {
  const userInfo = ref<UserInfoModel | null>(null);

  const authStore = useAuthStore();

  const { send: _getUserInfo } = useRequest(getUserInfoApi, { initialData: null, immediate: false });
  async function login(params: LoginParams) {
    try {
      await authStore.login(params);
      await getUserInfo();
    } catch (error) {
      console.log(error);
    }
  }

  // 获取用户信息
  async function getUserInfo() {
    try {
      userInfo.value = await _getUserInfo();
    } catch (error) {
      console.log(error);
    }
  }

  return {
    userInfo,
    login,
    getUserInfo,
  };
});
