import { expect, describe, it } from 'vitest';

import { TopItemsList } from './service';

describe('TopItemsList Function', () => {
  test('should return unique items ignoring case sensitivity', () => {
    const input = 'apple,banana,Apple,orange,Banana,apple';
    const result = TopItemsList(
      'symbol',
      ',',
      '\n',
      input,
      true,
      true,
      false,
      true
    );
    expect(result).toBe('orange');
  });

  test('should return unique items considering case sensitivity', () => {
    const input = 'apple,banana,Apple,orange,Banana,apple';
    const result = TopItemsList(
      'symbol',
      ',',
      '\n',
      input,
      true,
      true,
      true,
      true
    );
    expect(result).toBe('banana\nApple\norange\nBanana');
  });

  test('should return all unique items ignoring case sensitivity', () => {
    const input = 'apple,banana,Apple,orange,Banana,apple';
    const result = TopItemsList(
      'symbol',
      ',',
      '\n',
      input,
      true,
      true,
      false,
      false
    );
    expect(result).toBe('apple\nbanana\norange');
  });

  test('should return all unique items considering case sensitivity', () => {
    const input = 'apple,banana,Apple,orange,Banana,apple';
    const result = TopItemsList(
      'symbol',
      ',',
      '\n',
      input,
      true,
      true,
      true,
      false
    );
    expect(result).toBe('apple\nbanana\nApple\norange\nBanana');
  });

  test('should handle empty items deletion', () => {
    const input = 'apple,,banana, ,orange';
    const result = TopItemsList(
      'symbol',
      ',',
      '\n',
      input,
      true,
      true,
      false,
      false
    );
    expect(result).toBe('apple\nbanana\norange');
  });

  test('should handle trimming items', () => {
    const input = ' apple , banana , orange ';
    const result = TopItemsList(
      'symbol',
      ',',
      '\n',
      input,
      false,
      false,
      false,
      false
    );
    expect(result).toBe(' apple \n banana \n orange ');
  });

  test('should handle regex split', () => {
    const input = 'apple banana orange';
    const result = TopItemsList(
      'regex',
      '\\s+',
      '\n',
      input,
      false,
      false,
      false,
      false
    );
    expect(result).toBe('apple\nbanana\norange');
  });
});
