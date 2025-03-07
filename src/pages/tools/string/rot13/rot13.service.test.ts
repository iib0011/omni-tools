import { expect, describe, it } from 'vitest';
import { rot13 } from './service';

describe('rot13', () => {
  it('should encode a simple string using ROT13', () => {
    const input = 'hello';
    const result = rot13(input);
    expect(result).toBe('uryyb');
  });

  it('should decode a ROT13 encoded string', () => {
    const input = 'uryyb';
    const result = rot13(input);
    expect(result).toBe('hello');
  });

  it('should handle uppercase letters correctly', () => {
    const input = 'HELLO';
    const result = rot13(input);
    expect(result).toBe('URYYB');
  });

  it('should handle mixed case letters correctly', () => {
    const input = 'HelloWorld';
    const result = rot13(input);
    expect(result).toBe('UryybJbeyq');
  });

  it('should handle non-alphabetic characters correctly', () => {
    const input = 'Hello, World!';
    const result = rot13(input);
    expect(result).toBe('Uryyb, Jbeyq!');
  });

  it('should handle an empty string', () => {
    const input = '';
    const result = rot13(input);
    expect(result).toBe('');
  });

  it('should handle a string with numbers correctly', () => {
    const input = '1234';
    const result = rot13(input);
    expect(result).toBe('1234');
  });

  it('should handle a string with symbols correctly', () => {
    const input = '!@#$%^&*()_+-=';
    const result = rot13(input);
    expect(result).toBe('!@#$%^&*()_+-=');
  });

  it('should handle a string with mixed characters correctly', () => {
    const input = 'Hello, World! 123';
    const result = rot13(input);
    expect(result).toBe('Uryyb, Jbeyq! 123');
  });
});
