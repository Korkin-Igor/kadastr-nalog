import { inject, reactive, readonly, watch } from 'vue';
import {
  ApiError,
  changeAdminPassword as changeAdminPasswordRequest,
  fetchAdminSession,
  fetchLandingContent,
  isApiUnavailableError,
  loginAdmin as loginAdminRequest,
  logoutAdmin as logoutAdminRequest,
  saveLandingContent
} from '@/app/api/siteApi';
import { createDefaultLandingData } from '@/data/data';

const SAVE_DEBOUNCE_MS = 450;

export const LANDING_CONTENT_STORE_KEY = 'landing-content-store';
export const LANDING_CONTENT_LOCKED_PATHS = [
  'freeServiceForms[].fields',
  'checklistContent.fields'
];

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function normalizePath(path) {
  return path.replace(/\[\d+\]/g, '[]');
}

function isLockedContentPath(path) {
  if (!path) {
    return false;
  }

  const normalizedPath = normalizePath(path);

  return LANDING_CONTENT_LOCKED_PATHS.some(
    (lockedPath) =>
      normalizedPath === lockedPath ||
      normalizedPath.startsWith(`${lockedPath}.`) ||
      normalizedPath.startsWith(`${lockedPath}[`)
  );
}

function mergeWithDefaults(defaults, draft, path = '') {
  if (isLockedContentPath(path)) {
    return cloneValue(defaults);
  }

  if (Array.isArray(defaults)) {
    if (!Array.isArray(draft)) {
      return cloneValue(defaults);
    }

    const fallbackDefaultItem = defaults.length > 0 ? defaults[defaults.length - 1] : undefined;

    return draft.map((item, index) => {
      const defaultItem = defaults[index] ?? fallbackDefaultItem;
      const nextPath = `${path}[${index}]`;

      return defaultItem === undefined
        ? cloneValue(item)
        : mergeWithDefaults(defaultItem, item, nextPath);
    });
  }

  if (isPlainObject(defaults)) {
    const result = {};
    const draftObject = isPlainObject(draft) ? draft : {};
    const keys = new Set([...Object.keys(defaults), ...Object.keys(draftObject)]);

    keys.forEach((key) => {
      const defaultValue = defaults[key];
      const draftValue = draftObject[key];

      if (defaultValue === undefined) {
        result[key] = cloneValue(draftValue);
        return;
      }

      const nextPath = path ? `${path}.${key}` : key;
      result[key] = mergeWithDefaults(defaultValue, draftValue, nextPath);
    });

    return result;
  }

  if (draft === undefined) {
    return cloneValue(defaults);
  }

  return cloneValue(draft);
}

function replaceReactiveObject(target, nextValue) {
  Object.keys(target).forEach((key) => {
    delete target[key];
  });

  Object.assign(target, nextValue);
}

function normalizeLandingDraft(value) {
  if (!isPlainObject(value)) {
    return value;
  }

  const nextValue = cloneValue(value);

  if (isPlainObject(nextValue.heroContent)) {
    delete nextValue.heroContent.title;
    delete nextValue.heroContent.videoImage;
  }

  return nextValue;
}

function getErrorMessage(error, fallback) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

const landingData = reactive(createDefaultLandingData());
const status = reactive({
  errorMessage: '',
  authErrorMessage: '',
  isReady: false,
  isSaving: false,
  lastSavedAt: null,
  isCheckingSession: false,
  hasCheckedSession: false,
  isAuthenticating: false,
  isAuthenticated: false,
  isChangingPassword: false,
  authUser: ''
});

let isHydrating = true;
let saveTimer = 0;
let adminSessionPromise = null;

function replaceLandingData(nextValue) {
  const normalizedValue = normalizeLandingDraft(nextValue);
  const merged = mergeWithDefaults(createDefaultLandingData(), normalizedValue);
  replaceReactiveObject(landingData, merged);
}

