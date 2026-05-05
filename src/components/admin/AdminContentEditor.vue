<script setup>
import { computed } from 'vue';

defineOptions({
  name: 'AdminContentEditor'
});

const STRUCTURALLY_EDITABLE_ARRAYS = new Set(['reviews']);

const HIDDEN_EXACT_PATHS = new Set([
  'brand.logo',
  'headerContent.navigationLabel',
  'headerContent.closeMenuAriaLabel',
  'headerContent.utilityHref',
  'heroContent.menuIcon',
  'heroContent.eyebrow',
  'heroContent.proofPoints',
  'heroContent.videoLabel',
  'heroContent.videoDialogTitle',
  'heroContent.previewAriaLabel',
  'heroContent.openVideoAriaLabel',
  'heroContent.closeVideoLabel',
  'heroContent.closeVideoAriaLabel',
  'heroContent.watchLabel',
  'heroContent.pauseLabel',
  'heroContent.mutedButtonLabel',
  'heroContent.unmutedButtonLabel',
  'heroContent.videoRangeLabel',
  'ideaSection.imageAlt',
  'checklistContent.noteIcon',
  'checklistContent.checkListIcon',
  'footerContent.membershipLink',
  'footerContent.membershipImage',
  'footerContent.socials',
  'usefulSection.description',
  'usefulSection.cards[].description',
  'reviewsSection.previousAriaLabel',
  'reviewsSection.previousHorizontalAriaLabel',
  'reviewsSection.nextAriaLabel',
  'reviewsSection.nextHorizontalAriaLabel'
]);

const HIDDEN_SEGMENTS = new Set([
  'id',
  'icon',
  'logo',
  'url',
  'to',
  'href',
  'alt',
  'external',
  'actionUrl',
  'formType',
  'showBackLink',
  'backLinkLabel',
  'backLinkHref',
  'submittingLabel',
  'requiredSelectMessage',
  'requiredFieldMessage',
  'phoneIncompleteMessage',
  'emailInvalidMessage',
  'cadastralInvalidMessage',
  'submitFailedMessage',
  'networkFailedMessage'
]);

const CUSTOM_LABELS = {
  brand: 'Бренд',
  'brand.title': 'Название сайта',
  navigation: 'Пункты меню',
  'navigation[].label': 'Название пункта меню',
  headerContent: 'Шапка сайта',
  'headerContent.menuLabel': 'Текст кнопки меню',
  'headerContent.navigationTitle': 'Заголовок меню',
  'headerContent.closeMenuLabel': 'Текст кнопки закрытия меню',
  heroContent: 'Первый экран',
  'heroContent.titleLines': 'Строки главного заголовка',
  'heroContent.titleLines[]': 'Строка заголовка',
  'heroContent.accentWord': 'Выделенное слово',
  'heroContent.description': 'Описание',
  'heroContent.cta': 'Текст главной кнопки',
  'heroContent.utilityLabel': 'Текст кнопки в шапке',
  'heroContent.videoSrc': 'Видео',
  ideaSection: 'Блок идей',
  'ideaSection.title': 'Заголовок',
  'ideaSection.description': 'Описание',
  'ideaSection.note': 'Подпись',
  'ideaSection.items': 'Пункты',
  'ideaSection.items[]': 'Пункт',
  'ideaSection.image': 'Изображение',
  offerMeta: 'Блок предложения',
  'offerMeta.title': 'Заголовок',
  'offerMeta.paragraphs': 'Абзацы',
  'offerMeta.paragraphs[]': 'Абзац',
  offerCards: 'Карточки предложения',
  'offerCards[].titleHtml': 'Заголовок карточки',
  freeServicesSection: 'Бесплатные сервисы',
  'freeServicesSection.title': 'Заголовок секции',
  freeServiceForms: 'Карточки бесплатных сервисов',
  'freeServiceForms[].title': 'Заголовок карточки',
  'freeServiceForms[].description': 'Описание карточки',
  'freeServiceForms[].submitLabel': 'Текст кнопки',
  'freeServiceForms[].successText': 'Текст после отправки',
  checklistContent: 'Чек-лист',
  'checklistContent.eyebrow': 'Короткая подпись сверху',
  'checklistContent.title': 'Заголовок',
  'checklistContent.description': 'Описание',
  'checklistContent.benefits': 'Преимущества',
  'checklistContent.benefits[].text': 'Текст преимущества',
  'checklistContent.note': 'Подпись',
  'checklistContent.badge': 'Надпись на бейдже',
  'checklistContent.formTitle': 'Заголовок формы',
  'checklistContent.formDescription': 'Описание формы',
  'checklistContent.submitLabel': 'Текст кнопки',
  'checklistContent.successText': 'Текст после отправки',
  'checklistContent.privacy': 'Текст о конфиденциальности',
  dualSection: 'Что можно проверить',
  'dualSection.title': 'Заголовок',
  'dualSection.description': 'Описание',
  'dualSection.items': 'Пункты',
  'dualSection.items[]': 'Пункт',
  importantSection: 'Важно знать',
  'importantSection.title': 'Заголовок',
  'importantSection.lead': 'Вступительный текст',
  'importantSection.body': 'Основной текст',
  'importantSection.cards': 'Карточки',
  'importantSection.cards[].title': 'Заголовок карточки',
  'importantSection.cards[].description': 'Описание карточки',
  usefulSection: 'Полезные сервисы',
  'usefulSection.title': 'Заголовок',
  'usefulSection.cards': 'Карточки',
  'usefulSection.cards[].title': 'Название сервиса',
  reviewsSection: 'Секция отзывов',
  'reviewsSection.title': 'Заголовок секции',
  reviews: 'Отзывы',
  'reviews[]': 'Отзыв',
  'reviews[].name': 'Имя или компания',
  'reviews[].text': 'Текст отзыва',
  'reviews[].wide': 'Сделать карточку широкой',
  'reviews[].image': 'Изображение отзыва',
  footerGroups: 'Колонки в подвале',
  'footerGroups[].title': 'Заголовок колонки',
  'footerGroups[].links': 'Ссылки',
  'footerGroups[].links[].label': 'Название ссылки',
  footerContent: 'Подвал сайта',
  'footerContent.membershipTitle': 'Заголовок блока СРО',
  'footerContent.membershipText': 'Текст блока СРО',
  'footerContent.phone': 'Телефон',
  'footerContent.email': 'Email',
  'footerContent.documents': 'Документы',
  'footerContent.documents[].label': 'Название документа'
};

