import { describe, it, expect } from 'vitest';
import { compute } from './service';

describe('compute function', () => {
  it('should correctly sum numbers in smart extraction mode', () => {
    const input = 'The 2 cats have 4 and 7 kittens';
    const result = compute(input, 'smart', false, ',');
    expect(result).toBe('13');
  });

  it('should correctly sum numbers with custom delimiter', () => {
    const input = '2,4,7';
    const result = compute(input, 'delimiter', false, ',');
    expect(result).toBe('13');
  });

  it('should return running sum in smart extraction mode', () => {
    const input = 'The 2 cats have 4 and 7 kittens';
    const result = compute(input, 'smart', true, ',');
    expect(result).toBe('2\n6\n13\n');
  });

  it('should return running sum with custom delimiter', () => {
    const input = '2,4,7';
    const result = compute(input, 'delimiter', true, ',');
    expect(result).toBe('2\n6\n13\n');
  });

  it('should handle empty input gracefully in smart mode', () => {
    const input = '';
    const result = compute(input, 'smart', false, ',');
    expect(result).toBe('0');
  });

  it('should handle empty input gracefully in delimiter mode', () => {
    const input = '';
    const result = compute(input, 'delimiter', false, ',');
    expect(result).toBe('0');
  });

  it('should handle input with no numbers in smart mode', () => {
    const input = 'There are no numbers here';
    const result = compute(input, 'smart', false, ',');
    expect(result).toBe('0');
  });

  it('should handle input with no numbers in delimiter mode', () => {
    const input = 'a,b,c';
    const result = compute(input, 'delimiter', false, ',');
    expect(result).toBe('0');
  });

  it('should ignore non-numeric parts in delimiter mode', () => {
    const input = '2,a,4,b,7';
    const result = compute(input, 'delimiter', false, ',');
    expect(result).toBe('13');
  });

  it('should handle different separators', () => {
    const input = '2;4;7';
    const result = compute(input, 'delimiter', false, ';');
    expect(result).toBe('13');
  });
});
