<script setup>
defineProps({
  offerMeta: {
    type: Object,
    required: true
  },
  offerCards: {
    type: Array,
    required: true
  }
});
</script>

<template>
  <section id="offer" class="section offer-section">
    <div class="offer-section__mesh offer-section__mesh--one"></div>
    <div class="offer-section__mesh offer-section__mesh--two"></div>

    <div class="container offer-section__layout">
      <aside class="offer-section__summary" v-reveal="{ delay: 90, origin: 'left' }">
        <div class="offer-summary">
          <h2 class="offer-summary__title">{{ offerMeta.title }}</h2>

          <div class="offer-summary__body">
            <p v-for="(paragraph, index) in offerMeta.paragraphs" :key="`${index}-${paragraph}`">
              {{ paragraph }}
            </p>
          </div>
        </div>
      </aside>

      <div class="offer-section__cards" v-reveal="{ delay: 80, origin: 'right' }">
        <article
          v-for="(card, index) in offerCards"
          :key="`${index}-${card.titleHtml}`"
          class="service-card"
          v-reveal="{ delay: index * 80, origin: 'right' }"
        >
          <div class="service-card__top">
            <span class="service-card__icon">
              <img :src="card.icon" alt="" aria-hidden="true" />
            </span>
            <span class="service-card__line"></span>
          </div>

          <h3 v-html="card.titleHtml"></h3>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.offer-section {
  padding-block: 110px;
  background: linear-gradient(180deg, #1f2650 0%, #243466 44%, #162851 100%);
  color: white;
}

.offer-section__mesh {
  position: absolute;
  border-radius: 999px;
  filter: blur(50px);
  pointer-events: none;
}

.offer-section__mesh--one {
  left: -120px;
  bottom: 180px;
  width: 380px;
  height: 380px;
  background: rgba(146, 112, 255, 0.28);
  animation: mesh-drift 16s ease-in-out infinite;
}

.offer-section__mesh--two {
  right: 10%;
  top: 200px;
  width: 320px;
  height: 320px;
  background: rgba(4, 228, 255, 0.2);
  animation: mesh-drift 18s ease-in-out infinite reverse;
}

.offer-section__layout {
  display: grid;
  gap: 48px;
  align-items: start;
}

.offer-section__cards {
  display: grid;
  gap: 24px;
  width: 100%;
  align-self: start;
  justify-items: start;
  overflow: visible;
}

.offer-section__summary {
  position: static;
  align-self: start;
}

.service-card {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  transform-origin: left;
  will-change: max-width, background, border-color, box-shadow;
  padding: 28px;
  max-width: 637px;
  min-height: 192px;
  width: 100%;
  border-radius: 0;
  border: 1px solid rgba(91, 103, 133, 0.68);
  background: linear-gradient(135deg, rgba(20, 28, 72, 0.88) 0%, rgba(39, 47, 88, 0.95) 100%);
  box-shadow: 0 0 5px rgba(249, 249, 249, 0.1);
  transition:
    max-width 800ms cubic-bezier(0.22, 0.74, 0.2, 1),
    border-color 800ms cubic-bezier(0.22, 0.74, 0.2, 1),
    background 800ms cubic-bezier(0.22, 0.74, 0.2, 1),
    box-shadow 800ms cubic-bezier(0.22, 0.74, 0.2, 1);
}

.service-card::before,
.service-card::after {
  content: '';
  position: absolute;
  pointer-events: none;
  opacity: 0;
  transition:
    opacity 360ms cubic-bezier(0.2, 0.9, 0.25, 1),
    transform 360ms cubic-bezier(0.2, 0.9, 0.25, 1);
}

.service-card::before {
  inset: 0;
  background:
    linear-gradient(128deg, rgba(255, 255, 255, 0.38) 0%, rgba(255, 255, 255, 0) 38%),
    linear-gradient(210deg, rgba(120, 90, 255, 0.08) 0%, rgba(120, 90, 255, 0) 54%);
  transform: translate3d(18px, 18px, 0) scale(0.94);
  z-index: 0;
}

.service-card::after {
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

.service-card:hover {
  max-width: 900px;
  border-color: rgba(121, 147, 226, 0.46);
  background:
    radial-gradient(circle at 97% 90%, rgba(112, 72, 255, 0.44) 0%, rgba(112, 72, 255, 0) 56%),
    linear-gradient(156deg, rgba(247, 243, 255, 0.98) 0%, rgba(240, 247, 255, 0.98) 54%, rgba(251, 252, 255, 0.96) 100%);
  box-shadow:
    0 34px 78px rgba(9, 19, 43, 0.24),
    0 0 0 1px rgba(255, 255, 255, 0.16) inset;
}

.service-card:hover::before,
.service-card:hover::after {
  opacity: 1;
}

.service-card:hover::before {
  transform: translate3d(0, 0, 0) scale(1);
}

.service-card:hover::after {
  transform: translate3d(0, 0, 0) scale(1.08);
}

.service-card__top {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
  position: relative;
  z-index: 1;
}

.service-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  border-radius: 999px;
  border: 1px solid rgba(51, 157, 255, 0.8);
  background: rgba(8, 19, 43, 0.2);
}

.service-card__icon img {
  width: 26px;
  height: 26px;
}

.service-card__line {
  width: 72px;
  height: 6px;
  border-radius: 999px;
  background: var(--gradient-accent);
  opacity: 0.5;
}

.service-card h3 {
  margin: 0;
  color: #d9d9d9;
  font-size: 20px;
  line-height: 1.6;
  font-weight: 500;
  position: relative;
  max-width: 500px;
  z-index: 1;
}

.service-card h3 span {
  color: #71f6fd;
}

.service-card:hover h3 {
  color: var(--accent-deep);
}

.service-card:hover h3 span {
  color: #1b97ea;
}

.service-card:hover .service-card__icon {
  border-color: transparent;
  background: linear-gradient(135deg, #1b97ea 0%, #6939b8 100%);
  box-shadow: 0 14px 30px rgba(43, 106, 212, 0.24);
}

.service-card:hover .service-card__line {
  opacity: 0.78;
  box-shadow: 0 0 22px rgba(91, 164, 255, 0.28);
}

.offer-summary {
  position: relative;
  padding: 0;
}

.offer-summary__title {
  margin: 0;
  color: #ffffff;
  max-width: 586px;
  font-size: clamp(44px, 5vw, 64px);
  line-height: 1.25;
  font-weight: 700;
}

.offer-summary__body {
  display: grid;
  gap: 0;
  margin-top: 50px;
  max-width: 586px;
}

.offer-summary__body p {
  margin: 0;
  color: var(--text-inverse-soft);
  font-size: 24px;
  line-height: 1.33;
}

.offer-summary__body p + p {
  margin-top: 32px;
}

@media (min-width: 900px) {
  .offer-section__layout {
    grid-template-columns: minmax(0, 586px) minmax(0, 806px);
    justify-content: space-between;
  }

  .offer-section__summary {
    position: sticky;
    top: 112px;
  }

  .offer-section__cards {
    position: static;
    justify-self: end;
  }
}

@media (max-width: 899px) {
  .offer-section__cards {
    position: static;
  }

  .offer-summary__body {
    max-width: 100%;
  }

  .service-card {
    width: 100%;
    max-width: none;
  }

  .offer-summary {
    text-align: center;
  }
}

@media (max-width: 639px) {
  .service-card {
    padding: 22px;
  }

  .offer-summary__body p {
    font-size: 16px;
  }

  .offer-summary__body p + p {
    margin-top: 20px;
  }
}
</style>
