<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { useLandingContent } from '@/app/content/landingContent';
import { useRecaptchaAction } from '@/app/security/recaptcha';
import { buildPublicUrl } from '@/app/utils/publicUrl';
import AppFooter from '@/components/layout/AppFooter.vue';
import BrandLink from '@/components/ui/BrandLink.vue';
import {
  trainingMediaCatalog,
  trainingMediaFormatMap,
  trainingMediaFormats,
  trainingMediaIndustries,
  trainingMediaIndustryMap,
  trainingMediaSectionMap,
  trainingMediaSections
} from '@/data/trainingMediaCatalog';

const { landingData } = useLandingContent();
const recaptcha = useRecaptchaAction('lead_form_submit');

const form = reactive({
  industryId: '',
  email: ''
});

const errors = reactive({
  industry: '',
  sections: '',
  formats: '',
  materials: '',
  email: '',
  submit: ''
});

const selectedSectionIds = ref([]);
const selectedFormatIds = ref([]);
const selectedMaterialIds = ref([]);
const successMessage = ref('');
const isSubmitting = ref(false);

const selectedIndustry = computed(() => trainingMediaIndustryMap[Number(form.industryId)] ?? null);
const selectedSections = computed(() =>
  selectedSectionIds.value
    .map((sectionId) => trainingMediaSectionMap[sectionId])
    .filter(Boolean)
);
const selectedFormats = computed(() =>
  selectedFormatIds.value
    .map((formatId) => trainingMediaFormatMap[formatId])
    .filter(Boolean)
);
const filteredMaterials = computed(() => {
  const industryId = Number(form.industryId);

  if (!industryId || selectedSectionIds.value.length === 0) {
    return [];
  }

  return trainingMediaCatalog.filter(
    (material) =>
      material.industryIds.includes(industryId) &&
      material.sectionIds.some((sectionId) => selectedSectionIds.value.includes(sectionId))
  );
});
const filteredMaterialIdSet = computed(() => new Set(filteredMaterials.value.map((material) => material.id)));
const selectedMaterials = computed(() =>
  trainingMediaCatalog.filter((material) => selectedMaterialIds.value.includes(material.id))
);
const selectedFormatSummary = computed(() => {
  if (selectedFormats.value.length === 0) {
    return 'Не выбраны';
  }

  return selectedFormats.value.map((format) => format.title).join(', ');
});
const selectedMaterialCountLabel = computed(() =>
  getCountLabel(selectedMaterialIds.value.length, 'Материалы еще не выбраны', 'материал выбран', 'материала выбрано', 'материалов выбрано')
);
const completionPercent = computed(() => {
  let completedSteps = 0;

  if (form.industryId) {
    completedSteps += 1;
  }

  if (selectedSectionIds.value.length > 0) {
    completedSteps += 1;
  }

  if (selectedFormatIds.value.length > 0) {
    completedSteps += 1;
  }

  if (selectedMaterialIds.value.length > 0) {
    completedSteps += 1;
  }

  if (form.email.trim() && isEmailValid(form.email.trim())) {
    completedSteps += 1;
  }

  return Math.round((completedSteps / 5) * 100);
});

watch(
  filteredMaterialIdSet,
  (nextIds) => {
    selectedMaterialIds.value = selectedMaterialIds.value.filter((materialId) => nextIds.has(materialId));
  },
  { immediate: true }
);

function getCountLabel(count, emptyLabel, singularLabel, fewLabel, manyLabel) {
  if (count === 0) {
    return emptyLabel;
  }

  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return `${count} ${singularLabel}`;
  }

  const label = mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14) ? fewLabel : manyLabel;
  return `${count} ${label}`;
}

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

function toggleFormat(formatId) {
  clearFeedback();
  clearError('formats');

  if (selectedFormatIds.value.includes(formatId)) {
    selectedFormatIds.value = selectedFormatIds.value.filter((item) => item !== formatId);
    return;
  }

  selectedFormatIds.value = [...selectedFormatIds.value, formatId];
}

function toggleMaterial(materialId) {
  clearFeedback();
  clearError('materials');

  if (selectedMaterialIds.value.includes(materialId)) {
    selectedMaterialIds.value = selectedMaterialIds.value.filter((item) => item !== materialId);
    return;
  }

  selectedMaterialIds.value = [...selectedMaterialIds.value, materialId];
}

function selectAllVisibleMaterials() {
  clearFeedback();
  clearError('materials');
  selectedMaterialIds.value = filteredMaterials.value.map((material) => material.id);
}

function clearSelectedMaterials() {
  clearFeedback();
  clearError('materials');
  selectedMaterialIds.value = [];
}

function isEmailValid(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(value);
}

