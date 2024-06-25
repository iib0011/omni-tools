import { describe, it, expect } from 'vitest';
import { compute } from './service';

describe('compute function', () => {
  it('should replace dots and dashes with specified symbols', () => {
    const input = 'test';
    const dotSymbol = '*';
    const dashSymbol = '#';
    const result = compute(input, dotSymbol, dashSymbol);
    const expected = '# * *** #';
    expect(result).toBe(expected);
  });

  it('should return an empty string for empty input', () => {
    const input = '';
    const dotSymbol = '*';
    const dashSymbol = '#';
    const result = compute(input, dotSymbol, dashSymbol);
    expect(result).toBe('');
  });

  // Test case 3: Special characters handling
  it('should handle input with special characters', () => {
    const input = 'hello, world!';
    const dotSymbol = '*';
    const dashSymbol = '#';
    const result = compute(input, dotSymbol, dashSymbol);
    const expected =
      '**** * *#** *#** ### ##**## / *## ### *#* *#** #** #*#*##';
    expect(result).toBe(expected);
  });

  it('should work with different symbols for dots and dashes', () => {
    const input = 'morse';
    const dotSymbol = '!';
    const dashSymbol = '@';
    const result = compute(input, dotSymbol, dashSymbol);
    const expected = '@@ @@@ !@! !!! !';
    expect(result).toBe(expected);
  });

  it('should handle numeric input correctly', () => {
    const input = '12345';
    const dotSymbol = '*';
    const dashSymbol = '#';
    const result = compute(input, dotSymbol, dashSymbol);
    const expected = '*#### **### ***## ****# *****'; // This depends on how "12345" is encoded in morse code
    expect(result).toBe(expected);
  });
});
