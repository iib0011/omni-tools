import { expect, describe, it } from 'vitest';
import { UnixDateConverter } from './service';
import InitialValuesType from './types';

const createOptions = (
  overrides: Partial<InitialValuesType> = {}
): InitialValuesType => ({
  mode: 'unix-to-date',
  withLabel: true,
  useLocalTime: false,
  ...overrides
});

describe('UnixDateConverter', () => {
  it('should convert a single Unix timestamp with label (UTC)', () => {
    const input = '0';
    const result = UnixDateConverter(input, createOptions());
    expect(result).toBe('1970-01-01 00:00:00.000 UTC');
  });

  it('should convert a single Unix timestamp without label (UTC)', () => {
    const input = '1234567890';
    const result = UnixDateConverter(
      input,
      createOptions({ withLabel: false })
    );
    expect(result).toBe('2009-02-13 23:31:30.000');
  });

  it('should convert a single Unix timestamp in local time', () => {
    const input = '1234567890';
    const result = UnixDateConverter(
      input,
      createOptions({ useLocalTime: true })
    );
    expect(result.endsWith('UTC')).toBe(false);
  });

  it('should handle multiple lines with label (UTC)', () => {
    const input = '0\n2147483647';
    const result = UnixDateConverter(input, createOptions());
    expect(result).toBe(
      '1970-01-01 00:00:00.000 UTC\n2038-01-19 03:14:07.000 UTC'
    );
  });

  it('should handle multiple lines with local time', () => {
    const input = '1672531199\n1721287227';
    const result = UnixDateConverter(
      input,
      createOptions({
        withLabel: false,
        useLocalTime: true
      })
    );
    const lines = result.split('\n');
    expect(lines.length).toBe(2);
    expect(lines[0].endsWith('UTC')).toBe(false);
  });

  it('should return empty string for invalid input', () => {
    const input = 'not_a_number';
    const result = UnixDateConverter(input, createOptions());
    expect(result).toBe('');
  });

  it('should return empty string for empty input', () => {
    const input = '';
    const result = UnixDateConverter(
      input,
      createOptions({ withLabel: false })
    );
    expect(result).toBe('');
  });

  it('should ignore invalid lines in multiline input', () => {
    const input = 'abc\n1600000000';
    const result = UnixDateConverter(input, createOptions());
    expect(result).toBe('\n2020-09-13 12:26:40.000 UTC');
  });
});
