<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { setPageScrollLock } from '@/app/utils/pageScrollLock';
import BrandLink from '@/components/ui/BrandLink.vue';

const props = defineProps({
  brand: {
    type: Object,
    required: true
  },
  navigation: {
    type: Array,
    required: true
  },
  headerContent: {
    type: Object,
    required: true
  },
  utilityLabel: {
    type: String,
    required: true
  },
  menuIcon: {
    type: String,
    required: true
  }
});

const menuOpen = ref(false);
const headerRef = ref(null);
let headerResizeObserver;

function closeMenu() {
  menuOpen.value = false;
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value;
}

function updatePageHeaderOffset() {
  if (typeof document === 'undefined') {
    return;
  }

  const headerHeight = headerRef.value?.getBoundingClientRect().height;

  if (!headerHeight) {
    return;
  }

  document.documentElement.style.setProperty('--page-header-offset', `${Math.ceil(headerHeight)}px`);
}

function resetPageHeaderOffset() {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.style.removeProperty('--page-header-offset');
}

function handleWindowKeydown(event) {
  if (event.key === 'Escape' && menuOpen.value) {
    closeMenu();
  }
}

watch(menuOpen, (isMenuOpen) => {
  setPageScrollLock('app-header-menu', isMenuOpen);
});

onMounted(() => {
  window.addEventListener('keydown', handleWindowKeydown);
  window.addEventListener('resize', updatePageHeaderOffset);

  nextTick(() => {
    updatePageHeaderOffset();

    if (typeof ResizeObserver === 'undefined' || !headerRef.value) {
      return;
    }

    headerResizeObserver = new ResizeObserver(() => {
      updatePageHeaderOffset();
    });
    headerResizeObserver.observe(headerRef.value);
  });
});

onBeforeUnmount(() => {
  setPageScrollLock('app-header-menu', false);
  headerResizeObserver?.disconnect();
  resetPageHeaderOffset();
  window.removeEventListener('keydown', handleWindowKeydown);
  window.removeEventListener('resize', updatePageHeaderOffset);
});
</script>

<template>
  <Teleport to="body">
    <header ref="headerRef" class="hero__header">
      <div class="header__top">
        <BrandLink :brand="props.brand" href="#hero" @click="closeMenu" />
        <button
          class="hero__menu-button hero__menu-button-top"
          type="button"
          :aria-expanded="menuOpen"
          aria-controls="hero-menu"
          @click="toggleMenu"
        >
          <img :src="props.menuIcon" alt="" aria-hidden="true" />
          <span class="span-menu">{{ props.headerContent.menuLabel }}</span>
        </button>
      </div>

      <nav class="hero__header-actions">
        <a class="hero__quick-link" :href="props.headerContent.utilityHref" @click="closeMenu">
          <span class="hero__quick-link-signal" aria-hidden="true"></span>
          <span class="hero__quick-link-text">{{ props.utilityLabel }}</span>
        </a>

        <button
          class="hero__menu-button hero__menu-button-bottom"
          type="button"
          :aria-expanded="menuOpen"
          aria-controls="hero-menu"
          @click="toggleMenu"
        >
          <img :src="props.menuIcon" alt="" aria-hidden="true" />
          <span class="span-menu">{{ props.headerContent.menuLabel }}</span>
        </button>
      </nav>
    </header>
  </Teleport>

  <Teleport to="body">
    <Transition name="menu-drawer">
      <div
        v-if="menuOpen"
        class="hero__menu-shell"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hero-menu-title"
        @click.self="closeMenu"
      >
        <nav id="hero-menu" class="hero__menu" :aria-label="props.headerContent.navigationLabel">
          <div class="hero__menu-header">
            <p id="hero-menu-title" class="hero__menu-title">{{ props.headerContent.navigationTitle }}</p>

            <button
              class="hero__menu-close"
              type="button"
              :aria-label="props.headerContent.closeMenuAriaLabel"
              @click="closeMenu"
            >
              {{ props.headerContent.closeMenuLabel }}
            </button>
          </div>

          <a
            v-for="(item, index) in props.navigation"
            :key="item.id"
            :href="`#${item.id}`"
            class="hero__menu-link"
            @click="closeMenu"
          >
            <span>{{ item.label }}</span>
            <span class="hero__menu-link-index">
              {{ String(index + 1).padStart(2, '0') }}
            </span>
          </a>
        </nav>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.hero__header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 120;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 24px;
  box-sizing: border-box;
  margin: 0;
  padding: calc(14px + env(safe-area-inset-top, 0px)) clamp(18px, 3vw, 36px) 14px;
  border: 0;
  border-bottom: 1px solid rgba(139, 189, 255, 0.18);
  border-radius: 0;
  background: rgba(7, 24, 68, 0.82);
  box-shadow:
    0 14px 36px rgba(2, 8, 24, 0.24),
    inset 0 -1px 0 rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  isolation: isolate;
}

