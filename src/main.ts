import { createSSRApp } from 'vue';
import App from './App.vue';
import 'virtual:uno.css';
import { setupRouter } from './router';
import { setupStore } from './stores';

export function createApp() {
  const app = createSSRApp(App);

  setupStore(app);

  setupRouter(app);

  return {
    app,
  };
}
