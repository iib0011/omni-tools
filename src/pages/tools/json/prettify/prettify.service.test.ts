import { describe, it, expect } from 'vitest';
import { beautifyJson } from './service';

describe('beautifyJson', () => {
  it('should format valid JSON with spaces', () => {
    const result = beautifyJson('{"a":1,"b":2}', 'space', 2);
    expect(result).toBe('{\n  "a": 1,\n  "b": 2\n}');
  });

  it('should format valid JSON with tabs', () => {
    const result = beautifyJson('{"a":1}', 'tab', 2);
    expect(result).toBe('{\n\t"a": 1\n}');
  });

  it('should handle empty object', () => {
    const result = beautifyJson('{}', 'space', 2);
    expect(result).toBe('{}');
  });

  it('should handle nested objects', () => {
    const result = beautifyJson('{"a":{"b":1}}', 'space', 2);
    expect(result).toBe('{\n  "a": {\n    "b": 1\n  }\n}');
  });

  it('should throw on invalid JSON', () => {
    expect(() => beautifyJson('not json', 'space', 2)).toThrow(
      'Invalid JSON string'
    );
  });

  it('should handle arrays', () => {
    const result = beautifyJson('[1,2,3]', 'space', 2);
    expect(result).toBe('[\n  1,\n  2,\n  3\n]');
  });
});
