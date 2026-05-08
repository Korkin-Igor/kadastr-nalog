<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { useRecaptchaAction } from '@/app/security/recaptcha';
import { useLandingContent } from '@/app/content/landingContent';
import { buildPublicUrl } from '@/app/utils/publicUrl';
import AppFooter from '@/components/layout/AppFooter.vue';
import BrandLink from '@/components/ui/BrandLink.vue';
import {
  documentCatalog,
  documentIndustries,
  documentIndustryMap,
  documentSections,
  documentSectionMap
} from '@/data/documentCatalog';

const { landingData } = useLandingContent();
const recaptcha = useRecaptchaAction('lead_form_submit');

const form = reactive({
  industryId: '',
  email: ''
});

const errors = reactive({
  industry: '',
  sections: '',
  email: '',
  documents: '',
  submit: ''
});

const selectedSectionIds = ref([]);
const selectedDocumentIds = ref([]);
const successMessage = ref('');
const isSubmitting = ref(false);

const selectedIndustry = computed(() => documentIndustryMap[Number(form.industryId)] ?? null);
const selectedSections = computed(() =>
  selectedSectionIds.value
    .map((sectionId) => documentSectionMap[sectionId])
    .filter(Boolean)
);
const filteredDocuments = computed(() => {
  const industryId = Number(form.industryId);

  if (!industryId || selectedSectionIds.value.length === 0) {
    return [];
  }

  return documentCatalog.filter(
    (documentItem) =>
      documentItem.industryIds.includes(industryId) &&
      documentItem.sectionIds.some((sectionId) => selectedSectionIds.value.includes(sectionId))
  );
});
const filteredDocumentIdSet = computed(() => new Set(filteredDocuments.value.map((item) => item.id)));
const selectedDocuments = computed(() =>
  documentCatalog.filter((documentItem) => selectedDocumentIds.value.includes(documentItem.id))
);
const selectedDocumentCountLabel = computed(() => {
  const count = selectedDocumentIds.value.length;

  if (count === 0) {
    return 'Документы еще не выбраны';
  }

  if (count === 1) {
    return '1 документ выбран';
  }

  if (count >= 2 && count <= 4) {
    return `${count} документа выбрано`;
  }

  return `${count} документов выбрано`;
});
const completionPercent = computed(() => {
  let completedSteps = 0;

  if (form.industryId) {
    completedSteps += 1;
  }

  if (selectedSectionIds.value.length > 0) {
    completedSteps += 1;
  }

  if (selectedDocumentIds.value.length > 0) {
    completedSteps += 1;
  }

  if (form.email.trim() && isEmailValid(form.email.trim())) {
    completedSteps += 1;
  }

  return Math.round((completedSteps / 4) * 100);
});

watch(
  filteredDocumentIdSet,
  (nextIds) => {
    selectedDocumentIds.value = selectedDocumentIds.value.filter((documentId) => nextIds.has(documentId));
  },
  { immediate: true }
);

function clearError(field) {
  errors[field] = '';
}

function clearFeedback() {
  errors.submit = '';
  successMessage.value = '';
}

function toggleSection(sectionId) {
  clearFeedback();
  clearError('sections');

  if (!form.industryId) {
    errors.industry = 'Сначала выберите отрасль.';
    return;
  }

  if (selectedSectionIds.value.includes(sectionId)) {
    selectedSectionIds.value = selectedSectionIds.value.filter((item) => item !== sectionId);
    return;
  }

  if (selectedSectionIds.value.length >= 5) {
    errors.sections = 'Можно выбрать не более 5 разделов.';
    return;
  }

  selectedSectionIds.value = [...selectedSectionIds.value, sectionId];
}

function toggleDocument(documentId) {
  clearFeedback();
  clearError('documents');

  if (selectedDocumentIds.value.includes(documentId)) {
    selectedDocumentIds.value = selectedDocumentIds.value.filter((item) => item !== documentId);
    return;
  }

  selectedDocumentIds.value = [...selectedDocumentIds.value, documentId];
}

function selectAllVisibleDocuments() {
  clearFeedback();
  clearError('documents');
  selectedDocumentIds.value = filteredDocuments.value.map((documentItem) => documentItem.id);
}

function clearSelectedDocuments() {
  clearFeedback();
  clearError('documents');
  selectedDocumentIds.value = [];
}

function isEmailValid(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(value);
}

function validateForm() {
  errors.industry = '';
  errors.sections = '';
  errors.email = '';
  errors.documents = '';
  errors.submit = '';

  let isValid = true;
  const email = form.email.trim();

  if (!form.industryId) {
    errors.industry = 'Выберите отрасль.';
    isValid = false;
  }

  if (selectedSectionIds.value.length === 0) {
    errors.sections = 'Выберите хотя бы один раздел.';
    isValid = false;
  }

  if (!email) {
    errors.email = 'Укажите email для отправки предложения.';
    isValid = false;
  } else if (!isEmailValid(email)) {
    errors.email = 'Введите email в формате name@example.com.';
    isValid = false;
  }

  if (selectedDocumentIds.value.length === 0) {
    errors.documents = 'Выберите хотя бы один документ из списка.';
    isValid = false;
  }

  return isValid;
}