const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  path: {
    type: String,
    default: ''
  },
  blueprint: {
    default: undefined
  },
  lockedPaths: {
    type: Array,
    default: () => []
  },
  depth: {
    type: Number,
    default: 0
  }
});

const model = defineModel();

const normalizedPath = computed(() => normalizePath(props.path));
const lastPathSegment = computed(() => getLastPathSegment(normalizedPath.value) || props.label);
const isArrayValue = computed(() => Array.isArray(model.value));
const isObjectValue = computed(
  () => Object.prototype.toString.call(model.value) === '[object Object]'
);
const mediaKind = computed(() => detectMediaKind(model.value, lastPathSegment.value));
const isHtmlTextField = computed(() => lastPathSegment.value.toLowerCase() === 'titlehtml');
const useTextarea = computed(() => shouldUseTextarea(model.value, lastPathSegment.value));
const canManageArrayItems = computed(() =>
  STRUCTURALLY_EDITABLE_ARRAYS.has(normalizedPath.value)
);
const displayLabel = computed(() => getDisplayLabel(normalizedPath.value, props.label));
const validationMessage = computed(() =>
  getValidationMessage(normalizedPath.value, model.value, mediaKind.value)
);
const fieldHasError = computed(() => Boolean(validationMessage.value));
const addButtonDisabled = computed(() =>
  normalizedPath.value === 'reviews' && hasIncompleteReviews(model.value)
);
const objectKeys = computed(() => {
  if (!isObjectValue.value) {
    return [];
  }

  const source = isPlainObject(props.blueprint) ? props.blueprint : model.value || {};

  return Object.keys(source).filter((key) => !shouldHidePath(nextPath(key), props.lockedPaths));
});
const textFieldModel = computed({
  get() {
    if (typeof model.value !== 'string') {
      return '';
    }

    return isHtmlTextField.value ? stripSimpleMarkup(model.value) : model.value;
  },
  set(value) {
    model.value = value;
  }
});

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function normalizePath(path) {
  return String(path || '').replace(/\[\d+\]/g, '[]');
}

function getLastPathSegment(path) {
  const segments = String(path || '')
    .split('.')
    .filter(Boolean);

  return segments[segments.length - 1] || '';
}