async function loadLandingData() {
  status.errorMessage = '';

  try {
    const serverContent = await fetchLandingContent();

    if (serverContent) {
      replaceLandingData(serverContent);
    }
  } catch (error) {
    if (!isApiUnavailableError(error)) {
      status.errorMessage = getErrorMessage(error, 'Не удалось загрузить контент сайта.');
    }
  } finally {
    isHydrating = false;
    status.isReady = true;
  }
}

async function persistNow() {
  if (isHydrating || !status.isAuthenticated) {
    return;
  }

  status.isSaving = true;
  status.errorMessage = '';

  try {
    const result = await saveLandingContent(cloneValue(landingData));
    status.lastSavedAt = result.updatedAt || new Date().toISOString();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      status.isAuthenticated = false;
      status.authUser = '';
      status.authErrorMessage = 'Сессия администратора истекла. Войдите снова.';
    }

    status.errorMessage = getErrorMessage(error, 'Не удалось сохранить изменения.');
  } finally {
    status.isSaving = false;
  }
}

function schedulePersist() {
  if (isHydrating || !status.isAuthenticated) {
    return;
  }

  globalThis.clearTimeout(saveTimer);
  saveTimer = globalThis.setTimeout(() => {
    void persistNow();
  }, SAVE_DEBOUNCE_MS);
}

function resetLandingData() {
  replaceLandingData(createDefaultLandingData());
}

async function ensureAdminSessionChecked(force = false) {
  if (!force && status.hasCheckedSession) {
    return;
  }

  if (adminSessionPromise) {
    return adminSessionPromise;
  }

  status.isCheckingSession = true;
  status.authErrorMessage = '';

  adminSessionPromise = (async () => {
    try {
      const result = await fetchAdminSession();
      status.isAuthenticated = Boolean(result.authenticated);
      status.authUser = result.username || '';
    } catch (error) {
      status.isAuthenticated = false;
      status.authUser = '';

      if (!isApiUnavailableError(error)) {
        status.authErrorMessage = getErrorMessage(error, 'Не удалось проверить сессию администратора.');
      }
    } finally {
      status.isCheckingSession = false;
      status.hasCheckedSession = true;
      adminSessionPromise = null;
    }
  })();

  return adminSessionPromise;
}

async function loginAdmin(credentials) {
  status.isAuthenticating = true;
  status.authErrorMessage = '';

  try {
    const result = await loginAdminRequest(credentials);
    status.isAuthenticated = true;
    status.authUser = result.username || credentials.username || '';
    status.hasCheckedSession = true;
    return result;
  } catch (error) {
    status.isAuthenticated = false;
    status.authUser = '';
    status.authErrorMessage = getErrorMessage(error, 'Не удалось выполнить вход.');
    throw error;
  } finally {
    status.isAuthenticating = false;
  }
}

async function logoutAdmin() {
  status.authErrorMessage = '';

  try {
    await logoutAdminRequest();
  } catch (error) {
    if (!isApiUnavailableError(error)) {
      status.authErrorMessage = getErrorMessage(error, 'Не удалось завершить сеанс.');
    }
  } finally {
    status.isAuthenticated = false;
    status.authUser = '';
    globalThis.clearTimeout(saveTimer);
  }
}

async function changeAdminPassword(passwords) {
  status.isChangingPassword = true;

  try {
    return await changeAdminPasswordRequest(passwords);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      status.isAuthenticated = false;
      status.authUser = '';
      status.authErrorMessage = 'Сессия администратора истекла. Войдите снова.';
    }

    throw error;
  } finally {
    status.isChangingPassword = false;
  }
}

watch(
  landingData,
  () => {
    schedulePersist();
  },
  { deep: true }
);

const hydrationPromise = loadLandingData();

export const landingContentStore = {
  landingData,
  replaceLandingData,
  resetLandingData,
  persistNow,
  ensureAdminSessionChecked,
  loginAdmin,
  logoutAdmin,
  changeAdminPassword,
  status: readonly(status)
};

export async function waitForLandingContentReady() {
  await hydrationPromise;
}

export function useLandingContent() {
  return inject(LANDING_CONTENT_STORE_KEY, landingContentStore);
}