function validateForm() {
  errors.industry = '';
  errors.sections = '';
  errors.formats = '';
  errors.materials = '';
  errors.email = '';
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

  if (selectedFormatIds.value.length === 0) {
    errors.formats = 'Выберите хотя бы один формат.';
    isValid = false;
  }

  if (selectedMaterialIds.value.length === 0) {
    errors.materials = 'Выберите хотя бы один материал из списка.';
    isValid = false;
  }

  if (!email) {
    errors.email = 'Укажите email для связи по заявке.';
    isValid = false;
  } else if (!isEmailValid(email)) {
    errors.email = 'Введите email в формате name@example.com.';
    isValid = false;
  }

  return isValid;
}

function getSectionTitle(sectionId) {
  return trainingMediaSectionMap[sectionId]?.title ?? '';
}

function getMaterialIndustryLabel(material) {
  if (material.industryIds.length === trainingMediaIndustries.length) {
    return 'Подходит для всех отраслей';
  }

  const industryIdsWithoutFallback = trainingMediaIndustries
    .map((industry) => industry.id)
    .filter((industryId) => industryId !== 30);
  const matchesAllRealIndustries =
    material.industryIds.length === industryIdsWithoutFallback.length &&
    industryIdsWithoutFallback.every((industryId) => material.industryIds.includes(industryId));

  if (matchesAllRealIndustries) {
    return 'Подходит для всех отраслей, кроме «Нет отрасли»';
  }

  if (material.industryIds.length >= 7) {
    return `Подходит для ${material.industryIds.length} отраслей`;
  }

  return `Для: ${material.industryIds
    .map((industryId) => trainingMediaIndustryMap[industryId]?.label)
    .filter(Boolean)
    .join(', ')}`;
}

