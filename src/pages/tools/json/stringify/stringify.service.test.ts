import { describe, it, expect } from 'vitest';
import { stringifyJson } from './service';

describe('stringifyJson', () => {
  it('should stringify a simple object with spaces', () => {
    const result = stringifyJson('{a: 1}', 'space', 2, false);
    expect(result).toBe('{\n  "a": 1\n}');
  });

  it('should stringify with tabs', () => {
    const result = stringifyJson('{a: 1}', 'tab', 2, false);
    expect(result).toBe('{\n\t"a": 1\n}');
  });

  it('should stringify an array', () => {
    const result = stringifyJson('[1, 2, 3]', 'space', 2, false);
    expect(result).toBe('[\n  1,\n  2,\n  3\n]');
  });

  it('should escape HTML characters when enabled', () => {
    const result = stringifyJson('{x: "<script>"}', 'space', 2, true);
    expect(result).toContain('&lt;');
    expect(result).toContain('&gt;');
    expect(result).not.toContain('<script>');
  });

  it('should throw on invalid input', () => {
    expect(() => stringifyJson('not valid', 'space', 2, false)).toThrow(
      'Invalid JavaScript object/array'
    );
  });

  it('should handle nested objects', () => {
    const input = '{a: {b: {c: 1}}}';
    const result = stringifyJson(input, 'space', 2, false);
    expect(result).toContain('"a"');
    expect(result).toContain('"b"');
    expect(result).toContain('"c"');
  });
});
