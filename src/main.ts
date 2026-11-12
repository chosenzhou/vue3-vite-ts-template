import { createPinia } from 'pinia';
import { Quasar } from 'quasar';
import langZhCn from 'quasar/lang/zh-CN';
import { createApp } from 'vue';
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
app.use(router);

app.mount('#app');
