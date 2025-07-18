import { expect, describe, it } from 'vitest';
import { convertUnixToDate } from './service';

describe('convertUnixToDate', () => {
  it('should convert a single Unix timestamp with label (UTC)', () => {
    const input = '0';
    const result = convertUnixToDate(input, true, false);
    expect(result).toBe('1970-01-01 00:00:00.000 UTC');
  });

  it('should convert a single Unix timestamp without label (UTC)', () => {
    const input = '1234567890';
    const result = convertUnixToDate(input, false, false);
    expect(result).toBe('2009-02-13 23:31:30.000');
  });

  it('should convert a single Unix timestamp in local time', () => {
    const input = '1234567890';
    const result = convertUnixToDate(input, true, true);
    expect(result.endsWith('UTC')).toBe(false);
  });

  it('should handle multiple lines with label (UTC)', () => {
    const input = '0\n2147483647';
    const result = convertUnixToDate(input, true, false);
    expect(result).toBe(
      '1970-01-01 00:00:00.000 UTC\n2038-01-19 03:14:07.000 UTC'
    );
  });

  it('should handle multiple lines with local time', () => {
    const input = '1672531199\n1721287227';
    const result = convertUnixToDate(input, false, true);
    const lines = result.split('\n');
    expect(lines.length).toBe(2);
    expect(lines[0].endsWith('UTC')).toBe(false);
  });

  it('should return empty string for invalid input', () => {
    const input = 'not_a_number';
    const result = convertUnixToDate(input, true, false);
    expect(result).toBe('');
  });

  it('should return empty string for empty input', () => {
    const input = '';
    const result = convertUnixToDate(input, false, false);
    expect(result).toBe('');
  });

  it('should ignore invalid lines in multiline input', () => {
    const input = 'abc\n1600000000';
    const result = convertUnixToDate(input, true, false);
    expect(result).toBe('\n2020-09-13 12:26:40.000 UTC');
  });
});
