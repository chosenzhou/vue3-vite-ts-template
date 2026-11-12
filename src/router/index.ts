import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/home/HomeView.vue'),
      meta: { title: '首页' },
    },
    {
      path: '/auth/callback/wecom',
      name: 'auth-callback',
      component: () => import('@/views/auth/OAuthCallbackView.vue'),
      meta: { title: '登录中' },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/profile/ProfileView.vue'),
      meta: { requiresAuth: true, title: '我的' },
    },
    {
      path: '/charts',
      name: 'charts',
      component: () => import('@/views/charts/ChartView.vue'),
      meta: { title: '图表' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/not-found/NotFoundView.vue'),
      meta: { title: '页面不存在' },
    },
  ],
});

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !useUserStore().loggedIn) {
    return {
      path: '/',
      query: { redirect: to.fullPath, auth: 'required' },
    };
  }
  return true;
});

router.afterEach((to) => {
  document.title = to.meta.title
    ? `${to.meta.title} · WeCom H5`
    : 'WeCom H5';
});

export default router;
