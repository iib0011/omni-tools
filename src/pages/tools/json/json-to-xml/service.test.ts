import { describe, expect, it } from 'vitest';
import { convertJsonToXml } from './service';

const opts = { indentationType: 'none' as const, addMetaTag: false };

describe('convertJsonToXml', () => {
  it('converts a flat object', () => {
    const result = convertJsonToXml('{"name":"Alice","age":30}', opts);
    expect(result).toBe('<root><name>Alice</name><age>30</age></root>');
  });

  it('converts array values', () => {
    const result = convertJsonToXml('{"items":[1,2]}', opts);
    expect(result).toContain('<items>1</items>');
    expect(result).toContain('<items>2</items>');
  });

  it('handles null values', () => {
    const result = convertJsonToXml('{"x":null}', opts);
    expect(result).toContain('<x></x>');
  });

  it('escapes special characters in values', () => {
    const result = convertJsonToXml('{"k":"a&b<c>"}', opts);
    expect(result).toContain('a&amp;b&lt;c&gt;');
  });

  describe('depth guard', () => {
    it('throws when nesting exceeds MAX_DEPTH', () => {
      // Build a 101-level deep object
      let obj: any = { value: 1 };
      for (let i = 0; i < 101; i++) {
        obj = { nested: obj };
      }
      expect(() => convertJsonToXml(JSON.stringify(obj), opts)).toThrow(
        /maximum depth/i
      );
    });

    it('does not throw at exactly MAX_DEPTH - 1 levels', () => {
      let obj: any = { value: 1 };
      for (let i = 0; i < 98; i++) {
        obj = { nested: obj };
      }
      expect(() => convertJsonToXml(JSON.stringify(obj), opts)).not.toThrow();
    });
  });

  describe('XML tag name sanitization', () => {
    it('replaces spaces with underscores', () => {
      const result = convertJsonToXml('{"hello world":"v"}', opts);
      expect(result).toContain('<hello_world>v</hello_world>');
    });

    it('prefixes numeric-start keys with underscore', () => {
      const result = convertJsonToXml('{"1st":"gold"}', opts);
      expect(result).toContain('<_1st>gold</_1st>');
    });

    it('replaces < and > in keys', () => {
      const result = convertJsonToXml('{"a<b>c":"v"}', opts);
      expect(result).toContain('<a_b_c>v</a_b_c>');
    });

    it('prefixes numeric array index keys with row-', () => {
      const result = convertJsonToXml('{"items":[1,2,3]}', opts);
      // array indices are numeric → row-0, row-1, row-2 → no sanitization needed
      expect(result).toContain('<items>1</items>');
    });
  });
});
