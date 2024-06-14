import { defineStore } from 'pinia';
import { useRequest } from 'alova';
import { computed, ref } from 'vue';
import { getCache, removeCache, setCache } from '@/utils/cache';
import { TOKEN_KEY } from '@/enums/cacheEnum';
import { login as loginApi, logout as logoutApi } from '@/services/api/auth';

const authenticationScheme = 'Bearer';

export const useAuthStore = defineStore('AuthStore', () => {
  const token = ref<string | null>(null);

  const initToken = () => {
    token.value = getCache<string>(TOKEN_KEY) || null;
  };

  function setToken(value: string | null) {
    setCache(TOKEN_KEY, value);
    token.value = value;
  }

  const getAuthorization = computed(() => {
    return token.value ? `${authenticationScheme} ${token.value}` : '';
  });

  // 登录
  const { send: sendLogin } = useRequest(loginApi, { immediate: false });
  const login = async (params: LoginParams) => {
    try {
      const res = await sendLogin(params);
      setToken(res.token);
    } catch (error) {
      console.log(error);
    }
  };

  // 登出
  const { send: sendLogout } = useRequest(logoutApi, { immediate: false });
  async function logout() {
    try {
      await sendLogout();
      removeCache(TOKEN_KEY);
      token.value = null;
    } catch (err: any) {
      console.error(err);
    }
  }

  // 刷新token
  async function refreshToken() {
    try {
      // const res = await refreshToken();
      // setToken(res.data.access_token);
      // return res.data;
    } catch (err: any) {
      console.error(err);
    }
  }

  return {
    token,
    initToken,
    setToken,
    getAuthorization,
    login,
    logout,
    refreshToken,
  };
});
