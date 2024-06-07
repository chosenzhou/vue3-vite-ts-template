import { defineMock } from '@alova/mock';
import { join, sampleSize } from 'lodash-es';
import { createMock } from '@/mock/utils';
import { ResultEnum } from '@/enums/httpEnum';

function createRandomToken(len = 36 * 6) {
  const token = join(sampleSize('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ._-', len), '');
  return `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.${token}`;
}

export const authMocks = defineMock({
  // 登录
  '[POST]/api/login': (params) => {
    const { email, password } = params.data;
    if (email === 'uni-app@test.com' && (password === 'Vue3_Ts_Vite' || password === '123456')) {
      const token = createRandomToken();
      return createMock({ data: { token } });
    }
    console.log('模拟登录');
    return createMock({ data: [], code: ResultEnum.FAIL, message: '邮箱或密码错误' });
  },
});