function getSectionTitle(sectionId) {
  return documentSectionMap[sectionId]?.title ?? '';
}

function getDocumentIndustryLabel(documentItem) {
  if (documentItem.industryIds.length === documentIndustries.length) {
    return 'Подходит для всех отраслей';
  }

  const industryIdsWithoutFallback = documentIndustries
    .map((industry) => industry.id)
    .filter((industryId) => industryId !== 30);
  const matchesAllRealIndustries =
    documentItem.industryIds.length === industryIdsWithoutFallback.length &&
    industryIdsWithoutFallback.every((industryId) => documentItem.industryIds.includes(industryId));

  if (matchesAllRealIndustries) {
    return 'Подходит для всех отраслей, кроме «Нет отрасли»';
  }

  if (documentItem.industryIds.length >= 7) {
    return `Подходит для ${documentItem.industryIds.length} отраслей`;
  }

  return `Для: ${documentItem.industryIds
    .map((industryId) => documentIndustryMap[industryId]?.label)
    .filter(Boolean)
    .join(', ')}`;
}

async function handleSubmit() {
  clearFeedback();

  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;

  const payload = {
    Email: form.email.trim(),
    Industry: selectedIndustry.value?.label ?? '',
    Sections: selectedSections.value.map((section) => section.title),
    RequestedDocuments: selectedDocuments.value.map(
      (documentItem) => `${documentItem.title} (${documentItem.priceLabel})`
    ),
    DocumentsCount: String(selectedDocuments.value.length),
    _formType: 'document_templates_purchase',
    _formTitle: 'Купить шаблоны документов',
    _timestamp: new Date().toISOString()
  };

  try {
    const recaptchaToken = await recaptcha.execute();

    if (recaptcha.enabled) {
      if (!recaptchaToken) {
        errors.submit = 'Не удалось пройти проверку reCAPTCHA. Обновите страницу и попробуйте снова.';
        isSubmitting.value = false;
        return;
      }

      payload._recaptchaToken = recaptchaToken;
      payload._recaptchaAction = recaptcha.action;
    }
  } catch (error) {
    console.error('reCAPTCHA error:', error);
    errors.submit = 'Не удалось пройти проверку reCAPTCHA. Обновите страницу и попробуйте снова.';
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
      errors.submit =
        result.error || `Сервер вернул ошибку ${response.status || ''}. Проверьте обработчик формы.`;
      return;
    }

    successMessage.value =
      'Заявка отправлена. Подготовим предложение по выбранным документам и свяжемся с вами по email.';
    form.email = '';
    selectedDocumentIds.value = [];
  } catch (error) {
    console.error('Document templates request failed:', error);
    errors.submit = 'Не удалось отправить заявку. Проверьте соединение и попробуйте снова.';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="documents-page">
    <main class="page-shell">
      <section class="section documents-hero">
        <div class="container documents-hero__stack">
          <header class="documents-topbar" v-reveal="{ delay: 40 }">
            <BrandLink :brand="landingData.brand" to="/" />

            <nav class="documents-topbar__links" aria-label="Навигация по странице шаблонов">
              <RouterLink class="documents-topbar__link" to="/">
                На главную
              </RouterLink>
              <a class="documents-topbar__link" href="#catalog">
                К подбору
              </a>
              <a class="documents-topbar__link documents-topbar__link--accent" href="#order-card">
                Оставить заявку
              </a>
            </nav>
          </header>

          <div class="documents-hero__grid">
            <div class="documents-hero__copy" v-reveal="{ delay: 80, origin: 'left' }">
              <div class="documents-hero__eyebrow">
                <span class="documents-hero__pulse" aria-hidden="true"></span>
                Каталог
              </div>
              <h1>Шаблоны документов для самостоятельного снижения налогов</h1>
              <p class="documents-hero__lead">
                Выберите отрасль, отметьте разделы и соберите нужный комплект.
              </p>

              <div class="documents-hero__actions">
                <a class="button button--primary" href="#catalog" v-button-wave>
                  <span class="button__wave" aria-hidden="true"></span>
                  <span class="button__wave-gloss" aria-hidden="true"></span>
                  <span class="button__label">Подобрать документы</span>
                </a>

                <RouterLink class="button button--light documents-hero__back" to="/#useful">
                  Вернуться к полезным сервисам
                </RouterLink>
              </div>
            </div>

            <aside class="documents-hero__panel" v-reveal="{ delay: 130, origin: 'right' }">
              <div class="documents-hero__panel-head">
                <div>
                  <span>Статус подбора</span>
                  <strong>{{ completionPercent }}% заполнено</strong>
                </div>
                <span class="documents-hero__panel-note">4 шага</span>
              </div>

              <div class="documents-hero__progress">
                <span :style="{ width: `${completionPercent}%` }"></span>
              </div>

              <div class="documents-hero__steps">
                <article class="documents-hero__step" :class="{ 'documents-hero__step--ready': Boolean(form.industryId) }">
                  <span>01</span>
                  <div>
                    <strong>Отрасль</strong>
                    <p>{{ selectedIndustry ? 'Выбрано' : 'Не выбрано' }}</p>
                  </div>
                </article>

                <article
                  class="documents-hero__step"
                  :class="{ 'documents-hero__step--ready': selectedSectionIds.length > 0 }"
                >
                  <span>02</span>
                  <div>
                    <strong>Разделы</strong>
                    <p>{{ selectedSections.length > 0 ? `${selectedSections.length} выбрано` : '0 выбрано' }}</p>
                  </div>
                </article>

                <article
                  class="documents-hero__step"
                  :class="{ 'documents-hero__step--ready': selectedDocumentIds.length > 0 }"
                >
                  <span>03</span>
                  <div>
                    <strong>Документы</strong>
                    <p>{{ selectedDocumentIds.length > 0 ? `${selectedDocumentIds.length} выбрано` : '0 выбрано' }}</p>
                  </div>
                </article>

                <article
                  class="documents-hero__step"
                  :class="{ 'documents-hero__step--ready': Boolean(form.email.trim() && isEmailValid(form.email.trim())) }"
                >
                  <span>04</span>
                  <div>
                    <strong>Email</strong>
                    <p>{{ form.email.trim() && isEmailValid(form.email.trim()) ? 'Готово' : 'Не заполнено' }}</p>
                  </div>
                </article>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section id="catalog" class="section documents-catalog">
        <div class="container documents-catalog__layout">
          <div class="documents-catalog__main">
            <article class="documents-card" v-reveal="{ delay: 70, origin: 'left' }">
              <div class="documents-card__header">
                <span class="documents-card__eyebrow">Шаг 1</span>
                <h2>Выберите отрасль</h2>
              </div>

              <label class="documents-field">
                <select
                  v-model="form.industryId"
                  class="documents-field__control documents-field__control--select"
                  :class="{ 'documents-field__control--invalid': errors.industry }"
                  @change="clearFeedback(); clearError('industry')"
                >
                  <option value="" disabled>Ваша отрасль</option>
                  <option v-for="industry in documentIndustries" :key="industry.id" :value="String(industry.id)">
                    {{ industry.label }}
                  </option>
                </select>
                <span v-if="errors.industry" class="documents-field__error">{{ errors.industry }}</span>
              </label>
            </article>

            <article class="documents-card" v-reveal="{ delay: 110, origin: 'left' }">
              <div class="documents-card__header">
                <span class="documents-card__eyebrow">Шаг 2</span>
                <h2>Выберите разделы</h2>
              </div>

              <div class="documents-sections">
                <button
                  v-for="section in documentSections"
                  :key="section.id"
                  type="button"
                  class="documents-sections__chip"
                  :class="{ 'documents-sections__chip--active': selectedSectionIds.includes(section.id) }"
                  :disabled="!form.industryId"
                  @click="toggleSection(section.id)"
                >
                  <span class="documents-sections__index">{{ String(section.id).padStart(2, '0') }}</span>
                  <span>{{ section.title }}</span>
                </button>
              </div>
              <span v-if="errors.sections" class="documents-field__error">{{ errors.sections }}</span>
            </article>

            <article class="documents-card documents-results" v-reveal="{ delay: 150, origin: 'left' }">
              <div class="documents-card__header documents-results__header">
                <div>
                  <span class="documents-card__eyebrow">Шаг 3</span>
                  <h2>Документы</h2>
                </div>

                <div class="documents-results__meta">
                  <span>{{ filteredDocuments.length }} найдено</span>
                  <span>{{ selectedDocumentCountLabel }}</span>
                </div>
              </div>

              <div class="documents-results__toolbar">
                <div class="documents-results__actions">
                  <button
                    type="button"
                    class="documents-inline-button"
                    :disabled="filteredDocuments.length === 0"
                    @click="selectAllVisibleDocuments"
                    v-show="selectedSections.length"
                  >
                    Выбрать все найденные
                  </button>
                  <button
                    type="button"
                    class="documents-inline-button"
                    :disabled="selectedDocumentIds.length === 0"
                    @click="clearSelectedDocuments"
                    v-show="selectedSections.length"
                  >
                    Очистить выбор
                  </button>
                </div>
              </div>

              <p v-if="errors.documents" class="documents-field__error documents-field__error--block">
                {{ errors.documents }}
              </p>

              <div
                v-if="!form.industryId || selectedSectionIds.length === 0"
                class="documents-empty"
              >
                <h3>Выберите отрасль и разделы</h3>
              </div>

              <div
                v-else-if="filteredDocuments.length === 0"
                class="documents-empty"
              >
                <h3>Совпадений не найдено</h3>
              </div>

              <TransitionGroup
                v-else
                name="stack"
                tag="div"
                class="documents-results__grid"
                appear
              >
                <label
                  v-for="(documentItem, index) in filteredDocuments"
                  :key="documentItem.id"
                  class="documents-result-card"
                  :class="{ 'documents-result-card--selected': selectedDocumentIds.includes(documentItem.id) }"
                  :style="{ '--stack-delay': `${Math.min(index * 22, 240)}ms` }"
                >
                  <input
                    class="documents-result-card__checkbox"
                    type="checkbox"
                    :checked="selectedDocumentIds.includes(documentItem.id)"
                    @change="toggleDocument(documentItem.id)"
                  />

                  <div class="documents-result-card__body">
                    <div class="documents-result-card__summary">
                      <span class="documents-result-card__number">
                        {{ String(documentItem.id).padStart(2, '0') }}
                      </span>
                      <h3>{{ documentItem.title }}</h3>
                    </div>

                    <div class="documents-result-card__details">
                      <p class="documents-result-card__price">
                        {{ documentItem.priceLabel }}
                      </p>
                      <div class="documents-result-card__tags">
                        <span
                          v-for="sectionId in documentItem.sectionIds"
                          :key="`${documentItem.id}-${sectionId}`"
                          class="documents-result-card__tag"
                        >
                          {{ getSectionTitle(sectionId) }}
                        </span>
                      </div>
                      <p class="documents-result-card__industry">
                        {{ getDocumentIndustryLabel(documentItem) }}
                      </p>
                    </div>
                  </div>
                </label>
              </TransitionGroup>
            </article>
          </div>

          <aside id="order-card" class="documents-order" v-reveal="{ delay: 120, origin: 'right' }">
            <div class="documents-order__card">
              <div class="documents-order__headband">
                <span class="documents-order__badge">Онлайн-комплект</span>
                <span class="documents-order__progress-label">{{ completionPercent }}% заполнено</span>
              </div>
              <div class="documents-order__header">
                <h2>Заявка</h2>
              </div>

              <div class="documents-order__progress">
                <span :style="{ width: `${completionPercent}%` }"></span>
              </div>

              <div class="documents-order__summary">
                <div class="documents-order__summary-item">
                  <span>Отрасль</span>
                  <strong>{{ selectedIndustry?.label || 'Не выбрана' }}</strong>
                </div>
                <div class="documents-order__summary-item">
                  <span>Разделы</span>
                  <strong>
                    {{ selectedSections.length > 0 ? selectedSections.map((section) => section.title).join(', ') : 'Не выбраны' }}
                  </strong>
                </div>
                <div class="documents-order__summary-item">
                  <span>Выбор</span>
                  <strong>{{ selectedDocumentCountLabel }}</strong>
                </div>
              </div>

              <div class="documents-order__picked">
                <ul v-if="selectedDocuments.length > 0" class="documents-order__picked-list">
                  <li v-for="documentItem in selectedDocuments" :key="`picked-${documentItem.id}`">
                    <span>{{ documentItem.title }}</span>
                    <button type="button" @click="toggleDocument(documentItem.id)">
                      Убрать
                    </button>
                  </li>
                </ul>

                <p v-else class="documents-order__picked-empty">
                  Документы ещё не выбраны.
                </p>
              </div>

              <label class="documents-field">
                <span>Email</span>
                <input
                  v-model="form.email"
                  type="email"
                  autocomplete="email"
                  class="documents-field__control"
                  :class="{ 'documents-field__control--invalid': errors.email }"
                  placeholder="name@example.com"
                  @input="clearFeedback(); clearError('email')"
                />
                <span v-if="errors.email" class="documents-field__error">{{ errors.email }}</span>
              </label>

              <button class="button button--primary documents-order__submit" type="button" @click="handleSubmit" v-button-wave>
                <span class="button__wave" aria-hidden="true"></span>
                <span class="button__wave-gloss" aria-hidden="true"></span>
                <span class="button__label">
                  {{ isSubmitting ? 'Отправка заявки…' : 'Отправить заявку' }}
                </span>
              </button>

              <Transition name="success-fade" appear>
                <p v-if="successMessage" class="documents-order__success">
                  {{ successMessage }}
                </p>
              </Transition>

              <p v-if="errors.submit" class="documents-order__error">
                {{ errors.submit }}
              </p>

              <p v-if="recaptcha.enabled" class="documents-order__recaptcha">
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
            </div>
          </aside>
        </div>
      </section>
    </main>

    <AppFooter
      :brand="landingData.brand"
      :footer-groups="landingData.footerGroups"
      :footer-content="landingData.footerContent"
    />
  </div>
</template>

<style scoped>
.documents-page {
  --documents-violet: var(--accent-violet);
  --documents-accent-gradient: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-violet) 100%);
  --documents-violet-glow: rgba(105, 57, 184, 0.22);
  --documents-violet-glow-strong: rgba(105, 57, 184, 0.36);
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at 18% 10%, rgba(105, 57, 184, 0.22) 0%, rgba(105, 57, 184, 0) 26%),
    radial-gradient(circle at 10% 8%, rgba(73, 168, 255, 0.12) 0%, rgba(73, 168, 255, 0) 28%),
    radial-gradient(circle at 86% 18%, rgba(105, 57, 184, 0.22) 0%, rgba(105, 57, 184, 0) 26%),
    radial-gradient(circle at 70% 54%, rgba(139, 95, 255, 0.12) 0%, rgba(139, 95, 255, 0) 30%),
    radial-gradient(circle at 72% 64%, rgba(155, 95, 255, 0.16) 0%, rgba(155, 95, 255, 0) 24%),
    linear-gradient(180deg, #f2ecff 0%, #ece7fb 48%, #eeeafb 100%);
}

