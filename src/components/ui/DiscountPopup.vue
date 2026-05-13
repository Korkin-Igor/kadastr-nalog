<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useRecaptchaAction } from '@/app/security/recaptcha';
import { buildPublicUrl } from '@/app/utils/publicUrl';
import { setPageScrollLock } from '@/app/utils/pageScrollLock';

const SHOW_DELAY_MS = 60_000;
const OFFER_DURATION_MS = 9 * 60 * 1000;
const SESSION_KEY = 'discount-popup-dismissed';

const popupOpen = ref(false);
const isSubmitting = ref(false);
const successMessage = ref('');
const submitError = ref('');
const countdownLeft = ref(OFFER_DURATION_MS);
const form = reactive({
  phone: ''
});
const touched = ref(false);
const maskState = reactive({
  phone: {
    masked: '',
    unmasked: '',
    completed: false
  }
});

const recaptcha = useRecaptchaAction('lead_form_submit');
const route = useRoute();

let showTimeoutId = null;
let countdownIntervalId = null;

const phoneMaskOptions = {
  mask: '+7 (###) ###-##-##',
  eager: true,
  onMaska: (detail) => {
    maskState.phone = detail;
  }
};

const phoneError = computed(() => {
  if (!touched.value) {
    return '';
  }

  if (!form.phone.trim()) {
    return 'Укажите номер телефона.';
  }

  if (!maskState.phone?.completed) {
    return 'Введите номер телефона полностью.';
  }

  return '';
});

