import { describe, it, expect } from 'vitest';
import { convertTimetoSeconds } from './service';

describe('convertSecondsToTime', () => {
  it('should convert valid time strings to seconds', () => {
    const input = '01:02:03\n00:45:30\n12:00';
    const expectedOutput = '3723\n2730\n43200';
    expect(convertTimetoSeconds(input)).toBe(expectedOutput);
  });

  it('should handle single-line input', () => {
    const input = '00:01:30';
    const expectedOutput = '90';
    expect(convertTimetoSeconds(input)).toBe(expectedOutput);
  });

  it('should throw an error for invalid time format', () => {
    const input = '01:02:03\n01:02:03:04';
    expect(() => convertTimetoSeconds(input)).toThrow(
      'Time contains more than 3 parts on line 2'
    );
  });

  it('should throw an error for non-numeric values (minutes)', () => {
    const input = '01:XX:03';
    expect(() => convertTimetoSeconds(input)).toThrow(
      "Time doesn't contain valid minutes on line 1"
    );
  });

  it('should throw an error for non-numeric values (hours)', () => {
    const input = '0x:00:03';
    expect(() => convertTimetoSeconds(input)).toThrow(
      "Time doesn't contain valid hours on line 1"
    );
  });

  it('should throw an error for non-numeric values (seconds)', () => {
    const input = '01:00:0s';
    expect(() => convertTimetoSeconds(input)).toThrow(
      "Time doesn't contain valid seconds on line 1"
    );
  });

  it('should throw an error for non-numeric values multi lines (seconds)', () => {
    const input = '01:00:00\n01:00:0s';
    expect(() => convertTimetoSeconds(input)).toThrow(
      "Time doesn't contain valid seconds on line 2"
    );
  });

  it('should handle empty input', () => {
    const input = '';
    const expectedOutput = '';
    expect(convertTimetoSeconds(input)).toBe(expectedOutput);
  });
});
