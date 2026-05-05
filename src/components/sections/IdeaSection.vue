<script setup>
defineProps({
  ideaSection: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <section id="ideas" class="section idea-section section--dark">
    <div class="container idea-section__grid">
      <div class="idea-section__copy" v-reveal="80">
        <h2 class="idea-section__title">{{ ideaSection.title }}</h2>
        <p v-if="ideaSection.description" class="idea-section__description">{{ ideaSection.description }}</p>

        <div class="idea-section__list">
          <article
            v-for="(item, index) in ideaSection.items"
            :key="`${index}-${item}`"
            class="idea-section__item"
            :style="{ transitionDelay: `${140 + index * 90}ms` }"
            v-reveal="{ delay: 140 + index * 90, origin: 'left' }"
          >
            <span class="idea-section__bullet"></span>
            <p>{{ item }}</p>
          </article>
        </div>

        <p class="idea-section__note">{{ ideaSection.note }}</p>
      </div>

      <div class="idea-section__visual" v-reveal="{ delay: 160, origin: 'right' }">
        <div class="idea-section__image-shell">
          <img :src="ideaSection.image" :alt="ideaSection.imageAlt" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.idea-section {
  padding-block: 60px;
  background:
    linear-gradient(340deg, #000729, #000d2e 60%, #151f70)
}

.idea-section__grid {
  display: grid;
  gap: 40px;
  align-items: center;
}

.idea-section__copy {
  display: grid;
  gap: 28px;
  max-width: 644px;
}

.idea-section__title {
  margin: 0;
  max-width: 760px;
  color: white;
  font-size: clamp(38px, 4vw, 48px);
  line-height: 1.16;
  font-weight: 700;
}

.idea-section__list {
  display: grid;
  gap: 6px;
}

.idea-section__item {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 10px 6px;
}

.idea-section__bullet {
  position: relative;
  flex: 0 0 24px;
  width: 24px;
  height: 24px;
}

.idea-section__bullet::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 7px;
  width: 11px;
  height: 6px;
  border-left: 2px solid #04e4ff;
  border-bottom: 2px solid #04e4ff;
  transform: rotate(-45deg);
}

.idea-section__item p,
.idea-section__description,
.idea-section__note {
  margin: 0;
  color: #f2f6ff;
  font-size: 20px;
  line-height: 1.4;
}

.idea-section__description,
.idea-section__note {
  max-width: 629px;
  font-size: 17px;
  line-height: 1.88;
  color: rgba(255, 255, 255, 0.86);
}

.idea-section__visual {
  display: flex;
  width: 100%;
  justify-content: flex-end;
  justify-self: end;
}

.idea-section__image-shell {
  position: relative;
  width: 593px;
  max-width: 100%;
}

.idea-section__image-shell img {
  width: 100%;
  height: auto;
  object-fit: contain;
  -webkit-mask-image: radial-gradient(circle at center, rgba(0, 0, 0, 1) 26%, rgba(0, 0, 0, 0.92) 50%, rgba(0, 0, 0, 0.58) 68%, rgba(0, 0, 0, 0) 100%);
  mask-image: radial-gradient(circle at center, rgba(0, 0, 0, 1) 26%, rgba(0, 0, 0, 0.92) 50%, rgba(0, 0, 0, 0.58) 68%, rgba(0, 0, 0, 0) 100%);
}

.idea-section__image-shell::after {
  content: '';
  position: absolute;
  inset: 12% 10%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(205, 232, 255, 0.18) 0%, rgba(205, 232, 255, 0) 72%);
  pointer-events: none;
}

@media (max-width: 1000px) {
  .idea-section__grid {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .idea-section__visual {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .idea-section__title, .idea-section__note {
    text-align: center;
  }

  .idea-section__list {
    order: 3;
  }
}
</style>
