import { expect, describe, it } from 'vitest';
import { createPalindromeList, createPalindrome } from './service';

describe('createPalindrome', () => {
  test('should create palindrome by reversing the entire string', () => {
    const input = 'hello';
    const result = createPalindrome(input, true);
    expect(result).toBe('helloolleh');
  });

  test('should create palindrome by reversing the string excluding the last character', () => {
    const input = 'hello';
    const result = createPalindrome(input, false);
    expect(result).toBe('hellolleh');
  });

  test('should return an empty string if input is empty', () => {
    const input = '';
    const result = createPalindrome(input, true);
    expect(result).toBe('');
  });
});

describe('createPalindromeList', () => {
  test('should create palindrome for single-line input', () => {
    const input = 'hello';
    const result = createPalindromeList(input, true, false);
    expect(result).toBe('helloolleh');
  });

  test('should create palindrome for single-line input considering trailing spaces', () => {
    const input = 'hello ';
    const result = createPalindromeList(input, true, false);
    expect(result).toBe('hello  olleh');
  });

  test('should create palindrome for single-line input ignoring trailing spaces if lastChar is set to false', () => {
    const input = 'hello ';
    const result = createPalindromeList(input, true, false);
    expect(result).toBe('hello  olleh');
  });

  test('should create palindrome for multi-line input', () => {
    const input = 'hello\nworld';
    const result = createPalindromeList(input, true, true);
    expect(result).toBe('helloolleh\nworlddlrow');
  });

  test('should create palindrome for no multi-line input', () => {
    const input = 'hello\nworld\n';
    const result = createPalindromeList(input, true, false);
    expect(result).toBe('hello\nworld\n\ndlrow\nolleh');
  });

  test('should handle multi-line input with lastChar set to false', () => {
    const input = 'hello\nworld';
    const result = createPalindromeList(input, false, true);
    expect(result).toBe('hellolleh\nworldlrow');
  });

  test('should return an empty string if input is empty', () => {
    const input = '';
    const result = createPalindromeList(input, true, false);
    expect(result).toBe('');
  });
});
