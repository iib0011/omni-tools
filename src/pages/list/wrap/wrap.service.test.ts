import { describe, expect, it } from 'vitest';
import { SplitOperatorType, wrapList } from './service';

describe('wrap function', () => {
  it('should return the same input if no left and right are blanked', () => {
    const input: string = 'apple, pineaple, lemon, orange, mango';
    const splitOperatorType: SplitOperatorType = 'symbol';
    const splitSeparator = ', ';
    const joinSeparator = ', ';
    const deleteEmptyItems = false;

    const result = wrapList(
      splitOperatorType,
      input,
      splitSeparator,
      joinSeparator,
      deleteEmptyItems
    );

    expect(result).toBe('apple, pineaple, lemon, orange, mango');
  });

  it('should append to left if defined', () => {
    const input: string = 'apple, pineaple, lemon, orange, mango';
    const splitOperatorType: SplitOperatorType = 'symbol';
    const splitSeparator = ', ';
    const joinSeparator = ', ';
    const left = 'the ';
    const deleteEmptyItems = false;

    const result = wrapList(
      splitOperatorType,
      input,
      splitSeparator,
      joinSeparator,
      deleteEmptyItems,
      left
    );

    expect(result).toBe(
      'the apple, the pineaple, the lemon, the orange, the mango'
    );
  });

  it('should append to right if defined', () => {
    const input: string = 'apple, pineaple, lemon, orange, mango';
    const splitOperatorType: SplitOperatorType = 'symbol';
    const splitSeparator = ', ';
    const joinSeparator = ', ';
    const left = '';
    const right = 'z';
    const deleteEmptyItems = false;

    const result = wrapList(
      splitOperatorType,
      input,
      splitSeparator,
      joinSeparator,
      deleteEmptyItems,
      left,
      right
    );

    expect(result).toBe('applez, pineaplez, lemonz, orangez, mangoz');
  });

  it('should append to both side if both defined', () => {
    const input: string = 'apple, pineaple, lemon, orange, mango';
    const splitOperatorType: SplitOperatorType = 'symbol';
    const splitSeparator = ', ';
    const joinSeparator = ', ';
    const deleteEmptyItems = false;
    const left = 'K';
    const right = 'z';

    const result = wrapList(
      splitOperatorType,
      input,
      splitSeparator,
      joinSeparator,
      deleteEmptyItems,
      left,
      right
    );

    expect(result).toBe('Kapplez, Kpineaplez, Klemonz, Korangez, Kmangoz');
  });

  it('should append to both side if both defined and not delete empty items', () => {
    const input: string = 'apple, pineaple, lemon, orange, mango, ';
    const splitOperatorType: SplitOperatorType = 'symbol';
    const splitSeparator = ', ';
    const joinSeparator = ', ';
    const deleteEmptyItems = false;
    const left = 'K';
    const right = 'z';

    const result = wrapList(
      splitOperatorType,
      input,
      splitSeparator,
      joinSeparator,
      deleteEmptyItems,
      left,
      right
    );

    expect(result).toBe('Kapplez, Kpineaplez, Klemonz, Korangez, Kmangoz, Kz');
  });

  it('should append to both side if both defined and delete empty items', () => {
    const input: string = 'apple, pineaple, lemon, , orange, mango';
    const splitOperatorType: SplitOperatorType = 'symbol';
    const splitSeparator = ', ';
    const joinSeparator = ', ';
    const deleteEmptyItems = true;
    const left = 'K';
    const right = 'z';

    const result = wrapList(
      splitOperatorType,
      input,
      splitSeparator,
      joinSeparator,
      deleteEmptyItems,
      left,
      right
    );

    expect(result).toBe('Kapplez, Kpineaplez, Klemonz, Korangez, Kmangoz');
  });
});
