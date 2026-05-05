const activeScrollLocks = new Set();

function getLockTargets() {
  if (typeof document === 'undefined') {
    return [];
  }

  return [document.documentElement, document.body];
}

export function setPageScrollLock(lockId, shouldLock) {
  if (typeof document === 'undefined') {
    return;
  }

  if (shouldLock) {
    activeScrollLocks.add(lockId);
  } else {
    activeScrollLocks.delete(lockId);
  }

  const overflowValue = activeScrollLocks.size > 0 ? 'hidden' : '';

  getLockTargets().forEach((target) => {
    target.style.overflow = overflowValue;
  });
}
