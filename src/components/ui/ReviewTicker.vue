<script setup>
import { computed, nextTick, onBeforeUnmount, onBeforeUpdate, onMounted, ref, watch } from 'vue';

const AUTO_DRIFT_SPEED = 24;
const INTERACTION_PAUSE_MS = 2800;

const props = defineProps({
  reviews: {
    type: Array,
    required: true
  },
  previousLabel: {
    type: String,
    default: 'Предыдущий отзыв'
  },
  previousHorizontalLabel: {
    type: String,
    default: 'Предыдущий отзыв слева'
  },
  nextLabel: {
    type: String,
    default: 'Следующий отзыв'
  },
  nextHorizontalLabel: {
    type: String,
    default: 'Следующий отзыв справа'
  }
});

const reviewViewportRef = ref(null);
const reviewElements = ref([]);
const activeIndex = ref(0);
const activeRenderedIndex = ref(0);
const isVertical = ref(false);
let autoscrollFrame = 0;
let autoscrollResumeTimer = 0;
let autoscrollPaused = false;
let lastAutoscrollTimestamp = 0;
let autoscrollPosition = 0;

const hasReviews = computed(() => props.reviews.length > 0);
const hasControls = computed(() => props.reviews.length > 1);
const middleCopyOffset = computed(() => (hasControls.value ? props.reviews.length : 0));
const counterLabel = computed(() => `${activeIndex.value + 1} / ${props.reviews.length}`);
const renderedReviews = computed(() => {
  if (!props.reviews.length) return [];

  const copies = hasControls.value ? 3 : 1;

  return Array.from({ length: copies }, (_, copyIndex) =>
    props.reviews.map((review, reviewIndex) => ({
      review,
      baseIndex: reviewIndex,
      key: `${copyIndex}-${review.name}-${reviewIndex}`
    }))
  ).flat();
});

function normalizeIndex(index) {
  if (!props.reviews.length) return 0;
  return (index + props.reviews.length) % props.reviews.length;
}

function clampRenderedIndex(index) {
  if (!renderedReviews.value.length) return 0;
  return Math.min(Math.max(index, 0), renderedReviews.value.length - 1);
}

function getBaseIndexFromRenderedIndex(index) {
  if (!props.reviews.length) return 0;
  return index % props.reviews.length;
}

function setReviewRef(element, index) {
  if (!element) return;
  reviewElements.value[index] = element;
}

function getCurrentScrollPosition() {
  const viewport = reviewViewportRef.value;

  if (!viewport) return 0;

  return isVertical.value ? viewport.scrollTop : viewport.scrollLeft;
}

function setCurrentScrollPosition(value) {
  const viewport = reviewViewportRef.value;

  if (!viewport) return;

  if (isVertical.value) {
    viewport.scrollTop = value;
    return;
  }

  viewport.scrollLeft = value;
}

function syncAutoscrollPosition() {
  autoscrollPosition = getCurrentScrollPosition();
}

function getLoopBounds() {
  if (!hasControls.value) return null;

  const middleStartElement = reviewElements.value[middleCopyOffset.value];
  const nextCopyStartElement = reviewElements.value[middleCopyOffset.value + props.reviews.length];

  if (!middleStartElement || !nextCopyStartElement) return null;

  const start = isVertical.value ? middleStartElement.offsetTop : middleStartElement.offsetLeft;
  const end = isVertical.value ? nextCopyStartElement.offsetTop : nextCopyStartElement.offsetLeft;

  return {
    start,
    end,
    span: end - start
  };
}

function normalizeLoopPosition(position = getCurrentScrollPosition()) {
  const bounds = getLoopBounds();

  if (!bounds?.span) return position;

  let nextPosition = position;

  while (nextPosition < bounds.start) {
    nextPosition += bounds.span;
  }

  while (nextPosition >= bounds.end) {
    nextPosition -= bounds.span;
  }

  return nextPosition;
}