function getMaterialFormatLabel(material) {
  return material.formatIds
    .map((formatId) => trainingMediaFormatMap[formatId]?.title)
    .filter(Boolean)
    .join(', ');
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
    PreferredFormats: selectedFormats.value.map((format) => format.title),
    RequestedMaterials: selectedMaterials.value.map((material) => `${material.title} (${material.priceLabel})`),
    MaterialsCount: String(selectedMaterials.value.length),
    PurchaseFlow: 'Ручная заявка без онлайн-оплаты',
    _formType: 'training_media_purchase',
    _formTitle: 'Купить видео и аудио по налогу на имущество',
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
      'Заявка отправлена. Это ручная покупка: пришлем детали на почту и отдельно согласуем формат и состав материалов.';
    form.email = '';
    selectedMaterialIds.value = [];
  } catch (error) {
    console.error('Training media request failed:', error);
    errors.submit = 'Не удалось отправить заявку. Проверьте соединение и попробуйте снова.';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="training-page">
    <main class="page-shell">
      <section class="section training-hero">
        <div class="container training-hero__stack">
          <header class="training-topbar" v-reveal="{ delay: 40 }">
            <BrandLink :brand="landingData.brand" to="/" />

            <nav class="training-topbar__links" aria-label="Навигация по странице обучения">
              <RouterLink class="training-topbar__link" to="/">
                На главную
              </RouterLink>
              <a class="training-topbar__link" href="#catalog">
                К подбору
              </a>
              <a class="training-topbar__link training-topbar__link--accent" href="#order-card">
                Оставить заявку
              </a>
            </nav>
          </header>

          <div class="training-hero__grid">
            <div class="training-hero__copy" v-reveal="{ delay: 80, origin: 'left' }">
              <div class="training-hero__eyebrow">
                <span class="training-hero__pulse" aria-hidden="true"></span>
                Обучение
              </div>
              <h1>Видео и аудио по налогу на имущество</h1>
              <p class="training-hero__lead">
                Выберите отрасль, разделы и удобный формат. Покупка оформляется вручную: заявка уходит на нашу почту, после чего мы согласуем состав материалов и условия.
              </p>
              <p class="training-hero__note">
                Формат страницы повторяет каталог шаблонов документов, но здесь вы подбираете обучающие материалы в видео- и аудиоформате.
              </p>

              <div class="training-hero__actions">
                <a class="button button--primary" href="#catalog" v-button-wave>
                  <span class="button__wave" aria-hidden="true"></span>
                  <span class="button__wave-gloss" aria-hidden="true"></span>
                  <span class="button__label">Подобрать материалы</span>
                </a>

                <RouterLink class="button button--light training-hero__back" to="/#useful">
                  Вернуться к полезным сервисам
                </RouterLink>
              </div>
            </div>

            <aside class="training-hero__panel" v-reveal="{ delay: 130, origin: 'right' }">
              <div class="training-hero__panel-head">
                <div>
                  <span>Статус подбора</span>
                  <strong>{{ completionPercent }}% заполнено</strong>
                </div>
                <span class="training-hero__panel-note">5 шагов</span>
              </div>

              <div class="training-hero__progress">
                <span :style="{ width: `${completionPercent}%` }"></span>
              </div>

              <div class="training-hero__steps">
                <article class="training-hero__step" :class="{ 'training-hero__step--ready': Boolean(form.industryId) }">
                  <span>01</span>
                  <div>
                    <strong>Отрасль</strong>
                    <p>{{ selectedIndustry ? 'Выбрано' : 'Не выбрано' }}</p>
                  </div>
                </article>

                <article class="training-hero__step" :class="{ 'training-hero__step--ready': selectedSections.length > 0 }">
                  <span>02</span>
                  <div>
                    <strong>Разделы</strong>
                    <p>{{ selectedSections.length > 0 ? `${selectedSections.length} выбрано` : '0 выбрано' }}</p>
                  </div>
                </article>

                <article class="training-hero__step" :class="{ 'training-hero__step--ready': selectedFormats.length > 0 }">
                  <span>03</span>
                  <div>
                    <strong>Формат</strong>
                    <p>{{ selectedFormats.length > 0 ? selectedFormatSummary : 'Не выбран' }}</p>
                  </div>
                </article>

                <article class="training-hero__step" :class="{ 'training-hero__step--ready': selectedMaterialIds.length > 0 }">
                  <span>04</span>
                  <div>
                    <strong>Материалы</strong>
                    <p>{{ selectedMaterialIds.length > 0 ? `${selectedMaterialIds.length} выбрано` : '0 выбрано' }}</p>
                  </div>
                </article>

                <article
                  class="training-hero__step"
                  :class="{ 'training-hero__step--ready': Boolean(form.email.trim() && isEmailValid(form.email.trim())) }"
                >
                  <span>05</span>
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

      <section id="catalog" class="section training-catalog">
        <div class="container training-catalog__layout">
          <div class="training-catalog__main">
            <article class="training-card" v-reveal="{ delay: 70, origin: 'left' }">
              <div class="training-card__header">
                <span class="training-card__eyebrow">Шаг 1</span>
                <h2>Выберите отрасль</h2>
              </div>

              <label class="training-field">
                <select
                  v-model="form.industryId"
                  class="training-field__control training-field__control--select"
                  :class="{ 'training-field__control--invalid': errors.industry }"
                  @change="clearFeedback(); clearError('industry')"
                >
                  <option value="" disabled>Ваша отрасль</option>
                  <option v-for="industry in trainingMediaIndustries" :key="industry.id" :value="String(industry.id)">
                    {{ industry.label }}
                  </option>
                </select>
                <span v-if="errors.industry" class="training-field__error">{{ errors.industry }}</span>
              </label>
            </article>

            <article class="training-card" v-reveal="{ delay: 110, origin: 'left' }">
              <div class="training-card__header">
                <span class="training-card__eyebrow">Шаг 2</span>
                <h2>Выберите разделы</h2>
              </div>

              <div class="training-sections">
                <button
                  v-for="section in trainingMediaSections"
                  :key="section.id"
                  type="button"
                  class="training-sections__chip"
                  :class="{ 'training-sections__chip--active': selectedSectionIds.includes(section.id) }"
                  :disabled="!form.industryId"
                  @click="toggleSection(section.id)"
                >
                  <span class="training-sections__index">{{ String(section.id).padStart(2, '0') }}</span>
                  <span>{{ section.title }}</span>
                </button>
              </div>

              <span v-if="errors.sections" class="training-field__error">{{ errors.sections }}</span>
            </article>

            <article class="training-card" v-reveal="{ delay: 140, origin: 'left' }">
              <div class="training-card__header">
                <span class="training-card__eyebrow">Шаг 3</span>
                <h2>Выберите формат</h2>
              </div>

              <div class="training-formats">
                <button
                  v-for="format in trainingMediaFormats"
                  :key="format.id"
                  type="button"
                  class="training-format-card"
                  :class="{ 'training-format-card--active': selectedFormatIds.includes(format.id) }"
                  @click="toggleFormat(format.id)"
                >
                  <span class="training-format-card__title">{{ format.title }}</span>
                  <span class="training-format-card__text">{{ format.description }}</span>
                </button>
              </div>

              <span v-if="errors.formats" class="training-field__error">{{ errors.formats }}</span>
            </article>

            <article class="training-card training-results" v-reveal="{ delay: 170, origin: 'left' }">
              <div class="training-card__header training-results__header">
                <div>
                  <span class="training-card__eyebrow">Шаг 4</span>
                  <h2>Материалы</h2>
                </div>

                <div class="training-results__meta">
                  <span>{{ filteredMaterials.length }} найдено</span>
                  <span>{{ selectedMaterialCountLabel }}</span>
                </div>
              </div>

              <div class="training-results__toolbar">
                <div class="training-results__actions">
                  <button
                    v-show="selectedSections.length"
                    type="button"
                    class="training-inline-button"
                    :disabled="filteredMaterials.length === 0"
                    @click="selectAllVisibleMaterials"
                  >
                    Выбрать все найденные
                  </button>
                  <button
                    v-show="selectedSections.length"
                    type="button"
                    class="training-inline-button"
                    :disabled="selectedMaterialIds.length === 0"
                    @click="clearSelectedMaterials"
                  >
                    Очистить выбор
                  </button>
                </div>
              </div>

              <p v-if="errors.materials" class="training-field__error training-field__error--block">
                {{ errors.materials }}
              </p>

              <div v-if="!form.industryId || selectedSectionIds.length === 0" class="training-empty">
                <h3>Выберите отрасль и разделы</h3>
                <p>После этого покажем все подходящие обучающие материалы по налогу на имущество.</p>
              </div>

              <div v-else-if="filteredMaterials.length === 0" class="training-empty">
                <h3>Совпадений не найдено</h3>
                <p>Смените разделы или отрасль, чтобы расширить подборку.</p>
              </div>

              <TransitionGroup
                v-else
                name="stack"
                tag="div"
                class="training-results__grid"
                appear
              >
                <label
                  v-for="(material, index) in filteredMaterials"
                  :key="material.id"
                  class="training-result-card"
                  :class="{ 'training-result-card--selected': selectedMaterialIds.includes(material.id) }"
                  :style="{ '--stack-delay': `${Math.min(index * 18, 240)}ms` }"
                >
                  <input
                    class="training-result-card__checkbox"
                    type="checkbox"
                    :checked="selectedMaterialIds.includes(material.id)"
                    @change="toggleMaterial(material.id)"
                  />

                  <div class="training-result-card__body">
                    <div class="training-result-card__summary">
                      <span class="training-result-card__number">
                        {{ String(material.id).padStart(2, '0') }}
                      </span>
                      <h3>{{ material.title }}</h3>
                    </div>

                    <div class="training-result-card__details">
                      <p class="training-result-card__price">{{ material.priceLabel }}</p>
                      <p class="training-result-card__format">Форматы: {{ getMaterialFormatLabel(material) }}</p>
                      <div class="training-result-card__tags">
                        <span
                          v-for="sectionId in material.sectionIds"
                          :key="`${material.id}-${sectionId}`"
                          class="training-result-card__tag"
                        >
                          {{ getSectionTitle(sectionId) }}
                        </span>
                      </div>
                      <p class="training-result-card__industry">{{ getMaterialIndustryLabel(material) }}</p>
                    </div>
                  </div>
                </label>
              </TransitionGroup>
            </article>
          </div>

          <aside id="order-card" class="training-order" v-reveal="{ delay: 120, origin: 'right' }">
            <div class="training-order__card">
              <div class="training-order__headband">
                <span class="training-order__badge">Ручная заявка</span>
                <span class="training-order__progress-label">{{ completionPercent }}% заполнено</span>
              </div>
              <div class="training-order__header">
                <h2>Покупка видео и аудио</h2>
                <p>
                  Онлайн-оплаты здесь нет. После заявки мы получаем письмо, проверяем выбор и согласовываем покупку вручную.
                </p>
              </div>

              <div class="training-order__progress">
                <span :style="{ width: `${completionPercent}%` }"></span>
              </div>

              <div class="training-order__summary">
                <div class="training-order__summary-item">
                  <span>Отрасль</span>
                  <strong>{{ selectedIndustry?.label || 'Не выбрана' }}</strong>
                </div>
                <div class="training-order__summary-item">
                  <span>Разделы</span>
                  <strong>
                    {{ selectedSections.length > 0 ? selectedSections.map((section) => section.title).join(', ') : 'Не выбраны' }}
                  </strong>
                </div>
                <div class="training-order__summary-item">
                  <span>Формат</span>
                  <strong>{{ selectedFormatSummary }}</strong>
                </div>
                <div class="training-order__summary-item">
                  <span>Выбор</span>
                  <strong>{{ selectedMaterialCountLabel }}</strong>
                </div>
              </div>

              <div class="training-order__picked">
                <ul v-if="selectedMaterials.length > 0" class="training-order__picked-list">
                  <li v-for="material in selectedMaterials" :key="`picked-${material.id}`">
                    <div>
                      <span>{{ material.title }}</span>
                      <small>{{ material.priceLabel }}</small>
                    </div>
                    <button type="button" @click="toggleMaterial(material.id)">
                      Убрать
                    </button>
                  </li>
                </ul>

                <p v-else class="training-order__picked-empty">
                  Материалы еще не выбраны.
                </p>
              </div>

              <label class="training-field">
                <span>Email</span>
                <input
                  v-model="form.email"
                  type="email"
                  autocomplete="email"
                  class="training-field__control"
                  :class="{ 'training-field__control--invalid': errors.email }"
                  placeholder="name@example.com"
                  @input="clearFeedback(); clearError('email')"
                />
                <span v-if="errors.email" class="training-field__error">{{ errors.email }}</span>
              </label>

              <button class="button button--primary training-order__submit" type="button" @click="handleSubmit" v-button-wave>
                <span class="button__wave" aria-hidden="true"></span>
                <span class="button__wave-gloss" aria-hidden="true"></span>
                <span class="button__label">
                  {{ isSubmitting ? 'Отправка заявки…' : 'Отправить заявку на покупку' }}
                </span>
              </button>

              <Transition name="success-fade" appear>
                <p v-if="successMessage" class="training-order__success">
                  {{ successMessage }}
                </p>
              </Transition>

              <p v-if="errors.submit" class="training-order__error">
                {{ errors.submit }}
              </p>

              <p v-if="recaptcha.enabled" class="training-order__recaptcha">
                Этот сайт защищен reCAPTCHA, применяются
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
.training-page {
  --training-border: rgba(193, 176, 235, 0.88);
  --training-panel-border: rgba(136, 98, 224, 0.34);
  --training-accent: var(--accent-violet);
  --training-accent-soft: rgba(105, 57, 184, 0.12);
  --training-accent-strong: rgba(105, 57, 184, 0.18);
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at 14% 10%, rgba(105, 57, 184, 0.2) 0%, rgba(105, 57, 184, 0) 28%),
    radial-gradient(circle at 88% 16%, rgba(62, 166, 255, 0.18) 0%, rgba(62, 166, 255, 0) 30%),
    radial-gradient(circle at 72% 62%, rgba(124, 92, 255, 0.14) 0%, rgba(124, 92, 255, 0) 26%),
    linear-gradient(180deg, #f2ecff 0%, #ece7fb 48%, #eeeafb 100%);
}

.training-page > .page-shell {
  flex: 1 0 auto;
}

.training-page::before,
.training-page::after {
  content: '';
  position: fixed;
  pointer-events: none;
  z-index: 0;
}

.training-page::before {
  top: 116px;
  right: -84px;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(132, 79, 255, 0.26) 0%, rgba(132, 79, 255, 0) 72%);
  filter: blur(12px);
  animation: trainingFloat 12s ease-in-out infinite;
}