.documents-page > .page-shell {
  flex: 1 0 auto;
}

.documents-page::before,
.documents-page::after {
  content: '';
  position: fixed;
  inset: auto;
  pointer-events: none;
  z-index: 0;
}

.documents-page::before {
  top: 120px;
  right: -90px;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(132, 79, 255, 0.3) 0%, rgba(132, 79, 255, 0) 70%);
  filter: blur(10px);
  animation: documentsFloat 12s ease-in-out infinite;
}

.documents-page::after {
  left: -80px;
  bottom: 14%;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(105, 57, 184, 0.22) 0%, rgba(105, 57, 184, 0) 74%);
  filter: blur(12px);
  animation: documentsFloat 15s ease-in-out infinite reverse;
}

.documents-hero {
  position: relative;
  overflow: hidden;
  padding-top: 24px;
  padding-bottom: 12px;
}

.documents-hero::before,
.documents-catalog::before {
  content: '';
  position: absolute;
  inset: auto;
  pointer-events: none;
}

.documents-hero__stack {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 20px;
}

.documents-topbar {
  position: sticky;
  top: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 16px 22px;
  border: 1px solid rgba(140, 114, 225, 0.28);
  background: linear-gradient(135deg, rgba(7, 24, 68, 0.9) 0%, rgba(44, 27, 92, 0.88) 100%);
  box-shadow:
    0 14px 36px rgba(28, 14, 63, 0.28),
    0 0 0 1px rgba(127, 93, 214, 0.08),
    inset 0 -1px 0 rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(10px);
}

