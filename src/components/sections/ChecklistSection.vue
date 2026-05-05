<script setup>
import LeadFormCard from '@/components/ui/LeadFormCard.vue';

defineProps({
  checklistContent: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <section id="checklist" class="section checklist-section">
    <div class="container checklist-section__card">
      <div class="checklist-section__glow checklist-section__glow--left"></div>
      <div class="checklist-section__glow checklist-section__glow--right"></div>

      <div class="checklist-section__copy" v-reveal="{ delay: 80, origin: 'left' }">
        <div class="pill-chip">
          <img :src="checklistContent.checkListIcon" alt="">
          <span>{{ checklistContent.eyebrow }}</span>
        </div>

        <h2>{{ checklistContent.title }}</h2>
        <p class="checklist-section__lead">{{ checklistContent.description }}</p>

        <TransitionGroup name="stack" tag="div" class="checklist-section__benefits" appear>
          <article
            v-for="(item, index) in checklistContent.benefits"
            :key="`${index}-${item.text}`"
            class="checklist-section__benefit"
            :style="{ '--stack-delay': `${160 + index * 90}ms` }"
            v-reveal="{ delay: 160 + index * 90, origin: 'left' }"
          >
            <span class="checklist-section__benefit-badge">
              <img :src="item.icon" alt="" aria-hidden="true" />
            </span>
            <span>{{ item.text }}</span>
          </article>
        </TransitionGroup>

        <p class="checklist-section__privacy">{{ checklistContent.note }}</p>
      </div>

      <LeadFormCard
        variant="checklist"
        :title="checklistContent.formTitle"
        :description="checklistContent.formDescription"
        :fields="checklistContent.fields"
        :submit-label="checklistContent.submitLabel"
        :success-text="checklistContent.successText"
        :form-type="checklistContent.formType"
        :action-url="checklistContent.actionUrl"
        :show-back-link="checklistContent.showBackLink"
        :back-link-label="checklistContent.backLinkLabel"
        :back-link-href="checklistContent.backLinkHref"
        :submitting-label="checklistContent.submittingLabel"
        :required-select-message="checklistContent.requiredSelectMessage"
        :required-field-message="checklistContent.requiredFieldMessage"
        :phone-incomplete-message="checklistContent.phoneIncompleteMessage"
        :email-invalid-message="checklistContent.emailInvalidMessage"
        :cadastral-invalid-message="checklistContent.cadastralInvalidMessage"
        :submit-failed-message="checklistContent.submitFailedMessage"
        :network-failed-message="checklistContent.networkFailedMessage"
        :badge-text="checklistContent.badge"
        :note="checklistContent.privacy"
        :note-icon="checklistContent.noteIcon"
        v-reveal="{ delay: 160, origin: 'right' }"
      />
    </div>
  </section>
</template>

<style>
.checklist-section {
  background: linear-gradient(180deg, rgba(96, 49, 172, 0.98) 0%, rgba(19, 83, 156, 0.96) 100%);
}

.checklist-section__card {
  position: relative;
  display: grid;
  gap: 28px;
  max-width: 1412px;
  margin-inline: auto;
  align-items: start;
}

.checklist-section__glow {
  position: absolute;
  border-radius: 999px;
  pointer-events: none;
}

.checklist-section__glow--left {
  left: -20px;
  bottom: 100px;
  width: 260px;
  height: 260px;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.38) 0%, rgba(168, 85, 247, 0) 70%);
  filter: blur(42px);
  animation: mesh-drift 16s ease-in-out infinite;
}

.checklist-section__glow--right {
  right: 14%;
  top: -40px;
  width: 220px;
  height: 220px;
  background: radial-gradient(circle, rgba(4, 228, 255, 0.26) 0%, rgba(4, 228, 255, 0) 70%);
  filter: blur(40px);
  animation: mesh-drift 18s ease-in-out infinite reverse;
}

.checklist-section__copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  color: white;
  height: 100%;
}

.checklist-section__copy h2 {
  margin: 0;
  color: var(--accent-cyan);
  font-size: clamp(34px, 5vw, 48px);
  line-height: 1;
  text-shadow:
    0 0 18px rgba(4, 228, 255, 0.22),
    0 0 36px rgba(4, 228, 255, 0.16);
}

.checklist-section__lead,
.checklist-section__privacy {
  margin: 0;
  max-width: 690px;
  color: rgba(255, 255, 255, 0.84);
  font-size: 17px;
  line-height: 1.65;
}

.checklist-section__benefits {
  display: grid;
  gap: 10px;
  width: 100%;
}

.checklist-section__benefit {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px 16px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.92);
  font-size: 16px;
  transition:
      width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
      background-color 0.4s ease,
      border-color 0.4s ease,
      color 0.4s ease,
      transform 0.4s ease;

  cursor: pointer;
  overflow: hidden;
}

.checklist-section__benefit:hover {
  width: calc(100% + 20px);

  background: linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%);

  border-color: rgba(101, 63, 186, 0.3);

  color: #1e293b;

  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
}

/* Также можно добавить эффект для бейджика с иконкой */
.checklist-section__benefit:hover .checklist-section__benefit-badge {
  /* Меняем градиент бейджика на более светлый */
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  /* И добавляем ему свечение */
  box-shadow: 0 0 15px rgba(168, 85, 247, 0.5);
}

.checklist-section__benefit-badge {
  flex: 0 0 28px;
  width: 28px;
  height: 28px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(27, 151, 234, 0.92) 0%, rgba(105, 57, 184, 0.92) 100%);
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.checklist-section__benefit-badge img {
  width: 14px;
  height: 14px;
}

.checklist-section .form-card--checklist {
  width: 100%;
  justify-self: end;
  min-height: 496px;
  gap: 16px;
}

.checklist-section .form-card__title {
  font-size: clamp(22px, 2.3vw, 30px);
}

.checklist-section .form-card__description {
  font-size: 16px;
  line-height: 1.5;
}

.checklist-section .form-field__label {
  font-size: 14px;
}

.checklist-section .form-field__control {
  border-radius: 14px;
  background: #f5f7fc;
}

.checklist-section .form-card__submit {
  border-radius: 0;
}

.checklist-section .form-card__chip {
  background: rgba(101, 63, 186, 0.1);
}
</style>
