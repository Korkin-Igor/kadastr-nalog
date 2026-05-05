<script setup>
import { computed, onMounted, reactive } from 'vue';
import { RouterLink } from 'vue-router';
import { LANDING_CONTENT_LOCKED_PATHS, useLandingContent } from '@/app/content/landingContent';
import { useRecaptchaAction } from '@/app/security/recaptcha';
import AdminAssetField from '@/components/admin/AdminAssetField.vue';
import AdminContentEditor from '@/components/admin/AdminContentEditor.vue';
import AdminSocialsEditor from '@/components/admin/AdminSocialsEditor.vue';
import { createDefaultLandingData } from '@/data/data';

const {
  landingData,
  resetLandingData,
  ensureAdminSessionChecked,
  loginAdmin,
  logoutAdmin,
  changeAdminPassword,
  status
} = useLandingContent();

const defaultLandingData = createDefaultLandingData();
const loginRecaptcha = useRecaptchaAction('admin_login');
const credentials = reactive({
  username: '',
  password: ''
});
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});
const passwordFeedback = reactive({
  message: '',
  isError: false
});

const contentSections = [
  {
    key: 'heroContent',
    title: 'Первый экран и видео',
    description: 'Главный заголовок, описание, кнопки и основное видео.',
    defaultOpen: true
  },
  {
    key: 'reviewsSection',
    title: 'Заголовок блока отзывов',
    description: 'Заголовок секции с отзывами.',
    defaultOpen: true
  },
  {
    key: 'reviews',
    title: 'Отзывы',
    description: 'Можно добавлять, удалять и менять отзывы полностью.',
    defaultOpen: true
  },
  {
    key: 'brand',
    title: 'Бренд и логотип',
    description: 'Название компании и логотип в шапке и подвале.',
    defaultOpen: false
  },
  {
    key: 'navigation',
    title: 'Пункты меню',
    description: 'Названия пунктов верхнего меню.',
    defaultOpen: false
  },
  {
    key: 'headerContent',
    title: 'Шапка сайта',
    description: 'Тексты кнопок и меню в шапке.',
    defaultOpen: false
  },
  {
    key: 'ideaSection',
    title: 'Блок «Три идеи»',
    description: 'Заголовок, описание, подпись и пункты.',
    defaultOpen: false
  },
  {
    key: 'offerMeta',
    title: 'Блок «Что мы можем предложить»',
    description: 'Заголовок и абзацы вступительного текста.',
    defaultOpen: false
  },
  {
    key: 'offerCards',
    title: 'Карточки предложения',
    description: 'Тексты карточек в блоке предложения.',
    defaultOpen: false
  },
  {
    key: 'freeServicesSection',
    title: 'Заголовок бесплатных сервисов',
    description: 'Название секции с бесплатными сервисами.',
    defaultOpen: false
  },
  {
    key: 'freeServiceForms',
    title: 'Карточки бесплатных сервисов',
    description: 'Заголовки, описания и тексты кнопок.',
    defaultOpen: false
  },
  {
    key: 'checklistContent',
    title: 'Чек-лист',
    description: 'Тексты блока чек-листа и формы.',
    defaultOpen: false
  },
  {
    key: 'dualSection',
    title: 'Блок «Что можно проверить»',
    description: 'Заголовок, описание и список пунктов.',
    defaultOpen: false
  },
  {
    key: 'importantSection',
    title: 'Блок «Важно знать»',
    description: 'Основной текст и карточки блока.',
    defaultOpen: false
  },
  {
    key: 'usefulSection',
    title: 'Полезные сервисы',
    description: 'Заголовок, описание и тексты карточек.',
    defaultOpen: false
  },
  {
    key: 'footerGroups',
    title: 'Колонки в подвале',
    description: 'Названия колонок и ссылок в подвале.',
    defaultOpen: false
  },
  {
    key: 'footerContent',
    title: 'Подвал, соцсети и сертификат',
    description: 'Контакты, сертификат или билет, документы и соцсети в подвале.',
    defaultOpen: false
  }
];

