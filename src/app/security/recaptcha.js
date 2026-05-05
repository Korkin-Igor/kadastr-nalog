import { useChallengeV3 } from 'vue-recaptcha/head';

export const RECAPTCHA_SITE_KEY = String(import.meta.env.VITE_RECAPTCHA_SITE_KEY || '').trim();
export const RECAPTCHA_ENABLED = RECAPTCHA_SITE_KEY.length > 0;

export function useRecaptchaAction(action) {
  const challenge = RECAPTCHA_ENABLED ? useChallengeV3(action) : null;

  return {
    enabled: RECAPTCHA_ENABLED,
    action,
    async execute() {
      if (!challenge) {
        return '';
      }

      return challenge.execute();
    }
  };
}