.training-page::after {
  left: -72px;
  bottom: 12%;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(105, 57, 184, 0.24) 0%, rgba(105, 57, 184, 0) 74%);
  filter: blur(14px);
  animation: trainingFloat 15s ease-in-out infinite reverse;
}

.training-hero {
  padding-top: 24px;
  padding-bottom: 12px;
}

.training-hero__stack {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 20px;
}

.training-topbar {
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

.training-topbar::before {
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

.training-topbar > * {
  position: relative;
  z-index: 1;
}

.training-topbar__links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.training-topbar__link {
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

.training-topbar__link:hover,
.training-topbar__link:focus-visible {
  transform: translateY(-2px);
  border-color: rgba(160, 126, 255, 0.52);
  background: linear-gradient(135deg, rgba(123, 88, 228, 0.18) 0%, rgba(82, 149, 255, 0.14) 100%);
  box-shadow: 0 0 24px rgba(105, 57, 184, 0.18);
  color: #fff;
}

.training-topbar__link--accent {
  border-color: rgba(178, 150, 255, 0.56);
  background:
    linear-gradient(120deg, rgba(255, 255, 255, 0.12) 0%, rgba(105, 57, 184, 0.18) 38%, rgba(110, 92, 255, 0.22) 100%);
}

.training-hero__grid,
.training-catalog__layout {
  display: grid;
  grid-template-columns: minmax(0, 1.18fr) minmax(320px, 0.82fr);
  gap: 20px;
  align-items: start;
}

.training-hero__copy,
.training-hero__panel,
.training-card,
.training-order__card {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--training-border);
  background: linear-gradient(180deg, rgba(250, 246, 255, 0.94) 0%, rgba(241, 235, 251, 0.92) 100%);
  box-shadow:
    0 24px 64px rgba(11, 26, 58, 0.1),
    0 0 0 1px rgba(105, 57, 184, 0.04);
}

.training-hero__copy::before,
.training-hero__panel::before,
.training-card::before,
.training-order__card::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.24) 0%, rgba(255, 255, 255, 0) 32%),
    radial-gradient(circle at top right, rgba(109, 89, 255, 0.22) 0%, rgba(109, 89, 255, 0) 38%);
  pointer-events: none;
}

