<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { setPageScrollLock } from '@/app/utils/pageScrollLock';
import AppHeader from '@/components/layout/AppHeader.vue';

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
  heroContent: {
    type: Object,
    required: true
  }
});

const videoOpen = ref(false);
const videoPlaying = ref(false);
const videoMuted = ref(false);
const videoProgress = ref(0);
const videoDuration = ref(0);
const videoCurrentTime = ref(0);
const previewVideoRef = ref(null);
const expandedVideoRef = ref(null);

function getTitleParts(line) {
  const accentWord = props.heroContent.accentWord;

  if (!accentWord || typeof line !== 'string') {
    return {
      before: line,
      accent: '',
      after: ''
    };
  }

  const accentIndex = line.indexOf(accentWord);

  if (accentIndex === -1) {
    return {
      before: line,
      accent: '',
      after: ''
    };
  }

  return {
    before: line.slice(0, accentIndex),
    accent: accentWord,
    after: line.slice(accentIndex + accentWord.length)
  };
}

function playPreviewVideo() {
  const video = previewVideoRef.value;

  if (!video) {
    return;
  }

  video.muted = true;

  const playback = video.play();
  if (playback?.catch) {
    playback.catch(() => {});
  }
}

function pausePreviewVideo() {
  previewVideoRef.value?.pause();
}

function updateExpandedVideoState() {
  const video = expandedVideoRef.value;

  if (!video) {
    return;
  }

  videoDuration.value = Number.isFinite(video.duration) ? video.duration : 0;
  videoCurrentTime.value = Number.isFinite(video.currentTime) ? video.currentTime : 0;
  videoProgress.value = videoDuration.value > 0 ? (videoCurrentTime.value / videoDuration.value) * 100 : 0;
  videoPlaying.value = !video.paused && !video.ended;
}

async function openVideo() {
  if (videoOpen.value) {
    return;
  }

  videoOpen.value = true;
  pausePreviewVideo();

  await nextTick();

  const video = expandedVideoRef.value;
  const previewVideo = previewVideoRef.value;

  if (!video) {
    return;
  }

  if (previewVideo && Number.isFinite(previewVideo.currentTime)) {
    video.currentTime = previewVideo.currentTime;
  }

  video.muted = videoMuted.value;

  try {
    await video.play();
  } catch {
    videoMuted.value = true;
    video.muted = true;

    const playback = video.play();
    if (playback?.catch) {
      await playback.catch(() => {});
    }
  }

  updateExpandedVideoState();
}

function closeVideo() {
  const video = expandedVideoRef.value;
  const previewVideo = previewVideoRef.value;

  if (video && previewVideo && Number.isFinite(video.currentTime)) {
    previewVideo.currentTime = video.currentTime;
  }

  if (video) {
    video.pause();
  }

  videoOpen.value = false;
  videoPlaying.value = false;

  nextTick(() => {
    playPreviewVideo();
  });
}

async function toggleExpandedVideoPlayback() {
  const video = expandedVideoRef.value;

  if (!video) {
    return;
  }

  if (video.paused || video.ended) {
    const playback = video.play();
    if (playback?.catch) {
      await playback.catch(() => {});
    }
  } else {
    video.pause();
  }

  updateExpandedVideoState();
}

function toggleExpandedVideoMute() {
  videoMuted.value = !videoMuted.value;

  if (expandedVideoRef.value) {
    expandedVideoRef.value.muted = videoMuted.value;
  }
}

function handleExpandedVideoLoadedMetadata() {
  updateExpandedVideoState();
}

function handleExpandedVideoTimeUpdate() {
  updateExpandedVideoState();
}

function handleExpandedVideoEnded() {
  videoPlaying.value = false;
}

function handleExpandedVideoSeek(event) {
  const video = expandedVideoRef.value;
  const percent = Number(event.target.value);

  if (!video || !videoDuration.value) {
    return;
  }

  video.currentTime = (videoDuration.value * percent) / 100;
  updateExpandedVideoState();
}

function formatVideoTime(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return '0:00';
  }

  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');

  return `${minutes}:${remainder}`;
}

function handleWindowKeydown(event) {
  if (event.key === 'Escape' && videoOpen.value) {
    closeVideo();
  }
}

watch(videoOpen, (isVideoOpen) => {
  setPageScrollLock('hero-video', isVideoOpen);
});

onMounted(() => {
  window.addEventListener('keydown', handleWindowKeydown);
  playPreviewVideo();
});