function humanizeLabel(value) {
  if (!value) {
    return 'Поле';
  }

  return String(value)
    .replace(/\[(\d+)\]/g, ' $1 ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}

function stripSimpleMarkup(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getDisplayLabel(path, fallback) {
  const normalized = normalizePath(path);

  if (CUSTOM_LABELS[normalized]) {
    return CUSTOM_LABELS[normalized];
  }

  const segment = getLastPathSegment(normalized);

  if (CUSTOM_LABELS[segment]) {
    return CUSTOM_LABELS[segment];
  }

  return humanizeLabel(fallback || segment);
}

function shouldHidePath(path, lockedPaths) {
  const normalized = normalizePath(path);

  if (!normalized) {
    return false;
  }

  if (lockedPaths.some((candidate) => normalized === candidate)) {
    return true;
  }

  if (HIDDEN_EXACT_PATHS.has(normalized)) {
    return true;
  }

  const segment = getLastPathSegment(normalized);

  if (!segment) {
    return false;
  }

  return /aria/i.test(segment) || HIDDEN_SEGMENTS.has(segment);
}

function detectMediaKind(value, key) {
  const normalizedKey = String(key || '').toLowerCase();
  const normalizedValue = typeof value === 'string' ? value.toLowerCase() : '';

  if (normalizedKey === 'videosrc' || normalizedValue.startsWith('data:video/')) {
    return 'video';
  }

  if (
    /(?:icon|image|logo)$/.test(normalizedKey) ||
    normalizedValue.startsWith('data:image/') ||
    /\.(svg|png|jpe?g|gif|webp|avif)(\?|#|$)/.test(normalizedValue)
  ) {
    return 'image';
  }

  return '';
}

function shouldUseTextarea(value, key) {
  if (typeof value !== 'string') {
    return false;
  }

  const normalizedKey = String(key || '').toLowerCase();

  if (value.includes('\n') || value.length > 100) {
    return true;
  }

  return /(description|text|note|body|lead|privacy|dialogtitle)/.test(normalizedKey);
}

function isEmptyValue(value) {
  if (typeof value === 'string') {
    return value.trim().length === 0;
  }

  return !value;
}

function isRequiredPath(path) {
  return new Set(['reviews[].name', 'reviews[].text', 'reviews[].image']).has(normalizePath(path));
}

function getValidationMessage(path, value, kind) {
  if (!isRequiredPath(path) || !isEmptyValue(value)) {
    return '';
  }

  if (kind === 'image') {
    return 'Добавьте изображение отзыва.';
  }

  if (normalizePath(path) === 'reviews[].name') {
    return 'Заполните имя или компанию.';
  }

  if (normalizePath(path) === 'reviews[].text') {
    return 'Заполните текст отзыва.';
  }

  return 'Это поле обязательно.';
}

function getReviewMissingFields(review) {
  if (!isPlainObject(review)) {
    return ['имя', 'текст', 'изображение'];
  }

  const missingFields = [];

  if (isEmptyValue(review.name)) {
    missingFields.push('имя');
  }

  if (isEmptyValue(review.text)) {
    missingFields.push('текст');
  }

  if (isEmptyValue(review.image)) {
    missingFields.push('изображение');
  }

  return missingFields;
}

function hasIncompleteReviews(reviews) {
  if (!Array.isArray(reviews)) {
    return false;
  }

  return reviews.some((review) => getReviewMissingFields(review).length > 0);
}

function nextPath(segment) {
  return props.path ? `${props.path}.${segment}` : String(segment);
}

function getObjectBlueprint(key) {
  return isPlainObject(props.blueprint) ? props.blueprint[key] : undefined;
}

function getArrayItemBlueprint(index) {
  if (Array.isArray(props.blueprint) && props.blueprint.length > 0) {
    return props.blueprint[index] ?? props.blueprint[0];
  }

  if (Array.isArray(model.value) && model.value.length > 0) {
    return model.value[Math.min(index, model.value.length - 1)];
  }

  return '';
}

function createEmptyValue(sample) {
  if (Array.isArray(sample)) {
    return [];
  }

  if (isPlainObject(sample)) {
    return Object.fromEntries(
      Object.keys(sample).map((key) => [key, createEmptyValue(sample[key])])
    );
  }

  if (typeof sample === 'boolean') {
    return false;
  }

  if (typeof sample === 'number') {
    return 0;
  }

  return '';
}

function addArrayItem() {
  if (!Array.isArray(model.value)) {
    model.value = [];
  }

  model.value.push(createEmptyValue(getArrayItemBlueprint(model.value.length)));
}

function removeArrayItem(index) {
  model.value.splice(index, 1);
}

function getArrayItemTitle(item, index) {
  if (normalizedPath.value === 'reviews') {
    return item?.name ? item.name : `Отзыв ${index + 1}`;
  }

  if (normalizedPath.value.endsWith('paragraphs')) {
    return `Абзац ${index + 1}`;
  }

  if (normalizedPath.value.endsWith('titleLines')) {
    return `Строка ${index + 1}`;
  }

  if (normalizedPath.value.endsWith('proofPoints') || normalizedPath.value.endsWith('items')) {
    return `Пункт ${index + 1}`;
  }

  if (isPlainObject(item)) {
    const title = item.title || item.name || item.label;

    if (title) {
      return title;
    }
  }

  return `${displayLabel.value} ${index + 1}`;
}

function getAddButtonLabel() {
  if (normalizedPath.value === 'reviews') {
    return 'Добавить отзыв';
  }

  return 'Добавить';
}

function getRemoveButtonLabel() {
  if (normalizedPath.value === 'reviews') {
    return 'Удалить отзыв';
  }

  return 'Удалить';
}

function getArrayItemError(item) {
  if (normalizedPath.value !== 'reviews') {
    return '';
  }

  const missingFields = getReviewMissingFields(item);

  if (!missingFields.length) {
    return '';
  }

  return `Заполните: ${missingFields.join(', ')}.`;
}

function clearMediaValue() {
  model.value = '';
}

function getMediaButtonLabel() {
  if (mediaKind.value === 'video') {
    return model.value ? 'Заменить видео' : 'Загрузить видео';
  }

  return model.value ? 'Заменить изображение' : 'Загрузить изображение';
}

function getMediaHint() {
  if (mediaKind.value === 'video') {
    return model.value ? 'Текущее видео загружено.' : 'Видео пока не выбрано.';
  }

  return model.value ? 'Текущее изображение загружено.' : 'Изображение пока не выбрано.';
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function handleFileUpload(event) {
  const input = event.target;
  const [file] = input.files || [];

  if (!file) {
    return;
  }

  try {
    model.value = await readFileAsDataUrl(file);
  } finally {
    input.value = '';
  }
}
</script>

<template>
  <div class="content-editor" :class="{ 'content-editor--nested': depth > 0 }">
    <template v-if="isArrayValue">
      <div v-if="label && depth > 0" class="content-editor__group-heading">
        <h3>{{ displayLabel }}</h3>
      </div>

      <div class="content-editor__array">
        <article
          v-for="(item, index) in model"
          :key="`${path}-${index}`"
          class="content-editor__array-item"
        >
          <div class="content-editor__array-toolbar">
            <div class="content-editor__array-heading">
              <p>{{ getArrayItemTitle(item, index) }}</p>
              <p v-if="getArrayItemError(item)" class="content-editor__error">
                {{ getArrayItemError(item) }}
              </p>
            </div>
            <button
              v-if="canManageArrayItems"
              type="button"
              class="content-editor__danger"
              @click="removeArrayItem(index)"
            >
              {{ getRemoveButtonLabel() }}
            </button>
          </div>

          <AdminContentEditor
            v-model="model[index]"
            :label="displayLabel"
            :path="`${path}[${index}]`"
            :blueprint="getArrayItemBlueprint(index)"
            :locked-paths="lockedPaths"
            :depth="depth + 1"
          />
        </article>

        <div v-if="!model.length" class="content-editor__empty">
          Список пока пуст.
        </div>
      </div>

      <button
        v-if="canManageArrayItems"
        type="button"
        class="content-editor__add"
        :disabled="addButtonDisabled"
        @click="addArrayItem"
      >
        {{ getAddButtonLabel() }}
      </button>

      <p v-if="addButtonDisabled" class="content-editor__error">
        Сначала заполните все обязательные поля в текущих отзывах.
      </p>
    </template>

    <template v-else-if="isObjectValue">
      <div v-if="label && depth > 0" class="content-editor__group-heading">
        <h3>{{ displayLabel }}</h3>
      </div>

      <div v-if="objectKeys.length" class="content-editor__object-grid">
        <AdminContentEditor
          v-for="key in objectKeys"
          :key="`${path}-${key}`"
          v-model="model[key]"
          :label="key"
          :path="nextPath(key)"
          :blueprint="getObjectBlueprint(key)"
          :locked-paths="lockedPaths"
          :depth="depth + 1"
        />
      </div>
    </template>

    <template v-else>
      <label v-if="typeof model === 'boolean'" class="content-editor__checkbox">
        <input v-model="model" type="checkbox" />
        <span>{{ displayLabel }}</span>
      </label>

      <div
        v-else
        class="content-editor__field"
        :class="{ 'content-editor__field--invalid': fieldHasError }"
      >
        <span class="content-editor__label">{{ displayLabel }}</span>

        <textarea
          v-if="useTextarea"
          v-model="textFieldModel"
          class="content-editor__textarea"
          rows="4"
        ></textarea>

        <div
          v-else-if="mediaKind"
          class="content-editor__media"
          :class="{ 'content-editor__media--invalid': fieldHasError }"
        >
          <div class="content-editor__media-actions">
            <label class="content-editor__upload">
              <span>{{ getMediaButtonLabel() }}</span>
              <input
                type="file"
                :accept="mediaKind === 'video' ? 'video/*' : 'image/*'"
                @change="handleFileUpload"
              />
            </label>

            <button
              v-if="model"
              type="button"
              class="content-editor__ghost"
              @click="clearMediaValue"
            >
              Удалить файл
            </button>
          </div>

          <p class="content-editor__hint">{{ getMediaHint() }}</p>

          <div v-if="model" class="content-editor__preview">
            <img v-if="mediaKind === 'image'" :src="model" :alt="displayLabel" />
            <video
              v-else
              :src="model"
              controls
              muted
              playsinline
              preload="metadata"
            ></video>
          </div>
        </div>

        <input
          v-else-if="typeof model === 'number'"
          v-model.number="model"
          type="number"
          class="content-editor__input"
        />

        <input v-else v-model="textFieldModel" type="text" class="content-editor__input" />

        <p v-if="validationMessage" class="content-editor__error">
          {{ validationMessage }}
        </p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.content-editor {
  display: grid;
  gap: 18px;
}

.content-editor--nested {
  padding: 18px;
  border: 1px solid rgba(212, 220, 234, 0.92);
  background: rgba(247, 249, 253, 0.9);
}

.content-editor__group-heading h3 {
  margin: 0;
  color: #203661;
  font-size: 15px;
  font-weight: 800;
}

.content-editor__object-grid {
  display: grid;
  gap: 16px;
}

.content-editor__field,
.content-editor__media,
.content-editor__checkbox {
  display: grid;
  gap: 10px;
}

.content-editor__field--invalid .content-editor__input,
.content-editor__field--invalid .content-editor__textarea,
.content-editor__media--invalid .content-editor__upload,
.content-editor__media--invalid .content-editor__preview {
  border-color: rgba(190, 69, 69, 0.7);
}

.content-editor__label,
.content-editor__array-toolbar p,
.content-editor__checkbox span,
.content-editor__hint {
  margin: 0;
  color: #30466f;
  font-size: 13px;
  letter-spacing: 0.01em;
}

.content-editor__label,
.content-editor__array-toolbar p,
.content-editor__checkbox span {
  font-weight: 700;
}

.content-editor__hint {
  color: #5c6f91;
}

.content-editor__input,
.content-editor__textarea {
  width: 100%;
  border: 1px solid rgba(189, 201, 222, 0.96);
  background: #ffffff;
  color: #132342;
  padding: 12px 14px;
}

.content-editor__textarea {
  min-height: 108px;
  resize: vertical;
}

.content-editor__checkbox {
  grid-template-columns: auto 1fr;
  align-items: center;
}

.content-editor__checkbox input {
  width: 18px;
  height: 18px;
  margin: 0;
}

.content-editor__array {
  display: grid;
  gap: 14px;
}

.content-editor__array-item {
  display: grid;
  gap: 12px;
  padding: 16px;
  border: 1px solid rgba(212, 220, 234, 0.92);
  background: #ffffff;
}

.content-editor__array-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.content-editor__array-heading {
  display: grid;
  gap: 4px;
}

.content-editor__add,
.content-editor__ghost,
.content-editor__danger,
.content-editor__upload {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 10px 14px;
  border: 1px solid rgba(167, 182, 209, 0.96);
  background: #ffffff;
  color: #193158;
  font-size: 13px;
  font-weight: 700;
}

.content-editor__add:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.content-editor__danger {
  border-color: rgba(205, 115, 115, 0.4);
  color: #8d2635;
}

.content-editor__upload {
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.content-editor__upload input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.content-editor__media-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.content-editor__preview {
  overflow: hidden;
  border: 1px solid rgba(212, 220, 234, 0.92);
  background: #f2f5fb;
}

.content-editor__preview img,
.content-editor__preview video {
  display: block;
  width: 100%;
  max-height: 280px;
  object-fit: contain;
}

.content-editor__empty {
  padding: 16px;
  border: 1px dashed rgba(167, 182, 209, 0.96);
  color: #5c6f91;
  font-size: 14px;
}

.content-editor__error {
  margin: 0;
  color: #a02f3c;
  font-size: 13px;
  line-height: 1.45;
}

@media (max-width: 720px) {
  .content-editor__array-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
