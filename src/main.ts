import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router';
import './styles/main.scss';

const app = createApp(App);
app.use(router);
app.mount('#app');

console.log(
  '%c static.md %c Free image hosting',
  'background: #267cdb; color: white; padding: 2px 8px; border-radius: 2px; font-family: monospace; font-weight: bold',
  'color: inherit; font-family: monospace'
);

// Warm up the upload Cloud Function
fetch('/api/v4/upload?ping=true').catch(() => {});
