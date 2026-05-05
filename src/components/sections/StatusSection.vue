<script setup>
defineProps({
  statusSection: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <section id="status" class="section status-section">
    <div class="status-section__mesh status-section__mesh--one"></div>
    <div class="status-section__mesh status-section__mesh--two"></div>

    <div class="container status-section__layout">
      <div class="status-section__copy" v-reveal="{ delay: 70, origin: 'left' }">
        <span class="status-section__eyebrow">{{ statusSection.eyebrow }}</span>
        <h2 class="status-section__title">{{ statusSection.title }}</h2>
        <p class="status-section__description">{{ statusSection.description }}</p>

        <div class="status-section__points">
          <article
            v-for="(point, index) in statusSection.points"
            :key="point.title"
            class="status-section__point"
            :style="{ '--stack-delay': `${110 + index * 80}ms` }"
            v-reveal="{ delay: 110 + index * 80, origin: 'left' }"
          >
            <strong>{{ point.title }}</strong>
            <p>{{ point.text }}</p>
          </article>
        </div>
      </div>

      <figure class="status-section__visual" v-reveal="{ delay: 140, origin: 'right' }">
        <div class="status-section__certificate-shell">
          <div class="status-section__certificate-glow" aria-hidden="true"></div>
          <img
            :src="statusSection.image"
            :alt="statusSection.imageAlt"
            class="status-section__certificate"
          />
        </div>

        <figcaption class="status-section__caption">
          {{ statusSection.caption }}
        </figcaption>
      </figure>
    </div>
  </section>
</template>

<style scoped>
.status-section {
  overflow: clip;
  background:
    radial-gradient(circle at 12% 16%, rgba(91, 110, 255, 0.18) 0%, rgba(91, 110, 255, 0) 24%),
    linear-gradient(180deg, #08112b 0%, #11285b 54%, #0d1f45 100%);
  color: white;
}

.status-section__mesh {
  position: absolute;
  border-radius: 999px;
  filter: blur(44px);
  pointer-events: none;
}

.status-section__mesh--one {
  top: 64px;
  right: -120px;
  width: 360px;
  height: 360px;
  background: rgba(4, 228, 255, 0.14);
}

.status-section__mesh--two {
  left: -120px;
  bottom: 42px;
  width: 320px;
  height: 320px;
  background: rgba(105, 57, 184, 0.18);
}

.status-section__layout {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 36px;
  align-items: center;
}

.status-section__copy {
  display: grid;
  gap: 22px;
}

.status-section__eyebrow {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  min-height: 36px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.12);
  color: rgba(240, 246, 255, 0.92);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.status-section__title {
  margin: 0;
  max-width: 760px;
  font-size: clamp(36px, 4vw, 56px);
  line-height: 1.08;
  font-weight: 800;
  text-transform: uppercase;
}

.status-section__description {
  margin: 0;
  max-width: 700px;
  color: rgba(231, 238, 255, 0.84);
  font-size: 18px;
  line-height: 1.7;
}

.status-section__points {
  display: grid;
  gap: 16px;
}

.status-section__point {
  display: grid;
  gap: 10px;
  padding: 18px 20px;
  border: 1px solid rgba(137, 176, 255, 0.18);
  background: rgba(255, 255, 255, 0.06);
  box-shadow: 0 18px 48px rgba(4, 12, 30, 0.18);
}

.status-section__point strong,
.status-section__point p,
.status-section__caption {
  margin: 0;
}

.status-section__point strong {
  color: #dff6ff;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.03em;
}

.status-section__point p {
  color: rgba(231, 238, 255, 0.78);
  font-size: 15px;
  line-height: 1.65;
}

.status-section__visual {
  display: grid;
  gap: 16px;
  margin: 0;
}

.status-section__certificate-shell {
  position: relative;
  padding: clamp(14px, 2vw, 22px);
  border: 1px solid rgba(170, 197, 255, 0.24);
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.16) 0%, rgba(210, 224, 255, 0.08) 48%, rgba(255, 255, 255, 0.04) 100%);
  box-shadow:
    0 30px 80px rgba(3, 10, 28, 0.34),
    inset 0 0 0 1px rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.status-section__certificate-glow {
  position: absolute;
  inset: 16% 14%;
  background: radial-gradient(circle, rgba(126, 198, 255, 0.16) 0%, rgba(126, 198, 255, 0) 72%);
  filter: blur(24px);
  pointer-events: none;
}

.status-section__certificate {
  position: relative;
  z-index: 1;
  width: 100%;
  height: auto;
  display: block;
  background: #f7f3ea;
  box-shadow:
    0 20px 44px rgba(7, 17, 45, 0.24),
    0 0 0 1px rgba(255, 255, 255, 0.3);
}

.status-section__caption {
  color: rgba(231, 238, 255, 0.74);
  font-size: 14px;
  line-height: 1.6;
}

@media (min-width: 1040px) {
  .status-section__layout {
    grid-template-columns: minmax(0, 0.86fr) minmax(0, 1fr);
  }
}

@media (max-width: 1039px) {
  .status-section__visual {
    order: -1;
  }
}

@media (max-width: 639px) {
  .status-section__title {
    font-size: clamp(28px, 8vw, 38px);
  }

  .status-section__description {
    font-size: 16px;
    line-height: 1.6;
  }

  .status-section__point {
    padding: 16px;
  }
}
</style>
