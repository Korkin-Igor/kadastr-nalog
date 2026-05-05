<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

const props = defineProps({
  brand: {
    type: Object,
    required: true
  },
  href: {
    type: String,
    default: '#hero'
  },
  to: {
    type: [String, Object],
    default: null
  }
});

const linkTag = computed(() => (props.to ? RouterLink : 'a'));
const linkProps = computed(() => (props.to ? { to: props.to } : { href: props.href }));
</script>

<template>
  <component :is="linkTag" class="brand" v-bind="linkProps">
    <span class="brand__mark" aria-hidden="true">
      <img :src="props.brand.logo" alt="" class="brand__logo" />
    </span>
    <span class="brand__title">{{ props.brand.title }}</span>
  </component>
</template>