const countdownLabel = computed(() => {
  const totalSeconds = Math.max(0, Math.ceil(countdownLeft.value / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
});

watch(popupOpen, (isOpen) => {
  setPageScrollLock('discount-popup', isOpen);

  if (isOpen) {
    startCountdown();
    nextTick(() => {
      document.getElementById('discount-popup-phone')?.focus();
    });
    return;
  }

  stopCountdown();
});

watch(
  () => route.path,
  (path) => {
    if (path === '/admin') {
      clearShowTimer();
      popupOpen.value = false;
      return;
    }

    if (showTimeoutId === null && !popupOpen.value && !shouldSkipPopup()) {
      startShowTimer();
    }
  },
  { immediate: true }
);

function shouldSkipPopup() {
  if (typeof window === 'undefined') {
    return true;
  }

  return window.sessionStorage.getItem(SESSION_KEY) === '1';
}

function markPopupHandled() {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(SESSION_KEY, '1');
}

function startShowTimer() {
  if (shouldSkipPopup()) {
    return;
  }

  showTimeoutId = window.setTimeout(() => {
    popupOpen.value = true;
  }, SHOW_DELAY_MS);
}

function clearShowTimer() {
  if (showTimeoutId !== null) {
    window.clearTimeout(showTimeoutId);
    showTimeoutId = null;
  }
}

function startCountdown() {
  stopCountdown();
  countdownLeft.value = OFFER_DURATION_MS;

  countdownIntervalId = window.setInterval(() => {
    countdownLeft.value -= 1000;

    if (countdownLeft.value <= 0) {
      closePopup();
    }
  }, 1000);
}

function stopCountdown() {
  if (countdownIntervalId !== null) {
    window.clearInterval(countdownIntervalId);
    countdownIntervalId = null;
  }
}

function closePopup() {
  popupOpen.value = false;
  markPopupHandled();
}

function handleWindowKeydown(event) {
  if (event.key === 'Escape' && popupOpen.value) {
    closePopup();
  }
}

function resetMessages() {
  successMessage.value = '';
  submitError.value = '';
}

async function handleSubmit() {
  touched.value = true;
  resetMessages();

  if (phoneError.value) {
    return;
  }

  isSubmitting.value = true;

  const payload = {
    Phone: maskState.phone?.unmasked || form.phone,
    Source: 'Discount popup',
    Offer: 'Чек-лист «5 ошибок при подаче документов» + скидка 10%',
    _formType: 'discount_popup',
    _formTitle: 'Получить чек-лист «5 ошибок при подаче документов» и скидку 10%',
    _timestamp: new Date().toISOString()
  };

  try {
    const recaptchaToken = await recaptcha.execute();

    if (recaptcha.enabled) {
      if (!recaptchaToken) {
        submitError.value = 'Не удалось пройти проверку reCAPTCHA. Обновите страницу и попробуйте снова.';
        isSubmitting.value = false;
        return;
      }

      payload._recaptchaToken = recaptchaToken;
      payload._recaptchaAction = recaptcha.action;
    }
  } catch (error) {
    console.error('reCAPTCHA error:', error);
    submitError.value = 'Не удалось пройти проверку reCAPTCHA. Обновите страницу и попробуйте снова.';
    isSubmitting.value = false;
    return;
  }

  try {
    const response = await fetch(buildPublicUrl('form-handler.php'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    const result = text ? JSON.parse(text) : {};

    if (!response.ok || !result.success) {
      submitError.value = result.error || `Сервер вернул ошибку ${response.status || ''}.`;
      return;
    }

    successMessage.value = 'Заявка принята. Отправим чек-лист «5 ошибок при подаче документов» и зафиксируем скидку 10%.';
    markPopupHandled();

    window.setTimeout(() => {
      popupOpen.value = false;
    }, 1800);
  } catch (error) {
    console.error('Discount popup request failed:', error);
    submitError.value = 'Не удалось отправить заявку. Проверьте соединение и попробуйте снова.';
  } finally {
    isSubmitting.value = false;
  }
}

function markTouched() {
  touched.value = true;
}

onMounted(() => {
  window.addEventListener('keydown', handleWindowKeydown);
});

onBeforeUnmount(() => {
  clearShowTimer();
  stopCountdown();
  setPageScrollLock('discount-popup', false);
  window.removeEventListener('keydown', handleWindowKeydown);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="discount-popup-fade">
      <div
        v-if="popupOpen"
        class="discount-popup-shell"
        role="dialog"
        aria-modal="true"
        aria-labelledby="discount-popup-title"
        @click.self="closePopup"
      >
        <div class="discount-popup">
          <button
            class="discount-popup__close"
            type="button"
            aria-label="Закрыть попап"
            @click="closePopup"
          >
            ×
          </button>

          <div class="discount-popup__eyebrow">Спецпредложение</div>

          <h2 id="discount-popup-title" class="discount-popup__title">
            Оставьте номер — отправим чек-лист «5 ошибок при подаче документов» и скидку 10%
          </h2>

          <p class="discount-popup__lead">
            Подберем полезный материал по налоговым рискам в недвижимости и закрепим скидку на платные сервисы.
          </p>

          <p class="discount-popup__timer">
            Предложение действует еще <strong>{{ countdownLabel }}</strong>
          </p>

          <form class="discount-popup__form" @submit.prevent="handleSubmit">
            <label class="discount-popup__field">
              <input
                id="discount-popup-phone"
                v-model="form.phone"
                v-maska="phoneMaskOptions"
                type="tel"
                autocomplete="tel"
                class="discount-popup__input"
                :class="{ 'discount-popup__input--invalid': phoneError }"
                placeholder="+7 (___) ___-__-__"
                @input="resetMessages"
                @blur="markTouched"
              />
              <span v-if="phoneError" class="discount-popup__error">{{ phoneError }}</span>
            </label>

            <button class="button button--primary discount-popup__submit" type="submit" v-button-wave>
              <span class="button__wave" aria-hidden="true"></span>
              <span class="button__wave-gloss" aria-hidden="true"></span>
              <span class="button__label">
                {{ isSubmitting ? 'Отправка...' : 'Получить чек-лист' }}
              </span>
            </button>
          </form>

          <Transition name="success-fade" appear>
            <p v-if="successMessage" class="discount-popup__success">
              {{ successMessage }}
            </p>
          </Transition>

          <p v-if="submitError" class="discount-popup__error discount-popup__error--submit">
            {{ submitError }}
          </p>

          <p class="discount-popup__recaptcha">
            Этот сайт защищен reCAPTCHA, применяются
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
            и
            <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>
            Google.
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.discount-popup-shell {
  position: fixed;
  inset: 0;
  z-index: 2200;
  display: grid;
  place-items: center;
  padding:
    max(18px, env(safe-area-inset-top))
    clamp(16px, 3vw, 28px)
    max(18px, env(safe-area-inset-bottom));
  background:
    radial-gradient(circle at 50% 0%, rgba(96, 92, 255, 0.14) 0%, rgba(96, 92, 255, 0) 34%),
    rgba(3, 10, 28, 0.78);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.discount-popup {
  position: relative;
  width: min(560px, 100%);
  display: grid;
  gap: 18px;
  padding: clamp(22px, 3vw, 34px);
  border: 1px solid rgba(112, 180, 255, 0.22);
  border-radius: 28px;
  background:
    radial-gradient(circle at top left, rgba(49, 114, 219, 0.18) 0%, rgba(49, 114, 219, 0) 28%),
    radial-gradient(circle at bottom right, rgba(120, 77, 255, 0.16) 0%, rgba(120, 77, 255, 0) 32%),
    linear-gradient(180deg, rgba(246, 249, 255, 0.98) 0%, rgba(233, 240, 255, 0.98) 100%);
  box-shadow:
    0 36px 120px rgba(0, 0, 0, 0.34),
    0 0 0 1px rgba(255, 255, 255, 0.3) inset;
}

.discount-popup__close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid rgba(84, 104, 175, 0.18);
  background: rgba(255, 255, 255, 0.66);
  color: #6c7795;
  font-size: 34px;
  line-height: 1;
  transition:
    transform 220ms ease,
    background-color 220ms ease,
    border-color 220ms ease,
    color 220ms ease;
}

.discount-popup__close:hover {
  transform: translateY(-1px);
  border-color: rgba(84, 104, 175, 0.42);
  background: #ffffff;
  color: #223b67;
}

.discount-popup__eyebrow {
  display: inline-flex;
  align-items: center;
  justify-self: start;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(83, 112, 196, 0.18);
  background: rgba(255, 255, 255, 0.7);
  color: #536fc4;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.discount-popup__title {
  margin: 0;
  color: #20365f;
  font-size: clamp(28px, 3.2vw, 42px);
  line-height: 1.1;
  text-wrap: balance;
}

.discount-popup__lead {
  margin: -4px 0 0;
  color: #5c6f92;
  font-size: 16px;
  line-height: 1.65;
}

.discount-popup__timer {
  margin: 0;
  color: #d74a3a;
  font-size: 15px;
  font-weight: 700;
  text-align: center;
}

.discount-popup__timer strong {
  font-variant-numeric: tabular-nums;
}

.discount-popup__form {
  display: grid;
  gap: 16px;
}

.discount-popup__field {
  display: grid;
  gap: 8px;
}

.discount-popup__input {
  width: 100%;
  min-height: 64px;
  padding: 0 20px;
  border: 1px solid rgba(152, 167, 201, 0.54);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.82);
  color: #20365f;
  font-size: 18px;
  transition:
    border-color 220ms ease,
    box-shadow 220ms ease,
    background-color 220ms ease;
}

.discount-popup__input::placeholder {
  color: #8390ad;
}

.discount-popup__input:focus {
  outline: none;
  border-color: rgba(83, 112, 196, 0.5);
  box-shadow: 0 0 0 4px rgba(83, 112, 196, 0.12);
  background: #ffffff;
}

.discount-popup__input--invalid {
  border-color: rgba(191, 55, 87, 0.68);
  box-shadow: 0 0 0 4px rgba(191, 55, 87, 0.1);
}

.discount-popup__submit {
  width: 100%;
  min-height: 62px;
}

.discount-popup__error,
.discount-popup__success {
  margin: 0;
  font-size: 14px;
  line-height: 1.55;
}

.discount-popup__error {
  color: #b03054;
}

.discount-popup__error--submit,
.discount-popup__success {
  padding: 14px 16px;
  border-radius: 16px;
}

.discount-popup__error--submit {
  background: rgba(191, 55, 87, 0.08);
}

.discount-popup__success {
  background: rgba(36, 166, 106, 0.08);
  color: #146845;
}

.discount-popup__recaptcha {
  margin: -4px 0 0;
  color: rgba(91, 103, 133, 0.82);
  font-size: 11px;
  line-height: 1.45;
}

.discount-popup__recaptcha a {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 0.12em;
}

.discount-popup-fade-enter-active,
.discount-popup-fade-leave-active {
  transition: opacity 320ms ease;
}

.discount-popup-fade-enter-active .discount-popup,
.discount-popup-fade-leave-active .discount-popup {
  transition:
    transform 360ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 360ms ease;
}

.discount-popup-fade-enter-from,
.discount-popup-fade-leave-to {
  opacity: 0;
}

.discount-popup-fade-enter-from .discount-popup,
.discount-popup-fade-leave-to .discount-popup {
  opacity: 0;
  transform: translateY(22px) scale(0.96);
}

@media (max-width: 640px) {
  .discount-popup {
    gap: 16px;
    padding: 22px 18px 18px;
    border-radius: 24px;
  }

  .discount-popup__title {
    font-size: 28px;
  }

  .discount-popup__lead {
    font-size: 15px;
  }

  .discount-popup__input {
    min-height: 58px;
    font-size: 16px;
  }

  .discount-popup__submit {
    min-height: 58px;
  }
}
</style>
