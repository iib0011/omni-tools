import { expect, describe, it } from 'vitest';
import { UppercaseInput } from './service';

describe('UppercaseInput', () => {
  it('should convert a lowercase string to uppercase', () => {
    const input = 'hello';
    const result = UppercaseInput(input);
    expect(result).toBe('HELLO');
  });

  it('should convert a mixed case string to uppercase', () => {
    const input = 'HeLLo WoRLd';
    const result = UppercaseInput(input);
    expect(result).toBe('HELLO WORLD');
  });

  it('should convert an already uppercase string to uppercase', () => {
    const input = 'HELLO';
    const result = UppercaseInput(input);
    expect(result).toBe('HELLO');
  });

  it('should handle an empty string', () => {
    const input = '';
    const result = UppercaseInput(input);
    expect(result).toBe('');
  });

  it('should handle a string with numbers and symbols', () => {
    const input = '123 hello! @world';
    const result = UppercaseInput(input);
    expect(result).toBe('123 HELLO! @WORLD');
  });
});
