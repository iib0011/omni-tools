import { describe, expect, it } from 'vitest';
import { numberToWords } from './service';

describe('numberToWords', () => {
  it('converts zero', () => {
    expect(numberToWords('0', { uppercase: false, includeAnd: true })).toBe(
      'Zero'
    );
  });

  it('converts single-digit numbers', () => {
    expect(numberToWords('7', { uppercase: false, includeAnd: true })).toBe(
      'Seven'
    );
  });

  it('converts teens', () => {
    expect(numberToWords('15', { uppercase: false, includeAnd: true })).toBe(
      'Fifteen'
    );
  });

  it('converts tens', () => {
    expect(numberToWords('42', { uppercase: false, includeAnd: true })).toBe(
      'Forty Two'
    );
  });

  it('converts exact tens', () => {
    expect(numberToWords('40', { uppercase: false, includeAnd: true })).toBe(
      'Forty'
    );
  });

  it('converts hundreds with "and"', () => {
    expect(numberToWords('123', { uppercase: false, includeAnd: true })).toBe(
      'One Hundred And Twenty Three'
    );
  });

  it('omits "and" when option is disabled', () => {
    expect(numberToWords('123', { uppercase: false, includeAnd: false })).toBe(
      'One Hundred Twenty Three'
    );
  });

  it('converts large numbers', () => {
    expect(
      numberToWords('1234567', { uppercase: false, includeAnd: true })
    ).toBe(
      'Twelve Lakh Thirty Four Thousand Five Hundred And Sixty Seven'
    );
  });

  it('handles zero groups within large numbers', () => {
    expect(
      numberToWords('1000001', { uppercase: false, includeAnd: true })
    ).toBe('Ten Lakh And One');
  });

  it('converts decimal numbers', () => {
    expect(numberToWords('3.14', { uppercase: false, includeAnd: true })).toBe(
      'Three Point Fourteen'
    );
  });

  it('trims trailing zeros in the fraction', () => {
    expect(numberToWords('2.50', { uppercase: false, includeAnd: true })).toBe(
      'Two Point Five'
    );
  });

  it('converts negative numbers', () => {
    expect(numberToWords('-7', { uppercase: false, includeAnd: true })).toBe(
      'Minus Seven'
    );
  });

  it('uppercases the output when enabled', () => {
    expect(numberToWords('123', { uppercase: true, includeAnd: true })).toBe(
      'ONE HUNDRED AND TWENTY THREE'
    );
  });

  it('processes multiple lines independently', () => {
    const input = '1\n2\n3';
    expect(numberToWords(input, { uppercase: false, includeAnd: true })).toBe(
      'One\nTwo\nThree'
    );
  });

  it('preserves empty lines', () => {
    const input = '5\n\n10';
    expect(numberToWords(input, { uppercase: false, includeAnd: true })).toBe(
      'Five\n\nTen'
    );
  });

  it('returns empty string for empty input', () => {
    expect(numberToWords('', { uppercase: false, includeAnd: true })).toBe('');
  });

  it('returns empty string for non-numeric input', () => {
    expect(
      numberToWords('hello', { uppercase: false, includeAnd: true })
    ).toBe('');
  });

  it('supports a leading decimal point', () => {
    expect(numberToWords('.25', { uppercase: false, includeAnd: true })).toBe(
      'Zero Point Twenty Five'
    );
  });

  it('supports a trailing decimal point', () => {
    expect(numberToWords('5.', { uppercase: false, includeAnd: true })).toBe(
      'Five'
    );
  });

  it('rejects a lone dot', () => {
    expect(numberToWords('.', { uppercase: false, includeAnd: true })).toBe('');
  });
});