function applyLoopPosition(position = getCurrentScrollPosition()) {
  const nextPosition = normalizeLoopPosition(position);

  autoscrollPosition = nextPosition;

  if (Math.abs(nextPosition - getCurrentScrollPosition()) > 0.5) {
    setCurrentScrollPosition(nextPosition);
  }

  return nextPosition;
}

function clearAutoscrollResumeTimer() {
  window.clearTimeout(autoscrollResumeTimer);
}

function resetAutoscroll() {
  clearAutoscrollResumeTimer();
  autoscrollPaused = false;
  lastAutoscrollTimestamp = 0;
  syncAutoscrollPosition();
}

function pauseAutoscroll(delay = INTERACTION_PAUSE_MS) {
  clearAutoscrollResumeTimer();
  autoscrollPaused = true;
  lastAutoscrollTimestamp = 0;

  if (!hasControls.value) return;

  autoscrollResumeTimer = window.setTimeout(() => {
    autoscrollPaused = false;
    lastAutoscrollTimestamp = 0;
    syncAutoscrollPosition();
  }, delay);
}

function scrollToRenderedReview(renderedIndex, behavior = 'smooth') {
  if (!hasReviews.value) return;

  const normalizedRenderedIndex = clampRenderedIndex(renderedIndex);
  const viewport = reviewViewportRef.value;
  const targetReview = reviewElements.value[normalizedRenderedIndex];

  activeRenderedIndex.value = normalizedRenderedIndex;
  activeIndex.value = getBaseIndexFromRenderedIndex(normalizedRenderedIndex);

  if (!viewport || !targetReview) return;

  autoscrollPosition = isVertical.value ? targetReview.offsetTop : targetReview.offsetLeft;

  viewport.scrollTo({
    left: isVertical.value ? 0 : targetReview.offsetLeft,
    top: isVertical.value ? targetReview.offsetTop : 0,
    behavior
  });
}

function syncToActiveReview(behavior = 'auto') {
  if (!hasReviews.value) return;

  const renderedIndex = hasControls.value
    ? middleCopyOffset.value + normalizeIndex(activeIndex.value)
    : normalizeIndex(activeIndex.value);

  scrollToRenderedReview(renderedIndex, behavior);
}

function getManualTargetRenderedIndex(direction) {
  if (!hasControls.value) {
    return normalizeIndex(activeIndex.value + direction);
  }

  return middleCopyOffset.value + normalizeIndex(activeIndex.value + direction);
}

function showPreviousReview() {
  pauseAutoscroll();
  applyLoopPosition();
  scrollToRenderedReview(getManualTargetRenderedIndex(-1));
}

function showNextReview() {
  pauseAutoscroll();
  applyLoopPosition();
  scrollToRenderedReview(getManualTargetRenderedIndex(1));
}

function syncActiveIndex() {
  const viewport = reviewViewportRef.value;

  if (!viewport || reviewElements.value.length === 0) return;

  const viewportPosition = applyLoopPosition();

  syncAutoscrollPosition();
  let nextActiveRenderedIndex = 0;
  let smallestDistance = Number.POSITIVE_INFINITY;

  reviewElements.value.forEach((element, index) => {
    if (!element) return;

    const elementPosition = isVertical.value ? element.offsetTop : element.offsetLeft;
    const distance = Math.abs(elementPosition - viewportPosition);

    if (distance < smallestDistance) {
      smallestDistance = distance;
      nextActiveRenderedIndex = index;
    }
  });

  activeRenderedIndex.value = nextActiveRenderedIndex;
  activeIndex.value = getBaseIndexFromRenderedIndex(nextActiveRenderedIndex);
}

function handleKeydown(event) {
  if (!hasControls.value) return;

  if (isVertical.value) {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      pauseAutoscroll();
      showPreviousReview();
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      pauseAutoscroll();
      showNextReview();
    }

    return;
  }

  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    pauseAutoscroll();
    showPreviousReview();
  }

  if (event.key === 'ArrowRight') {
    event.preventDefault();
    pauseAutoscroll();
    showNextReview();
  }
}

function handleUserInteraction() {
  pauseAutoscroll();
}

