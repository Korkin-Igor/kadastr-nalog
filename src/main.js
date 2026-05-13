import { createApp } from 'vue';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/700.css';
import '@fontsource/manrope/800.css';
import { VueRecaptchaPlugin } from 'vue-recaptcha/head';
import App from './App.vue';
import { LANDING_CONTENT_STORE_KEY, landingContentStore } from './app/content/landingContent';
import { registerAppDirectives } from './app/registerDirectives';
import { getRecaptchaSiteKey, isRecaptchaEnabled, loadRecaptchaConfig } from './app/security/recaptcha';
import router from './router';

async function bootstrap() {
  await loadRecaptchaConfig();

  const app = createApp(App);

  registerAppDirectives(app);

  if (isRecaptchaEnabled()) {
    app.use(VueRecaptchaPlugin, {
      v3SiteKey: getRecaptchaSiteKey()
    });
  }

  app.use(router);
  app.provide(LANDING_CONTENT_STORE_KEY, landingContentStore);

  app.mount('#app');
}

void bootstrap();
