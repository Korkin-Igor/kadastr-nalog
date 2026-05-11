<script setup>
import { useRecaptchaProvider } from 'vue-recaptcha/head';
import DiscountPopup from '@/components/ui/DiscountPopup.vue';
import { RECAPTCHA_ENABLED } from '@/app/security/recaptcha';

if (RECAPTCHA_ENABLED) {
  useRecaptchaProvider();
}
</script>

<template>
  <RouterView />
  <DiscountPopup />
</template>

<style>
:root {
  color-scheme: light;
  font-family: 'Manrope', sans-serif;
  --page-header-offset: 104px;
  --page-bg: #f4f7fc;
  --surface: #ffffff;
  --surface-dark: #07112d;
  --text-primary: #12203f;
  --text-secondary: #5b6785;
  --text-inverse: rgba(255, 255, 255, 0.94);
  --text-inverse-soft: rgba(231, 238, 255, 0.78);
  --border-soft: rgba(91, 103, 133, 0.14);
  --border-strong: rgba(215, 222, 235, 0.92);
  --accent-cyan: #04e4ff;
  --accent-blue: #1b97ea;
  --accent-deep: #1b398f;
  --accent-violet: #6939b8;
  --gradient-accent: linear-gradient(90deg, #1b97ea 0%, #6939b8 100%);
  --gradient-hero: linear-gradient(122deg, #120d2d 0%, #183570 42%, #1ca3e3 100%);
  --gradient-dark: radial-gradient(circle at top left, rgba(62, 75, 172, 0.6) 0%, rgba(3, 24, 62, 0) 42%), linear-gradient(135deg, #010729 0%, #06143c 100%);
  --gradient-free: conic-gradient(from 180deg at 50% 50%, #5337a5, #3d469f, #0e4974, #5d30a7, #5337a5);
  --shadow-soft: 0 24px 64px rgba(9, 19, 43, 0.14);
  --shadow-heavy: 0 32px 90px rgba(7, 17, 45, 0.24);
  --container: 1440px;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-width: 320px;
  background: var(--page-bg);
  color: var(--text-primary);
}

img {
  display: block;
  max-width: 100%;
}

a {
  color: inherit;
  text-decoration: none;
}

button,
input,
select {
  font: inherit;
}

button {
  border: 0;
  background: transparent;
  cursor: pointer;
}

section[id] {
  scroll-margin-top: var(--page-header-offset);
}

.page-shell {
  position: relative;
  overflow: clip;
}

.container {
  width: min(calc(100% - 40px), var(--container));
  margin-inline: auto;
}

.section {
  position: relative;
  padding-block: clamp(32px, 5vw, 110px);
  isolation: isolate;
  overflow: clip;
}

.section--flush {
  padding-block: 40px 120px;
}

.section--dark {
  color: var(--text-inverse);
}

.hero::after,
.idea-section::after,
.offer-section::after,
.free-services-section::after,
.checklist-section::after,
.audit-section::after,
.important-section::after,
.useful-section::after,
.footer::after {
  content: '';
  position: absolute;
  inset: -18% -12%;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 18% 24%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 22%),
    radial-gradient(circle at 76% 18%, rgba(4, 228, 255, 0.2) 0%, rgba(4, 228, 255, 0) 24%),
    radial-gradient(circle at 48% 82%, rgba(168, 85, 247, 0.18) 0%, rgba(168, 85, 247, 0) 28%);
  opacity: 0.7;
  mix-blend-mode: screen;
  animation: ambient-drift 18s ease-in-out infinite alternate;
}

.section > .container,
.footer > .container {
  position: relative;
  z-index: 1;
}

.reveal {
  opacity: 0;
  transform: translate3d(0, 36px, 0);
  transition:
    opacity 0.9s cubic-bezier(0.2, 0.9, 0.25, 1),
    transform 0.9s cubic-bezier(0.2, 0.9, 0.25, 1);
  transition-delay: var(--reveal-delay, 0ms);
}

.reveal[data-reveal-origin='left'] {
  transform: translate3d(-42px, 0, 0);
}

.reveal[data-reveal-origin='right'] {
  transform: translate3d(42px, 0, 0);
}

.reveal.is-visible {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}

.menu-fade-enter-active,
.menu-fade-leave-active {
  transition:
    opacity 280ms ease,
    transform 280ms ease;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

.stack-enter-active,
.stack-appear-active {
  transition:
    opacity 720ms cubic-bezier(0.2, 0.9, 0.25, 1),
    transform 720ms cubic-bezier(0.2, 0.9, 0.25, 1),
    filter 720ms cubic-bezier(0.2, 0.9, 0.25, 1);
  transition-delay: var(--stack-delay, 0ms);
}

.stack-enter-from,
.stack-appear-from {
  opacity: 0;
  filter: blur(10px);
  transform: translate3d(0, 26px, 0) scale(0.975);
}

.stack-move {
  transition: transform 420ms ease;
}

.success-fade-enter-active,
.success-fade-appear-active,
.success-fade-leave-active {
  transition:
    opacity 260ms ease,
    transform 260ms ease;
}

.success-fade-enter-from,
.success-fade-appear-from,
.success-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.button {
  display: inline-flex;
  position: relative;
  align-items: center;
  justify-content: center;
  min-height: 56px;
  padding: 16px 26px;
  border-radius: 0;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.02em;
  overflow: hidden;
  isolation: isolate;
  transition:
    transform 220ms ease,
    box-shadow 220ms ease,
    background-color 320ms cubic-bezier(0.22, 1, 0.36, 1),
    color 220ms ease,
    border-color 220ms ease;
}

.button__label {
  position: relative;
  z-index: 1;
}

.button:hover {
  transform: translateY(-2px);
}

.button,
.service-card,
.form-card,
.audit-grid__item,
.important-section__card,
.important-section__summary-card,
.useful-card,
.review-card,
.footer__placeholder {
  transition:
    transform 320ms cubic-bezier(0.2, 0.9, 0.25, 1),
    box-shadow 320ms cubic-bezier(0.2, 0.9, 0.25, 1),
    border-color 320ms cubic-bezier(0.2, 0.9, 0.25, 1),
    background-color 320ms cubic-bezier(0.2, 0.9, 0.25, 1);
}

.grecaptcha-badge {
  visibility: hidden;
}

.service-card:hover,
.form-card:hover,
.audit-grid__item:hover,
.important-section__card:hover,
.important-section__summary-card:hover,
.useful-card:hover,
.review-card:hover,
.footer__placeholder:hover {
  transform: translateY(-6px);
}

.button--primary {
  color: #3556a5;
  background: #ffffff;
  border: 1px solid rgba(29, 148, 232, 0.85);
  box-shadow:
    0 0 0 1px rgba(88, 241, 255, 0.18),
    0 0 22px rgba(88, 241, 255, 0.24),
    0 0 46px rgba(77, 151, 255, 0.18),
    0 0 72px rgba(105, 57, 184, 0.14);
}

.button__wave,
.button__wave-gloss {
  position: absolute;
  left: -10%;
  right: -10%;
  height: 206%;
  pointer-events: none;
  z-index: 0;
  opacity: 0;
  transition:
    bottom 520ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 520ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 300ms ease;
}

.button__wave {
  bottom: -204%;
  background: linear-gradient(140deg, #1b97ea 0%, #4f6fd7 48%, #6939b8 100%);
  border-radius: 48% 52% 0 0 / 18% 20% 0 0;
  transform: rotate(-2.6deg) scale(1.02, 1);
}

.button__wave-gloss {
  left: -4%;
  right: -14%;
  bottom: -212%;
  height: 178%;
  background:
    radial-gradient(circle at 34% 22%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.16) 24%, rgba(255, 255, 255, 0) 58%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 42%);
  border-radius: 54% 46% 0 0 / 17% 19% 0 0;
  mix-blend-mode: screen;
  opacity: 0;
  transform: rotate(1.8deg) scale(1.01, 1);
}

.button--primary.is-wave-active {
  color: #ffffff;
  border-color: rgba(105, 57, 184, 0.4);
  box-shadow:
    0 18px 44px rgba(39, 111, 219, 0.32),
    0 0 34px rgba(88, 241, 255, 0.3),
    0 0 74px rgba(105, 57, 184, 0.24);
}

.button--primary.is-wave-leaving {
  color: #3556a5;
  border-color: rgba(105, 57, 184, 0.4);
  box-shadow:
    0 18px 44px rgba(39, 111, 219, 0.24),
    0 0 26px rgba(88, 241, 255, 0.2),
    0 0 52px rgba(105, 57, 184, 0.16);
}

.button--primary.is-wave-active .button__wave {
  opacity: 1;
  bottom: -52%;
  transform: rotate(0.8deg) scale(1.015, 1);
}

.button--primary.is-wave-active .button__wave-gloss {
  bottom: -46%;
  opacity: 1;
  transform: rotate(-1deg) scale(1.015, 1);
}

.button--primary.is-wave-leaving .button__wave {
  opacity: 1;
  bottom: 108%;
  transform: rotate(2.2deg) scale(0.99, 1);
}

.button--primary.is-wave-leaving .button__wave-gloss {
  bottom: 116%;
  opacity: 0.22;
  transform: rotate(3deg) scale(0.98, 1);
}

.button--primary.is-wave-above .button__wave,
.button--primary.is-wave-above .button__wave-gloss,
.button--primary.is-wave-instant .button__wave,
.button--primary.is-wave-instant .button__wave-gloss {
  transition: none;
}

.button--primary.is-wave-above .button__wave {
  opacity: 0;
  bottom: 108%;
  transform: rotate(2.2deg) scale(0.99, 1);
}

.button--primary.is-wave-above .button__wave-gloss {
  bottom: 116%;
  opacity: 0;
  transform: rotate(3deg) scale(0.98, 1);
}

.button--primary.is-wave-below .button__wave {
  opacity: 0;
  bottom: -204%;
  transform: rotate(-2.6deg) scale(1.02, 1);
}

.button--primary.is-wave-below .button__wave-gloss {
  bottom: -212%;
  opacity: 0;
  transform: rotate(1.8deg) scale(1.01, 1);
}

.button--light {
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 16px 40px rgba(9, 19, 43, 0.24);
}

.eyebrow {
  margin: 0;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.eyebrow--light {
  color: rgba(255, 255, 255, 0.68);
}

.pill-chip {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.88);
  font-size: 14px;
  font-weight: 700;
}

.section-title {
  display: grid;
  gap: 18px;
}

.section-title--centered {
  text-align: center;
  justify-items: center;
}

.section-title__eyebrow {
  margin: 0;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent-blue);
}

.section-title--inverted .section-title__eyebrow {
  color: rgba(255, 255, 255, 0.7);
}

.section-title__heading {
  margin: 0;
  font-size: clamp(36px, 5vw, 64px);
  line-height: 1.05;
  font-weight: 800;
  color: var(--accent-deep);
}

.section-title--centered .section-title__heading {
  max-width: none;
}

.section-title__text {
  margin: 0;
  max-width: 780px;
  font-size: clamp(17px, 2vw, 24px);
  line-height: 1.5;
  color: var(--text-secondary);
}

.section-title--inverted .section-title__heading {
  color: white;
}

.section-title--inverted .section-title__text {
  color: var(--text-inverse-soft);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.brand__mark {
  position: relative;
  flex: 0 0 60px;
  width: 60px;
  height: 60px;
}

.brand__logo {
  width: 60px;
  height: 60px;
}

.brand__logo--base,
.brand__logo--spark,
.brand__logo--mini {
  position: absolute;
  inset: 0;
}

.brand__logo--base {
  object-fit: contain;
  filter: drop-shadow(0 8px 16px rgba(4, 228, 255, 0.14));
}

.brand__logo--spark {
  top: 6px;
  left: 5px;
  width: 50.5px;
  height: 49px;
}

.brand__logo--mini {
  top: 36px;
  left: 7px;
  width: 18px;
  height: 11px;
}

.brand__title {
  max-width: 440px;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
  color: white;
}

.form-card {
  display: grid;
  gap: 24px;
  padding: 32px;
  border-radius: 0;
  background: #ffffff;
  border: 1px solid var(--border-soft);
  box-shadow: var(--shadow-soft);
}

.form-card--checklist {
  background: rgba(255, 255, 255, 0.98);
  border-color: rgba(201, 211, 230, 0.55);
  border-radius: 0;
}

.form-card__chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  min-height: 34px;
  padding: 8px 14px;
  border-radius: 999px;
  background: var(--page-bg);
  color: rgba(15, 23, 48, 0.9);
  font-size: 14px;
  font-weight: 700;
}

.form-card__heading {
  display: grid;
  gap: 16px;
}

.form-card__heading-top {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.form-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  max-width: 48px;
  width: 100%;
  height: 48px;
  border-radius: 16px;
  background: var(--gradient-accent);
  box-shadow: 0 12px 30px rgba(59, 123, 206, 0.22);
}

.form-card__icon img {
  width: 24px;
  height: 24px;
}

.form-card__title {
  margin: 0;
  color: var(--accent-deep);
  font-size: clamp(24px, 3vw, 30px);
  line-height: 1.2;
  font-weight: 700;
}

.form-card__description {
  margin: 0;
  color: var(--accent-deep);
  font-size: 18px;
  line-height: 1.55;
}

.form-card__fields {
  display: grid;
  gap: 16px;
}

.form-field {
  display: grid;
  gap: 8px;
}

.form-field__label {
  color: var(--accent-deep);
  font-size: 16px;
  font-weight: 700;
}

.form-field__control {
  width: 100%;
  min-height: 56px;
  padding: 16px 18px;
  border-radius: 16px;
  border: 1px solid var(--border-strong);
  background: var(--page-bg);
  color: var(--text-primary);
  font-size: 16px;
  transition: border-color 180ms ease, box-shadow 180ms ease;
}

.form-field__control::placeholder {
  color: rgba(91, 103, 133, 0.9);
}

.form-field__control:focus {
  outline: none;
  border-color: rgba(91, 62, 186, 0.45);
  box-shadow: 0 0 0 4px rgba(91, 62, 186, 0.12);
}

.form-field__control--select {
  appearance: none;
  background-image: linear-gradient(45deg, transparent 50%, #5b6785 50%), linear-gradient(135deg, #5b6785 50%, transparent 50%);
  background-position: calc(100% - 22px) calc(50% - 2px), calc(100% - 16px) calc(50% - 2px);
  background-size: 6px 6px, 6px 6px;
  background-repeat: no-repeat;
}

.form-field__control--textarea {
  min-height: 132px;
  resize: vertical;
}

.form-field__control--invalid {
  border-color: rgba(198, 44, 66, 0.48);
  box-shadow: 0 0 0 4px rgba(198, 44, 66, 0.08);
}

.form-field__error {
  color: #c62c42;
  font-size: 13px;
  font-weight: 700;
}

.form-card__submit {
  justify-self: start;
  min-width: 199px;
}

.form-card__success {
  color: #0d8d68;
  font-size: 14px;
  font-weight: 700;
}

.form-card__note {
  display: flex;
  gap: 8px;
  align-items: center;
  color: rgba(91, 103, 133, 0.9);
  font-size: 13px;
  line-height: 1.4;
}

.form-card__note img {
  width: 16px;
  height: 16px;
}

@keyframes float-orb {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(18px, -12px, 0) scale(1.08);
  }
}

@keyframes ambient-drift {
  0% {
    transform: translate3d(-2%, -2%, 0) scale(1);
  }
  50% {
    transform: translate3d(2%, 1%, 0) scale(1.05);
  }
  100% {
    transform: translate3d(-1%, 3%, 0) scale(0.98);
  }
}

@keyframes gradient-flow {
  0% {
    background-position: 0% 30%;
  }
  50% {
    background-position: 100% 70%;
  }
  100% {
    background-position: 20% 40%;
  }
}

@keyframes floating-card {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes mesh-drift {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(18px, -14px, 0) scale(1.08);
  }
}

@keyframes title-glow {
  0%,
  100% {
    filter: drop-shadow(0 0 10px rgba(90, 252, 255, 0.34));
  }
  50% {
    filter: drop-shadow(0 0 18px rgba(90, 252, 255, 0.64));
  }
}

@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

@media (max-width: 900px) {
  #app {
    margin-top: 100px;
  }
}

@media (min-width: 900px) {
  .hero__layout {
    grid-template-columns: minmax(0, 622px) minmax(0, 742px);
    justify-content: space-between;
  }

  .idea-section__grid {
    grid-template-columns: minmax(0, 644px) minmax(0, 593px);
    justify-content: space-between;
  }

  .important-section__layout {
    grid-template-columns: minmax(0, 700px) minmax(0, 700px);
    justify-content: space-between;
  }

  .footer__top {
    grid-template-columns: minmax(0, 1fr) minmax(0, 0.95fr);
  }

  .offer-section__layout {
    grid-template-columns: minmax(0, 586px) minmax(0, 806px);
    justify-content: space-between;
  }

  .offer-section__summary {
    position: sticky;
    top: 112px;
  }

  .offer-section__cards {
    position: static;
    justify-self: end;
  }

  .free-services-section__grid {
    grid-template-columns: minmax(0, 731px) minmax(0, 685px);
    justify-content: space-between;
    align-items: start;
  }

  .checklist-section__card {
    grid-template-columns: minmax(0, 712px) minmax(0, 516px);
    justify-content: space-between;
  }

  .footer__groups {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .audit-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 48px;
    row-gap: 24px;
  }

  .useful-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .useful-grid > .useful-card:nth-child(-n + 3) {
    align-items: flex-start;
  }
}

@media (min-width: 1180px) {
  .footer__top {
    grid-template-columns: minmax(0, 0.72fr) minmax(0, 1fr);
  }

  .footer__groups {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1440px) {
  .container {
    width: var(--container);
  }
}

@media (max-width: 899px) {
  :root {
    --page-header-offset: 156px;
  }

  .offer-section__cards {
    position: static;
  }

  .service-card {
    width: 100%;
    max-width: none;
  }

  .checklist-section .form-card--checklist {
    max-width: none;
    justify-self: stretch;
  }
}

@media (max-width: 900px) {
  .section {
    padding-block: clamp(24px, 4vw, 36px);
  }

  .idea-section.section,
  .offer-section.section {
    padding-block: clamp(24px, 4vw, 36px);
  }

  .section--flush {
    padding-block: 18px 36px;
  }

  .section-title {
    text-align: center;
    justify-items: center;
  }

  .hero__title,
  .hero__description,
  .idea-section__title,
  .idea-section__note,
  .offer-summary,
  .checklist-section__copy h2,
  .checklist-section__lead,
  .checklist-section__privacy,
  .important-section__summary-card h3,
  .important-section__summary-card p {
    text-align: center;
  }

  .hero__description,
  .idea-section__note,
  .offer-summary__title,
  .offer-summary__body,
  .section-title__text,
  .checklist-section__lead,
  .checklist-section__privacy {
    margin-inline: auto;
  }

  .checklist-section__copy > .pill-chip {
    align-self: center;
  }
}

@media (max-width: 639px) {
  :root {
    --page-header-offset: 216px;
  }

  .container {
    width: min(calc(100% - 24px), var(--container));
  }

  .section {
    padding-block: 20px;
  }

  .idea-section.section,
  .offer-section.section {
    padding-block: 20px;
  }

  .section--flush {
    padding-block: 16px 28px;
  }

  .brand__title {
    font-size: 15px;
  }

  .brand__mark,
  .brand__logo {
    width: 48px;
    height: 48px;
  }

  .brand__mark {
    flex-basis: 48px;
  }

  .brand__logo--spark {
    top: 5px;
    left: 4px;
    width: 40px;
    height: 39px;
  }

  .brand__logo--mini {
    top: 29px;
    left: 5px;
    width: 14px;
    height: 9px;
  }

  .button,
  .form-field__control {
    width: 100%;
  }

  .idea-section__title {
    font-size: 38px;
  }

  .hero__description,
  .service-card p,
  .review-card__text {
    font-size: 16px;
  }

  .service-card,
  .form-card,
  .important-section__summary-card,
  .important-section__card,
  .useful-card,
  .review-card {
    padding: 22px;
  }

  .offer-summary__body p,
  .idea-section__item p,
  .audit-grid__item p,
  .important-section__card p {
    font-size: 16px;
  }

  .offer-summary__body p + p {
    margin-top: 20px;
  }

  .review-card,
  .review-card--wide {
    width: 86vw;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
</style>
