import { expect, describe, it } from 'vitest';
import { convertHoursToDays } from './service';

describe('convertHoursToDays', () => {
  it('should convert hours to days with default accuracy', () => {
    const input = '48';
    const result = convertHoursToDays(input, '1', false);
    expect(result).toBe('2');
  });

  it('should convert hours to days with specified accuracy', () => {
    const input = '50';
    const result = convertHoursToDays(input, '2', false);
    expect(result).toBe('2.08');
  });

  it('should append "days" postfix when daysFlag is true', () => {
    const input = '72';
    const result = convertHoursToDays(input, '1', true);
    expect(result).toBe('3 days');
  });

  it('should handle multiple lines of input', () => {
    const input = '24\n48\n72';
    const result = convertHoursToDays(input, '1', true);
    expect(result).toBe('1 days\n2 days\n3 days');
  });

  it('should handle invalid input gracefully', () => {
    const input = 'abc';
    const result = convertHoursToDays(input, '1', false);
    expect(result).toBe('');
  });

  it('should handle empty input', () => {
    const input = '';
    const result = convertHoursToDays(input, '1', false);
    expect(result).toBe('');
  });
});