.training-hero__copy {
  display: grid;
  gap: 14px;
  padding: clamp(22px, 3vw, 32px);
}

.training-hero__copy::after {
  content: '';
  position: absolute;
  inset: auto -30px -70px auto;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(132, 79, 255, 0.28) 0%, rgba(132, 79, 255, 0) 72%);
}

.training-hero__eyebrow {
  display: inline-flex;
  align-items: center;
  justify-self: start;
  gap: 10px;
  padding: 8px 12px;
  border: 1px solid rgba(177, 153, 245, 0.88);
  background: linear-gradient(135deg, rgba(249, 245, 255, 0.96) 0%, rgba(241, 247, 255, 0.92) 100%);
  color: var(--training-accent);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.training-hero__pulse {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--training-accent);
  box-shadow: 0 0 0 0 rgba(105, 57, 184, 0.45);
  animation: trainingPulse 2.8s ease-out infinite;
}

.training-hero__copy h1 {
  margin: 0;
  color: #102146;
  font-size: clamp(34px, 4.2vw, 56px);
  line-height: 0.98;
  text-wrap: balance;
}

.training-hero__lead,
.training-hero__note,
.training-order__header p,
.training-empty p,
.training-result-card__industry,
.training-result-card__format,
.training-order__picked-list small,
.training-order__recaptcha {
  margin: 0;
  color: #4c6289;
  font-size: 15px;
  line-height: 1.6;
}

