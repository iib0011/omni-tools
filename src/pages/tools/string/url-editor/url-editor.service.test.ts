import { describe, expect, it } from 'vitest';
import { generateUrl, parseUrl, URL_PARSE_ERRORS } from './service';

function paramEntries(parsed: ReturnType<typeof parseUrl>) {
  return parsed.params.map(({ key, value }) => ({ key, value }));
}

describe('url-editor', () => {
  it('parses a valid URL with query parameters', () => {
    const parsed = parseUrl('https://example.com/search?q=iphone&page=2');

    expect(parsed.protocol).toBe('https:');
    expect(parsed.host).toBe('example.com');
    expect(parsed.pathname).toBe('/search');
    expect(parsed.hash).toBe('');
    expect(parsed.originTrailingSlash).toBe(false);
    expect(paramEntries(parsed)).toEqual([
      { key: 'q', value: 'iphone' },
      { key: 'page', value: '2' }
    ]);
  });

  it('parses multiple query parameters', () => {
    expect(paramEntries(parseUrl('https://example.com?a=1&b=2&c=3'))).toEqual([
      { key: 'a', value: '1' },
      { key: 'b', value: '2' },
      { key: 'c', value: '3' }
    ]);
  });

  it('parses URLs without query parameters', () => {
    const parsed = parseUrl('https://example.com');

    expect(parsed.pathname).toBe('/');
    expect(parsed.originTrailingSlash).toBe(false);
    expect(parsed.params).toEqual([]);
  });

  it('tracks trailing slash on origin-only URLs', () => {
    expect(parseUrl('https://example.com/').originTrailingSlash).toBe(true);
    expect(parseUrl('https://example.com').originTrailingSlash).toBe(false);
  });

  it('parses URLs with a hash', () => {
    const parsed = parseUrl('https://example.com/page#section1');

    expect(parsed.pathname).toBe('/page');
    expect(parsed.hash).toBe('#section1');
    expect(parsed.originTrailingSlash).toBe(false);
  });

  it('throws for invalid URLs', () => {
    expect(() => parseUrl('abc123')).toThrow(URL_PARSE_ERRORS.INVALID);
    expect(() => parseUrl('')).toThrow(URL_PARSE_ERRORS.INVALID);
  });

  it('rejects URLs with credentials', () => {
    expect(() => parseUrl('https://user:pass@example.com/')).toThrow(
      URL_PARSE_ERRORS.CREDENTIALS
    );
  });

  it('generates an updated URL from parsed components', () => {
    const parsed = parseUrl('https://example.com/search?q=iphone&page=2');
    parsed.params = parsed.params.map((param, index) =>
      index === 0 ? { ...param, value: 'samsung' } : { ...param, value: '5' }
    );

    expect(generateUrl(parsed)).toBe(
      'https://example.com/search?q=samsung&page=5'
    );
  });

  it('preserves origin-only URLs without a trailing slash', () => {
    expect(generateUrl(parseUrl('https://example.com'))).toBe(
      'https://example.com'
    );
  });

  it('preserves origin-only URLs with a trailing slash', () => {
    expect(generateUrl(parseUrl('https://example.com/'))).toBe(
      'https://example.com/'
    );
  });

  it('preserves hash on origin-only URLs without inserting a slash', () => {
    expect(generateUrl(parseUrl('https://example.com#top'))).toBe(
      'https://example.com#top'
    );
  });

  it('round-trips URL components', () => {
    const input = 'https://example.com/search?q=test&sort=desc#top';
    expect(generateUrl(parseUrl(input))).toBe(input);
  });

  it('generates URL with edited host and path', () => {
    const parsed = parseUrl('https://example.com/search?q=test');
    parsed.host = 'github.com';
    parsed.pathname = '/topics/open-source';

    expect(generateUrl(parsed)).toBe(
      'https://github.com/topics/open-source?q=test'
    );
  });

  it('normalizes path without a leading slash', () => {
    const parsed = parseUrl('https://example.com/search');
    parsed.pathname = 'topics/open-source';

    expect(generateUrl(parsed)).toBe('https://example.com/topics/open-source');
  });

  it('normalizes hash without a leading hash symbol', () => {
    const parsed = parseUrl('https://example.com/page');
    parsed.hash = 'section1';

    expect(generateUrl(parsed)).toBe('https://example.com/page#section1');
  });

  it('ignores whitespace-only query keys', () => {
    const parsed = parseUrl('https://example.com?q=test');
    parsed.params.push({
      id: 'temp-id',
      key: '   ',
      value: 'ignored'
    });

    expect(generateUrl(parsed)).toBe('https://example.com?q=test');
  });

  it('throws when host is empty', () => {
    const parsed = parseUrl('https://example.com');
    parsed.host = '   ';

    expect(() => generateUrl(parsed)).toThrow(URL_PARSE_ERRORS.INVALID);
  });
});
