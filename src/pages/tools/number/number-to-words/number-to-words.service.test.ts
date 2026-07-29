import { describe, expect, it } from 'vitest';
import { numberToWords } from './service';

describe('numberToWords', () => {
  it('converts zero', () => {
    expect(numberToWords('0', { uppercase: false, useAnd: true })).toBe(
      'Zero'
    );
  });

  it('converts single-digit numbers', () => {
    expect(numberToWords('7', { uppercase: false, useAnd: true })).toBe(
      'Seven'
    );
  });

  it('converts teens', () => {
    expect(numberToWords('15', { uppercase: false, useAnd: true })).toBe(
      'Fifteen'
    );
  });

  it('converts tens', () => {
    expect(numberToWords('42', { uppercase: false, useAnd: true })).toBe(
      'Forty Two'
    );
  });

  it('converts exact tens', () => {
    expect(numberToWords('40', { uppercase: false, useAnd: true })).toBe(
      'Forty'
    );
  });

  it('converts hundreds with "and"', () => {
    expect(numberToWords('123', { uppercase: false, useAnd: true })).toBe(
      'One Hundred And Twenty Three'
    );
  });

  it('omits "and" when option is disabled', () => {
    expect(numberToWords('123', { uppercase: false, useAnd: false })).toBe(
      'One Hundred Twenty Three'
    );
  });

  it('converts large numbers', () => {
    expect(
      numberToWords('1234567', { uppercase: false, useAnd: true })
    ).toBe(
      'Twelve Lakh Thirty Four Thousand Five Hundred And Sixty Seven'
    );
  });

  it('handles zero groups within large numbers', () => {
    expect(
      numberToWords('1000001', { uppercase: false, useAnd: true })
    ).toBe('Ten Lakh And One');
  });

  it('converts decimal numbers', () => {
    expect(numberToWords('3.14', { uppercase: false, useAnd: true })).toBe(
      'Three Point Fourteen'
    );
  });

  it('trims trailing zeros in the fraction', () => {
    expect(numberToWords('2.50', { uppercase: false, useAnd: true })).toBe(
      'Two Point Five'
    );
  });

  it('converts negative numbers', () => {
    expect(numberToWords('-7', { uppercase: false, useAnd: true })).toBe(
      'Minus Seven'
    );
  });

  it('uppercases the output when enabled', () => {
    expect(numberToWords('123', { uppercase: true, useAnd: true })).toBe(
      'ONE HUNDRED AND TWENTY THREE'
    );
  });

  it('processes multiple lines independently', () => {
    const input = '1\n2\n3';
    expect(numberToWords(input, { uppercase: false, useAnd: true })).toBe(
      'One\nTwo\nThree'
    );
  });

  it('preserves empty lines', () => {
    const input = '5\n\n10';
    expect(numberToWords(input, { uppercase: false, useAnd: true })).toBe(
      'Five\n\nTen'
    );
  });

  it('returns empty string for empty input', () => {
    expect(numberToWords('', { uppercase: false, useAnd: true })).toBe('');
  });

  it('returns empty string for non-numeric input', () => {
    expect(
      numberToWords('hello', { uppercase: false, useAnd: true })
    ).toBe('');
  });

  it('supports a leading decimal point', () => {
    expect(numberToWords('.25', { uppercase: false, useAnd: true })).toBe(
      'Zero Point Twenty Five'
    );
  });

  it('supports a trailing decimal point', () => {
    expect(numberToWords('5.', { uppercase: false, useAnd: true })).toBe(
      'Five'
    );
  });

  it('rejects a lone dot', () => {
    expect(numberToWords('.', { uppercase: false, useAnd: true })).toBe('');
  });
});