.documents-topbar::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgba(105, 57, 184, 0.22) 0%,
    rgba(33, 88, 170, 0.1) 28%,
    rgba(255, 255, 255, 0.02) 100%
  );
  pointer-events: none;
}

.documents-topbar > * {
  position: relative;
  z-index: 1;
}

.documents-topbar__links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.documents-topbar__link {
  padding: 10px 14px;
  border: 1px solid rgba(195, 234, 255, 0.2);
  color: rgba(255, 255, 255, 0.88);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition:
    transform 220ms ease,
    border-color 220ms ease,
    background-color 220ms ease,
    color 220ms ease;
}

.documents-topbar__link:hover,
.documents-topbar__link:focus-visible {
  transform: translateY(-2px);
  border-color: rgba(160, 126, 255, 0.52);
  background: linear-gradient(135deg, rgba(123, 88, 228, 0.18) 0%, rgba(82, 149, 255, 0.14) 100%);
  box-shadow: 0 0 24px rgba(105, 57, 184, 0.18);
  color: #fff;
}

.documents-topbar__link--accent {
  border-color: rgba(178, 150, 255, 0.56);
  background:
    linear-gradient(120deg, rgba(255, 255, 255, 0.12) 0%, rgba(105, 57, 184, 0.18) 38%, rgba(110, 92, 255, 0.22) 100%);
}

