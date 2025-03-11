import { describe, expect, it } from 'vitest';
import { generateArithmeticSequence } from './service';

describe('generateArithmeticSequence', () => {
  it('should generate basic arithmetic sequence', () => {
    const result = generateArithmeticSequence(1, 2, 5, ', ');
    expect(result).toBe('1, 3, 5, 7, 9');
  });

  it('should handle negative first term', () => {
    const result = generateArithmeticSequence(-5, 2, 5, ' ');
    expect(result).toBe('-5 -3 -1 1 3');
  });

  it('should handle negative common difference', () => {
    const result = generateArithmeticSequence(10, -2, 5, ',');
    expect(result).toBe('10,8,6,4,2');
  });

  it('should handle decimal numbers', () => {
    const result = generateArithmeticSequence(1.5, 0.5, 4, ' ');
    expect(result).toBe('1.5 2 2.5 3');
  });

  it('should handle single term sequence', () => {
    const result = generateArithmeticSequence(1, 2, 1, ',');
    expect(result).toBe('1');
  });
});