function runAutoscrollFrame(timestamp) {
  if (autoscrollPaused || !hasControls.value) {
    lastAutoscrollTimestamp = timestamp;
    autoscrollFrame = window.requestAnimationFrame(runAutoscrollFrame);
    return;
  }

  if (!lastAutoscrollTimestamp) {
    lastAutoscrollTimestamp = timestamp;
    autoscrollFrame = window.requestAnimationFrame(runAutoscrollFrame);
    return;
  }

  const deltaTime = timestamp - lastAutoscrollTimestamp;
  const driftDistance = (AUTO_DRIFT_SPEED * deltaTime) / 1000;
  const viewport = reviewViewportRef.value;

  lastAutoscrollTimestamp = timestamp;

  if (viewport) {
    autoscrollPosition += driftDistance;
    autoscrollPosition = normalizeLoopPosition(autoscrollPosition);
    setCurrentScrollPosition(autoscrollPosition);
  }

  autoscrollFrame = window.requestAnimationFrame(runAutoscrollFrame);
}

function startAutoscroll() {
  window.cancelAnimationFrame(autoscrollFrame);
  autoscrollFrame = window.requestAnimationFrame(runAutoscrollFrame);
}

onBeforeUpdate(() => {
  reviewElements.value = [];
});

watch(
  () => props.reviews.length,
  async () => {
    activeIndex.value = normalizeIndex(activeIndex.value);
    activeRenderedIndex.value = hasControls.value
      ? middleCopyOffset.value + activeIndex.value
      : activeIndex.value;
    await nextTick();
    syncToActiveReview('auto');
    resetAutoscroll();
  }
);

onMounted(() => {
  startAutoscroll();

  window.requestAnimationFrame(() => {
    syncToActiveReview('auto');
    resetAutoscroll();
  });
});

onBeforeUnmount(() => {
  clearAutoscrollResumeTimer();
  window.cancelAnimationFrame(autoscrollFrame);
});
</script>

<template>
  <div class="review-ticker" v-reveal="80">
    <div class="review-ticker__topbar">
      <span></span>
      <div v-if="hasControls" class="review-ticker__controls">
        <button
          class="review-ticker__button"
          type="button"
          :aria-label="isVertical ? props.previousLabel : props.previousHorizontalLabel"
          @click="showPreviousReview"
        >
          <span
            class="review-ticker__arrow"
            :class="isVertical ? 'review-ticker__arrow--up' : 'review-ticker__arrow--left'"
            aria-hidden="true"
          />
        </button>

        <span class="review-ticker__counter">{{ counterLabel }}</span>

        <button
          class="review-ticker__button"
          type="button"
          :aria-label="isVertical ? props.nextLabel : props.nextHorizontalLabel"
          @click="showNextReview"
        >
          <span
            class="review-ticker__arrow"
            :class="isVertical ? 'review-ticker__arrow--down' : 'review-ticker__arrow--right'"
            aria-hidden="true"
          />
        </button>
      </div>
    </div>

    <div
      ref="reviewViewportRef"
      class="review-ticker__viewport"
      :class="{ 'review-ticker__viewport--vertical': isVertical }"
      tabindex="0"
      @keydown="handleKeydown"
      @pointerdown="handleUserInteraction"
      @scroll.passive="syncActiveIndex"
    >
      <div class="review-ticker__track" :class="{ 'review-ticker__track--vertical': isVertical }">
        <article
          v-for="(item, index) in renderedReviews"
          :key="item.key"
          :ref="(element) => setReviewRef(element, index)"
          class="review-card"
          :class="{ 'review-card--wide': item.review.wide }"
        >
          <div class="review-card__top">
            <div class="review-card__identity">
              <img
                v-if="item.review.image"
                class="review-card__avatar"
                :src="item.review.image"
                :alt="item.review.name"
              />
              <span v-else class="review-card__avatar">{{ item.review.name.slice(0, 2).toUpperCase() }}</span>
              <p class="review-card__name">{{ item.review.name }}</p>
            </div>

            <span class="review-card__rating">★★★★★</span>
          </div>

          <p class="review-card__text">{{ item.review.text }}</p>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
