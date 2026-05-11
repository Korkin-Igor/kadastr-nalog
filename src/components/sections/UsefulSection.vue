<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import SectionTitle from '@/components/ui/SectionTitle.vue';

const props = defineProps({
  usefulSection: {
    type: Object,
    required: true
  }
});

const featuredCards = computed(() => props.usefulSection.cards.filter((card) => card.featured));
const regularCards = computed(() => props.usefulSection.cards.filter((card) => !card.featured));
</script>

<template>
  <section id="useful" class="section useful-section">
    <div class="useful-section__mesh"></div>

    <div class="container useful-section__stack">
      <SectionTitle
        :title="usefulSection.title"
        centered
        inverted
      />

      <TransitionGroup
        v-if="featuredCards.length"
        name="stack"
        tag="div"
        class="useful-grid useful-grid--featured"
        appear
      >
        <RouterLink
          v-for="(card, index) in featuredCards"
          :key="`featured-${index}-${card.title}`"
          :to="card.to"
          class="useful-card useful-card--featured"
          :style="{ '--stack-delay': `${80 + index * 70}ms` }"
          v-reveal="{ delay: 80 + index * 70 }"
        >
          <span class="useful-card__icon">
            <img :src="card.icon" alt="" aria-hidden="true" />
          </span>
          <div class="useful-card__body">
            <span v-if="card.badge" class="useful-card__badge">{{ card.badge }}</span>
            <h3>{{ card.title }}</h3>
            <p class="useful-card__description">
              {{ card.description }}
            </p>
            <span class="useful-card__cta">
              {{ card.ctaLabel || 'Открыть страницу' }}
            </span>
          </div>
        </RouterLink>
      </TransitionGroup>

      <TransitionGroup
        v-if="regularCards.length"
        name="stack"
        tag="div"
        class="useful-grid useful-grid--default"
        appear
      >
        <RouterLink
          v-for="(card, index) in regularCards"
          :key="`regular-${index}-${card.title}`"
          :to="card.to"
          class="useful-card"
          :style="{ '--stack-delay': `${220 + index * 55}ms` }"
          v-reveal="{ delay: 220 + index * 55 }"
        >
          <span class="useful-card__icon">
            <img :src="card.icon" alt="" aria-hidden="true" />
          </span>
          <div class="useful-card__body">
            <h3>{{ card.title }}</h3>
          </div>
        </RouterLink>
      </TransitionGroup>
    </div>
  </section>
</template>

<style>
.useful-section__stack {
  display: grid;
  gap: 38px;
}

.useful-section {
  overflow: clip;
  background: linear-gradient(114deg, #3d469f 7.96%, #0e4974 45.304%, #56237c 80.961%);
}

.useful-section__mesh {
  position: absolute;
  inset: 80px auto auto 6%;
  width: 280px;
  height: 280px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(123, 92, 255, 0.18) 0%, rgba(123, 92, 255, 0) 70%);
  filter: blur(36px);
  animation: mesh-drift 14s ease-in-out infinite;
}

.useful-grid {
  display: grid;
  gap: 18px;
}

.useful-grid--featured,
.useful-grid--default {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.useful-section .section-title__heading {
  font-size: clamp(38px, 4vw, 54px);
}

.useful-card {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  gap: 0 18px;
  align-items: start;
  padding: 24px;
  min-height: 112px;
  border: 1px solid var(--border-soft);
  border-radius: 20px;
  background: rgba(12, 33, 73, 0.48);
  border-color: rgba(121, 142, 194, 0.24);
  box-shadow: 0 18px 44px rgba(9, 19, 43, 0.18);
  transition:
    transform 420ms cubic-bezier(0.22, 0.74, 0.2, 1),
    border-color 420ms cubic-bezier(0.22, 0.74, 0.2, 1),
    background 420ms cubic-bezier(0.22, 0.74, 0.2, 1),
    box-shadow 420ms cubic-bezier(0.22, 0.74, 0.2, 1);
}

.useful-card--featured {
  grid-template-columns: 60px minmax(0, 1fr);
  gap: 0 18px;
  padding: 26px;
  min-height: 236px;
  border-color: rgba(160, 195, 255, 0.3);
  background:
    radial-gradient(circle at 100% 100%, rgba(112, 72, 255, 0.22) 0%, rgba(112, 72, 255, 0) 58%),
    linear-gradient(160deg, rgba(20, 41, 88, 0.9) 0%, rgba(18, 55, 92, 0.9) 48%, rgba(43, 33, 100, 0.88) 100%);
  box-shadow:
    0 26px 56px rgba(6, 18, 45, 0.24),
    0 0 0 1px rgba(165, 225, 255, 0.08) inset;
}

.useful-card::before,
.useful-card::after {
  content: '';
  position: absolute;
  pointer-events: none;
  opacity: 0;
  transition:
    opacity 360ms cubic-bezier(0.2, 0.9, 0.25, 1),
    transform 420ms cubic-bezier(0.22, 0.74, 0.2, 1);
}

.useful-card::before {
  inset: 0;
  background:
    linear-gradient(132deg, rgba(255, 255, 255, 0.34) 0%, rgba(255, 255, 255, 0) 36%),
    linear-gradient(214deg, rgba(112, 82, 255, 0.12) 0%, rgba(112, 82, 255, 0) 58%);
  transform: translate3d(16px, 16px, 0) scale(0.95);
  z-index: 0;
}

.useful-card::after {
  right: -124px;
  bottom: -146px;
  width: 332px;
  height: 332px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(111, 87, 255, 0.7) 0%,
    rgba(81, 198, 255, 0.54) 30%,
    rgba(191, 230, 255, 0.18) 56%,
    rgba(255, 255, 255, 0) 78%
  );
  filter: blur(24px);
  mix-blend-mode: screen;
  transform: translate3d(38px, 42px, 0) scale(0.72);
  z-index: 0;
}

