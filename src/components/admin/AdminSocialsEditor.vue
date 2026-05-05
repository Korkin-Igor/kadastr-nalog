<script setup>
defineOptions({
  name: 'AdminSocialsEditor'
});

const model = defineModel({
  default: () => []
});

function ensureArray() {
  if (!Array.isArray(model.value)) {
    model.value = [];
  }
}

function createEmptySocial() {
  return {
    name: '',
    url: '',
    alt: '',
    icon: ''
  };
}

function addSocial() {
  ensureArray();
  model.value.push(createEmptySocial());
}

function removeSocial(index) {
  model.value.splice(index, 1);
}

function getSocialTitle(social, index) {
  return social?.name?.trim() || `Соцсеть ${index + 1}`;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function handleIconUpload(index, event) {
  const input = event.target;
  const [file] = input.files || [];

  if (!file) {
    return;
  }

  try {
    model.value[index].icon = await readFileAsDataUrl(file);
  } finally {
    input.value = '';
  }
}

function clearIcon(index) {
  model.value[index].icon = '';
}
</script>

<template>
  <section class="admin-socials">
    <div class="admin-socials__header">
      <div>
        <p class="admin-socials__title">Соцсети в подвале</p>
        <p class="admin-socials__hint">
          Можно добавлять карточки, менять ссылку и загружать собственную иконку.
        </p>
      </div>

      <button type="button" class="admin-socials__add" @click="addSocial">
        Добавить соцсеть
      </button>
    </div>

    <div v-if="model.length" class="admin-socials__list">
      <article
        v-for="(social, index) in model"
        :key="social.name || social.url || index"
        class="admin-socials__card"
      >
        <div class="admin-socials__card-header">
          <p class="admin-socials__card-title">{{ getSocialTitle(social, index) }}</p>
          <button type="button" class="admin-socials__remove" @click="removeSocial(index)">
            Удалить
          </button>
        </div>

        <div class="admin-socials__grid">
          <label class="admin-socials__field">
            <span>Название</span>
            <input v-model="social.name" type="text" placeholder="VK" />
          </label>

          <label class="admin-socials__field">
            <span>Ссылка</span>
            <input v-model="social.url" type="text" placeholder="https://example.com/profile" />
          </label>

          <label class="admin-socials__field">
            <span>Alt-текст</span>
            <input v-model="social.alt" type="text" placeholder="Логотип VK" />
          </label>
        </div>

        <div class="admin-socials__icon-row">
          <label class="admin-socials__upload">
            <span>{{ social.icon ? 'Заменить иконку' : 'Загрузить иконку' }}</span>
            <input type="file" accept="image/*,.svg" @change="handleIconUpload(index, $event)" />
          </label>

          <button
            v-if="social.icon"
            type="button"
            class="admin-socials__ghost"
            @click="clearIcon(index)"
          >
            Удалить иконку
          </button>
        </div>

        <div v-if="social.icon" class="admin-socials__icon-preview">
          <img :src="social.icon" :alt="social.alt || social.name || 'Иконка соцсети'" />
        </div>
      </article>
    </div>

    <div v-else class="admin-socials__empty">Список соцсетей пока пуст.</div>
  </section>
</template>

<style scoped>
.admin-socials {
  display: grid;
  gap: 16px;
  padding: 18px;
  border: 1px solid rgba(212, 220, 234, 0.92);
  background: rgba(247, 249, 253, 0.9);
}

.admin-socials__header,
.admin-socials__card-header,
.admin-socials__icon-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.admin-socials__title,
.admin-socials__hint,
.admin-socials__card-title,
.admin-socials__empty {
  margin: 0;
}

.admin-socials__title,
.admin-socials__card-title,
.admin-socials__field span {
  color: #203661;
  font-size: 14px;
  font-weight: 800;
}

.admin-socials__hint,
.admin-socials__empty {
  color: #5c6f91;
  font-size: 13px;
  line-height: 1.5;
}

.admin-socials__list {
  display: grid;
  gap: 14px;
}

.admin-socials__card {
  display: grid;
  gap: 14px;
  padding: 16px;
  border: 1px solid rgba(212, 220, 234, 0.92);
  background: #ffffff;
}

.admin-socials__grid {
  display: grid;
  gap: 12px;
}

.admin-socials__field {
  display: grid;
  gap: 8px;
}

.admin-socials__field input {
  width: 100%;
  min-height: 44px;
  padding: 12px 14px;
  border: 1px solid rgba(189, 201, 222, 0.96);
  background: #ffffff;
  color: #132342;
}

.admin-socials__add,
.admin-socials__remove,
.admin-socials__ghost,
.admin-socials__upload {
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

.admin-socials__remove {
  border-color: rgba(205, 115, 115, 0.4);
  color: #8d2635;
}

.admin-socials__upload {
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.admin-socials__upload input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.admin-socials__icon-preview {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 76px;
  height: 76px;
  border: 1px solid rgba(212, 220, 234, 0.92);
  background: #f2f5fb;
}

.admin-socials__icon-preview img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

@media (max-width: 720px) {
  .admin-socials__header,
  .admin-socials__card-header,
  .admin-socials__icon-row {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
