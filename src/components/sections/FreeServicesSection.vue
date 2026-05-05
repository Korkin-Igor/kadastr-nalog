<script setup>
import LeadFormCard from '@/components/ui/LeadFormCard.vue';
import SectionTitle from '@/components/ui/SectionTitle.vue';

defineProps({
  title: {
    type: String,
    required: true
  },
  forms: {
    type: Array,
    required: true
  }
});
</script>

<template>
  <section id="free-services" class="section free-services-section section--dark">
    <div class="container free-services-section__stack">
      <SectionTitle
        :title="title"
        centered
        inverted

      />

      <TransitionGroup name="stack" tag="div" class="free-services-section__grid" appear>
        <LeadFormCard
          v-for="(card, index) in forms"
          :key="`${index}-${card.title}`"
          :icon="card.icon"
          :title="card.title"
          :description="card.description"
          :fields="card.fields"
          :submit-label="card.submitLabel"
          :success-text="card.successText"
          :form-type="card.formType"
          :action-url="card.actionUrl"
          :show-back-link="card.showBackLink"
          :back-link-label="card.backLinkLabel"
          :back-link-href="card.backLinkHref"
          :submitting-label="card.submittingLabel"
          :required-select-message="card.requiredSelectMessage"
          :required-field-message="card.requiredFieldMessage"
          :phone-incomplete-message="card.phoneIncompleteMessage"
          :email-invalid-message="card.emailInvalidMessage"
          :cadastral-invalid-message="card.cadastralInvalidMessage"
          :submit-failed-message="card.submitFailedMessage"
          :network-failed-message="card.networkFailedMessage"
          :style="{ '--stack-delay': `${index * 120}ms` }"
          v-reveal="{ delay: 80 + index * 120 }"
        />
      </TransitionGroup>
    </div>
  </section>
</template>

<style>
.free-services-section {
  scroll-margin-top: calc(var(--page-header-offset) + clamp(20px, 3vw, 32px));
  background: radial-gradient(circle at 18% 32%, rgba(165, 90, 255, 0.24) 0%, rgba(165, 90, 255, 0) 18%), radial-gradient(circle at 86% 74%, rgba(76, 167, 255, 0.22) 0%, rgba(76, 167, 255, 0) 18%), var(--gradient-free);
  background-size: 120% 120%;
  animation: gradient-flow 18s ease-in-out infinite alternate;
}

.free-services-section__stack,
.reviews-section__stack,
.useful-section__stack {
  display: grid;
  gap: 38px;
}

.free-services-section__grid {
  display: grid;
  gap: 24px;
}

.free-services-section .section-title.section-title--inverted .section-title__heading {
  color: var(--accent-cyan);
  font-size: clamp(38px, 4.2vw, 56px);
  text-shadow:
    0 0 18px rgba(4, 228, 255, 0.22),
    0 0 36px rgba(4, 228, 255, 0.16);
}

.free-services-section .form-card {
  min-height: 500px;
  border-color: rgba(194, 204, 226, 0.7);
  box-shadow: 0 16px 46px rgba(9, 19, 43, 0.16);
}

.free-services-section .form-card__title {
  max-width: 560px;
  font-size: clamp(18px, 1.8vw, 22px);
}

.free-services-section .form-card__description {
  max-width: 620px;
  font-size: 16px;
  line-height: 1.5;
}

.free-services-section .form-field__label {
  font-size: 15px;
}

.free-services-section .form-field__control {
  border-radius: 0;
  background: #f4f7fc;
}

.free-services-section .form-card__submit {
  border-radius: 0;
}
</style>