.hero__header::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 0;
  background: linear-gradient(90deg, rgba(33, 88, 170, 0.22) 0%, rgba(33, 88, 170, 0.08) 28%, rgba(255, 255, 255, 0.02) 100%);
  pointer-events: none;
  z-index: 0;
}

.hero__header > * {
  position: relative;
  z-index: 1;
}

.hero__header-actions {
  display: flex;
  align-items: center;
  gap: 30px;
}

.hero__quick-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  min-height: 42px;
  padding: 11px 22px;
  overflow: hidden;
  isolation: isolate;
  border: 1px solid rgba(195, 234, 255, 0.68);
  background:
    linear-gradient(120deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.03) 38%, rgba(110, 92, 255, 0.12) 100%);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.08),
    0 0 0 1px rgba(74, 212, 255, 0.08),
    0 14px 34px rgba(6, 16, 44, 0.16);
  color: white;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: 0.08em;
  text-wrap: balance;
  text-transform: uppercase;
  border-radius: 0;
  transition:
    transform 320ms cubic-bezier(0.2, 0.9, 0.25, 1),
    box-shadow 320ms cubic-bezier(0.2, 0.9, 0.25, 1),
    border-color 320ms cubic-bezier(0.2, 0.9, 0.25, 1),
    background-color 320ms cubic-bezier(0.2, 0.9, 0.25, 1);
}

.hero__quick-link::before {
  content: '';
  position: absolute;
  inset: -24% auto -24% -38%;
  width: 48%;
  background: linear-gradient(
    115deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(132, 237, 255, 0.06) 34%,
    rgba(132, 237, 255, 0.38) 50%,
    rgba(255, 255, 255, 0) 68%
  );
  transform: translateX(-180%) skewX(-24deg);
  animation: hero-quick-link-scan 4.8s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
  pointer-events: none;
}

.hero__quick-link::after {
  content: '';
  position: absolute;
  inset: auto 18px 0;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(4, 228, 255, 0.16) 0%, rgba(4, 228, 255, 0.92) 45%, rgba(142, 115, 255, 0.84) 100%);
  transform-origin: left center;
  animation: hero-quick-link-trace 2.6s ease-in-out infinite;
  pointer-events: none;
}

.hero__quick-link-text,
.hero__quick-link-signal {
  position: relative;
  z-index: 1;
}

.hero__quick-link-text {
  text-align: center;
  transition:
    transform 240ms cubic-bezier(0.22, 1, 0.36, 1),
    letter-spacing 240ms cubic-bezier(0.22, 1, 0.36, 1);
}

.hero__quick-link-signal {
  position: relative;
  flex: 0 0 16px;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  box-shadow:
    inset 0 0 0 1px rgba(164, 241, 255, 0.38),
    0 0 0 1px rgba(164, 241, 255, 0.12);
  transition: transform 240ms cubic-bezier(0.22, 1, 0.36, 1);
}

.hero__quick-link-signal::before,
.hero__quick-link-signal::after {
  content: '';
  position: absolute;
  border-radius: inherit;
}

