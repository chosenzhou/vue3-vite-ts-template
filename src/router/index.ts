import { ref } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { restoreSession } from '@/services/auth';
import { useSessionStore } from '@/stores/session';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/home/HomeView.vue'),
      meta: { requiresAuth: true, title: '首页' },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/login/LoginView.vue'),
      meta: { title: '登录' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/not-found/NotFoundView.vue'),
      meta: { title: '页面不存在' },
    },
  ],
});

export const pendingSessionRoute = ref<string | null>(null);

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) {
    pendingSessionRoute.value = null;
    return true;
  }
  const session = useSessionStore();
  if (!session.loggedIn && session.token) {
    pendingSessionRoute.value = to.fullPath;
    try {
      await restoreSession();
    }
    catch {
      return false;
    }
    if (pendingSessionRoute.value === to.fullPath) {
      pendingSessionRoute.value = null;
    }
  }
  if (!session.loggedIn) {
    return {
      path: '/login',
      query: { redirect: to.fullPath },
    };
  }
  return true;
});

router.afterEach((to) => {
  document.title = to.meta.title
    ? `${to.meta.title} · H5`
    : 'H5';
});

export default router;
