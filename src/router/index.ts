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
      path: '/workbench',
      name: 'workbench',
      component: () => import('@/views/workbench/WorkbenchView.vue'),
      meta: { requiresAuth: true, workbench: true, title: '工作台' },
    },
    {
      path: '/sales',
      name: 'sales',
      component: () => import('@/views/sales/SalesView.vue'),
      meta: { requiresAuth: true, workbench: true, title: '销售数据' },
    },
    {
      path: '/goals',
      name: 'goals',
      component: () => import('@/views/goals/GoalsView.vue'),
      meta: { requiresAuth: true, workbench: true, title: '目标进度' },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/profile/ProfileView.vue'),
      meta: { requiresAuth: true, workbench: true, title: '我的' },
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

// Separate dev-only routes render the real business pages without creating a session.
// Production routes, OAuth callback and the authentication guard are unchanged.
if (import.meta.env.DEV) {
  router.addRoute({
    path: '/__preview',
    redirect: '/__preview/workbench',
    meta: { preview: true, workbench: true },
    children: [
      {
        path: 'workbench',
        name: 'preview-workbench',
        component: () => import('@/views/workbench/WorkbenchView.vue'),
        meta: { title: '工作台' },
      },
      {
        path: 'sales',
        name: 'preview-sales',
        component: () => import('@/views/sales/SalesView.vue'),
        meta: { title: '销售数据' },
      },
      {
        path: 'goals',
        name: 'preview-goals',
        component: () => import('@/views/goals/GoalsView.vue'),
        meta: { title: '目标进度' },
      },
      {
        path: 'profile',
        name: 'preview-profile',
        component: () => import('@/views/profile/ProfileView.vue'),
        meta: { title: '我的' },
      },
    ],
  });
}

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