.documents-hero__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(300px, 0.8fr);
  gap: 20px;
  align-items: stretch;
}

.documents-hero__copy,
.documents-hero__panel,
.documents-card,
.documents-order__card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(193, 176, 235, 0.88);
  background:
    linear-gradient(180deg, rgba(250, 246, 255, 0.94) 0%, rgba(241, 235, 251, 0.92) 100%);
  box-shadow:
    0 24px 64px rgba(11, 26, 58, 0.1),
    0 0 0 1px rgba(105, 57, 184, 0.04);
}

.documents-hero__copy::before,
.documents-hero__panel::before,
.documents-card::before,
.documents-order__card::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.24) 0%, rgba(255, 255, 255, 0) 32%),
    radial-gradient(circle at top right, rgba(109, 89, 255, 0.22) 0%, rgba(109, 89, 255, 0) 38%);
  pointer-events: none;
}

.documents-hero__copy {
  display: grid;
  gap: 14px;
  padding: clamp(22px, 3vw, 32px);
}

.documents-hero__copy::after {
  content: '';
  position: absolute;
  inset: auto -30px -70px auto;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(132, 79, 255, 0.28) 0%, rgba(132, 79, 255, 0) 72%);
  pointer-events: none;
}

.documents-hero__eyebrow {
  display: inline-flex;
  align-items: center;
  justify-self: start;
  gap: 10px;
  padding: 8px 12px;
  border: 1px solid rgba(177, 153, 245, 0.88);
  background: linear-gradient(135deg, rgba(249, 245, 255, 0.96) 0%, rgba(241, 247, 255, 0.92) 100%);
  color: var(--documents-violet);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.documents-hero__pulse {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--documents-violet);
  box-shadow: 0 0 0 0 rgba(105, 57, 184, 0.45);
  animation: documentsPulse 2.8s ease-out infinite;
}

.documents-hero__copy h1 {
  margin: 0;
  color: #102146;
  font-size: clamp(34px, 4.2vw, 56px);
  line-height: 0.98;
  text-wrap: balance;
}

.documents-hero__lead {
  margin: 0;
  max-width: 720px;
  color: #4c6289;
  font-size: 16px;
  line-height: 1.6;
}

.documents-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.documents-hero__back {
  min-height: 56px;
}

