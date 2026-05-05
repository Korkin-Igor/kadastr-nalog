export const revealDirective = {
  mounted(el, binding) {
    const value = binding.value;
    const delay =
      typeof value === 'number'
        ? value
        : typeof value === 'object' && value !== null && typeof value.delay === 'number'
          ? value.delay
          : 0;
    const origin =
      typeof value === 'object' && value !== null && value.origin
        ? value.origin
        : 'bottom';

    el.classList.add('reveal');
    el.style.setProperty('--reveal-delay', `${delay}ms`);
    el.dataset.revealOrigin = origin;

    const isInInitialViewport = () => {
      const rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight * 0.95 && rect.bottom > 0;
    };

    if (isInInitialViewport()) {
      requestAnimationFrame(() => {
        el.classList.add('is-visible');
      });
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -6% 0px'
      }
    );

    observer.observe(el);
    el.__revealObserver = observer;
  },
  unmounted(el) {
    el.__revealObserver?.disconnect();
  }
};
