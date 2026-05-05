<script setup>
import SectionTitle from '@/components/ui/SectionTitle.vue';

defineProps({
  dualSection: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <section id="audit" class="section audit-section section--dark">
    <div class="container audit__inner">
      <SectionTitle
        :title="dualSection.title"
        :description="dualSection.description"
        inverted
      />

      <TransitionGroup name="stack" tag="div" class="audit-grid" appear>
        <article
          v-for="(item, index) in dualSection.items"
          :key="`${index}-${item}`"
          class="audit-grid__item"
          :style="{ '--stack-delay': `${80 + index * 60}ms` }"
          v-reveal="{ delay: 80 + index * 60 }"
        >
          <span class="audit-grid__tick"></span>
          <p>{{ item }}</p>
        </article>
      </TransitionGroup>
    </div>
  </section>
</template>

<style scoped>
.audit-section {
  background: linear-gradient(-45deg, #04122d 0%, #1B4091 80%, #0f466e 100%);
}

.audit__inner {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.audit-grid {
  display: grid;
  gap: 20px 50px;
  margin-top: 32px;
}

.audit-grid__item {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  box-shadow: none;
  max-width: 630px;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(255, 255, 255, 0.03);
}

.audit-grid__tick {
  position: relative;
  flex: 0 0 14px;
  width: 14px;
  height: 14px;
  margin-top: 6px;
}

.audit-grid__tick::before {
  content: '';
  position: absolute;
  inset: 2px 1px 1px 1px;
  border-left: 2px solid #00e9ff;
  border-bottom: 2px solid #00e9ff;
  transform: rotate(-45deg);
  transform-origin: center;
}

.audit-grid__item p {
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 18px;
  line-height: 1.55;
}

.audit-grid__item:hover {
  transform: none;
  box-shadow: none;
}



.audit-grid__item:hover {
  /* Легкое увеличение элемента */
  transform: translateY(-5px) scale(1.02);

  /* Создаем многослойное свечение */
  box-shadow:
      0 10px 30px -10px rgba(0, 233, 255, 0.6),   /* Основное, яркое свечение */
      0 0 20px rgba(0, 233, 255, 0.3);            /* Внешнее, более мягкое свечение (glow) */

  /* Делаем фон и рамку чуть более заметными */
  background-color: rgba(255, 255, 255, 0.07);
  border-color: rgba(0, 233, 255, 0.3);
}

</style>