onBeforeUnmount(() => {
  pausePreviewVideo();
  expandedVideoRef.value?.pause();
  setPageScrollLock('hero-video', false);
  window.removeEventListener('keydown', handleWindowKeydown);
});
</script>

<template>
  <section id="hero" class="hero section section--flush">
    <div class="hero__veil hero__veil--left"></div>
    <div class="hero__veil hero__veil--bottom"></div>
    <div class="hero__veil hero__veil--right"></div>

    <AppHeader
      :brand="props.brand"
      :navigation="props.navigation"
      :header-content="props.headerContent"
      :utility-label="props.heroContent.utilityLabel"
      :menu-icon="props.heroContent.menuIcon"
    />

    <div class="container hero__container">
      <Teleport to="body">
        <Transition name="hero-video-lightbox">
          <div
            v-if="videoOpen"
            class="hero__video-shell"
            role="dialog"
            aria-modal="true"
            aria-labelledby="hero-video-title"
            @click.self="closeVideo"
          >
            <div class="hero__video-modal">
              <div class="hero__video-modal-top">
                <p id="hero-video-title" class="hero__video-modal-title">
                  {{ props.heroContent.videoDialogTitle }}
                </p>

                <button
                  class="hero__video-close"
                  type="button"
                  :aria-label="props.heroContent.closeVideoAriaLabel"
                  @click="closeVideo"
                >
                  {{ props.heroContent.closeVideoLabel }}
                </button>
              </div>

              <div class="hero__video-frame">
                <video
                  ref="expandedVideoRef"
                  class="hero__video-player"
                  :src="props.heroContent.videoSrc"
                  playsinline
                  preload="metadata"
                  @click="toggleExpandedVideoPlayback"
                  @ended="handleExpandedVideoEnded"
                  @loadedmetadata="handleExpandedVideoLoadedMetadata"
                  @pause="videoPlaying = false"
                  @play="videoPlaying = true"
                  @timeupdate="handleExpandedVideoTimeUpdate"
                ></video>

                <button
                  v-if="!videoPlaying"
                  class="hero__video-center-toggle"
                  type="button"
                  @click.stop="toggleExpandedVideoPlayback"
                >
                  {{ props.heroContent.watchLabel }}
                </button>
              </div>

              <div class="hero__video-controls">
                <button
                  class="hero__video-control"
                  type="button"
                  @click="toggleExpandedVideoPlayback"
                >
                  {{ videoPlaying ? props.heroContent.pauseLabel : props.heroContent.watchLabel }}
                </button>

                <button
                  class="hero__video-control hero__video-control--ghost"
                  type="button"
                  @click="toggleExpandedVideoMute"
                >
                  {{ videoMuted ? props.heroContent.mutedButtonLabel : props.heroContent.unmutedButtonLabel }}
                </button>

                <div class="hero__video-progress">
                  <span class="hero__video-time">{{ formatVideoTime(videoCurrentTime) }}</span>
                  <input
                    class="hero__video-range"
                    type="range"
                    min="0"
                    max="100"
                    step="0.1"
                    :value="videoProgress"
                    :aria-label="props.heroContent.videoRangeLabel"
                    @input="handleExpandedVideoSeek"
                  />
                  <span class="hero__video-time">{{ formatVideoTime(videoDuration) }}</span>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <div class="hero__layout">
        <div class="hero__copy" v-reveal="80">
          <h1 class="hero__title">
            <span
              v-for="(line, index) in props.heroContent.titleLines"
              :key="`${index}-${line}`"
              class="hero__title-line"
            >
              <template v-if="getTitleParts(line).accent">
                {{ getTitleParts(line).before }}
                <span class="hero__title-accent">{{ getTitleParts(line).accent }}</span>
                {{ getTitleParts(line).after }}
              </template>
              <template v-else>
                {{ line }}
              </template>
            </span>
          </h1>

          <p class="hero__description">{{ props.heroContent.description }}</p>

          <a class="button button--primary hero__cta" href="#checklist" v-button-wave>
            <span class="button__wave" aria-hidden="true"></span>
            <span class="button__wave-gloss" aria-hidden="true"></span>
            <span class="button__label">{{ props.heroContent.cta }}</span>
          </a>
        </div>

        <div class="hero__media" v-reveal="180">
          <div class="hero__video-card">
            <span class="hero__video-label">{{ props.heroContent.videoLabel }}</span>
            <video
              ref="previewVideoRef"
              class="hero__video-preview"
              :src="props.heroContent.videoSrc"
              autoplay
              loop
              muted
              playsinline
              preload="metadata"
              :aria-label="props.heroContent.previewAriaLabel"
            ></video>
            <div class="hero__video-shade" aria-hidden="true"></div>
            <button
              class="hero__play"
              type="button"
              :aria-label="props.heroContent.openVideoAriaLabel"
              @click="openVideo"
            >
              <span class="hero__play-core" aria-hidden="true">
                <span class="hero__play-icon"></span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  background: linear-gradient(to right, #35216e, #13356e, #1ba7e7);
  color: #ffffff;
}

