import { describe, it, expect } from 'vitest';
import { truncateClockTime } from './service';

describe('truncateClockTime', () => {
  it('should truncate time to hours only without zero padding', () => {
    const input = '12:34:56\n07:08:09';
    const result = truncateClockTime(input, false, false, false);
    expect(result).toBe('12\n07');
  });
  it('should truncate time to hours only without zero padding 2', () => {
    const input = '12:34:56\n7:08:09';
    const result = truncateClockTime(input, false, false, false);
    expect(result).toBe('12\n7');
  });

  it('should truncate time to hours and minutes with zero padding', () => {
    const input = '3:4:5\n7:8:9';
    const result = truncateClockTime(input, true, false, true);
    expect(result).toBe('03:04\n07:08');
  });

  it('should handle empty input gracefully', () => {
    const input = '';
    const result = truncateClockTime(input, false, false, false);
    expect(result).toBe('');
  });

  it('should throw an error if time contains more than 3 parts', () => {
    const input = '12:34:56:78';
    expect(() => truncateClockTime(input, false, false, false)).toThrow(
      'Time contains more than 3 parts on line 1'
    );
  });

  it('should throw an error if time contains invalid characters', () => {
    const input = '12:34:ab';
    expect(() => truncateClockTime(input, false, false, false)).toThrow(
      "Time doesn't contain valid seconds on line 1"
    );
  });

  it('should add zero seconds and minutes when zeroPrint is true', () => {
    const input = '12';
    const result = truncateClockTime(input, false, true, false);
    expect(result).toBe('12:0:0');
  });

  it('should pad single-digit hours, minutes, and seconds when zeroPadding is true', () => {
    const input = '1:2:3';
    const result = truncateClockTime(input, true, true, true);
    expect(result).toBe('01:02:00');
  });

  it('should handle multiple lines of input correctly', () => {
    const input = '12:34:56\n1:2:3\n7:8';
    const result = truncateClockTime(input, true, true, true);
    expect(result).toBe('12:34:00\n01:02:00\n07:08:00');
  });
});
