<script setup>
import { computed } from 'vue';
import LeadFormCard from '@/components/ui/LeadFormCard.vue';
import { servicePagesBySlug } from '@/data/servicePages';

const props = defineProps({
  slug: {
    type: String,
    required: true
  }
});

const page = computed(() => servicePagesBySlug[props.slug]);
</script>

<template>
  <div v-if="page" class="service-page">
    <main class="page-shell">
      <section class="section service-page__body service-page__body--clean">
        <div class="container service-page__body-layout">
          <aside
              id="request-form"
              class="service-page__form-shell"
              v-reveal="{ delay: 120, origin: 'right' }"
          >
            <LeadFormCard
                :icon="page.icon"
                :title="page.form.title"
                :description="page.form.description"
                :fields="page.form.fields"
                :submit-label="page.form.submitLabel"
                :success-text="page.form.successText"
                :form-type="page.form.formType"
                :action-url="page.form.actionUrl"
                :show-back-link="page.form.showBackLink"
                :back-link-label="page.form.backLinkLabel"
                :back-link-href="page.form.backLinkHref"
                :submitting-label="page.form.submittingLabel"
                :required-select-message="page.form.requiredSelectMessage"
                :required-field-message="page.form.requiredFieldMessage"
                :phone-incomplete-message="page.form.phoneIncompleteMessage"
                :email-invalid-message="page.form.emailInvalidMessage"
                :cadastral-invalid-message="page.form.cadastralInvalidMessage"
                :submit-failed-message="page.form.submitFailedMessage"
                :network-failed-message="page.form.networkFailedMessage"
                :badge-text="page.form.badgeText"
                :note="page.form.note"
                :note-icon="page.form.noteIcon"
            />
          </aside>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* Базовые стили страницы */
.service-page {
  min-height: 100vh;
  background:
      radial-gradient(circle at top left, rgba(86, 120, 255, 0.18) 0%, rgba(86, 120, 255, 0) 24%),
      linear-gradient(180deg, #f4f7fc 0%, #edf2fa 100%);
  display: flex;
  flex-direction: column;
}

.page-shell {
  flex: 1;
  display: flex;
  align-items: center; /* Центрируем форму по вертикали, если места много */
  justify-content: center;
}

/* Body секция - очищенная */
.service-page__body {
  padding-top: 40px;
  padding-bottom: 80px;
  width: 100%;
}

.service-page__body-layout {
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

/* Форма теперь занимает всё доступное место или центрируется */
.service-page__form-shell {
  position: relative;
  width: 100%;
  max-width: 600px; /* Ограничиваем ширину формы для красоты */
  margin: 0 auto;
}

@media (max-width: 639px) {
  .service-page__body {
    padding-top: 20px;
    padding-bottom: 40px;
  }

  .service-page__form-shell {
    padding: 0 16px;
  }
}
</style>
