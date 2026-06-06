import { describe, expect, it } from 'vitest';
import { generateUrl, parseUrl } from './service';

describe('url-editor', () => {
  it('parses a valid URL with query parameters', () => {
    expect(parseUrl('https://example.com/search?q=iphone&page=2')).toEqual({
      protocol: 'https:',
      host: 'example.com',
      pathname: '/search',
      hash: '',
      params: [
        { key: 'q', value: 'iphone' },
        { key: 'page', value: '2' }
      ]
    });
  });

  it('parses multiple query parameters', () => {
    expect(parseUrl('https://example.com?a=1&b=2&c=3').params).toEqual([
      { key: 'a', value: '1' },
      { key: 'b', value: '2' },
      { key: 'c', value: '3' }
    ]);
  });

  it('parses URLs without query parameters', () => {
    expect(parseUrl('https://example.com')).toEqual({
      protocol: 'https:',
      host: 'example.com',
      pathname: '/',
      hash: '',
      params: []
    });
  });

  it('parses URLs with a hash', () => {
    expect(parseUrl('https://example.com/page#section1')).toEqual({
      protocol: 'https:',
      host: 'example.com',
      pathname: '/page',
      hash: '#section1',
      params: []
    });
  });

  it('throws for invalid URLs', () => {
    expect(() => parseUrl('abc123')).toThrow('Invalid URL');
    expect(() => parseUrl('')).toThrow('Invalid URL');
  });

  it('generates an updated URL from parsed components', () => {
    const parsed = parseUrl('https://example.com/search?q=iphone&page=2');
    parsed.params = [
      { key: 'q', value: 'samsung' },
      { key: 'page', value: '5' }
    ];

    expect(generateUrl(parsed)).toBe(
      'https://example.com/search?q=samsung&page=5'
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

  it('throws when host is empty', () => {
    const parsed = parseUrl('https://example.com');
    parsed.host = '   ';

    expect(() => generateUrl(parsed)).toThrow('Invalid URL');
  });
});
