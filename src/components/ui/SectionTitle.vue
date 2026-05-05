<script setup>
defineProps({
  eyebrow: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  centered: {
    type: Boolean,
    default: false
  },
  inverted: {
    type: Boolean,
    default: false
  }
});
</script>

<template>
  <div
    class="section-title"
    :class="{
      'section-title--centered': centered,
      'section-title--inverted': inverted
    }"
  >
    <p v-if="eyebrow" class="section-title__eyebrow">{{ eyebrow }}</p>
    <h2 class="section-title__heading">{{ title }}</h2>
    <p v-if="description" class="section-title__text">{{ description }}</p>
  </div>
</template>
