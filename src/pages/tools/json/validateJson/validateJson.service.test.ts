import { describe, it, expect } from 'vitest';
import { validateJson } from './service';

describe('validateJson', () => {
  it('should return valid for correct JSON', () => {
    const result = validateJson('{"a": 1}');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should return valid for empty object', () => {
    const result = validateJson('{}');
    expect(result.valid).toBe(true);
  });

  it('should return valid for array', () => {
    const result = validateJson('[1, 2, 3]');
    expect(result.valid).toBe(true);
  });

  it('should return invalid with error for malformed JSON', () => {
    const result = validateJson('{invalid}');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should return invalid for empty string', () => {
    const result = validateJson('');
    expect(result.valid).toBe(false);
  });

  it('should return invalid for plain text', () => {
    const result = validateJson('hello world');
    expect(result.valid).toBe(false);
  });

  it('should handle JSON with special characters', () => {
    const result = validateJson('{"key": "value with \\"quotes\\""}');
    expect(result.valid).toBe(true);
  });
});
