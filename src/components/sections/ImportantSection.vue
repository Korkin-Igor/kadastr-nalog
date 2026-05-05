<script setup>
import SectionTitle from '@/components/ui/SectionTitle.vue';

defineProps({
  importantSection: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <section id="important" class="section important-section">
    <div class="container important-section__stack">
      <SectionTitle :title="importantSection.title" inverted class="title" />
      <div class="important-section__layout">
        <div class="important-section__summary" v-reveal="{ delay: 70, origin: 'left' }">

          <article class="important-section__summary-card">
            <h3>{{ importantSection.lead }}</h3>
            <p>{{ importantSection.body }}</p>
          </article>
        </div>

        <TransitionGroup name="stack" tag="div" class="important-section__cards" appear>
          <article
            v-for="(card, index) in importantSection.cards"
            :key="`${index}-${card.title}`"
            class="important-section__card"
            :style="{ '--stack-delay': `${120 + index * 90}ms` }"
            v-reveal="{ delay: 120 + index * 90, origin: 'right' }"
          >
            <span class="important-section__card-icon">
              <img :src="card.icon" alt="" aria-hidden="true" />
            </span>

            <div>
              <h3>{{ card.title }}</h3>
              <p>{{ card.description }}</p>
            </div>
          </article>
        </TransitionGroup>
      </div>
    </div>
  </section>
</template>

<style scoped>
.title {
  margin-left: clamp(24px, 4vw, 54px);
}

.important-section__stack {
  display: grid;
  gap: 40px;
}

.important-section__layout {
  display: grid;
  gap: 40px;
  align-items: start;
}

.important-section {
  background: linear-gradient(68deg, #17397e 16.326%, #051c35 99.718%);
}

.important-section__summary {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 30px;
  height: 100%;
}

.important-section__summary-card,
.important-section__card,
.useful-card,
.footer__placeholder {
  border: 1px solid var(--border-soft);
  border-radius: 28px;
  background: #ffffff;
  box-shadow: var(--shadow-soft);
}

.important-section__summary-card {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  padding: clamp(28px, 4vw, 36px);
  border-radius: 24px;
  border-color: rgba(93, 123, 186, 0.26);
  background: linear-gradient(135deg, rgba(63, 69, 150, 0.34) 0%, rgba(22, 52, 104, 0.5) 58%, rgba(11, 29, 60, 0.78) 100%);
  box-shadow: 0 20px 56px rgba(4, 16, 39, 0.28);
  transition:
    border-color 800ms cubic-bezier(0.22, 0.74, 0.2, 1),
    background 800ms cubic-bezier(0.22, 0.74, 0.2, 1),
    box-shadow 800ms cubic-bezier(0.22, 0.74, 0.2, 1),
    transform 400ms cubic-bezier(0.22, 0.74, 0.2, 1);
}

.important-section__summary-card h3 {
  margin: 0 0 18px;
  color: #ffffff;
  font-size: 2rem;
  line-height: 1.15;
  position: relative;
  z-index: 1;
  transition: color 800ms cubic-bezier(0.22, 0.74, 0.2, 1);
}

.important-section__summary-card p {
  margin: 0;
  color: rgba(234, 241, 255, 0.84);
  font-size: 20px;
  line-height: 1.65;
  position: relative;
  z-index: 1;
  transition: color 800ms cubic-bezier(0.22, 0.74, 0.2, 1);
}

.important-section__cards {
  display: flex;
  flex-direction: column;
  gap: 18px;
  overflow: visible;
}

.important-section__card {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  display: flex;
  gap: 10px;
  align-self: flex-start;
  width: 100%;
  transform-origin: left;
  will-change: max-width, background, border-color, box-shadow;
  padding: 20px 24px;
  border-radius: 22px;
  background: rgba(8, 24, 52, 0.26);
  border-color: rgba(93, 123, 186, 0.22);
  box-shadow: none;
  transition:
    max-width 800ms cubic-bezier(0.22, 0.74, 0.2, 1),
    border-color 800ms cubic-bezier(0.22, 0.74, 0.2, 1),
    background 800ms cubic-bezier(0.22, 0.74, 0.2, 1),
    box-shadow 800ms cubic-bezier(0.22, 0.74, 0.2, 1);
}

.important-section__card::before,
.important-section__card::after {
  content: '';
  position: absolute;
  pointer-events: none;
  opacity: 0;
  transition:
    opacity 360ms cubic-bezier(0.2, 0.9, 0.25, 1),
    transform 360ms cubic-bezier(0.2, 0.9, 0.25, 1);
}

.important-section__card::before {
  inset: 0;
  background:
    linear-gradient(128deg, rgba(255, 255, 255, 0.38) 0%, rgba(255, 255, 255, 0) 38%),
    linear-gradient(210deg, rgba(120, 90, 255, 0.08) 0%, rgba(120, 90, 255, 0) 54%);
  transform: translate3d(18px, 18px, 0) scale(0.94);
  z-index: 0;
}

.important-section__card::after {
  right: -162px;
  bottom: -188px;
  width: 468px;
  height: 468px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(112, 82, 255, 0.74) 0%,
    rgba(81, 198, 255, 0.58) 28%,
    rgba(191, 230, 255, 0.22) 52%,
    rgba(255, 255, 255, 0) 76%
  );
  filter: blur(24px);
  mix-blend-mode: screen;
  transform: translate3d(42px, 48px, 0) scale(0.72);
  z-index: 0;
}

.important-section__card:hover {
  border-color: rgba(121, 147, 226, 0.46);
  background:
    radial-gradient(circle at 97% 90%, rgba(112, 72, 255, 0.44) 0%, rgba(112, 72, 255, 0) 56%),
    linear-gradient(156deg, rgba(247, 243, 255, 0.98) 0%, rgba(240, 247, 255, 0.98) 54%, rgba(251, 252, 255, 0.96) 100%);
  box-shadow:
    0 34px 78px rgba(9, 19, 43, 0.24),
    0 0 0 1px rgba(255, 255, 255, 0.16) inset;
}

.important-section__card:hover::before,
.important-section__card:hover::after {
  opacity: 1;
}

.important-section__card:hover::before {
  transform: translate3d(0, 0, 0) scale(1);
}

.important-section__card:hover::after {
  transform: translate3d(0, 0, 0) scale(1.08);
}

.important-section__card-top {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 12px;
  max-width: 500px;
  position: relative;
  z-index: 1;
}

.important-section__card-icon,
.useful-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  max-width: 52px;
  width: 100%;
  height: 52px;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(27, 151, 234, 0.14) 0%, rgba(105, 57, 184, 0.16) 100%);
}