.hero__quick-link-signal::before {
  inset: 3px;
  background: linear-gradient(180deg, #b7f6ff 0%, #54d1ff 100%);
  box-shadow:
    0 0 12px rgba(84, 209, 255, 0.56),
    0 0 20px rgba(84, 209, 255, 0.28);
  animation: hero-quick-link-pulse 1.9s ease-in-out infinite;
}

.hero__quick-link-signal::after {
  inset: -7px;
  border: 1px solid rgba(114, 227, 255, 0.46);
  opacity: 0;
  animation: hero-quick-link-ripple 1.9s ease-out infinite;
}

.hero__quick-link:hover,
.hero__quick-link:focus-visible {
  transform: translateY(-2px);
  border-color: rgba(214, 243, 255, 0.92);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.16),
    0 0 0 1px rgba(74, 212, 255, 0.22),
    0 18px 40px rgba(6, 16, 44, 0.24),
    0 0 28px rgba(105, 57, 184, 0.16);
}

.hero__quick-link:hover::before,
.hero__quick-link:focus-visible::before {
  animation-duration: 2.2s;
}

.hero__quick-link:hover .hero__quick-link-text,
.hero__quick-link:focus-visible .hero__quick-link-text {
  transform: translateX(6px);
  letter-spacing: 0.1em;
  animation: hero-quick-link-hover-drift 780ms cubic-bezier(0.22, 1, 0.36, 1) infinite alternate;
}

.hero__quick-link:hover .hero__quick-link-signal,
.hero__quick-link:focus-visible .hero__quick-link-signal {
  transform: translateX(2px) rotate(10deg);
  animation: hero-quick-link-hover-jolt 820ms cubic-bezier(0.2, 0.9, 0.25, 1) infinite alternate;
}

.hero__quick-link:hover::after,
.hero__quick-link:focus-visible::after {
  animation-duration: 1.4s;
}

.hero__quick-link:focus-visible {
  outline: none;
}

.hero__menu-button {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  min-height: 52px;
  padding: 14px 18px;
  border-radius: 0;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.08);
  color: white;
  transition:
    transform 320ms cubic-bezier(0.2, 0.9, 0.25, 1),
    box-shadow 320ms cubic-bezier(0.2, 0.9, 0.25, 1),
    border-color 320ms cubic-bezier(0.2, 0.9, 0.25, 1),
    background-color 320ms cubic-bezier(0.2, 0.9, 0.25, 1);
}

.hero__menu-button:hover,
.hero__menu-button:focus-visible {
  transform: translateY(-2px);
}

.hero__menu-button-top {
  display: none;
}

.hero__menu-button img {
  width: 20px;
  height: 20px;
}

.hero__menu-shell {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  justify-content: flex-end;
  background: rgba(4, 12, 30, 0.56);
  backdrop-filter: blur(12px);
}

.hero__menu {
  position: relative;
  width: min(430px, 100vw);
  min-height: 100dvh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding:
    max(24px, env(safe-area-inset-top))
    clamp(20px, 4vw, 32px)
    max(24px, env(safe-area-inset-bottom));
  border-left: 1px solid rgba(255, 255, 255, 0.14);
  background:
    radial-gradient(circle at top left, rgba(83, 99, 217, 0.24) 0%, rgba(83, 99, 217, 0) 34%),
    linear-gradient(180deg, rgba(7, 17, 45, 0.98) 0%, rgba(4, 13, 31, 0.98) 100%);
  box-shadow: -24px 0 80px rgba(3, 11, 29, 0.44);
  overflow-y: auto;
}

.hero__menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.hero__menu-title {
  margin: 0;
  color: rgba(215, 227, 255, 0.72);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.hero__menu-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 12px 18px;
  border-radius: 0;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.08);
  color: white;
  font-size: 14px;
  font-weight: 700;
  transition:
    background 180ms ease,
    border-color 180ms ease,
    transform 180ms ease;
}

.hero__menu-close:hover {
  transform: translateY(-1px);
  border-color: rgba(255, 255, 255, 0.24);
  background: rgba(255, 255, 255, 0.12);
}

