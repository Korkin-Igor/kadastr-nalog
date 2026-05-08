const basePath = import.meta.env.BASE_URL || '/';

const normalizedBasePath =
  basePath.length > 1 && basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;

export function buildPublicUrl(path = '') {
  const normalizedPath = String(path).replace(/^\/+/, '');
  const prefix = normalizedBasePath === '/' ? '/' : `${normalizedBasePath}/`;

  return normalizedPath ? `${prefix}${normalizedPath}` : prefix;
}