.training-hero__note {
  padding: 14px 16px;
  border: 1px solid rgba(177, 153, 245, 0.3);
  background: rgba(255, 255, 255, 0.46);
}

.training-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.training-hero__back {
  min-height: 56px;
}

.training-hero__panel {
  display: grid;
  gap: 16px;
  padding: 22px;
  border-color: var(--training-panel-border);
  background:
    radial-gradient(circle at top right, rgba(126, 95, 232, 0.4) 0%, rgba(126, 95, 232, 0) 34%),
    linear-gradient(160deg, rgba(18, 15, 58, 0.98) 0%, rgba(37, 29, 95, 0.96) 48%, rgba(17, 78, 142, 0.94) 100%);
  box-shadow:
    0 28px 64px rgba(24, 11, 58, 0.34),
    0 0 48px rgba(105, 57, 184, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  color: #fff;
  animation: trainingFloat 10s ease-in-out infinite;
}

.training-hero__panel::after {
  content: '';
  position: absolute;
  inset: auto auto -90px -50px;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(170, 124, 255, 0.34) 0%, rgba(170, 124, 255, 0) 68%);
}

.training-hero__panel-head,
.training-hero__step {
  position: relative;
  z-index: 1;
}

.training-hero__panel-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 12px;
}

.training-hero__panel-head span,
.training-hero__panel-note {
  color: rgba(217, 233, 255, 0.72);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.training-hero__panel-head strong {
  display: block;
  margin-top: 8px;
  color: #fff;
  font-size: 26px;
  line-height: 1;
}

.training-hero__progress,
.training-order__progress {
  position: relative;
  z-index: 1;
  height: 10px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
}

.training-hero__progress span,
.training-order__progress span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #64c4ff 0%, #a87eff 100%);
  box-shadow: 0 0 22px rgba(122, 191, 255, 0.34);
}

.training-hero__steps {
  display: grid;
  gap: 12px;
}

.training-hero__step {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  padding: 14px 16px;
  border: 1px solid rgba(186, 208, 255, 0.16);
  background: rgba(255, 255, 255, 0.08);
  transition:
    transform 220ms ease,
    border-color 220ms ease,
    background-color 220ms ease;
}

.training-hero__step--ready {
  border-color: rgba(133, 200, 255, 0.42);
  background: rgba(133, 200, 255, 0.16);
}

.training-hero__step span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.1);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.training-hero__step strong,
.training-order__summary-item strong {
  display: block;
  font-size: 15px;
  line-height: 1.4;
}

.training-hero__step p,
.training-order__summary-item span,
.training-order__progress-label {
  margin: 0;
  color: rgba(226, 237, 255, 0.76);
  font-size: 13px;
  line-height: 1.5;
}

.training-catalog {
  padding-top: 12px;
}

.training-catalog__main {
  display: grid;
  gap: 20px;
}

.training-card,
.training-order__card {
  padding: 24px;
}

.training-card__header,
.training-results__header,
.training-order__header {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 8px;
}

.training-card__header h2,
.training-order__header h2,
.training-empty h3,
.training-result-card__summary h3 {
  margin: 0;
  color: #102146;
}

