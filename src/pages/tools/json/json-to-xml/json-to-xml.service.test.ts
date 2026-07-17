import { describe, it, expect } from 'vitest';
import { convertJsonToXml } from './service';

describe('convertJsonToXml', () => {
  it('should convert simple JSON to XML', () => {
    const result = convertJsonToXml('{"name": "test"}', {
      indentationType: 'space',
      addMetaTag: false
    });
    expect(result).toContain('<name>test</name>');
    expect(result).toContain('<root>');
    expect(result).toContain('</root>');
  });

  it('should add XML meta tag when enabled', () => {
    const result = convertJsonToXml('{"a": 1}', {
      indentationType: 'none',
      addMetaTag: true
    });
    expect(result).toContain('<?xml version="1.0"');
  });

  it('should handle nested objects', () => {
    const result = convertJsonToXml('{"a": {"b": 1}}', {
      indentationType: 'none',
      addMetaTag: false
    });
    expect(result).toContain('<a>');
    expect(result).toContain('<b>1</b>');
    expect(result).toContain('</a>');
  });

  it('should handle arrays', () => {
    const result = convertJsonToXml('{"items": [1, 2]}', {
      indentationType: 'none',
      addMetaTag: false
    });
    expect(result).toContain('<items>1</items>');
    expect(result).toContain('<items>2</items>');
  });

  it('should escape XML special characters', () => {
    const result = convertJsonToXml('{"text": "a < b & c > d"}', {
      indentationType: 'none',
      addMetaTag: false
    });
    expect(result).toContain('&lt;');
    expect(result).toContain('&amp;');
    expect(result).toContain('&gt;');
  });

  it('should throw on invalid JSON', () => {
    expect(() =>
      convertJsonToXml('invalid', {
        indentationType: 'none',
        addMetaTag: false
      })
    ).toThrow();
  });
});
