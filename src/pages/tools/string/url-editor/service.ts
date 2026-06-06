import { ParsedUrl, QueryParam } from './types';

export function parseUrl(input: string): ParsedUrl {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error('Invalid URL');
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error('Invalid URL');
  }

  const params: QueryParam[] = Array.from(url.searchParams.entries()).map(
    ([key, value]) => ({ key, value })
  );

  return {
    protocol: url.protocol,
    host: url.host,
    pathname: url.pathname,
    hash: url.hash,
    params
  };
}

export function generateUrl(parsed: ParsedUrl): string {
  const protocol = parsed.protocol || 'https:';
  const host = parsed.host.trim();
  if (!host) {
    throw new Error('Invalid URL');
  }

  let pathname = parsed.pathname || '/';
  if (!pathname.startsWith('/')) {
    pathname = `/${pathname}`;
  }

  const url = new URL(`${protocol}//${host}${pathname}`);

  let hash = parsed.hash.trim();
  if (hash && !hash.startsWith('#')) {
    hash = `#${hash}`;
  }
  url.hash = hash;

  parsed.params.forEach(({ key, value }) => {
    if (key) {
      url.searchParams.append(key, value);
    }
  });

  return url.toString();
}