.important-section__card-icon img,
.useful-card__icon img {
  width: 24px;
  height: 24px;
}

.important-section__card h3,
.useful-card h3 {
  margin: 0;
  color: #2fd7ff;
  font-size: 14px;
  line-height: 1.45;
  font-weight: 700;
  position: relative;
  z-index: 1;
  transition: color 800ms cubic-bezier(0.22, 0.74, 0.2, 1);
}

.important-section__card p {
  margin: 0;
  color: #ffffff;
  font-size: 16px;
  line-height: 1.5;
  position: relative;
  z-index: 1;
  transition: color 800ms cubic-bezier(0.22, 0.74, 0.2, 1);
}

.important-section__card:hover h3 {
  color: var(--accent-deep);
}

.important-section__card:hover p {
  color: var(--text-secondary);
}

.important-section__card-icon {
  transition:
    background 800ms cubic-bezier(0.22, 0.74, 0.2, 1),
    box-shadow 800ms cubic-bezier(0.22, 0.74, 0.2, 1);
}

.important-section__card:hover .important-section__card-icon {
  background: linear-gradient(135deg, #1b97ea 0%, #6939b8 100%);
  box-shadow: 0 14px 30px rgba(43, 106, 212, 0.24);
}

@media (max-width: 700px) {
  .title {
    margin: 0 0 20px 0;
  }
}

@media (min-width: 900px) {
  .important-section__card {
    max-width: 560px;
  }

  .important-section__card:hover {
    max-width: 700px;
  }

  .important-section__card p {
    max-width: 450px;
  }
}
</style>
