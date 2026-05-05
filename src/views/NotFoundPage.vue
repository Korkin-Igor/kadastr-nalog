<template>
  <main class="page-shell not-found">
    <section class="section not-found__section">
      <div class="container not-found__layout">
        <span class="not-found__eyebrow">404</span>
        <h1>Страница не найдена</h1>
        <p>Проверьте адрес маршрута или вернитесь на главную страницу проекта.</p>
        <RouterLink class="button button--primary" to="/" v-button-wave>
          <span class="button__wave" aria-hidden="true"></span>
          <span class="button__wave-gloss" aria-hidden="true"></span>
          <span class="button__label">Перейти на главную</span>
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  background: linear-gradient(180deg, #07112d 0%, #183570 58%, #1ca3e3 100%);
}

.not-found__section {
  display: grid;
  min-height: 100vh;
  place-items: center;
}

.not-found__layout {
  display: grid;
  gap: 18px;
  justify-items: start;
  max-width: 720px;
  color: white;
}

.not-found__eyebrow {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.12);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.not-found__layout h1 {
  margin: 0;
  font-size: clamp(42px, 6vw, 72px);
  line-height: 1;
  text-transform: uppercase;
}

.not-found__layout p {
  margin: 0;
  font-size: 18px;
  line-height: 1.6;
  color: rgba(241, 245, 255, 0.86);
}

@media (max-width: 639px) {
  .not-found__layout p {
    font-size: 16px;
  }
}
</style>
