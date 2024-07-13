import { expect, describe, it } from 'vitest';
import { palindromeList } from './service';

describe('palindromeList', () => {
  test('should return true for single character words', () => {
    const input = 'a|b|c';
    const separator = '|';
    const result = palindromeList('symbol', input, separator);
    expect(result).toBe('true|true|true');
  });

  test('should return false for non-palindromes', () => {
    const input = 'hello|world';
    const separator = '|';
    const result = palindromeList('symbol', input, separator);
    expect(result).toBe('false|false');
  });

  test('should split using regex', () => {
    const input = 'racecar,abba,hello';
    const separator = ',';
    const result = palindromeList('regex', input, separator);
    expect(result).toBe('true,true,false');
  });

  test('should return empty string for empty input', () => {
    const input = '';
    const separator = '|';
    const result = palindromeList('symbol', input, separator);
    expect(result).toBe('');
  });

  test('should split using custom separator', () => {
    const input = 'racecar;abba;hello';
    const separator = ';';
    const result = palindromeList('symbol', input, separator);
    expect(result).toBe('true;true;false');
  });

  test('should handle leading and trailing spaces', () => {
    const input = ' racecar | abba | hello ';
    const separator = '|';
    const result = palindromeList('symbol', input, separator);
    expect(result).toBe('true|true|false');
  });

  test('should handle multilines checking with trimming', () => {
    const input = ' racecar  \n    abba \n  hello ';
    const separator = '\n';
    const result = palindromeList('symbol', input, separator);
    expect(result).toBe('true\ntrue\nfalse');
  });

  test('should handle empty strings in input', () => {
    const input = 'racecar||hello';
    const separator = '|';
    const result = palindromeList('symbol', input, separator);
    expect(result).toBe('true|true|false');
  });
});