.review-ticker {
  display: grid;
  gap: 20px;
  width: 100%;
}

.review-ticker__topbar {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
}

.review-ticker__hint {
  margin: 0;
  color: rgba(28, 49, 92, 0.72);
  font-size: 14px;
  line-height: 1.5;
}

.review-ticker__controls {
  display: inline-flex;
  gap: 12px;
  align-items: center;
  flex-shrink: 0;
}

.review-ticker__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border: 1px solid rgba(91, 103, 133, 0.18);
  border-radius: 999px;
  background: white;
  box-shadow: 0 16px 30px rgba(13, 35, 76, 0.08);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.review-ticker__button:hover,
.review-ticker__button:focus-visible {
  transform: translateY(-2px);
  border-color: rgba(46, 91, 201, 0.26);
  box-shadow: 0 20px 36px rgba(13, 35, 76, 0.14);
  outline: none;
}

.review-ticker__counter {
  min-width: 58px;
  color: var(--accent-deep);
  font-size: 14px;
  font-weight: 800;
  text-align: center;
}

.review-ticker__arrow {
  width: 12px;
  height: 12px;
  border-right: 2px solid var(--accent-deep);
  border-bottom: 2px solid var(--accent-deep);
}

.review-ticker__arrow--left {
  transform: rotate(135deg);
}

.review-ticker__arrow--right {
  transform: rotate(-45deg);
}

.review-ticker__arrow--up {
  transform: rotate(-135deg);
}

.review-ticker__arrow--down {
  transform: rotate(45deg);
}

.review-ticker__viewport {
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;
  scroll-behavior: auto;
  scrollbar-width: none;
}

.review-ticker__viewport::-webkit-scrollbar {
  display: none;
}

.review-ticker__viewport:focus-visible {
  outline: 2px solid rgba(46, 91, 201, 0.28);
  outline-offset: 10px;
}

.review-ticker__track {
  display: flex;
  gap: 18px;
  width: max-content;
  padding: 2px 2px 12px;
}

.review-card {
  width: min(470px, 82vw);
  flex-shrink: 0;
  display: grid;
  gap: 18px;
  padding: 22px;
  border: 1px solid rgba(91, 103, 133, 0.12);
  border-radius: 24px;
  background: white;
  box-shadow: 0 16px 34px rgba(13, 35, 76, 0.06);
}

.review-card--wide {
  width: min(820px, 92vw);
}

.review-card__top {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.review-card__identity {
  display: flex;
  gap: 12px;
  align-items: center;
}

.review-card__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 999px;
  background: var(--gradient-accent);
  color: white;
  font-size: 16px;
  font-weight: 800;
}

.review-card__name {
  margin: 0;
  color: var(--accent-deep);
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
}

.review-card__rating {
  color: transparent;
  background: var(--gradient-accent);
  background-clip: text;
  -webkit-background-clip: text;
  font-size: 16px;
  font-weight: 800;
}

.review-card__text {
  margin: 0;
  color: var(--accent-deep);
  font-size: 18px;
  line-height: 1.55;
}

@media (max-width: 700px) {
  .review-ticker {
    gap: 18px;
  }

  .review-ticker__topbar {
    flex-direction: column;
    align-items: stretch;
  }

  .review-ticker__controls {
    justify-content: space-between;
  }

  .review-ticker__button {
    width: 48px;
    height: 48px;
  }

  .review-ticker__viewport {
    overflow-x: auto;
    overflow-y: hidden;
  }

  .review-ticker__track {
    width: max-content;
    padding-bottom: 8px;
  }

  .review-card {
    width: min(300px, 78vw);
  }

  .review-card--wide {
    width: min(340px, 86vw);
  }

  .review-card {
    gap: 16px;
    padding: 18px;
    border-radius: 22px;
  }

  .review-card__top {
    flex-direction: column;
    align-items: flex-start;
  }

  .review-card__identity {
    width: 100%;
    align-items: flex-start;
  }

  .review-card__name,
  .review-card__rating {
    font-size: 15px;
  }

  .review-card__text {
    font-size: 16px;
  }
}
</style>