.hero__menu-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  min-height: 64px;
  padding: 16px 18px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.92);
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 1.2;
  transition:
    background 180ms ease,
    color 180ms ease,
    border-color 180ms ease,
    transform 180ms ease;
}

.hero__menu-link-index {
  color: rgba(143, 224, 255, 0.78);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.hero__menu-link:hover {
  transform: translateX(-4px);
  border-color: rgba(104, 182, 255, 0.26);
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.menu-drawer-enter-active,
.menu-drawer-leave-active {
  transition:
    opacity 280ms ease,
    backdrop-filter 280ms ease;
}

.menu-drawer-enter-active .hero__menu,
.menu-drawer-leave-active .hero__menu {
  transition:
    transform 360ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 360ms ease;
}

.menu-drawer-enter-from,
.menu-drawer-leave-to {
  opacity: 0;
  backdrop-filter: blur(0);
}

.menu-drawer-enter-from .hero__menu,
.menu-drawer-leave-to .hero__menu {
  opacity: 0.8;
  transform: translateX(100%);
}

@keyframes hero-quick-link-scan {
  0%,
  18% {
    transform: translateX(-180%) skewX(-24deg);
    opacity: 0;
  }
  28% {
    opacity: 1;
  }
  54% {
    transform: translateX(380%) skewX(-24deg);
    opacity: 0.96;
  }
  100% {
    transform: translateX(380%) skewX(-24deg);
    opacity: 0;
  }
}

@keyframes hero-quick-link-trace {
  0%,
  100% {
    transform: scaleX(0.18);
    opacity: 0.44;
  }
  45% {
    transform: scaleX(1);
    opacity: 1;
  }
  70% {
    transform: scaleX(0.56);
    opacity: 0.78;
  }
}

@keyframes hero-quick-link-pulse {
  0%,
  100% {
    transform: scale(0.9);
    filter: saturate(0.94);
  }
  50% {
    transform: scale(1.12);
    filter: saturate(1.12);
  }
}

@keyframes hero-quick-link-ripple {
  0% {
    transform: scale(0.58);
    opacity: 0;
  }
  24% {
    opacity: 0.74;
  }
  100% {
    transform: scale(1.36);
    opacity: 0;
  }
}

@keyframes hero-quick-link-hover-drift {
  0% {
    transform: translateX(4px);
  }
  100% {
    transform: translateX(10px);
  }
}

@keyframes hero-quick-link-hover-jolt {
  0% {
    transform: translateX(0) rotate(0deg) scale(1);
  }
  100% {
    transform: translateX(4px) rotate(12deg) scale(1.08);
  }
}

@media (max-width: 1000px) {
  .span-menu {
    display: none;
  }

  .hero__header-actions {
    justify-content: center;
  }
}

@media (max-width: 899px) {
  .hero__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .hero__header-actions {
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 898px) {
  .hero__header {
    gap: 15px;
  }

  .header__top {
    width: 95vw;
    display: flex;
    justify-content: space-between;
    gap: 10px;
  }

  .hero__menu-button-top {
    display: flex;
    max-width: 60px;
  }

  .hero__menu-button-bottom {
    display: none;
  }

  .hero__quick-link {
    width: 95vw;
  }
}

@media (max-width: 639px) {
  .hero__header {
    top: 0;
    width: 100%;
    padding: calc(12px + env(safe-area-inset-top, 0px)) 14px 12px;
    border-radius: 0;
    gap: 5px;
  }

  .hero__header-actions {
    align-items: stretch;
    flex-direction: column;
    gap: 5px;
  }

  .hero__quick-link,
  .hero__menu-button {
    width: 100%;
  }

  .hero__menu {
    width: 100vw;
    margin-top: 0;
    padding: 14px 18px;
    border-radius: 22px;
  }

  .hero__menu-link {
    min-height: 58px;
    font-size: 20px;
  }

  .hero__menu-close {
    min-height: 44px;
    padding-inline: 16px;
  }
}

@media (max-width: 500px) {
  .hero__quick-link-text {
    font-size: 10px;
  }
}
</style>
