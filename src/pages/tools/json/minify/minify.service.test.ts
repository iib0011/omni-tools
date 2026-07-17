import { describe, it, expect } from 'vitest';
import { minifyJson } from './service';

describe('minifyJson', () => {
  it('should minify formatted JSON', () => {
    const result = minifyJson('{\n  "a": 1\n}');
    expect(result).toBe('{"a":1}');
  });

  it('should handle empty object', () => {
    expect(minifyJson('{}')).toBe('{}');
  });

  it('should handle arrays', () => {
    expect(minifyJson('[1, 2, 3]')).toBe('[1,2,3]');
  });

  it('should handle nested objects', () => {
    expect(minifyJson('{"a":{"b":1}}')).toBe('{"a":{"b":1}}');
  });

  it('should throw on invalid JSON', () => {
    expect(() => minifyJson('invalid')).toThrow('Invalid JSON string');
  });
});
