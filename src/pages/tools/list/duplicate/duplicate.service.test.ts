import { describe, expect, it } from 'vitest';
import { duplicateList } from './service';

describe('duplicateList function', () => {
  it('should duplicate elements correctly with symbol split', () => {
    const input = 'Hello World';
    const result = duplicateList('symbol', ' ', ' ', input, true, false, 2);
    expect(result).toBe('Hello World Hello World');
  });

  it('should duplicate elements correctly with regex split', () => {
    const input = 'Hello||World';
    const result = duplicateList('regex', '\\|\\|', ' ', input, true, false, 2);
    expect(result).toBe('Hello World Hello World');
  });

  it('should handle fractional duplication', () => {
    const input = 'Hello World';
    const result = duplicateList('symbol', ' ', ' ', input, true, false, 1.5);
    expect(result).toBe('Hello World Hello');
  });

  it('should handle reverse option correctly', () => {
    const input = 'Hello World';
    const result = duplicateList('symbol', ' ', ' ', input, true, true, 2);
    expect(result).toBe('Hello World World Hello');
  });

  it('should handle concatenate option correctly', () => {
    const input = 'Hello World';
    const result = duplicateList('symbol', ' ', ' ', input, false, false, 2);
    expect(result).toBe('Hello Hello World World');
  });

  it('should handle interweaving option correctly', () => {
    const input = 'Hello World';
    const result = duplicateList('symbol', ' ', ' ', input, false, false, 2);
    expect(result).toBe('Hello Hello World World');
  });

  it('should throw an error for negative copies', () => {
    expect(() =>
      duplicateList('symbol', ' ', ' ', 'Hello World', true, false, -1)
    ).toThrow('Number of copies cannot be negative');
  });

  it('should handle interweaving option correctly 2', () => {
    const input = "je m'appelle king";
    const result = duplicateList('symbol', ' ', ', ', input, false, true, 2.1);
    expect(result).toBe("je, king, m'appelle, m'appelle, king, je");
  });

  it('should handle interweaving option correctly 3', () => {
    const input = "je m'appelle king";
    const result = duplicateList('symbol', ' ', ', ', input, false, true, 1);
    expect(result).toBe("je, m'appelle, king");
  });

  it('should handle interweaving option correctly 3', () => {
    const input = "je m'appelle king";
    const result = duplicateList('symbol', ' ', ', ', input, true, true, 2.7);
    expect(result).toBe(
      "je, m'appelle, king, king, m'appelle, je, king, m'appelle"
    );
  });
});
