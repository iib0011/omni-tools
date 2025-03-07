import { describe, expect, it } from 'vitest';
import { rotateList, SplitOperatorType } from './service';

describe('rotate function', () => {
  it('should rotate right side if right is set to true', () => {
    const input: string = 'apple, pineaple, lemon, orange, mango';
    const splitOperatorType: SplitOperatorType = 'symbol';
    const splitSeparator = ', ';
    const joinSeparator = '  ';
    const step = 1;
    const right = true;

    const result = rotateList(
      splitOperatorType,
      input,
      splitSeparator,
      joinSeparator,
      right,

      step
    );

    expect(result).toBe('mango  apple  pineaple  lemon  orange');
  });

  it('should rotate left side if right is set to true', () => {
    const input: string = 'apple, pineaple, lemon, orange, mango';
    const splitOperatorType: SplitOperatorType = 'symbol';
    const splitSeparator = ', ';
    const joinSeparator = ' ';
    const step = 1;
    const right = false;

    const result = rotateList(
      splitOperatorType,
      input,
      splitSeparator,
      joinSeparator,
      right,

      step
    );

    expect(result).toBe('pineaple lemon orange mango apple');
  });

  it('should rotate left side with 2 step if right is set to true', () => {
    const input: string = 'apple, pineaple, lemon, orange, mango';
    const splitOperatorType: SplitOperatorType = 'symbol';
    const splitSeparator = ', ';
    const joinSeparator = ' ';
    const step = 2;
    const right = false;

    const result = rotateList(
      splitOperatorType,
      input,
      splitSeparator,
      joinSeparator,
      right,

      step
    );

    expect(result).toBe('lemon orange mango apple pineaple');
  });

  it('should raise an error if step is negative', () => {
    const input: string = 'apple, pineaple, lemon, orange, mango';
    const splitOperatorType: SplitOperatorType = 'symbol';
    const splitSeparator = ', ';
    const joinSeparator = ' ';
    const step = -2;
    const right = false;

    expect(() => {
      rotateList(
        splitOperatorType,
        input,
        splitSeparator,
        joinSeparator,
        right,
        step
      );
    }).toThrowError('Rotation step must be greater than zero.');
  });

  it('should raise an error if step is undefined', () => {
    const input: string = 'apple, pineaple, lemon, orange, mango';
    const splitOperatorType: SplitOperatorType = 'symbol';
    const splitSeparator = ', ';
    const joinSeparator = ' ';
    const right = false;

    expect(() => {
      rotateList(
        splitOperatorType,
        input,
        splitSeparator,
        joinSeparator,
        right
      );
    }).toThrowError('Rotation step contains non-digits.');
  });
});
