<script setup>
import ReviewTicker from '@/components/ui/ReviewTicker.vue';
import SectionTitle from '@/components/ui/SectionTitle.vue';

defineProps({
  sectionContent: {
    type: Object,
    required: true
  },
  reviews: {
    type: Array,
    required: true
  }
});
</script>

<template>
  <section id="reviews" class="section reviews-section">
    <div class="container reviews-section__stack">
      <SectionTitle :title="sectionContent.title" centered />

      <ReviewTicker
        :reviews="reviews"
        :previous-label="sectionContent.previousAriaLabel"
        :previous-horizontal-label="sectionContent.previousHorizontalAriaLabel"
        :next-label="sectionContent.nextAriaLabel"
        :next-horizontal-label="sectionContent.nextHorizontalAriaLabel"
      />
    </div>
  </section>
</template>

<style scoped>
.reviews-section__stack {
  display: grid;
  gap: 38px;
}
</style>
