class ApiError extends Error {
  constructor(message, status = 0, code = '') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

const basePath = import.meta.env.BASE_URL || '/';
const normalizedBasePath =
  basePath.length > 1 && basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;

function buildApiUrl(endpoint) {
  const prefix = normalizedBasePath === '/' ? '' : normalizedBasePath;
  return `${prefix}/api/${endpoint}`;
}

async function parseJsonResponse(response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new ApiError('Сервер вернул некорректный JSON.', response.status, 'invalid_json');
  }
}

async function requestJson(endpoint, options = {}) {
  const response = await fetch(buildApiUrl(endpoint), {
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json;charset=utf-8' } : {})
    },
    ...options
  });

  const payload = await parseJsonResponse(response);

  if (!response.ok) {
    throw new ApiError(
      payload.error || `Ошибка запроса (${response.status}).`,
      response.status,
      payload.code || ''
    );
  }

  return payload;
}

export function isApiUnavailableError(error) {
  return (
    error instanceof ApiError &&
    (error.status === 404 || error.status === 405 || error.code === 'invalid_json')
  );
}

export async function fetchLandingContent() {
  const payload = await requestJson('content.php');
  return payload.content ?? null;
}

export async function saveLandingContent(content) {
  return requestJson('content.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'save', content })
  });
}

export async function fetchAdminSession() {
  return requestJson('auth.php');
}

export async function loginAdmin(credentials) {
  return requestJson('auth.php', {
    method: 'POST',
    body: JSON.stringify({
      action: 'login',
      ...credentials
    })
  });
}

export async function logoutAdmin() {
  return requestJson('auth.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'logout' })
  });
}

export async function changeAdminPassword(passwords) {
  return requestJson('auth.php', {
    method: 'POST',
    body: JSON.stringify({
      action: 'change_password',
      ...passwords
    })
  });
}

export { ApiError };
