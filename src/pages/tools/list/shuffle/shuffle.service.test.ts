import { describe, expect, it } from 'vitest';
import { shuffleList, SplitOperatorType } from './service';

describe('shuffle function', () => {
  it('should be a 4 length list if no length value defined ', () => {
    const input: string = 'apple, pineaple, lemon, orange';
    const splitOperatorType: SplitOperatorType = 'symbol';
    const splitSeparator = ', ';
    const joinSeparator = ' ';

    const result = shuffleList(
      splitOperatorType,
      input,
      splitSeparator,
      joinSeparator
    );
    expect(result.split(joinSeparator).length).toBe(4);
  });

  it('should be a 2 length list if length value is set to 2', () => {
    const input: string = 'apple, pineaple, lemon, orange';
    const splitOperatorType: SplitOperatorType = 'symbol';
    const splitSeparator = ', ';
    const joinSeparator = ' ';
    const length = 2;

    const result = shuffleList(
      splitOperatorType,
      input,
      splitSeparator,
      joinSeparator,
      length
    );
    expect(result.split(joinSeparator).length).toBe(2);
  });

  it('should be a 4 length list if length value is set to 99', () => {
    const input: string = 'apple, pineaple, lemon, orange';
    const splitOperatorType: SplitOperatorType = 'symbol';
    const splitSeparator = ', ';
    const joinSeparator = ' ';
    const length = 99;

    const result = shuffleList(
      splitOperatorType,
      input,
      splitSeparator,
      joinSeparator,
      length
    );
    expect(result.split(joinSeparator).length).toBe(4);
  });

  it('should include a random element  if length value is undefined', () => {
    const input: string = 'apple, pineaple, lemon, orange';
    const splitOperatorType: SplitOperatorType = 'symbol';
    const splitSeparator = ', ';
    const joinSeparator = ' ';

    const result = shuffleList(
      splitOperatorType,
      input,
      splitSeparator,
      joinSeparator,
      length
    );
    expect(result.split(joinSeparator)).toContain('apple');
  });

  it('should return empty string if input is empty', () => {
    const input: string = '';
    const splitOperatorType: SplitOperatorType = 'symbol';
    const splitSeparator = ', ';
    const joinSeparator = ' ';

    const result = shuffleList(
      splitOperatorType,
      input,
      splitSeparator,
      joinSeparator,
      length
    );
    expect(result).toBe('');
  });

  describe('regex mode', () => {
    it('splits correctly with a valid regex pattern', () => {
      const result = shuffleList('regex', 'a1b2c3d', '\\d', '\n');
      // Split produces ['a','b','c','d'] — all 4 parts must be present
      expect(result.split('\n').sort()).toEqual(['a', 'b', 'c', 'd']);
    });

    it('throws a user-friendly error for an invalid regex pattern', () => {
      expect(() =>
        shuffleList('regex', 'hello world', '[invalid', '\n')
      ).toThrow(/invalid regular expression/i);
    });

    it('throws when the pattern exceeds 200 characters', () => {
      const longPattern = 'a'.repeat(201);
      expect(() => shuffleList('regex', 'hello', longPattern, '\n')).toThrow(
        /200 characters/i
      );
    });

    it('accepts a pattern exactly at the 200-character limit', () => {
      // Simple 200-char literal pattern: matches 200 'x's in sequence — valid but harmless
      const pattern = 'x'.repeat(200);
      // Input has no 'x' run of 200 → split returns the whole string as one element
      expect(() =>
        shuffleList('regex', 'hello world', pattern, '\n')
      ).not.toThrow();
    });
  });
});
