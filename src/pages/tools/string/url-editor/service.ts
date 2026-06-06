import { ParsedUrl, QueryParam } from './types';

export const URL_PARSE_ERRORS = {
  INVALID: 'Invalid URL',
  CREDENTIALS: 'URLs with credentials are not supported'
} as const;

let fallbackParamIdCounter = 0;

function createParamId(): string {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  fallbackParamIdCounter += 1;
  return `param-${fallbackParamIdCounter}-${Date.now()}`;
}

export function createQueryParam(key = '', value = ''): QueryParam {
  return { id: createParamId(), key, value };
}

function detectOriginTrailingSlash(input: string, url: URL): boolean {
  if (url.pathname !== '/') {
    return false;
  }

  const beforeQueryOrHash = input.split(/[?#]/)[0];
  const schemeEnd = beforeQueryOrHash.indexOf('://');
  if (schemeEnd === -1) {
    return false;
  }

  const firstSlashAfterScheme = beforeQueryOrHash.indexOf('/', schemeEnd + 3);
  if (firstSlashAfterScheme === -1) {
    return false;
  }

  return firstSlashAfterScheme === beforeQueryOrHash.length - 1;
}

export function parseUrl(input: string): ParsedUrl {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error(URL_PARSE_ERRORS.INVALID);
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error(URL_PARSE_ERRORS.INVALID);
  }

  if (url.username || url.password) {
    throw new Error(URL_PARSE_ERRORS.CREDENTIALS);
  }

  const params: QueryParam[] = Array.from(url.searchParams.entries()).map(
    ([key, value]) => createQueryParam(key, value)
  );

  return {
    protocol: url.protocol,
    host: url.host,
    pathname: url.pathname,
    hash: url.hash,
    originTrailingSlash: detectOriginTrailingSlash(trimmed, url),
    params
  };
}

export function generateUrl(parsed: ParsedUrl): string {
  const rawProtocol = parsed.protocol || 'https';
  const protocol = rawProtocol.endsWith(':') ? rawProtocol : `${rawProtocol}:`;
  const host = parsed.host.trim();
  if (!host) {
    throw new Error(URL_PARSE_ERRORS.INVALID);
  }
  if (host.includes('@')) {
    throw new Error(URL_PARSE_ERRORS.CREDENTIALS);
  }

  let pathname = parsed.pathname || '/';
  if (!pathname.startsWith('/')) {
    pathname = `/${pathname}`;
  }

  let base: string;
  if (pathname === '/' && !parsed.originTrailingSlash) {
    base = `${protocol}//${host}`;
  } else if (pathname === '/') {
    base = `${protocol}//${host}/`;
  } else {
    base = `${protocol}//${host}${pathname}`;
  }

  const searchParams = new URLSearchParams();
  parsed.params.forEach(({ key, value }) => {
    const trimmedKey = key.trim();
    if (trimmedKey) {
      searchParams.append(trimmedKey, value);
    }
  });

  const search = searchParams.toString();
  const query = search ? `?${search}` : '';

  let hash = parsed.hash.trim();
  if (hash && !hash.startsWith('#')) {
    hash = `#${hash}`;
  }

  return `${base}${query}${hash}`;
}
