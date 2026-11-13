import { createPinia } from 'pinia';
import { Quasar } from 'quasar';
import langZhCn from 'quasar/lang/zh-CN';
import { createApp } from 'vue';
import { startWeComAuthentication } from '@/services/auth';
import { configureHttpAuth } from '@/services/http';
import { useUserStore } from '@/stores/user';
import App from './App.vue';
import router from './router';
import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/src/css/index.sass';
import '@/assets/styles/main.scss';

const app = createApp(App);

app.use(Quasar, {
  lang: langZhCn,
  plugins: {},
});
app.use(createPinia());

configureHttpAuth({
  getToken: () => useUserStore().token,
  async onUnauthorized() {
    const currentRoute = router.currentRoute.value;
    const redirect = currentRoute.name === 'auth-callback'
      ? '/'
      : currentRoute.fullPath;
    useUserStore().clearSession();
    await router.replace({
      path: '/',
      query: { auth: 'expired', redirect },
    });
    await startWeComAuthentication(redirect);
  },
});

app.use(router);

app.mount('#app');
