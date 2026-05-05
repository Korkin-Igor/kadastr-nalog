<script setup>
import { computed } from 'vue';

defineOptions({
  name: 'AdminAssetField'
});

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  kind: {
    type: String,
    default: 'image'
  },
  accept: {
    type: String,
    default: 'image/*'
  },
  hint: {
    type: String,
    default: ''
  }
});

const model = defineModel({
  default: ''
});

const hasValue = computed(() => typeof model.value === 'string' && model.value.length > 0);
const isImageValue = computed(() => isImageAsset(model.value));
const actionLabel = computed(() => {
  if (props.kind === 'file') {
    return hasValue.value ? 'Заменить файл' : 'Загрузить файл';
  }

  return hasValue.value ? 'Заменить изображение' : 'Загрузить изображение';
});
const statusLabel = computed(() => {
  if (!hasValue.value) {
    return props.kind === 'file' ? 'Файл пока не загружен.' : 'Изображение пока не загружено.';
  }

  if (props.kind === 'file' && !isImageValue.value) {
    return `Файл загружен: ${getAssetBadge(model.value)}`;
  }

  return props.kind === 'file'
    ? 'Файл загружен и готов к использованию.'
    : 'Изображение загружено и готово к использованию.';
});

function isImageAsset(value) {
  const normalizedValue = String(value || '').toLowerCase();

  return (
    normalizedValue.startsWith('data:image/') ||
    /\.(svg|png|jpe?g|gif|webp|avif)(\?|#|$)/.test(normalizedValue)
  );
}

function getAssetBadge(value) {
  const normalizedValue = String(value || '').toLowerCase();

  if (!normalizedValue) {
    return 'FILE';
  }

  if (normalizedValue.startsWith('data:application/pdf')) {
    return 'PDF';
  }

  if (normalizedValue.startsWith('data:application/msword')) {
    return 'DOC';
  }

  if (
    normalizedValue.startsWith(
      'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
  ) {
    return 'DOCX';
  }

  if (normalizedValue.startsWith('data:image/')) {
    return 'IMG';
  }

  const extensionMatch = normalizedValue.match(/\.([a-z0-9]+)(?:\?|#|$)/i);
  return extensionMatch?.[1]?.toUpperCase() || 'FILE';
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

function clearValue() {
  model.value = '';
}
</script>

<template>
  <section class="admin-asset-field">
    <div class="admin-asset-field__copy">
      <p class="admin-asset-field__label">{{ props.label }}</p>
      <p v-if="props.hint" class="admin-asset-field__hint">{{ props.hint }}</p>
    </div>

    <div class="admin-asset-field__actions">
      <label class="admin-asset-field__upload">
        <span>{{ actionLabel }}</span>
        <input type="file" :accept="props.accept" @change="handleFileUpload" />
      </label>

      <button
        v-if="hasValue"
        type="button"
        class="admin-asset-field__ghost"
        @click="clearValue"
      >
        Удалить
      </button>
    </div>

    <p class="admin-asset-field__status">{{ statusLabel }}</p>

    <div v-if="hasValue" class="admin-asset-field__preview">
      <img v-if="isImageValue" :src="model" :alt="props.label" class="admin-asset-field__image" />

      <a
        v-else
        :href="model"
        target="_blank"
        rel="noopener noreferrer"
        class="admin-asset-field__file"
      >
        <span class="admin-asset-field__badge">{{ getAssetBadge(model) }}</span>
        <span>Открыть загруженный файл</span>
      </a>
    </div>
  </section>
</template>

<style scoped>
.admin-asset-field {
  display: grid;
  gap: 12px;
  padding: 18px;
  border: 1px solid rgba(212, 220, 234, 0.92);
  background: rgba(247, 249, 253, 0.9);
}

.admin-asset-field__copy,
.admin-asset-field__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
  align-items: center;
  justify-content: space-between;
}

.admin-asset-field__label,
.admin-asset-field__hint,
.admin-asset-field__status {
  margin: 0;
}

.admin-asset-field__label {
  color: #203661;
  font-size: 14px;
  font-weight: 800;
}

.admin-asset-field__hint,
.admin-asset-field__status {
  color: #5c6f91;
  font-size: 13px;
  line-height: 1.5;
}

.admin-asset-field__upload,
.admin-asset-field__ghost {
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

.admin-asset-field__upload {
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.admin-asset-field__upload input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.admin-asset-field__preview {
  overflow: hidden;
  border: 1px solid rgba(212, 220, 234, 0.92);
  background: #ffffff;
}

.admin-asset-field__image {
  display: block;
  width: 100%;
  max-height: 180px;
  object-fit: contain;
  background: #f2f5fb;
}

.admin-asset-field__file {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  color: #193158;
  text-decoration: none;
}

.admin-asset-field__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 52px;
  min-height: 32px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #0b1430;
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

@media (max-width: 720px) {
  .admin-asset-field__copy,
  .admin-asset-field__actions {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
