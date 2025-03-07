import { describe, expect, it } from 'vitest';
import { compute } from './service';

describe('compute function', () => {
  it('should split by symbol', () => {
    const result = compute('symbol', 'hello world', ' ', '', 0, 0, '', '', ',');
    expect(result).toBe('hello,world');
  });

  it('should split by regex', () => {
    const result = compute(
      'regex',
      'hello1world2again',
      '',
      '\\d',
      0,
      0,
      '',
      '',
      ','
    );
    expect(result).toBe('hello,world,again');
  });

  it('should split by length', () => {
    const result = compute('length', 'helloworld', '', '', 3, 0, '', '', ',');
    expect(result).toBe('hel,low,orl,d');
  });

  it('should split into chunks', () => {
    const result = compute(
      'chunks',
      'helloworldagain',
      '',
      '',
      0,
      3,
      '[',
      ']',
      ','
    );
    expect(result).toBe('[hello],[world],[again]');
  });

  it('should handle empty input', () => {
    const result = compute('symbol', '', ' ', '', 0, 0, '', '', ',');
    expect(result).toBe('');
  });

  it('should handle length greater than text length', () => {
    const result = compute('length', 'hi', '', '', 5, 0, '', '', ',');
    expect(result).toBe('hi');
  });

  it('should handle chunks greater than text length', () => {
    expect(() => {
      compute('chunks', 'hi', '', '', 0, 5, '', '', ',');
    }).toThrow('Text length must be at least as long as the number of chunks');
  });

  it('should handle invalid length', () => {
    expect(() => {
      compute('length', 'hello', '', '', -1, 0, '', '', ',');
    }).toThrow('Length must be a positive number');
  });

  it('should handle invalid chunks', () => {
    expect(() => {
      compute('chunks', 'hello', '', '', 0, 0, '', '', ',');
    }).toThrow('Number of chunks must be a positive number');
  });
});
