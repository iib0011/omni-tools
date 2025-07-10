import { describe, it, expect } from 'vitest';
import { convertDateToEpoch, convertEpochToDate } from './service';

describe('convertDateToEpoch', () => {
  it('should convert ISO 8601 date strings to epoch', () => {
    const input = '2023-01-01T00:00:00Z\n2023-12-31T23:59:59Z';
    const result = convertDateToEpoch(input);
    const lines = result.split('\n');

    expect(lines[0]).toBe('1672531200'); // 2023-01-01 00:00:00 UTC
    expect(lines[1]).toBe('1704067199'); // 2023-12-31 23:59:59 UTC
  });

  it('should convert YYYY-MM-DD date format to epoch', () => {
    const input = '2023-01-01\n2023-06-15';
    const result = convertDateToEpoch(input);
    const lines = result.split('\n');

    expect(lines[0]).toBe('1672531200'); // 2023-01-01 00:00:00 UTC
    expect(lines[1]).toBe('1686787200'); // 2023-06-15 00:00:00 UTC
  });

  it('should convert YYYY-MM-DD HH:mm:ss format to epoch', () => {
    const input = '2023-01-01 12:30:45';
    const result = convertDateToEpoch(input);

    expect(result).toBe('1672576245'); // 2023-01-01 12:30:45 UTC
  });

  it('should convert MM/DD/YYYY format to epoch', () => {
    const input = '01/01/2023\n12/31/2023';
    const result = convertDateToEpoch(input);
    const lines = result.split('\n');

    expect(lines[0]).toBe('1672531200'); // 2023-01-01 00:00:00 UTC
    expect(lines[1]).toBe('1703980800'); // 2023-12-31 00:00:00 UTC
  });

  it('should convert DD/MM/YYYY format to epoch', () => {
    const input = '15/06/2023';
    const result = convertDateToEpoch(input);

    expect(result).toBe('1686787200'); // 2023-06-15 00:00:00 UTC
  });

  it('should handle already existing epoch timestamps', () => {
    const input = '1672531200\n1704067199';
    const result = convertDateToEpoch(input);

    expect(result).toBe('1672531200\n1704067199');
  });

  it('should handle empty lines', () => {
    const input = '2023-01-01\n\n2023-12-31';
    const result = convertDateToEpoch(input);
    const lines = result.split('\n');

    expect(lines[0]).toBe('1672531200');
    expect(lines[1]).toBe('');
    expect(lines[2]).toBe('1703980800');
  });

  it('should handle empty input', () => {
    const input = '';
    const result = convertDateToEpoch(input);

    expect(result).toBe('');
  });

  it('should throw error for invalid date format', () => {
    const input = 'invalid-date-format';

    expect(() => convertDateToEpoch(input)).toThrow(
      'Invalid date format on line 1: "invalid-date-format"'
    );
  });

  it('should throw error for invalid date on specific line', () => {
    const input = '2023-01-01\ninvalid-date\n2023-12-31';

    expect(() => convertDateToEpoch(input)).toThrow(
      'Invalid date format on line 2: "invalid-date"'
    );
  });

  it('should handle mixed date formats', () => {
    const input = '2023-01-01T00:00:00Z\n01/15/2023\n2023-06-15 12:30:00';
    const result = convertDateToEpoch(input);
    const lines = result.split('\n');

    expect(lines[0]).toBe('1672531200'); // ISO format
    expect(lines[1]).toBe('1673740800'); // MM/DD/YYYY format
    expect(lines[2]).toBe('1686832200'); // YYYY-MM-DD HH:mm:ss format
  });

  it('should handle JavaScript date string format', () => {
    const input = 'Sun Jan 01 2023 00:00:00';
    const result = convertDateToEpoch(input);

    expect(result).toBe('1672531200');
  });

  it('should convert date with milliseconds correctly', () => {
    const input = '2023-01-01T00:00:00.000Z';
    const result = convertDateToEpoch(input);

    expect(result).toBe('1672531200');
  });
});

describe('convertEpochToDate', () => {
  it('should convert epoch timestamps to human-readable dates', () => {
    const input = '1672531200\n1704067199';
    const result = convertEpochToDate(input);
    const lines = result.split('\n');

    expect(lines[0]).toBe('2023-01-01 00:00:00 UTC');
    expect(lines[1]).toBe('2023-12-31 23:59:59 UTC');
  });

  it('should convert single epoch timestamp', () => {
    const input = '1672531200';
    const result = convertEpochToDate(input);

    expect(result).toBe('2023-01-01 00:00:00 UTC');
  });

  it('should handle epoch timestamp 0', () => {
    const input = '0';
    const result = convertEpochToDate(input);

    expect(result).toBe('1970-01-01 00:00:00 UTC');
  });

  it('should handle empty lines', () => {
    const input = '1672531200\n\n1704067199';
    const result = convertEpochToDate(input);
    const lines = result.split('\n');

    expect(lines[0]).toBe('2023-01-01 00:00:00 UTC');
    expect(lines[1]).toBe('');
    expect(lines[2]).toBe('2023-12-31 23:59:59 UTC');
  });

  it('should handle empty input', () => {
    const input = '';
    const result = convertEpochToDate(input);

    expect(result).toBe('');
  });

  it('should throw error for invalid epoch timestamp', () => {
    const input = 'invalid-epoch';

    expect(() => convertEpochToDate(input)).toThrow(
      'Invalid epoch timestamp on line 1: "invalid-epoch"'
    );
  });

  it('should throw error for negative epoch timestamp', () => {
    const input = '-1672531200';

    expect(() => convertEpochToDate(input)).toThrow(
      'Invalid epoch timestamp on line 1: "-1672531200"'
    );
  });

  it('should throw error for epoch timestamp too far in the future', () => {
    const input = '9999999999';

    expect(() => convertEpochToDate(input)).toThrow(
      'Invalid epoch timestamp on line 1: "9999999999"'
    );
  });

  it('should handle multiple epoch timestamps', () => {
    const input = '0\n946684800\n1577836800';
    const result = convertEpochToDate(input);
    const lines = result.split('\n');

    expect(lines[0]).toBe('1970-01-01 00:00:00 UTC');
    expect(lines[1]).toBe('2000-01-01 00:00:00 UTC');
    expect(lines[2]).toBe('2020-01-01 00:00:00 UTC');
  });

  it('should throw error for invalid epoch on specific line', () => {
    const input = '1672531200\ninvalid-epoch\n1704067199';

    expect(() => convertEpochToDate(input)).toThrow(
      'Invalid epoch timestamp on line 2: "invalid-epoch"'
    );
  });
});
