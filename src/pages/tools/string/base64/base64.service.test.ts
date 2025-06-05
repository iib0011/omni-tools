import { expect, describe, it } from 'vitest';
import { base64 } from './service';

describe('base64', () => {
  it('should encode a simple string using Base64 correctly', () => {
    const input = 'hello';
    const result = base64(input, true);
    expect(result).toBe('aGVsbG8=');
  });

  it('should decode a simple Base64-encoded string correctly', () => {
    const input = 'aGVsbG8=';
    const result = base64(input, false);
    expect(result).toBe('hello');
  });

  it('should handle special characters encoding correctly', () => {
    const input = 'Hello, World!';
    const result = base64(input, true);
    expect(result).toBe('SGVsbG8sIFdvcmxkIQ==');
  });

  it('should handle special characters decoding correctly', () => {
    const input = 'SGVsbG8sIFdvcmxkIQ==';
    const result = base64(input, false);
    expect(result).toBe('Hello, World!');
  });

  it('should handle an empty string encoding correctly', () => {
    const input = '';
    const result = base64(input, true);
    expect(result).toBe('');
  });

  it('should handle an empty string decoding correctly', () => {
    const input = '';
    const result = base64(input, false);
    expect(result).toBe('');
  });

  it('should handle a newline encoding correctly', () => {
    const input = '\n';
    const result = base64(input, true);
    expect(result).toBe('Cg==');
  });

  it('should handle a newline decoding correctly', () => {
    const input = 'Cg==';
    const result = base64(input, false);
    expect(result).toBe('\n');
  });

  it('should handle a string with symbols encoding correctly', () => {
    const input = '!@#$%^&*()_+-=';
    const result = base64(input, true);
    expect(result).toBe('IUAjJCVeJiooKV8rLT0=');
  });

  it('should handle a string with mixed characters decoding correctly', () => {
    const input = 'IUAjJCVeJiooKV8rLT0=';
    const result = base64(input, false);
    expect(result).toBe('!@#$%^&*()_+-=');
  });
});
