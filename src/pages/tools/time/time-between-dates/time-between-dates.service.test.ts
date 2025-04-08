import { describe, expect, it } from 'vitest';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import duration from 'dayjs/plugin/duration';
import {
  calculateTimeBetweenDates,
  formatTimeDifference,
  formatTimeWithLargestUnit,
  getTimeWithTimezone
} from './service';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);

// Utility function to create a date
const createDate = (
  year: number,
  month: number,
  day: number,
  hours = 0,
  minutes = 0
) => dayjs.utc(Date.UTC(year, month - 1, day, hours, minutes)).toDate();

describe('calculateTimeBetweenDates', () => {
  it('should calculate exactly 1 year difference', () => {
    const startDate = createDate(2023, 1, 1);
    const endDate = createDate(2024, 1, 1);
    const result = calculateTimeBetweenDates(startDate, endDate);

    expect(result.years).toBe(1);
    expect(result.months).toBe(0);
    expect(result.days).toBe(0);
    expect(result.hours).toBe(0);
    expect(result.minutes).toBe(0);
  });

  it('should calculate 1 year and 1 day difference', () => {
    const startDate = createDate(2023, 1, 1);
    const endDate = createDate(2024, 1, 2);
    const result = calculateTimeBetweenDates(startDate, endDate);

    expect(result.years).toBe(1);
    expect(result.months).toBe(0);
    expect(result.days).toBe(1);
    expect(result.hours).toBe(0);
    expect(result.minutes).toBe(0);
  });

  it('should handle leap year correctly', () => {
    const startDate = createDate(2024, 2, 28); // February 28th in leap year
    const endDate = createDate(2024, 3, 1); // March 1st
    const result = calculateTimeBetweenDates(startDate, endDate);

    expect(result.days).toBe(2);
    expect(result.months).toBe(0);
    expect(result.years).toBe(0);
    expect(result.hours).toBe(0);
    expect(result.minutes).toBe(0);
  });

  it('should swap dates if startDate is after endDate', () => {
    const startDate = createDate(2024, 1, 1);
    const endDate = createDate(2023, 1, 1);
    const result = calculateTimeBetweenDates(startDate, endDate);

    expect(result.years).toBe(1);
    expect(result.months).toBe(0);
    expect(result.days).toBe(0);
    expect(result.hours).toBe(0);
    expect(result.minutes).toBe(0);
  });

  it('should handle same day different hours', () => {
    const startDate = createDate(2024, 1, 1, 10);
    const endDate = createDate(2024, 1, 1, 15);
    const result = calculateTimeBetweenDates(startDate, endDate);

    expect(result.years).toBe(0);
    expect(result.months).toBe(0);
    expect(result.days).toBe(0);
    expect(result.hours).toBe(5);
    expect(result.minutes).toBe(0);
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
      '1 year, 2 months, 10 days, 5 hours, 30 minutes'
    );
  });

  it('should handle singular units correctly', () => {
    const difference = {
      years: 1,
      months: 1,
      days: 1,
      hours: 1,
      minutes: 1,
      seconds: 0,
      milliseconds: 0
    };
    expect(formatTimeDifference(difference)).toBe(
      '1 year, 1 month, 1 day, 1 hour, 1 minute'
    );
  });

  it('should return 0 minutes if all values are zero', () => {
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
    ).toBe('0 minutes');
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
      minutes: 30,
      seconds: 0,
      milliseconds: 0
    };
    expect(formatTimeWithLargestUnit(difference, 'days')).toBe(
      '15 days, 12 hours, 30 minutes'
    );
  });
});
