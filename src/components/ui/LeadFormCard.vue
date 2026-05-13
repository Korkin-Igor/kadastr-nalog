<script setup>
import { reactive, ref } from 'vue';
import { useRecaptchaAction } from '@/app/security/recaptcha';
import { buildPublicUrl } from '@/app/utils/publicUrl';

const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
  fields: { type: Array, required: true },
  submitLabel: { type: String, required: true },
  successText: { type: String, default: 'Форма отправлена.' },
  icon: { type: String, default: '' },
  badgeText: { type: String, default: '' },
  variant: { type: String, default: 'default' },
  note: { type: String, default: '' },
  noteIcon: { type: String, default: '' },
  formType: { type: String, default: 'general' },
  actionUrl: { type: String, default: 'form-handler.php' },
  showBackLink: { type: Boolean, default: false },
  backLinkLabel: { type: String, default: 'Назад к сервисам' },
  backLinkHref: { type: String, default: '/#useful' },
  submittingLabel: { type: String, default: 'Отправка...' },
  requiredSelectMessage: { type: String, default: 'Выберите значение из списка.' },
  requiredFieldMessage: { type: String, default: 'Заполните поле.' },
  phoneIncompleteMessage: { type: String, default: 'Введите номер телефона полностью.' },
  emailInvalidMessage: { type: String, default: 'Введите email в формате name@example.com.' },
  cadastralInvalidMessage: { type: String, default: 'Формат: 00:00:0000000:00' },
  submitFailedMessage: { type: String, default: 'Не удалось отправить заявку. Попробуйте позже.' },
  networkFailedMessage: { type: String, default: 'Ошибка соединения с сервером.' }
});

const form = reactive(
  props.fields.reduce((acc, field) => {
    acc[field.name] = '';
    return acc;
  }, {})
);

const errors = reactive({});
const touched = reactive({});
const maskState = reactive({});
const successMessage = ref('');
const isLoading = ref(false);
const recaptcha = useRecaptchaAction('lead_form_submit');

props.fields.forEach((field) => {
  errors[field.name] = '';
  touched[field.name] = false;

  if (field.type === 'tel' || field.type === 'cadastral') {
    maskState[field.name] = { masked: '', unmasked: '', completed: false };
  }
});

const maskOptions = props.fields.reduce((acc, field) => {
  if (field.type === 'tel') {
    acc[field.name] = {
      mask: '+7 (###) ###-##-##',
      eager: true,
      onMaska: (detail) => {
        maskState[field.name] = detail;
      }
    };
  }

  if (field.type === 'cadastral') {
    acc[field.name] = {
      mask: [
        '##:##:######:##',
        '##:##:#######:##'
      ],
      eager: true,
      onMaska: (detail) => {
        maskState[field.name] = detail;
      }
    };
  }

  return acc;
}, {});

function validateField(field) {
  const value = typeof form[field.name] === 'string' ? form[field.name].trim() : form[field.name];

  if (field.required && !value) {
    return field.type === 'select' ? props.requiredSelectMessage : props.requiredFieldMessage;
  }

  if (field.type === 'tel' && value && !maskState[field.name]?.completed) {
    return props.phoneIncompleteMessage;
  }

  if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(value)) {
    return props.emailInvalidMessage;
  }

  if (field.type === 'cadastral' && value && !/^\d{2}:\d{2}:\d{6,7}:\d{2}$/u.test(value)) {
    return props.cadastralInvalidMessage;
  }

  return '';
}

function touchField(field) {
  touched[field.name] = true;
  errors[field.name] = validateField(field);
}

function prepareDataForSend() {
  const data = { ...form };

  props.fields.forEach((field) => {
    if ((field.type === 'tel' || field.type === 'cadastral') && maskState[field.name]?.unmasked) {
      data[field.name] = maskState[field.name].unmasked;
    }
  });

  data._formType = props.formType;
  data._formTitle = props.title;
  data._timestamp = new Date().toISOString();

  return data;
}

