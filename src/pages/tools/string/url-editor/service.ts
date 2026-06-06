import { ParsedUrl, QueryParam } from './types';

export const URL_PARSE_ERRORS = {
  INVALID: 'Invalid URL',
  CREDENTIALS: 'URLs with credentials are not supported'
} as const;

export function createQueryParam(key = '', value = ''): QueryParam {
  return { id: crypto.randomUUID(), key, value };
}

function detectOriginTrailingSlash(input: string, url: URL): boolean {
  if (url.pathname !== '/') {
    return false;
  }

  const beforeQueryOrHash = input.split(/[?#]/)[0];
  const origin = `${url.protocol}//${url.host}`;

  return beforeQueryOrHash.slice(origin.length) === '/';
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
  const protocol = parsed.protocol || 'https:';
  const host = parsed.host.trim();
  if (!host) {
    throw new Error(URL_PARSE_ERRORS.INVALID);
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
