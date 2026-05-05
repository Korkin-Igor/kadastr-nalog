import { createApp } from 'vue';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/700.css';
import '@fontsource/manrope/800.css';
import { VueRecaptchaPlugin } from 'vue-recaptcha/head';
import App from './App.vue';
import { LANDING_CONTENT_STORE_KEY, landingContentStore } from './app/content/landingContent';
import { registerAppDirectives } from './app/registerDirectives';
import { RECAPTCHA_ENABLED, RECAPTCHA_SITE_KEY } from './app/security/recaptcha';
import router from './router';

const app = createApp(App);

registerAppDirectives(app);

if (RECAPTCHA_ENABLED) {
  app.use(VueRecaptchaPlugin, {
    v3SiteKey: RECAPTCHA_SITE_KEY
  });
}

app.use(router);
app.provide(LANDING_CONTENT_STORE_KEY, landingContentStore);

app.mount('#app');
