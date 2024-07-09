import { expect, describe, it } from 'vitest';
import { reverseList } from './service';

describe('reverseList Function', () => {
  test('should reverse items split by symbol', () => {
    const input = 'apple,banana,orange';
    const result = reverseList('symbol', ',', '\n', input);
    expect(result).toBe('orange\nbanana\napple');
  });

  test('should reverse items split by regex', () => {
    const input = 'apple banana orange';
    const result = reverseList('regex', '\\s+', '\n', input);
    expect(result).toBe('orange\nbanana\napple');
  });

  test('should handle empty input', () => {
    const input = '';
    const result = reverseList('symbol', ',', '\n', input);
    expect(result).toBe('');
  });

  test('should handle join separator', () => {
    const input = 'apple,banana,orange';
    const result = reverseList('symbol', ',', ', ', input);
    expect(result).toBe('orange, banana, apple');
  });
});