async function handleSubmit() {
  successMessage.value = '';
  let hasError = false;

  props.fields.forEach((field) => {
    touched[field.name] = true;
    errors[field.name] = validateField(field);

    if (errors[field.name]) {
      hasError = true;
    }
  });

  if (hasError) {
    return;
  }

  isLoading.value = true;
  const payload = prepareDataForSend();

  try {
    const recaptchaToken = await recaptcha.execute();

    if (recaptcha.enabled) {
      if (!recaptchaToken) {
        isLoading.value = false;
        window.alert('Не удалось проверить reCAPTCHA. Обновите страницу и попробуйте снова.');
        return;
      }

      payload._recaptchaToken = recaptchaToken;
      payload._recaptchaAction = recaptcha.action;
    }
  } catch (error) {
    console.error('reCAPTCHA error:', error);
    window.alert('Не удалось проверить reCAPTCHA. Обновите страницу и попробуйте снова.');
    isLoading.value = false;
    return;
  }

  try {
    const response = await fetch(buildPublicUrl(props.actionUrl), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    const text = await response.text();
    let result = {};

    if (text) {
      try {
        result = JSON.parse(text);
      } catch (parseError) {
        console.error('Invalid JSON response:', text, parseError);
        window.alert('Сервер вернул некорректный ответ. Проверьте PHP-логи на хостинге.');
        return;
      }
    }

    if (response.ok && result.success) {
      successMessage.value = props.successText;

      props.fields.forEach((field) => {
        form[field.name] = '';
        touched[field.name] = false;
        errors[field.name] = '';

        if (field.type === 'tel' || field.type === 'cadastral') {
          maskState[field.name] = { masked: '', unmasked: '', completed: false };
        }
      });
    } else {
      console.error('Server error:', result);
      window.alert(
        result.error ||
          (response.status
            ? `Сервер вернул ошибку ${response.status}. Проверьте PHP-обработчик формы.`
            : props.submitFailedMessage)
      );
    }
  } catch (error) {
    console.error('Network error:', error);
    window.alert(props.networkFailedMessage);
  } finally {
    isLoading.value = false;
  }
}

function autocompleteFor(field) {
  if (field.autocomplete) return field.autocomplete;
  if (field.type === 'tel') return 'tel';
  if (field.type === 'email') return 'email';
  return 'off';
}
</script>

<template>
  <form class="form-card" :class="`form-card--${variant}`" @submit.prevent="handleSubmit">
    <div v-if="showBackLink" class="form-card__back-wrapper">
      <RouterLink :to="backLinkHref" class="form-card__back-btn">← {{ backLinkLabel }}</RouterLink>
    </div>
    <div v-else-if="badgeText" class="form-card__chip">
      {{ badgeText }}
    </div>

    <div class="form-card__heading">
      <div class="form-card__heading-top">
        <div v-if="icon && variant !== 'checklist'" class="form-card__icon">
          <img :src="icon" alt="" aria-hidden="true" />
        </div>
        <h3 class="form-card__title">{{ title }}</h3>
      </div>
      <p class="form-card__description">{{ description }}</p>
    </div>

    <div class="form-card__fields">
      <label v-for="field in fields" :key="field.name" class="form-field">
        <span class="form-field__label">{{ field.label }}</span>

        <select
          v-if="field.type === 'select'"
          v-model="form[field.name]"
          class="form-field__control form-field__control--select"
          :class="{ 'form-field__control--invalid': touched[field.name] && errors[field.name] }"
          @blur="touchField(field)"
          @change="touchField(field)"
        >
          <option value="" disabled>{{ field.placeholder }}</option>
          <option v-for="option in field.options" :key="option" :value="option">
            {{ option }}
          </option>
        </select>

        <textarea
          v-else-if="field.type === 'textarea'"
          v-model="form[field.name]"
          class="form-field__control form-field__control--textarea"
          :class="{ 'form-field__control--invalid': touched[field.name] && errors[field.name] }"
          :placeholder="field.placeholder"
          :autocomplete="autocompleteFor(field)"
          :rows="field.rows || 4"
          @blur="touchField(field)"
        ></textarea>

        <input
          v-else
          v-model="form[field.name]"
          :type="field.type === 'tel' ? 'tel' : field.type === 'email' ? 'email' : 'text'"
          class="form-field__control"
          :class="{ 'form-field__control--invalid': touched[field.name] && errors[field.name] }"
          :placeholder="field.placeholder"
          :autocomplete="autocompleteFor(field)"
          v-maska="maskOptions[field.name]"
          @blur="touchField(field)"
        />

        <span v-if="touched[field.name] && errors[field.name]" class="form-field__error">
          {{ errors[field.name] }}
        </span>
      </label>
    </div>

    <button class="button button--primary form-card__submit" type="submit" v-button-wave>
      <span class="button__wave" aria-hidden="true"></span>
      <span class="button__wave-gloss" aria-hidden="true"></span>
      <span class="button__label">
        {{ isLoading ? submittingLabel : submitLabel }}
      </span>
    </button>

    <Transition name="success-fade" appear>
      <p v-if="successMessage" class="form-card__success">{{ successMessage }}</p>
    </Transition>

    <p class="form-card__recaptcha">
      Этот сайт защищён reCAPTCHA, применяются
      <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
        Privacy Policy
      </a>
      и
      <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">
        Terms of Service
      </a>
      Google.
    </p>

    <div v-if="note" class="form-card__note">
      <img v-if="noteIcon" :src="noteIcon" alt="" aria-hidden="true" />
      <span>{{ note }}</span>
    </div>
  </form>
</template>

<style scoped>
.form-card__back-btn {
  color: #5468af;
  font-weight: 600;
}

.form-card__recaptcha {
  margin: -4px 0 0;
  color: rgba(91, 103, 133, 0.78);
  font-size: 11px;
  line-height: 1.45;
}

.form-card__recaptcha a {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 0.12em;
}
</style>