.training-card__eyebrow,
.training-order__badge {
  display: inline-flex;
  align-items: center;
  justify-self: start;
  padding: 6px 10px;
  border: 1px solid rgba(177, 153, 245, 0.32);
  background: rgba(255, 255, 255, 0.54);
  color: var(--training-accent);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.training-field {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 8px;
}

.training-field > span:first-child {
  color: #102146;
  font-size: 14px;
  font-weight: 700;
}

.training-field__control {
  width: 100%;
  min-height: 56px;
  padding: 16px 18px;
  border: 1px solid rgba(168, 177, 204, 0.66);
  background: rgba(255, 255, 255, 0.82);
  color: #102146;
  transition:
    border-color 220ms ease,
    box-shadow 220ms ease,
    background-color 220ms ease;
}

.training-field__control:focus {
  outline: none;
  border-color: rgba(105, 57, 184, 0.62);
  box-shadow: 0 0 0 3px rgba(105, 57, 184, 0.12);
  background: #fff;
}

.training-field__control--select {
  appearance: none;
}

.training-field__control--invalid {
  border-color: rgba(191, 55, 87, 0.7);
  box-shadow: 0 0 0 3px rgba(191, 55, 87, 0.1);
}

.training-field__error {
  color: #bc3457;
  font-size: 13px;
  line-height: 1.5;
}

.training-field__error--block {
  margin: 0;
}

.training-sections,
.training-formats,
.training-results__grid {
  position: relative;
  z-index: 1;
}

.training-sections {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
}

.training-sections__chip,
.training-format-card {
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

.training-sections__chip:hover:not(:disabled),
.training-format-card:hover {
  transform: translateY(-2px);
  border-color: rgba(123, 80, 214, 0.72);
  background:
    linear-gradient(145deg, rgba(105, 57, 184, 0.18) 0%, rgba(64, 146, 255, 0.12) 100%),
    rgba(255, 255, 255, 0.98);
  box-shadow: 0 16px 34px rgba(61, 32, 124, 0.12);
}

.training-sections__chip--active,
.training-format-card--active {
  transform: translateY(-2px);
  border-color: rgba(123, 80, 214, 0.72);
  background:
    linear-gradient(145deg, rgba(105, 57, 184, 0.18) 0%, rgba(64, 146, 255, 0.12) 100%),
    rgba(255, 255, 255, 0.98);
  box-shadow: 0 16px 34px rgba(61, 32, 124, 0.12);
}

.training-sections__chip:disabled {
  opacity: 0.56;
  cursor: not-allowed;
}

.training-sections__index {
  color: var(--training-accent);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.training-sections__chip span:last-child {
  overflow-wrap: anywhere;
}

.training-formats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
}

.training-format-card__title {
  color: #102146;
  font-size: 16px;
  font-weight: 800;
}

.training-format-card__text {
  color: #4c6289;
  font-size: 14px;
  line-height: 1.6;
}

.training-results__header {
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
}

.training-results__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: end;
  color: #4c6289;
  font-size: 13px;
  font-weight: 700;
}

.training-results__toolbar,
.training-results__actions,
.training-order__headband,
.training-order__summary,
.training-order__picked,
.training-order__picked-list,
.training-result-card__details,
.training-result-card__tags {
  position: relative;
  z-index: 1;
}

.training-results__toolbar {
  display: flex;
  justify-content: end;
  padding-top: 16px;
}

.training-results__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.training-inline-button {
  padding: 10px 14px;
  border: 1px solid rgba(105, 57, 184, 0.18);
  background: rgba(255, 255, 255, 0.52);
  color: var(--training-accent);
  font-size: 13px;
  font-weight: 800;
  transition:
    transform 220ms ease,
    border-color 220ms ease,
    background-color 220ms ease;
}

.training-inline-button:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: rgba(105, 57, 184, 0.48);
  background: rgba(255, 255, 255, 0.9);
}

.training-inline-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.training-empty {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 8px;
  padding: 26px;
  border: 1px dashed rgba(168, 177, 204, 0.8);
  background: rgba(255, 255, 255, 0.52);
}

.training-results__grid {
  display: grid;
  gap: 12px;
  margin-top: 18px;
}

.training-result-card {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  gap: 14px;
  align-items: start;
  padding: 16px;
  border: 1px solid rgba(168, 177, 204, 0.66);
  background: rgba(255, 255, 255, 0.72);
  transition:
    transform 220ms ease,
    border-color 220ms ease,
    box-shadow 220ms ease,
    background-color 220ms ease;
}

.training-result-card:hover {
  transform: translateY(-2px);
  border-color: rgba(105, 57, 184, 0.44);
  box-shadow: 0 18px 34px rgba(18, 32, 70, 0.08);
}

.training-result-card--selected {
  border-color: rgba(105, 57, 184, 0.62);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.94) 0%, rgba(238, 229, 255, 0.96) 100%);
  box-shadow:
    0 18px 36px rgba(18, 32, 70, 0.08),
    0 0 0 3px rgba(105, 57, 184, 0.08);
}

.training-result-card__checkbox {
  width: 20px;
  height: 20px;
  margin: 4px 0 0;
  accent-color: var(--training-accent);
}

.training-result-card__body,
.training-result-card__summary {
  display: grid;
  gap: 10px;
}

