import { expect, describe, it } from 'vitest';
import { epochToDate, dateToEpoch, main } from './service';

describe('epoch-converter service', () => {
  it('converts epoch (seconds) to date', () => {
    expect(epochToDate('1609459200')).toBe('Fri, 01 Jan 2021 00:00:00 GMT');
  });
  it('converts epoch (milliseconds) to date', () => {
    expect(epochToDate('1609459200000')).toBe('Fri, 01 Jan 2021 00:00:00 GMT');
  });
  it('returns error for invalid epoch', () => {
    expect(epochToDate('notanumber')).toMatch(/Invalid epoch/);
  });
  it('converts date string to epoch', () => {
    expect(dateToEpoch('2021-01-01T00:00:00Z')).toBe('1609459200');
  });
  it('returns error for invalid date string', () => {
    expect(dateToEpoch('notadate')).toMatch(/Invalid date/);
  });
  it('main: detects and converts epoch', () => {
    expect(main('1609459200', {})).toBe('Fri, 01 Jan 2021 00:00:00 GMT');
  });
  it('main: detects and converts date', () => {
    expect(main('2021-01-01T00:00:00Z', {})).toBe('1609459200');
  });
  it('main: returns error for invalid input', () => {
    expect(main('notadate', {})).toMatch(/Invalid date/);
    expect(main('notanumber', {})).toMatch(/Invalid date/);
  });
});
