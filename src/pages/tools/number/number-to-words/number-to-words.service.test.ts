import { describe, expect, it } from 'vitest';
import { numberToWords } from './service';

describe('numberToWords', () => {
  it('converts zero', () => {
    expect(numberToWords('0', { uppercase: false, includeAnd: true })).toBe(
      'zero'
    );
  });

  it('converts single-digit numbers', () => {
    expect(numberToWords('7', { uppercase: false, includeAnd: true })).toBe(
      'seven'
    );
  });

  it('converts teens', () => {
    expect(numberToWords('15', { uppercase: false, includeAnd: true })).toBe(
      'fifteen'
    );
  });

  it('converts hyphenated tens', () => {
    expect(numberToWords('42', { uppercase: false, includeAnd: true })).toBe(
      'forty-two'
    );
  });

  it('converts exact tens without hyphen', () => {
    expect(numberToWords('40', { uppercase: false, includeAnd: true })).toBe(
      'forty'
    );
  });

  it('converts hundreds with "and"', () => {
    expect(numberToWords('123', { uppercase: false, includeAnd: true })).toBe(
      'one hundred and twenty-three'
    );
  });

  it('omits "and" when option is disabled', () => {
    expect(numberToWords('123', { uppercase: false, includeAnd: false })).toBe(
      'one hundred twenty-three'
    );
  });

  it('converts thousands', () => {
    expect(
      numberToWords('1234567', { uppercase: false, includeAnd: true })
    ).toBe(
      'one million two hundred and thirty-four thousand five hundred and sixty-seven'
    );
  });

  it('handles zero groups within large numbers', () => {
    expect(
      numberToWords('1000001', { uppercase: false, includeAnd: true })
    ).toBe('one million one');
  });

  it('converts decimal numbers digit by digit', () => {
    expect(numberToWords('3.14', { uppercase: false, includeAnd: true })).toBe(
      'three point one four'
    );
  });

  it('trims trailing zeros in the fraction', () => {
    expect(numberToWords('2.50', { uppercase: false, includeAnd: true })).toBe(
      'two point five'
    );
  });

  it('converts negative numbers', () => {
    expect(numberToWords('-7', { uppercase: false, includeAnd: true })).toBe(
      'negative seven'
    );
  });

  it('uppercases the output when enabled', () => {
    expect(numberToWords('123', { uppercase: true, includeAnd: true })).toBe(
      'ONE HUNDRED AND TWENTY-THREE'
    );
  });

  it('processes multiple lines independently', () => {
    const input = '1\n2\n3';
    expect(numberToWords(input, { uppercase: false, includeAnd: true })).toBe(
      'one\ntwo\nthree'
    );
  });

  it('preserves empty lines', () => {
    const input = '5\n\n10';
    expect(numberToWords(input, { uppercase: false, includeAnd: true })).toBe(
      'five\n\nten'
    );
  });

  it('returns empty string for empty input', () => {
    expect(numberToWords('', { uppercase: false, includeAnd: true })).toBe('');
  });

  it('returns empty string for non-numeric input', () => {
    expect(numberToWords('hello', { uppercase: false, includeAnd: true })).toBe(
      ''
    );
  });

  it('supports a leading decimal point', () => {
    expect(numberToWords('.25', { uppercase: false, includeAnd: true })).toBe(
      'zero point two five'
    );
  });

  it('supports a trailing decimal point', () => {
    expect(numberToWords('5.', { uppercase: false, includeAnd: true })).toBe(
      'five'
    );
  });

  it('rejects a lone dot', () => {
    expect(numberToWords('.', { uppercase: false, includeAnd: true })).toBe('');
  });
});
