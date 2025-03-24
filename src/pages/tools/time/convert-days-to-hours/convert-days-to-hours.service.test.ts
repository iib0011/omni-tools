import { expect, describe, it } from 'vitest';
import { convertDaysToHours } from './service';

describe('Convert Days to Hours', () => {
  it('should convert days to hours correctly', () => {
    expect(convertDaysToHours('2', false)).toBe('48');
    expect(convertDaysToHours('0', false)).toBe('0');
  });

  it('should handle invalid input', () => {
    expect(convertDaysToHours('2\nc\n1', false)).toBe('48\n\n24');
  });
});