.training-result-card__summary {
  grid-template-columns: 54px minmax(0, 1fr);
  align-items: start;
}

.training-result-card__number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  border: 1px solid rgba(105, 57, 184, 0.18);
  background: rgba(105, 57, 184, 0.06);
  color: var(--training-accent);
  font-size: 13px;
  font-weight: 800;
}

.training-result-card__price {
  margin: 0;
  color: #102146;
  font-size: 15px;
  font-weight: 800;
}

.training-result-card__format {
  color: var(--training-accent);
}

.training-result-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.training-result-card__tag {
  padding: 6px 10px;
  border: 1px solid rgba(105, 57, 184, 0.16);
  background: rgba(105, 57, 184, 0.08);
  color: #102146;
  font-size: 12px;
  font-weight: 700;
}

.training-order__card {
  position: sticky;
  top: 96px;
  display: grid;
  gap: 18px;
  padding: 24px;
}

.training-order__headband {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.training-order__summary {
  display: grid;
  gap: 10px;
}

.training-order__summary-item {
  display: grid;
  gap: 4px;
  padding: 12px 14px;
  border: 1px solid rgba(168, 177, 204, 0.48);
  background: rgba(255, 255, 255, 0.54);
}

.training-order__summary-item span {
  color: #4c6289;
}

.training-order__summary-item strong {
  color: #102146;
}

.training-order__picked {
  display: grid;
  gap: 10px;
}

.training-order__picked-list {
  display: grid;
  gap: 10px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.training-order__picked-list li {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
  padding: 14px;
  border: 1px solid rgba(168, 177, 204, 0.48);
  background: rgba(255, 255, 255, 0.56);
}

.training-order__picked-list li > div {
  display: grid;
  gap: 4px;
}

.training-order__picked-list li > div > span {
  color: #102146;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
}

.training-order__picked-list button {
  padding: 8px 10px;
  border: 1px solid rgba(105, 57, 184, 0.16);
  background: rgba(105, 57, 184, 0.06);
  color: var(--training-accent);
  font-size: 12px;
  font-weight: 800;
}

.training-order__picked-empty {
  margin: 0;
  padding: 18px;
  border: 1px dashed rgba(168, 177, 204, 0.8);
  background: rgba(255, 255, 255, 0.52);
  color: #4c6289;
}

.training-order__submit {
  width: 100%;
}

.training-order__success,
.training-order__error {
  position: relative;
  z-index: 1;
  margin: 0;
  padding: 14px 16px;
  font-size: 14px;
  line-height: 1.6;
}

.training-order__success {
  border: 1px solid rgba(36, 166, 106, 0.26);
  background: rgba(36, 166, 106, 0.08);
  color: #146845;
}

.training-order__error {
  border: 1px solid rgba(191, 55, 87, 0.26);
  background: rgba(191, 55, 87, 0.08);
  color: #9d2746;
}

.training-order__recaptcha a {
  color: var(--training-accent);
  text-decoration: underline;
}

.training-page :deep(.button--light) {
  border-color: rgba(180, 194, 220, 0.94);
  background: rgba(255, 255, 255, 0.92);
  color: #173460;
  box-shadow: 0 12px 30px rgba(17, 33, 61, 0.08);
}

.training-page :deep(.button--light:hover),
.training-page :deep(.button--light:focus-visible) {
  border-color: rgba(78, 120, 204, 0.58);
  background: rgba(246, 249, 255, 1);
}

@keyframes trainingFloat {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }

  50% {
    transform: translate3d(0, -10px, 0);
  }
}

@keyframes trainingPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(105, 57, 184, 0.45);
  }

  70% {
    box-shadow: 0 0 0 14px rgba(105, 57, 184, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(105, 57, 184, 0);
  }
}

@media (max-width: 1080px) {
  .training-hero__grid,
  .training-catalog__layout {
    grid-template-columns: 1fr;
  }

  .training-order__card {
    position: relative;
    top: 0;
  }
}

@media (max-width: 979px) {
  .training-sections {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 780px) {
  .training-topbar {
    align-items: start;
    flex-direction: column;
  }

  .training-results__header {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .training-results__meta,
  .training-results__toolbar,
  .training-order__headband {
    justify-content: start;
  }
}

@media (max-width: 639px) {
  .training-page::before,
  .training-page::after {
    display: none;
  }

  .training-hero,
  .training-catalog {
    padding-top: 8px;
  }

  .training-card,
  .training-order__card,
  .training-hero__panel {
    padding: 18px;
  }

  .training-hero__copy {
    padding: 20px;
  }

  .training-sections,
  .training-formats {
    grid-template-columns: 1fr;
  }

  .training-result-card,
  .training-result-card__summary {
    grid-template-columns: 1fr;
  }

  .training-result-card__checkbox {
    margin: 0;
  }

  .training-order__picked-list li {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
