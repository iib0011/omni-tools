import { expect, describe, it } from 'vitest';
import { stringReverser } from './service';

describe('stringReverser', () => {
  it('should reverse a single-line string', () => {
    const input = 'hello world';
    const result = stringReverser(input, false, false, false);
    expect(result).toBe('dlrow olleh');
  });

  it('should reverse each line in a multi-line string', () => {
    const input = 'hello\nworld';
    const result = stringReverser(input, true, false, false);
    expect(result).toBe('olleh\ndlrow');
  });

  it('should remove empty items if emptyItems is true', () => {
    const input = 'hello\n\nworld';
    const result = stringReverser(input, true, true, false);
    expect(result).toBe('olleh\ndlrow');
  });

  it('should trim each line if trim is true', () => {
    const input = '  hello  \n  world  ';
    const result = stringReverser(input, true, false, true);
    expect(result).toBe('olleh\ndlrow');
  });

  it('should handle empty input', () => {
    const input = '';
    const result = stringReverser(input, false, false, false);
    expect(result).toBe('');
  });

  it('should handle a single line with emptyItems and trim', () => {
    const input = '  hello world  ';
    const result = stringReverser(input, false, true, true);
    expect(result).toBe('dlrow olleh');
  });

  it('should handle a single line with emptyItems and non trim', () => {
    const input = '  hello world  ';
    const result = stringReverser(input, false, true, false);
    expect(result).toBe('  dlrow olleh  ');
  });

  it('should handle a multi line with emptyItems and non trim', () => {
    const input = '  hello\n\n\n\nworld  ';
    const result = stringReverser(input, true, true, false);
    expect(result).toBe('olleh  \n  dlrow');
  });
});