const statusLabel = computed(() => {
  if (!status.isReady) {
    return 'Загружаем контент сайта…';
  }

  if (status.isCheckingSession) {
    return 'Проверяем доступ в админку…';
  }

  if (status.authErrorMessage) {
    return `Ошибка авторизации: ${status.authErrorMessage}`;
  }

  if (!status.isAuthenticated) {
    return 'Войдите, чтобы менять контент и сохранять его в базу данных.';
  }

  if (status.isSaving) {
    return 'Сохраняем изменения в базу данных…';
  }

  if (status.errorMessage) {
    return `Ошибка: ${status.errorMessage}`;
  }

  if (!status.lastSavedAt) {
    return 'После входа изменения сохраняются автоматически в базу данных.';
  }

  const savedAt = new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit'
  }).format(new Date(status.lastSavedAt));

  return `Последнее автосохранение: ${savedAt}`;
});

function handleReset() {
  if (!window.confirm('Сбросить все изменения и вернуть стандартный текст сайта?')) {
    return;
  }

  resetLandingData();
}

function resetPasswordForm() {
  passwordForm.currentPassword = '';
  passwordForm.newPassword = '';
  passwordForm.confirmPassword = '';
}

function setPasswordFeedback(message, isError) {
  passwordFeedback.message = message;
  passwordFeedback.isError = isError;
}

async function handleLogin() {
  try {
    const recaptchaToken = await loginRecaptcha.execute();
    const payload = {
      username: credentials.username.trim(),
      password: credentials.password
    };

    if (loginRecaptcha.enabled) {
      if (!recaptchaToken) {
        status.authErrorMessage = 'Не удалось пройти проверку reCAPTCHA. Обновите страницу и попробуйте снова.';
        return;
      }

      payload.recaptchaToken = recaptchaToken;
      payload.recaptchaAction = loginRecaptcha.action;
    }

    await loginAdmin({
      ...payload
    });
    credentials.password = '';
    setPasswordFeedback('', false);
  } catch {
    if (!status.authErrorMessage) {
      status.authErrorMessage = 'Не удалось выполнить проверку reCAPTCHA. Попробуйте ещё раз.';
    }

    // Сообщение уже попадает в status.authErrorMessage.
  }
}

async function handleChangePassword() {
  setPasswordFeedback('', false);

  if (
    !passwordForm.currentPassword.trim()
    || !passwordForm.newPassword.trim()
    || !passwordForm.confirmPassword.trim()
  ) {
    setPasswordFeedback('Заполните текущий пароль, новый пароль и подтверждение.', true);
    return;
  }

  if (passwordForm.newPassword.length < 8) {
    setPasswordFeedback('Новый пароль должен содержать минимум 8 символов.', true);
    return;
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    setPasswordFeedback('Подтверждение не совпадает с новым паролем.', true);
    return;
  }

  try {
    await changeAdminPassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    });

    resetPasswordForm();
    setPasswordFeedback('Пароль успешно обновлён.', false);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Не удалось сменить пароль.';
    setPasswordFeedback(message, true);
  }
}

async function handleLogout() {
  await logoutAdmin();
  resetPasswordForm();
  setPasswordFeedback('', false);
}

onMounted(() => {
  void ensureAdminSessionChecked();
});
</script>

