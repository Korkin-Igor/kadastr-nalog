<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import BrandLink from '@/components/ui/BrandLink.vue';

const props = defineProps({
  brand: {
    type: Object,
    required: true
  },
  footerGroups: {
    type: Array,
    required: true
  },
  footerContent: {
    type: Object,
    required: true
  }
});

const phoneHref = computed(() => `tel:${String(props.footerContent.phone || '').replace(/[^\d+]/g, '')}`);
const emailHref = computed(() => `mailto:${String(props.footerContent.email || '')}`);
const membershipLink = computed(() => String(props.footerContent.membershipLink || ''));
const membershipPreviewImage = computed(() => {
  const previewCandidate = String(props.footerContent.membershipImage || '');

  if (isImageAsset(previewCandidate)) {
    return previewCandidate;
  }

  return isImageAsset(membershipLink.value) ? membershipLink.value : '';
});
const membershipBadge = computed(() =>
  getAssetBadge(membershipLink.value || props.footerContent.membershipImage)
);

function isImageAsset(value) {
  const normalizedValue = String(value || '').toLowerCase();

  return (
    normalizedValue.startsWith('data:image/') ||
    /\.(svg|png|jpe?g|gif|webp|avif)(\?|#|$)/.test(normalizedValue)
  );
}

function getAssetBadge(value) {
  const normalizedValue = String(value || '').toLowerCase();

  if (!normalizedValue) {
    return 'FILE';
  }

  if (normalizedValue.startsWith('data:application/pdf') || /\.pdf(\?|#|$)/.test(normalizedValue)) {
    return 'PDF';
  }

  if (normalizedValue.startsWith('data:application/msword') || /\.doc(\?|#|$)/.test(normalizedValue)) {
    return 'DOC';
  }

  if (
    normalizedValue.startsWith(
      'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) ||
    /\.docx(\?|#|$)/.test(normalizedValue)
  ) {
    return 'DOCX';
  }

  if (isImageAsset(normalizedValue)) {
    return 'IMG';
  }

  return 'FILE';
}

function getSocialAlt(social) {
  return social?.alt || social?.name || 'Соцсеть';
}

function getSocialFallback(social) {
  return String(social?.name || 'S')
    .trim()
    .slice(0, 2)
    .toUpperCase();
}
</script>

<template>
  <footer id="footer" class="footer">
    <div class="container footer__top">
      <div class="footer__brand-col" v-reveal="{ delay: 60, origin: 'left' }">
        <BrandLink :brand="props.brand" href="#hero" class="brand--footer" />

        <div class="footer__credentials">
          <component
            :is="membershipLink ? 'a' : 'div'"
            v-bind="membershipLink ? { href: membershipLink, target: '_blank', rel: 'noopener noreferrer' } : {}"
            class="footer__bilet-link"
            :title="props.footerContent.membershipTitle"
          >
            <img
              v-if="membershipPreviewImage"
              :src="membershipPreviewImage"
              :alt="props.footerContent.membershipTitle"
              class="footer__bilet-img"
            />
            <span v-else class="footer__bilet-badge">
              {{ membershipBadge }}
            </span>
            <span class="footer__bilet-text">
              {{ props.footerContent.membershipText }}
            </span>
          </component>
        </div>

        <div class="footer__contacts">
          <a :href="phoneHref" class="footer__phone">
            {{ props.footerContent.phone }}
          </a>
          <a :href="emailHref" class="footer__email">
            {{ props.footerContent.email }}
          </a>
        </div>
      </div>

      <TransitionGroup name="stack" tag="div" class="footer__nav-grid" appear>
        <div
          v-for="(group, index) in props.footerGroups"
          :key="`${index}-${group.title}`"
          class="footer__group"
          :style="{ '--stack-delay': `${100 + index * 70}ms` }"
          v-reveal="{ delay: 100 + index * 70, origin: 'right' }"
        >
          <p class="footer__group-title">{{ group.title }}</p>
          <component
            v-for="link in group.links"
            :key="link.id + link.label"
            :is="link.to ? RouterLink : 'a'"
            v-bind="link.to ? { to: link.to } : { href: `#${link.id}` }"
            class="footer__group-link"
          >
            {{ link.label }}
          </component>
        </div>
      </TransitionGroup>
    </div>

    <div class="container footer__bottom">
      <div class="footer__socials">
        <component
          v-for="(social, index) in props.footerContent.socials"
          :key="social.name || social.url || index"
          :is="social.url ? 'a' : 'span'"
          v-bind="social.url ? { href: social.url, target: '_blank', rel: 'noopener noreferrer' } : {}"
          class="footer__social-link"
          :title="social.name"
        >
          <img v-if="social.icon" :src="social.icon" :alt="getSocialAlt(social)" />
          <span v-else class="footer__social-fallback">{{ getSocialFallback(social) }}</span>
        </component>
      </div>

      <div class="footer__docs">
        <a
          v-for="document in props.footerContent.documents"
          :key="document.url"
          :href="document.url"
          class="footer__doc-link"
          :target="document.external ? '_blank' : undefined"
          :rel="document.external ? 'noopener noreferrer' : undefined"
        >
          {{ document.label }}
        </a>
      </div>

      <div class="footer__copyright">
        &copy; {{ new Date().getFullYear() }} {{ props.brand.title }}
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  position: relative;
  isolation: isolate;
  overflow: clip;
  padding-top: 48px;
  padding-bottom: 24px;
  background: #0b1430;
  color: var(--text-inverse);
  font-size: 14px;
}

.footer__top {
  display: grid;
  gap: 40px;
  align-items: start;
  margin-bottom: 40px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 40px;
}

.footer__brand-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 320px;
}

.footer__credentials {
  display: flex;
  align-items: center;
  gap: 12px;
}

.footer__bilet-link {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: opacity 0.2s;
}

.footer__bilet-link:hover {
  opacity: 0.8;
}

.footer__bilet-img {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  object-fit: cover;
}

.footer__bilet-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  padding: 0 10px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.footer__bilet-text {
  font-size: 12px;
  line-height: 1.2;
  color: rgba(255, 255, 255, 0.6);
}

.footer__contacts {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer__phone {
  font-size: 18px;
  font-weight: 700;
  color: white;
  text-decoration: none;
}

.footer__email {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
}

.footer__email:hover {
  color: white;
}

.footer__nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 24px;
}

.footer__group {
  display: grid;
  gap: 12px;
}

.footer__group-title {
  margin: 0;
  color: rgba(255, 255, 255, 0.4);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.footer__group-link {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  transition: color 0.2s;
}

.footer__group-link:hover {
  color: white;
}

.footer__bottom {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  font-size: 13px;
}

.footer__socials {
  display: flex;
  gap: 12px;
}

.footer__social-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transition: background 0.2s, transform 0.2s;
}

.footer__social-link:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.footer__docs {
  display: flex;
  gap: 20px;
}

.footer__doc-link {
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  transition: color 0.2s;
}

.footer__doc-link:hover {
  color: white;
  text-decoration: underline;
}

.footer__copyright {
  color: rgba(255, 255, 255, 0.3);
  font-size: 12px;
}

.footer__social-link img {
  width: 35px;
  height: 35px;
  border-radius: 35px;
}

.footer__social-fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;
  border-radius: 35px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

@media (max-width: 768px) {
  .footer__top {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .footer__brand-col {
    max-width: 100%;
  }

  .footer__bottom {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .footer__socials,
  .footer__docs {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