.hero__veil {
  position: absolute;
  border-radius: 999px;
  pointer-events: none;
  filter: blur(24px);
}

.hero__veil--left {
  top: -120px;
  left: -100px;
  width: 760px;
  height: 760px;
  background: radial-gradient(circle, rgb(15 0 47 / 0.34) 0%, rgba(154, 103, 255, 0) 70%);
  animation: float-orb 12s ease-in-out infinite;
}

.hero__veil--bottom {
  right: -150px;
  bottom: -150px;
  width: 920px;
  height: 420px;
  background: rgb(0 13 41);
  filter: blur(150px);
  animation: float-orb 14s ease-in-out infinite reverse;
}

.hero__veil--right {
  top: -120px;
  right: 100px;
  width: 360px;
  height: 360px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0) 70%);
}

.hero__container {
  position: relative;
  z-index: 1;
}

.hero__layout {
  display: grid;
  gap: 40px;
  align-items: center;
  padding-top: clamp(56px, 8vw, 88px);
}

.hero__copy {
  display: grid;
  gap: 24px;
  max-width: 622px;
}

.hero__title {
  margin: 0;
  display: grid;
  gap: 0;
  font-size: clamp(44px, 4.4vw, 55px);
  line-height: 1.2;
  font-weight: 800;
  text-transform: uppercase;
  text-wrap: balance;
  text-shadow:
    0 0 18px rgba(255, 255, 255, 0.34),
    0 0 42px rgba(255, 255, 255, 0.2);
}

.hero__title-line {
  display: block;
  line-height: 1.2;
}