<template>
  <main class="admin-page">
    <section class="section admin-page__section">
      <div class="container admin-page__stack">
        <header class="admin-page__hero">
          <div class="admin-page__hero-copy">
            <p class="eyebrow">Простая админка</p>
            <h1>Меняйте тексты, отзывы, логотип и файлы через вход в админку</h1>
            <p>
              Контент сайта загружается с сервера, а после входа изменения автоматически
              сохраняются в базу данных.
            </p>
          </div>

          <div class="admin-page__hero-actions">
            <RouterLink to="/" class="button button--light">
              Открыть сайт
            </RouterLink>
            <button
              v-if="status.isAuthenticated"
              class="button button--light"
              type="button"
              @click="handleReset"
            >
              Сбросить изменения
            </button>
            <button
              v-if="status.isAuthenticated"
              class="button button--light"
              type="button"
              @click="handleLogout"
            >
              Выйти
            </button>
          </div>
        </header>

        <p
          class="admin-page__status"
          :class="{ 'admin-page__status--error': status.errorMessage || status.authErrorMessage }"
        >
          {{ statusLabel }}
        </p>

        <section v-if="!status.isAuthenticated" class="admin-login">
          <div class="admin-login__card">
            <h2>Вход в админку</h2>
            <p>
              Используйте логин и пароль из таблицы <code>admin_users</code>. Без входа редактирование
              и сохранение отключены.
            </p>
            <p>
              Проверка выполняется через невидимую <code>reCAPTCHA v3</code>, поэтому отдельного
              чекбокса на странице нет.
            </p>

            <form class="admin-login__form" @submit.prevent="handleLogin">
              <label class="admin-login__field">
                <span>Логин</span>
                <input
                  v-model="credentials.username"
                  type="text"
                  autocomplete="username"
                  placeholder="admin"
                />
              </label>

              <label class="admin-login__field">
                <span>Пароль</span>
                <input
                  v-model="credentials.password"
                  type="password"
                  autocomplete="current-password"
                  placeholder="Введите пароль"
                />
              </label>

              <button class="button button--primary admin-login__submit" type="submit">
                {{ status.isAuthenticating ? 'Входим…' : 'Войти' }}
              </button>
            </form>

            <p class="admin-login__recaptcha">
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

            <p v-if="status.authErrorMessage" class="admin-login__error">
              {{ status.authErrorMessage }}
            </p>
          </div>
        </section>

        <section v-else class="admin-page__sections">
          <article class="admin-card admin-security">
            <div class="admin-card__header">
              <h2>Смена пароля</h2>
              <p>
                Вы вошли как <code>{{ status.authUser }}</code>. Для смены пароля укажите текущий
                пароль и задайте новый.
              </p>
            </div>

            <div class="admin-card__body">
              <form class="admin-password__form" @submit.prevent="handleChangePassword">
                <label class="admin-login__field">
                  <span>Текущий пароль</span>
                  <input
                    v-model="passwordForm.currentPassword"
                    type="password"
                    autocomplete="current-password"
                    placeholder="Введите текущий пароль"
                  />
                </label>

                <label class="admin-login__field">
                  <span>Новый пароль</span>
                  <input
                    v-model="passwordForm.newPassword"
                    type="password"
                    autocomplete="new-password"
                    minlength="8"
                    placeholder="Минимум 8 символов"
                  />
                </label>

                <label class="admin-login__field">
                  <span>Подтверждение нового пароля</span>
                  <input
                    v-model="passwordForm.confirmPassword"
                    type="password"
                    autocomplete="new-password"
                    minlength="8"
                    placeholder="Повторите новый пароль"
                  />
                </label>

                <button
                  class="button button--primary admin-password__submit"
                  type="submit"
                  :disabled="status.isChangingPassword"
                >
                  {{ status.isChangingPassword ? 'Сохраняем пароль…' : 'Сменить пароль' }}
                </button>
              </form>

              <p
                v-if="passwordFeedback.message"
                :class="[
                  'admin-password__message',
                  passwordFeedback.isError
                    ? 'admin-password__message--error'
                    : 'admin-password__message--success'
                ]"
              >
                {{ passwordFeedback.message }}
              </p>
            </div>
          </article>

          <details
            v-for="section in contentSections"
            :key="section.key"
            :class="['admin-card', `admin-card--${section.key}`]"
            :open="section.defaultOpen"
          >
            <summary class="admin-card__summary">
              <div class="admin-card__header">
                <h2>{{ section.title }}</h2>
                <p>{{ section.description }}</p>
              </div>
            </summary>

            <div class="admin-card__body">
              <div v-if="section.key === 'brand'" class="admin-card__extras">
                <AdminAssetField
                  v-model="landingData.brand.logo"
                  label="Логотип сайта"
                  accept="image/*,.svg"
                  hint="Поддерживаются SVG, PNG, JPG, WebP и другие изображения."
                />
              </div>

              <div v-else-if="section.key === 'footerContent'" class="admin-card__extras">
                <AdminAssetField
                  v-model="landingData.footerContent.membershipLink"
                  label="Файл сертификата или членского билета"
                  kind="file"
                  accept="image/*,.svg,.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  hint="Можно загрузить PDF, изображение или документ. Эта ссылка откроется из подвала."
                />

                <AdminAssetField
                  v-model="landingData.footerContent.membershipImage"
                  label="Превью сертификата"
                  accept="image/*,.svg"
                  hint="Необязательно. При загрузке PDF сюда можно добавить миниатюру, логотип ТПП или обложку."
                />

                <AdminSocialsEditor v-model="landingData.footerContent.socials" />
              </div>

              <AdminContentEditor
                v-model="landingData[section.key]"
                :label="section.title"
                :path="section.key"
                :blueprint="defaultLandingData[section.key]"
                :locked-paths="LANDING_CONTENT_LOCKED_PATHS"
              />
            </div>
          </details>
        </section>
      </div>
    </section>
  </main>
</template>

