import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router';
import './styles/main.scss';

const app = createApp(App);
app.use(router);
app.mount('#app');

// Warm up the upload Cloud Function
fetch('/api/v4/upload?ping=true').catch(() => {});

// Track pageviews with Google Analytics
router.afterEach((to) => {
  if (window.ga) {
    const title = to.path === '/'
      ? 'Home'
      : to.path.slice(1).replace(/\b\w/g, c => c.toUpperCase());
    window.ga?.('set', { page: to.fullPath, title });
    window.ga?.('send', 'pageview');
  }
});
