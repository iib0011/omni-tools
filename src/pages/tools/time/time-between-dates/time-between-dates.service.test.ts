import { describe, expect, it } from 'vitest';
import {
  calculateTimeBetweenDates,
  formatTimeDifference,
  formatTimeWithLargestUnit,
  getTimeWithTimezone
} from './service';

// Utility function to create a date
const createDate = (
  year: number,
  month: number,
  day: number,
  hours = 0,
  minutes = 0,
  seconds = 0
) => new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
describe('calculateTimeBetweenDates', () => {
  it('should calculate the correct time difference', () => {
    const startDate = createDate(2023, 1, 1);
    const endDate = createDate(2024, 1, 1);
    const result = calculateTimeBetweenDates(startDate, endDate);

    expect(result.years).toBe(1);
    expect(result.months).toBe(12);
    expect(result.days).toBeGreaterThanOrEqual(365);
  });

  it('should swap dates if startDate is after endDate', () => {
    const startDate = createDate(2024, 1, 1);
    const endDate = createDate(2023, 1, 1);
    const result = calculateTimeBetweenDates(startDate, endDate);
    expect(result.years).toBe(1);
  });
});

describe('formatTimeDifference', () => {
  it('should format time difference correctly', () => {
    const difference = {
      years: 1,
      months: 2,
      days: 10,
      hours: 5,
      minutes: 30,
      seconds: 0,
      milliseconds: 0
    };
    expect(formatTimeDifference(difference)).toBe(
      '1 years, 2 months, 10 days, 5 hours, 30 minutes'
    );
  });

  it('should return 0 seconds if all values are zero', () => {
    expect(
      formatTimeDifference({
        years: 0,
        months: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: 0
      })
    ).toBe('0 seconds');
  });
});

describe('getTimeWithTimezone', () => {
  it('should convert UTC date to specified timezone', () => {
    const date = getTimeWithTimezone('2025-03-27', '12:00:00', 'GMT+2');
    expect(date.getUTCHours()).toBe(10); // 12:00 GMT+2 is 10:00 UTC
  });

  it('should throw error for invalid timezone', () => {
    expect(() =>
      getTimeWithTimezone('2025-03-27', '12:00:00', 'INVALID')
    ).toThrow('Invalid timezone format');
  });
});

describe('formatTimeWithLargestUnit', () => {
  it('should format time with the largest unit', () => {
    const difference = {
      years: 0,
      months: 1,
      days: 15,
      hours: 12,
      minutes: 0,
      seconds: 0,
      milliseconds: 0
    };
    expect(formatTimeWithLargestUnit(difference, 'days')).toContain(
      '15 days, 12 hours'
    );
  });
});
