const EXIT_DURATION_MS = 520;

function cancelAnimationFrameSafe(frameId) {
  if (frameId) {
    cancelAnimationFrame(frameId);
  }
}

function clearWaveTimers(el) {
  if (el.__buttonWaveLeaveTimer) {
    clearTimeout(el.__buttonWaveLeaveTimer);
    el.__buttonWaveLeaveTimer = null;
  }

  cancelAnimationFrameSafe(el.__buttonWaveFrameOne);
  cancelAnimationFrameSafe(el.__buttonWaveFrameTwo);
  el.__buttonWaveFrameOne = null;
  el.__buttonWaveFrameTwo = null;
}

function queueActivation(el) {
  el.__buttonWaveFrameOne = requestAnimationFrame(() => {
    el.__buttonWaveFrameTwo = requestAnimationFrame(() => {
      el.classList.remove('is-wave-below', 'is-wave-instant', 'is-wave-above', 'is-wave-leaving');
      el.classList.add('is-wave-active');
    });
  });
}

export const buttonWaveDirective = {
  mounted(el) {
    el.classList.add('is-wave-below');

    const activate = () => {
      clearWaveTimers(el);

      if (el.classList.contains('is-wave-above')) {
        el.classList.add('is-wave-instant');
        el.classList.remove('is-wave-above', 'is-wave-active', 'is-wave-leaving');
        el.classList.add('is-wave-below');
        void el.offsetWidth;
        queueActivation(el);
        return;
      }

      if (el.classList.contains('is-wave-leaving')) {
        el.classList.remove('is-wave-leaving');
      }

      queueActivation(el);
    };

    const deactivate = () => {
      clearWaveTimers(el);

      if (!el.classList.contains('is-wave-active') && !el.classList.contains('is-wave-leaving')) {
        return;
      }

      el.classList.remove('is-wave-active', 'is-wave-below', 'is-wave-instant', 'is-wave-above');
      el.classList.add('is-wave-leaving');

      el.__buttonWaveLeaveTimer = window.setTimeout(() => {
        el.classList.remove('is-wave-leaving');
        el.classList.add('is-wave-above');
        el.__buttonWaveLeaveTimer = null;
      }, EXIT_DURATION_MS);
    };

    const handleFocusOut = (event) => {
      if (!el.contains(event.relatedTarget)) {
        deactivate();
      }
    };

    el.__buttonWaveHandlers = {
      activate,
      deactivate,
      handleFocusOut
    };

    el.addEventListener('pointerenter', activate);
    el.addEventListener('pointerleave', deactivate);
    el.addEventListener('focusin', activate);
    el.addEventListener('focusout', handleFocusOut);
  },
  unmounted(el) {
    clearWaveTimers(el);

    const handlers = el.__buttonWaveHandlers;
    if (!handlers) {
      return;
    }

    el.removeEventListener('pointerenter', handlers.activate);
    el.removeEventListener('pointerleave', handlers.deactivate);
    el.removeEventListener('focusin', handlers.activate);
    el.removeEventListener('focusout', handlers.handleFocusOut);
    delete el.__buttonWaveHandlers;
  }
};
