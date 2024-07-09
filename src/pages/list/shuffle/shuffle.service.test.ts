import { expect, describe, it } from 'vitest';
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
    console.log(result);
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
    console.log(result);
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
    console.log(result);
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
    console.log(result);
    expect(result).toBe('');
  });
});