.useful-card:hover {
  transform: translateY(-10px) scale(1.018);
  border-color: rgba(127, 180, 255, 0.52);
  background:
    radial-gradient(circle at 100% 100%, rgba(112, 72, 255, 0.34) 0%, rgba(112, 72, 255, 0) 54%),
    linear-gradient(160deg, rgba(20, 41, 88, 0.95) 0%, rgba(17, 59, 96, 0.92) 48%, rgba(49, 30, 104, 0.9) 100%);
  box-shadow:
    0 26px 58px rgba(6, 18, 45, 0.32),
    0 0 0 1px rgba(165, 225, 255, 0.12) inset;
}

.useful-card:hover::before,
.useful-card:hover::after {
  opacity: 1;
}

.useful-card:hover::before {
  transform: translate3d(0, 0, 0) scale(1);
}

.useful-card:hover::after {
  transform: translate3d(0, 0, 0) scale(1.08);
}

.useful-card > * {
  position: relative;
  z-index: 1;
}

.useful-card__body {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.useful-card--featured .useful-card__body {
  align-content: start;
  gap: 10px;
}

.useful-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(27, 151, 234, 0.14) 0%, rgba(105, 57, 184, 0.16) 100%);
  grid-row: 1 / span 2;
  align-self: start;
  transition:
    transform 360ms cubic-bezier(0.22, 0.74, 0.2, 1),
    background 360ms cubic-bezier(0.22, 0.74, 0.2, 1),
    box-shadow 360ms cubic-bezier(0.22, 0.74, 0.2, 1);
}

.useful-card--featured .useful-card__icon {
  width: 60px;
  height: 60px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(27, 151, 234, 0.94) 0%, rgba(105, 57, 184, 0.92) 100%);
  box-shadow:
    0 14px 28px rgba(28, 125, 226, 0.34),
    0 0 22px rgba(123, 112, 255, 0.28);
}

.useful-card__icon img {
  width: 24px;
  height: 24px;
  transition: transform 360ms cubic-bezier(0.22, 0.74, 0.2, 1);
}

.useful-card--featured .useful-card__icon img {
  transform: scale(1.08);
}

.useful-card__badge {
  display: inline-flex;
  align-items: center;
  justify-self: start;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(223, 246, 255, 0.12);
  border: 1px solid rgba(179, 226, 255, 0.22);
  color: #dff6ff;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.useful-card h3 {
  margin: 0;
  color: #ffffff;
  font-size: 18px;
  line-height: 1.45;
  font-weight: 700;
  transition:
    color 320ms cubic-bezier(0.2, 0.9, 0.25, 1),
    text-shadow 320ms cubic-bezier(0.2, 0.9, 0.25, 1);
}

.useful-card--featured h3 {
  font-size: 21px;
  line-height: 1.34;
  color: #f6fbff;
  text-shadow: none;
}

.useful-card__description {
  margin: 0;
  max-width: 44ch;
  color: rgba(227, 240, 255, 0.78);
  font-size: 14px;
  line-height: 1.6;
}

.useful-card__cta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  justify-self: start;
  margin-top: 4px;
  color: #eff9ff;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  transition:
    transform 320ms cubic-bezier(0.2, 0.9, 0.25, 1),
    color 320ms cubic-bezier(0.2, 0.9, 0.25, 1);
}

.useful-card__cta::after {
  content: '↗';
  font-size: 15px;
}

.useful-card:hover .useful-card__icon {
  transform: translateY(-2px) scale(1.06);
  background: linear-gradient(135deg, rgba(27, 151, 234, 0.94) 0%, rgba(105, 57, 184, 0.92) 100%);
  box-shadow:
    0 14px 28px rgba(28, 125, 226, 0.34),
    0 0 22px rgba(123, 112, 255, 0.28);
}

.useful-card:hover .useful-card__icon img {
  transform: scale(1.08);
}

.useful-card:hover h3 {
  color: #dff6ff;
  text-shadow: 0 0 22px rgba(108, 199, 255, 0.34);
}

.useful-card:hover .useful-card__cta,
.useful-card--featured:hover .useful-card__cta {
  transform: translateX(4px);
  color: #dff6ff;
}

@media (max-width: 920px) {
  .useful-grid--featured,
  .useful-grid--default {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .useful-card--featured {
    grid-template-columns: 52px minmax(0, 1fr);
    padding: 24px;
    min-height: auto;
  }

  .useful-card--featured .useful-card__icon {
    width: 52px;
    height: 52px;
    border-radius: 16px;
  }

  .useful-card--featured h3 {
    font-size: 19px;
  }
}

</style>