.documents-hero__panel {
  display: grid;
  align-content: start;
  gap: 16px;
  padding: 22px;
  border-color: rgba(136, 98, 224, 0.34);
  background:
    radial-gradient(circle at top right, rgba(126, 95, 232, 0.4) 0%, rgba(126, 95, 232, 0) 34%),
    linear-gradient(160deg, rgba(18, 15, 58, 0.98) 0%, rgba(37, 29, 95, 0.96) 48%, rgba(17, 78, 142, 0.94) 100%);
  box-shadow:
    0 28px 64px rgba(24, 11, 58, 0.34),
    0 0 48px rgba(105, 57, 184, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  color: #fff;
  animation: documentsFloat 10s ease-in-out infinite;
}

.documents-hero__panel::after {
  content: '';
  position: absolute;
  inset: auto auto -90px -50px;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(170, 124, 255, 0.34) 0%, rgba(170, 124, 255, 0) 68%);
  pointer-events: none;
}

.documents-hero__panel-head,
.documents-hero__step {
  position: relative;
  z-index: 1;
}

.documents-hero__panel-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 12px;
}

.documents-hero__panel-head span,
.documents-hero__panel-note {
  color: rgba(217, 233, 255, 0.72);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.documents-hero__panel-head strong {
  display: block;
  margin-top: 8px;
  color: #fff;
  font-size: 26px;
  line-height: 1;
}

.documents-hero__progress,
.documents-order__progress {
  position: relative;
  z-index: 1;
  height: 10px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
}

.documents-hero__progress span,
.documents-order__progress span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #56d8ff 0%, #7e6bff 48%, #b777ff 100%);
  box-shadow: 0 0 22px rgba(126, 107, 255, 0.45);
  transition: width 260ms ease;
}

.documents-hero__steps {
  display: grid;
  gap: 10px;
}

.documents-hero__step {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 12px;
  align-items: start;
  padding: 14px;
  border: 1px solid rgba(196, 226, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  transition:
    transform 220ms ease,
    border-color 220ms ease,
    background-color 220ms ease;
}

.documents-hero__step:hover {
  transform: translateY(-2px);
  border-color: rgba(180, 145, 255, 0.34);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(116, 77, 210, 0.14) 100%);
}

.documents-hero__step--ready {
  border-color: rgba(180, 145, 255, 0.4);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.09) 0%, rgba(124, 84, 223, 0.18) 100%);
}

.documents-hero__step > span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(105, 57, 184, 0.34) 0%, rgba(96, 159, 255, 0.22) 100%);
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.documents-hero__step strong {
  display: block;
  margin-bottom: 4px;
  color: #fff;
  font-size: 14px;
}