<style scoped>
.admin-page {
  background:
    radial-gradient(circle at top right, rgba(26, 78, 168, 0.08), transparent 32%),
    linear-gradient(180deg, #f4f8ff 0%, #eef3fb 100%);
}

.admin-page__section {
  padding-block: 44px 80px;
}

.admin-page__stack {
  display: grid;
  gap: 22px;
}

.admin-page__hero,
.admin-card {
  border: 1px solid rgba(210, 220, 236, 0.95);
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 16px 42px rgba(18, 38, 74, 0.08);
}

.admin-page__hero {
  display: grid;
  gap: 18px;
  padding: 28px;
}

.admin-page__hero-copy {
  display: grid;
  gap: 14px;
}

.admin-page__hero-copy h1,
.admin-card__header h2 {
  margin: 0;
  color: #12254d;
}

.admin-page__hero-copy p,
.admin-card__header p {
  margin: 0;
  color: #4f6286;
  line-height: 1.6;
}

.admin-page__hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.admin-page__status {
  margin: 0;
  padding: 14px 18px;
  border: 1px solid rgba(194, 206, 228, 0.9);
  background: rgba(255, 255, 255, 0.88);
  color: #30466f;
  font-size: 14px;
  font-weight: 700;
}

.admin-page__status--error {
  border-color: rgba(205, 115, 115, 0.38);
  color: #8d2635;
}

.admin-page__sections {
  display: grid;
  gap: 16px;
}

.admin-login__card {
  display: grid;
  gap: 16px;
  max-width: 520px;
  padding: 28px;
  border: 1px solid rgba(210, 220, 236, 0.95);
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 16px 42px rgba(18, 38, 74, 0.08);
}

.admin-login__card h2,
.admin-login__card p {
  margin: 0;
}

.admin-login__card h2 {
  color: #12254d;
}

.admin-login__card p {
  color: #4f6286;
  line-height: 1.6;
}

.admin-login__form {
  display: grid;
  gap: 14px;
}

.admin-login__field {
  display: grid;
  gap: 8px;
}

.admin-login__field span {
  color: #30466f;
  font-size: 13px;
  font-weight: 700;
}

.admin-login__field input {
  width: 100%;
  min-height: 46px;
  padding: 12px 14px;
  border: 1px solid rgba(189, 201, 222, 0.96);
  background: #ffffff;
  color: #132342;
}

.admin-login__submit {
  justify-content: center;
}

.admin-password__form {
  display: grid;
  gap: 14px;
  max-width: 520px;
}

.admin-password__submit {
  justify-content: center;
}

.admin-password__message {
  margin: 0;
  font-weight: 700;
}

.admin-password__message--error {
  color: #8d2635;
}

.admin-password__message--success {
  color: #1f6b45;
}

.admin-login__recaptcha {
  margin: -4px 0 0;
  color: rgba(91, 103, 133, 0.82);
  font-size: 11px;
  line-height: 1.45;
}

.admin-login__recaptcha a {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 0.12em;
}

.admin-login__error {
  color: #8d2635;
  font-weight: 700;
}

.admin-card {
  overflow: hidden;
}

.admin-card__summary {
  list-style: none;
  cursor: pointer;
}

.admin-card__summary::-webkit-details-marker {
  display: none;
}

.admin-card__header {
  display: grid;
  gap: 8px;
  padding: 22px 24px;
}

.admin-card__body {
  display: grid;
  gap: 16px;
  padding: 0 24px 24px;
}

.admin-card__extras {
  display: grid;
  gap: 16px;
}

.admin-card--reviews :deep(.content-editor__array) {
  gap: 16px;
}

.admin-card--reviews :deep(.content-editor__array-item) {
  border-color: rgba(190, 204, 230, 0.95);
  background: #f9fbff;
}

.admin-page :deep(.button--light) {
  border-color: rgba(178, 192, 216, 0.95);
  background: #ffffff;
  color: #1d3765;
  box-shadow: 0 10px 26px rgba(18, 38, 74, 0.08);
}

.admin-page :deep(.button--light:hover),
.admin-page :deep(.button--light:focus-visible) {
  border-color: rgba(87, 116, 182, 0.42);
  background: #f5f8ff;
  color: #12254d;
}

@media (max-width: 720px) {
  .admin-page__hero,
  .admin-card__header,
  .admin-card__body {
    padding-inline: 18px;
  }

  .admin-page__hero,
  .admin-card__body {
    padding-block: 20px;
  }
}
</style>
