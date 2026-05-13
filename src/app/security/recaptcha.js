import { useChallengeV3 } from 'vue-recaptcha/head';

const FALLBACK_RECAPTCHA_SITE_KEY = String(import.meta.env.VITE_RECAPTCHA_SITE_KEY || '').trim();

let recaptchaSiteKey = FALLBACK_RECAPTCHA_SITE_KEY;

function normalizeSiteKey(value) {
  return String(value || '').trim();
}

export function getRecaptchaSiteKey() {
  return recaptchaSiteKey;
}

export function isRecaptchaEnabled() {
  return recaptchaSiteKey.length > 0;
}

export function setRecaptchaSiteKey(value) {
  recaptchaSiteKey = normalizeSiteKey(value);
}

export async function loadRecaptchaConfig() {
  try {
    const response = await fetch('/api/runtime-config.php', {
      headers: {
        Accept: 'application/json'
      },
      credentials: 'same-origin'
    });

    if (!response.ok) {
      throw new Error(`Runtime config request failed with status ${response.status}`);
    }

    const runtimeConfig = await response.json();
    const siteKey = normalizeSiteKey(runtimeConfig?.recaptcha?.siteKey);
    setRecaptchaSiteKey(siteKey);
  } catch {
    setRecaptchaSiteKey(FALLBACK_RECAPTCHA_SITE_KEY);
  }

  return {
    enabled: isRecaptchaEnabled(),
    siteKey: getRecaptchaSiteKey()
  };
}

export function useRecaptchaAction(action) {
  const enabled = isRecaptchaEnabled();
  const challenge = enabled ? useChallengeV3(action) : null;

  return {
    enabled,
    action,
    async execute() {
      if (!challenge) {
        return '';
      }

      return challenge.execute();
    }
  };
}