.documents-hero__step p {
  margin: 0;
  color: rgba(223, 235, 255, 0.82);
  font-size: 12px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.documents-catalog {
  position: relative;
  z-index: 1;
  padding-top: 12px;
  padding-bottom: 90px;
}

.documents-catalog__layout {
  display: grid;
  gap: 20px;
  align-items: start;
}

.documents-catalog__main {
  display: grid;
  gap: 14px;
}

.documents-card,
.documents-order__card {
  padding: 20px;
  transition:
    transform 260ms ease,
    box-shadow 260ms ease,
    border-color 260ms ease;
}

.documents-card:hover,
.documents-order__card:hover {
  transform: translateY(-3px);
  border-color: rgba(173, 145, 241, 0.96);
  box-shadow:
    0 28px 74px rgba(11, 26, 58, 0.14),
    0 0 34px rgba(105, 57, 184, 0.1);
}

.documents-card__header {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 10px;
  margin-bottom: 10px;
}

.documents-card__eyebrow {
  color: var(--documents-violet);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.documents-card__header h2,
.documents-order__header h2 {
  margin: 0;
  color: #102146;
}

.documents-order__header {
  position: relative;
  z-index: 1;
}

.documents-field {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 8px;
}

.documents-field span:first-child {
  color: #274574;
  font-size: 13px;
  font-weight: 800;
}

.documents-field__control {
  width: 100%;
  min-height: 52px;
  padding: 14px 16px;
  border: 1px solid rgba(194, 177, 235, 0.96);
  background: linear-gradient(180deg, rgba(250, 246, 255, 0.98) 0%, rgba(244, 238, 253, 0.96) 100%);
  color: #2d2356;
  transition:
    border-color 200ms ease,
    box-shadow 200ms ease,
    background-color 200ms ease;
}

.documents-field__control:focus {
  outline: none;
  border-color: rgba(105, 57, 184, 0.72);
  box-shadow: 0 0 0 4px rgba(105, 57, 184, 0.12);
}

.documents-field__control--select {
  appearance: none;
}

.documents-field__control--invalid {
  border-color: rgba(195, 70, 70, 0.72);
}

.documents-field__error {
  color: #a12838;
  font-size: 13px;
  font-weight: 700;
}

.documents-field__error--block {
  display: block;
  margin-bottom: 10px;
}

.documents-sections {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.documents-sections__chip {
  display: grid;
  gap: 6px;
  align-content: start;
  min-height: 82px;
  min-width: 0;
  padding: 12px;
  border: 1px solid rgba(194, 177, 235, 0.92);
  background: linear-gradient(180deg, rgba(249, 245, 255, 0.98) 0%, rgba(242, 235, 252, 0.94) 100%);
  color: #352667;
  text-align: left;
  line-height: 1.35;
  transition:
    transform 240ms ease,
    border-color 240ms ease,
    background 240ms ease,
    box-shadow 240ms ease;
}

.documents-sections__chip:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.documents-sections__chip:not(:disabled):hover,
.documents-sections__chip--active {
  transform: translateY(-2px);
  border-color: rgba(123, 80, 214, 0.72);
  background:
    linear-gradient(145deg, rgba(105, 57, 184, 0.18) 0%, rgba(64, 146, 255, 0.12) 100%),
    rgba(255, 255, 255, 0.98);
  box-shadow: 0 16px 34px rgba(61, 32, 124, 0.12);
}

.documents-sections__index {
  color: var(--documents-violet);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.documents-sections__chip span:last-child {
  overflow-wrap: anywhere;
}

.documents-results__header {
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
}

.documents-results__meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.documents-results__meta span {
  padding: 9px 12px;
  border: 1px solid rgba(204, 189, 240, 0.88);
  background: linear-gradient(180deg, rgba(250, 245, 255, 0.98) 0%, rgba(241, 232, 255, 0.94) 100%);
  color: #4d2b8c;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.documents-results__toolbar {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: flex-end;
  margin-bottom: 14px;
}

.documents-results__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.documents-inline-button {
  min-height: 38px;
  padding: 9px 12px;
  border: 1px solid rgba(198, 186, 235, 0.9);
  background: linear-gradient(180deg, rgba(250, 245, 255, 0.99) 0%, rgba(240, 232, 255, 0.95) 100%);
  color: #4b2f86;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  transition:
    transform 220ms ease,
    border-color 220ms ease,
    box-shadow 220ms ease;
}

.documents-inline-button:not(:disabled):hover {
  transform: translateY(-1px);
  border-color: rgba(124, 84, 223, 0.58);
  box-shadow: 0 12px 24px rgba(105, 57, 184, 0.12);
}

.documents-inline-button:disabled {
  cursor: not-allowed;
  opacity: 0.52;
}

.documents-empty {
  position: relative;
  z-index: 1;
  padding: 22px;
  border: 1px dashed rgba(191, 177, 230, 0.96);
  background: linear-gradient(180deg, rgba(248, 242, 255, 0.94) 0%, rgba(239, 232, 252, 0.88) 100%);
}

.documents-empty h3 {
  margin: 0;
  color: #4d2b8c;
  font-size: 16px;
}

.documents-results__grid {
  display: grid;
  gap: 10px;
}

.documents-result-card {
  position: relative;
  isolation: isolate;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid rgba(201, 189, 236, 0.92);
  background:
    radial-gradient(circle at top right, rgba(105, 57, 184, 0.08) 0%, rgba(105, 57, 184, 0) 42%),
    linear-gradient(155deg, rgba(250, 246, 255, 0.99) 0%, rgba(239, 232, 252, 0.96) 100%);
  cursor: pointer;
  transition:
    transform 240ms ease,
    border-color 240ms ease,
    box-shadow 240ms ease;
}

.documents-result-card::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 3px;
  background: linear-gradient(180deg, rgba(105, 57, 184, 0.1) 0%, rgba(105, 57, 184, 0.54) 100%);
  transform: scaleY(0.35);
  transform-origin: center top;
  transition: transform 260ms ease, opacity 260ms ease;
  opacity: 0.7;
}

.documents-result-card::after {
  content: '';
  position: absolute;
  inset: auto -72px -72px auto;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(162, 113, 255, 0.28) 0%, rgba(162, 113, 255, 0) 70%);
  opacity: 0;
  transform: scale(0.7);
  transition:
    opacity 260ms ease,
    transform 260ms ease;
  pointer-events: none;
}

.documents-result-card:hover,
.documents-result-card--selected {
  transform: translateY(-2px);
  border-color: rgba(124, 84, 223, 0.72);
  box-shadow:
    0 18px 38px rgba(19, 39, 76, 0.08),
    0 0 28px rgba(105, 57, 184, 0.12);
}

.documents-result-card:hover::before,
.documents-result-card--selected::before {
  transform: scaleY(1);
  opacity: 1;
}

.documents-result-card:hover::after,
.documents-result-card--selected::after {
  opacity: 1;
  transform: scale(1);
}

.documents-result-card__checkbox {
  width: 18px;
  height: 18px;
  margin-top: 2px;
  accent-color: var(--documents-violet);
}

.documents-result-card__body {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 10px;
}

.documents-result-card__summary {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 10px;
  align-items: start;
}

.documents-result-card__number {
  padding-top: 2px;
  color: var(--documents-violet);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.documents-result-card h3 {
  margin: 0;
  color: #102146;
  font-size: 15px;
  line-height: 1.45;
}

.documents-result-card__details {
  display: grid;
  gap: 10px;
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transform: translateY(-4px);
  transition:
    max-height 260ms ease,
    opacity 220ms ease,
    transform 220ms ease;
}

.documents-result-card:hover .documents-result-card__details,
.documents-result-card--selected .documents-result-card__details {
  max-height: 260px;
  opacity: 1;
  transform: translateY(0);
}

.documents-result-card__price {
  justify-self: start;
  margin: 0;
  padding: 6px 10px;
  border: 1px solid rgba(201, 183, 242, 0.92);
  background: linear-gradient(180deg, rgba(249, 243, 255, 0.98) 0%, rgba(240, 231, 255, 0.94) 100%);
  color: #6c37be;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.documents-result-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.documents-result-card__tag {
  padding: 6px 8px;
  border: 1px solid rgba(203, 187, 240, 0.9);
  background: linear-gradient(180deg, rgba(251, 248, 255, 0.94) 0%, rgba(245, 242, 255, 0.9) 100%);
  color: #5b32a5;
  font-size: 11px;
  font-weight: 700;
}

.documents-result-card__industry {
  margin: 0;
  color: #5b7094;
  font-size: 12px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.documents-order {
  position: relative;
}

.documents-order__card {
  position: sticky;
  top: 22px;
  display: grid;
  gap: 16px;
  border-color: rgba(194, 178, 234, 0.96);
  box-shadow:
    0 26px 64px rgba(11, 26, 58, 0.12),
    0 0 42px rgba(105, 57, 184, 0.08);
}

.documents-order__headband {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.documents-order__badge,
.documents-order__progress-label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.documents-order__badge {
  padding: 8px 12px;
  border: 1px solid rgba(196, 176, 239, 0.92);
  background: linear-gradient(135deg, rgba(248, 240, 255, 0.98) 0%, rgba(238, 232, 255, 0.94) 100%);
  color: #5b32a5;
}

.documents-order__progress-label {
  color: #6f58a0;
}

.documents-order__summary {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 10px;
}

.documents-order__summary-item {
  display: grid;
  gap: 6px;
  padding: 12px 14px;
  border: 1px solid rgba(200, 186, 235, 0.92);
  background:
    radial-gradient(circle at top right, rgba(105, 57, 184, 0.08) 0%, rgba(105, 57, 184, 0) 48%),
    linear-gradient(180deg, rgba(248, 242, 255, 0.98) 0%, rgba(239, 232, 252, 0.94) 100%);
}

.documents-order__summary-item span {
  color: #745ca7;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.documents-order__summary-item strong {
  color: #3b276e;
  line-height: 1.5;
}

.documents-order__picked {
  position: relative;
  z-index: 1;
}

.documents-order__picked-list {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.documents-order__picked-list li {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: start;
  padding: 10px 12px;
  border: 1px solid rgba(188, 202, 226, 0.92);
  background: rgba(255, 255, 255, 0.92);
}

.documents-order__picked-list span {
  color: #15315c;
  font-size: 13px;
  line-height: 1.5;
}

.documents-order__picked-list button {
  color: #5673a5;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.documents-order__picked-empty,
.documents-order__recaptcha {
  margin: 0;
  color: #5a7094;
  line-height: 1.6;
}

.documents-order__submit {
  justify-content: center;
}

.documents-order__success {
  margin: 0;
  color: #1f6b45;
  font-weight: 800;
  line-height: 1.6;
}

.documents-order__error {
  margin: 0;
  color: #a12838;
  font-weight: 700;
  line-height: 1.6;
}

.documents-order__recaptcha {
  font-size: 11px;
  line-height: 1.45;
}

.documents-order__recaptcha a {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 0.12em;
}

.documents-page :deep(.button--light) {
  border-color: rgba(180, 194, 220, 0.94);
  background: rgba(255, 255, 255, 0.92);
  color: #173460;
  box-shadow: 0 12px 30px rgba(17, 33, 61, 0.08);
}

.documents-page :deep(.button--light:hover),
.documents-page :deep(.button--light:focus-visible) {
  border-color: rgba(78, 120, 204, 0.58);
  background: rgba(246, 249, 255, 1);
}

@media (min-width: 980px) {
  .documents-catalog__layout {
    grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.9fr);
  }
}

@media (min-width: 1440px) {
  .documents-sections {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

@media (max-width: 979px) {
  .documents-hero__grid {
    grid-template-columns: 1fr;
  }

  .documents-hero__panel {
    animation: none;
  }

  .documents-order__card {
    position: static;
  }

  .documents-sections {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .documents-topbar {
    padding: 14px 16px;
  }

  .documents-topbar,
  .documents-topbar__links,
  .documents-hero__actions,
  .documents-results__actions {
    flex-direction: column;
    align-items: stretch;
  }

  .documents-hero__copy,
  .documents-hero__panel,
  .documents-card,
  .documents-order__card {
    padding: 18px;
  }

  .documents-hero__metrics {
    grid-template-columns: 1fr;
  }

  .documents-hero__panel-head,
  .documents-order__headband {
    align-items: start;
    flex-direction: column;
  }

  .documents-results__header {
    grid-template-columns: 1fr;
  }

  .documents-results__meta,
  .documents-results__toolbar {
    justify-content: flex-start;
  }

  .documents-sections {
    grid-template-columns: 1fr;
  }

  .documents-result-card,
  .documents-order__picked-list li {
    grid-template-columns: 1fr;
  }

  .documents-result-card__checkbox {
    margin: 0;
  }

  .documents-result-card__summary {
    grid-template-columns: 1fr;
    gap: 6px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .documents-page::before,
  .documents-page::after,
  .documents-hero__panel,
  .documents-hero__pulse {
    animation: none;
  }
}

@keyframes documentsFloat {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(0, -10px, 0);
  }
}

@keyframes documentsPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(47, 132, 255, 0.42);
  }
  70% {
    box-shadow: 0 0 0 12px rgba(47, 132, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(47, 132, 255, 0);
  }
}
</style>