.hero__title-accent {
  color: transparent;
  background: linear-gradient(180deg, #d6efff 0%, #8ff7ff 32%, #5afcff 62%, #d8f0ff 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow:
    0 0 12px rgba(90, 252, 255, 0.38),
    0 0 34px rgba(90, 252, 255, 0.3);
  animation: title-glow 3.2s ease-in-out infinite;
}

.hero__description {
  margin: 0;
  max-width: 520px;
  font-size: 18px;
  line-height: 1.66;
  color: rgba(241, 245, 255, 0.88);
}

.hero__cta {
  width: min(100%, 577px);
  min-height: 58px;
  justify-content: flex-start;
  padding-inline: 24px 48px;
  border-radius: 0;
  color: #3556a5;
  font-size: 15px;
  font-weight: 800;
  line-height: 1.46;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  box-shadow: 0 0 20px rgba(34, 209, 232, 0.2);
  position: relative;
}

.hero__cta::after {
  content: '›';
  position: absolute;
  right: 18px;
  top: 50%;
  font-size: 22px;
  color: inherit;
  transform: translateY(-52%);
  transition: transform 220ms ease, color 220ms ease;
}

.hero__cta:hover,
.hero__cta:focus-visible {
  color: #ffffff;
}

.hero__cta:hover::after {
  transform: translate(4px, -52%);
}

.hero__media {
  display: flex;
  justify-content: flex-end;
}

.hero__video-card {
  position: relative;
  overflow: hidden;
  width: min(100%, 620px);
  min-height: 352px;
  border: 3px solid rgba(58, 211, 255, 0.5);
  background: #091633;
  box-shadow:
    0 24px 64px rgba(9, 19, 43, 0.14),
    0 0 20px rgba(59, 226, 226, 0.45);
  isolation: isolate;
}

.hero__video-label {
  position: absolute;
  top: 18px;
  left: 18px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 8px 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(8, 19, 43, 0.72);
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.hero__video-preview {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 352px;
  object-fit: cover;
  transform: scale(1.01);
}

.hero__video-shade {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(3, 8, 24, 0.08) 0%, rgba(3, 8, 24, 0.32) 48%, rgba(3, 8, 24, 0.62) 100%),
    radial-gradient(circle at center, rgba(14, 128, 204, 0.12) 0%, rgba(3, 8, 24, 0) 52%);
  pointer-events: none;
}

.hero__play {
  position: absolute;
  inset: 50% auto auto 50%;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 136px;
  height: 136px;
  padding: 0;
  transform: translate(-50%, -50%);
  border: 0;
  background: transparent;
  transition:
    transform 320ms cubic-bezier(0.22, 1, 0.36, 1),
    filter 320ms cubic-bezier(0.22, 1, 0.36, 1);
}

.hero__play::before,
.hero__play::after {
  content: '';
  position: absolute;
  border-radius: 999px;
  transition:
    transform 320ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 320ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 320ms cubic-bezier(0.22, 1, 0.36, 1);
}

.hero__play::before {
  inset: 0;
  border: 4px solid rgba(132, 226, 255, 0.94);
  background: transparent;
  box-shadow:
    0 0 24px rgba(99, 241, 255, 0.2),
    0 0 40px rgba(141, 103, 255, 0.12);
}

.hero__play::after {
  inset: -10px;
  border: 1px solid rgba(120, 210, 255, 0.28);
  opacity: 0.5;
  transform: scale(0.96);
}

.hero__play-core {
  position: absolute;
  inset: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.hero__play-icon {
  position: relative;
  width: 36px;
  height: 42px;
  clip-path: polygon(0 0, 100% 50%, 0 100%);
  background: linear-gradient(180deg, #6cf4ff 0%, #62b4ff 46%, #8b63ff 100%);
  transform: translateX(4px) scale(1);
  transition:
    transform 320ms cubic-bezier(0.22, 1, 0.36, 1),
    filter 320ms cubic-bezier(0.22, 1, 0.36, 1);
}

.hero__play-icon::after {
  content: '';
  position: absolute;
  inset: -10px;
  z-index: -1;
  clip-path: polygon(0 0, 100% 50%, 0 100%);
  background: linear-gradient(180deg, rgba(108, 244, 255, 0.56) 0%, rgba(98, 180, 255, 0.46) 46%, rgba(139, 99, 255, 0.58) 100%);
  filter: blur(10px);
  opacity: 0;
  transition: opacity 320ms cubic-bezier(0.22, 1, 0.36, 1);
}

.hero__video-card:hover .hero__play,
.hero__video-card:focus-within .hero__play {
  transform: translate(-50%, -50%) scale(1.05);
  filter:
    drop-shadow(0 0 18px rgba(99, 241, 255, 0.26))
    drop-shadow(0 0 30px rgba(141, 103, 255, 0.18));
}

.hero__video-card:hover .hero__play::before,
.hero__video-card:focus-within .hero__play::before {
  box-shadow:
    0 0 18px rgba(99, 241, 255, 0.34),
    0 0 34px rgba(141, 103, 255, 0.22);
}

.hero__video-card:hover .hero__play::after,
.hero__video-card:focus-within .hero__play::after {
  opacity: 1;
  transform: scale(1);
}

.hero__video-card:hover .hero__play-icon,
.hero__video-card:focus-within .hero__play-icon {
  transform: translateX(4px) scale(1.04);
  filter:
    drop-shadow(0 0 10px rgba(99, 241, 255, 0.42))
    drop-shadow(0 0 18px rgba(141, 103, 255, 0.32));
}

.hero__video-card:hover .hero__play-icon::after,
.hero__video-card:focus-within .hero__play-icon::after {
  opacity: 1;
}

.hero__video-shell {
  position: fixed;
  inset: 0;
  z-index: 2100;
  display: grid;
  place-items: center;
  padding:
    max(18px, env(safe-area-inset-top))
    clamp(16px, 3vw, 28px)
    max(18px, env(safe-area-inset-bottom));
  background: rgba(3, 10, 28, 0.78);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.hero__video-modal {
  width: min(1100px, 100%);
  max-height: calc(100dvh - 36px);
  display: grid;
  gap: 18px;
  padding: clamp(16px, 2vw, 24px);
  border: 1px solid rgba(112, 180, 255, 0.22);
  background:
    radial-gradient(circle at top left, rgba(49, 114, 219, 0.24) 0%, rgba(49, 114, 219, 0) 28%),
    linear-gradient(180deg, rgba(5, 15, 39, 0.98) 0%, rgba(7, 16, 34, 0.98) 100%);
  box-shadow:
    0 36px 120px rgba(0, 0, 0, 0.48),
    0 0 0 1px rgba(255, 255, 255, 0.04) inset;
  overflow: auto;
}

.hero__video-modal-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.hero__video-modal-title {
  margin: 0;
  color: #eef6ff;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.hero__video-close {
  min-height: 44px;
  padding: 0 16px;
  border: 1px solid rgba(144, 215, 255, 0.24);
  background: rgba(255, 255, 255, 0.06);
  color: #eef6ff;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  transition:
    background-color 220ms ease,
    border-color 220ms ease,
    transform 220ms ease;
}

.hero__video-close:hover {
  transform: translateY(-1px);
  border-color: rgba(144, 215, 255, 0.42);
  background: rgba(255, 255, 255, 0.12);
}

.hero__video-frame {
  position: relative;
  overflow: hidden;
  background: #020916;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.3);
}

.hero__video-player {
  width: 100%;
  max-height: min(72vh, 760px);
  display: block;
  background: #020916;
  object-fit: contain;
}

.hero__video-center-toggle {
  position: absolute;
  inset: 50% auto auto 50%;
  min-width: 148px;
  min-height: 54px;
  padding: 0 20px;
  border: 1px solid rgba(134, 211, 255, 0.34);
  background: rgba(6, 17, 44, 0.74);
  color: #eef6ff;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  transform: translate(-50%, -50%);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 20px 42px rgba(0, 0, 0, 0.3);
}

.hero__video-controls {
  display: grid;
  grid-template-columns: auto auto minmax(0, 1fr);
  align-items: center;
  gap: 14px;
}

.hero__video-control {
  min-height: 46px;
  padding: 0 18px;
  border: 1px solid rgba(107, 203, 255, 0.38);
  background: linear-gradient(135deg, rgba(24, 136, 226, 0.92) 0%, rgba(96, 92, 255, 0.92) 100%);
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  transition:
    transform 220ms ease,
    box-shadow 220ms ease,
    border-color 220ms ease,
    background-color 220ms ease;
}

.hero__video-control:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 26px rgba(36, 109, 219, 0.22);
}

.hero__video-control--ghost {
  background: rgba(255, 255, 255, 0.06);
}

.hero__video-progress {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
}

.hero__video-time {
  color: rgba(225, 238, 255, 0.72);
  font-size: 12px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.hero__video-range {
  width: 100%;
  height: 4px;
  margin: 0;
  accent-color: #5fe1ff;
}

.hero-video-lightbox-enter-active,
.hero-video-lightbox-leave-active {
  transition: opacity 320ms ease;
}

.hero-video-lightbox-enter-active .hero__video-modal,
.hero-video-lightbox-leave-active .hero__video-modal {
  transition:
    transform 360ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 360ms ease;
}

.hero-video-lightbox-enter-from,
.hero-video-lightbox-leave-to {
  opacity: 0;
}

.hero-video-lightbox-enter-from .hero__video-modal,
.hero-video-lightbox-leave-to .hero__video-modal {
  opacity: 0;
  transform: translateY(24px) scale(0.96);
}

@keyframes float-orb {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }

  50% {
    transform: translate3d(0, 18px, 0);
  }
}

@keyframes title-glow {
  0%,
  100% {
    filter: drop-shadow(0 0 0 rgba(90, 252, 255, 0.28));
  }

  50% {
    filter: drop-shadow(0 0 18px rgba(90, 252, 255, 0.34));
  }
}

@media (min-width: 1150px) {
  .hero__video-frame video {
    max-width: 500px;
  }
}

@media (max-width: 960px) {
  .hero__video-card,
  .hero__video-preview {
    width: 100%;
  }

  .hero__layout {
    padding-top: clamp(36px, 6vw, 52px);
  }

  .hero__media {
    justify-content: stretch;
  }

  .hero__video-card,
  .hero__video-preview {
    width: 100%;
  }
}

@media (max-width: 900px) {
  .hero__copy {
    margin: 0 auto;
  }
}

@media (max-width: 720px) {
  .hero__title {
    font-size: clamp(34px, 10vw, 44px);
  }

  .hero__description {
    font-size: 16px;
  }

  .hero__video-card,
  .hero__video-preview {
    min-height: 240px;
  }

  .hero__play {
    width: 92px;
    height: 92px;
  }

  .hero__play::before {
    border-width: 3px;
  }

  .hero__play-icon {
    width: 24px;
    height: 28px;
  }

  .hero__video-label {
    top: 12px;
    left: 12px;
    min-height: 30px;
    padding: 6px 10px;
    font-size: 11px;
  }

  .hero__video-modal {
    gap: 14px;
    padding: 14px;
  }

  .hero__video-modal-top,
  .hero__video-controls {
    grid-template-columns: 1fr;
    justify-items: stretch;
  }

  .hero__video-modal-top {
    display: grid;
  }

  .hero__video-close,
  .hero__video-control,
  .hero__video-control--ghost {
    width: 100%;
  }

  .hero__video-progress {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .hero__video-time:last-child {
    text-align: right;
  }
}
</style>
