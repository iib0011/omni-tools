import { describe, expect, it } from 'vitest';
import {
  DATE_WEEKDAY_ERRORS,
  findMatchingYears,
  formatMatchingYearsResult,
  parseAndFindMatchingYears
} from './service';

describe('date-weekday-calculator', () => {
  it('finds multiple matching years for a normal date', () => {
    const result = findMatchingYears({
      month: 7,
      day: 23,
      weekday: 'friday',
      startYear: 2000,
      endYear: 2050
    });

    expect(result.count).toBe(7);
    expect(result.matches.map((match) => match.year)).toEqual([
      2004, 2010, 2021, 2027, 2032, 2038, 2049
    ]);
    expect(result.matches[2]?.formatted).toBe('Friday, July 23, 2021');
    expect(result.matches[2]?.date).toBeInstanceOf(Date);
  });

  it('includes February 29 only in leap years that match the weekday', () => {
    const result = findMatchingYears({
      month: 2,
      day: 29,
      weekday: 'monday',
      startYear: 2000,
      endYear: 2100
    });

    expect(result.matches.map((match) => match.year)).toEqual([
      2016, 2044, 2072
    ]);
    expect(result.matches[0]?.formatted).toBe('Monday, February 29, 2016');
  });

  it('rejects invalid dates like April 31', () => {
    expect(() =>
      findMatchingYears({
        month: 4,
        day: 31,
        weekday: 'monday',
        startYear: 2000,
        endYear: 2050
      })
    ).toThrow(DATE_WEEKDAY_ERRORS.INVALID_DATE);
  });

  it('returns empty results when nothing matches', () => {
    const result = findMatchingYears({
      month: 7,
      day: 23,
      weekday: 'friday',
      startYear: 2022,
      endYear: 2022
    });

    expect(result.count).toBe(0);
    expect(result.matches).toEqual([]);
    expect(formatMatchingYearsResult(result)).toBe(
      'No matching years found in the selected range.'
    );
  });

  it('rejects invalid year ranges', () => {
    expect(() =>
      findMatchingYears({
        month: 7,
        day: 23,
        weekday: 'friday',
        startYear: 2050,
        endYear: 2000
      })
    ).toThrow(DATE_WEEKDAY_ERRORS.INVALID_YEAR_RANGE);
  });

  it('rejects years outside 1–9999', () => {
    expect(() =>
      findMatchingYears({
        month: 7,
        day: 23,
        weekday: 'friday',
        startYear: 0,
        endYear: 2000
      })
    ).toThrow(DATE_WEEKDAY_ERRORS.INVALID_YEAR);

    expect(() =>
      findMatchingYears({
        month: 7,
        day: 23,
        weekday: 'friday',
        startYear: 2000,
        endYear: 10000
      })
    ).toThrow(DATE_WEEKDAY_ERRORS.INVALID_YEAR);
  });

  it('handles boundary years when start equals end', () => {
    const match = findMatchingYears({
      month: 7,
      day: 23,
      weekday: 'friday',
      startYear: 2021,
      endYear: 2021
    });
    expect(match.count).toBe(1);
    expect(match.matches[0]?.year).toBe(2021);

    const miss = findMatchingYears({
      month: 7,
      day: 23,
      weekday: 'friday',
      startYear: 2022,
      endYear: 2022
    });
    expect(miss.count).toBe(0);
  });

  it('handles years below 100 without the Date 1900-offset', () => {
    const result = findMatchingYears({
      month: 1,
      day: 1,
      weekday: 'saturday',
      startYear: 50,
      endYear: 50
    });

    expect(result.matches.map((match) => match.year)).toEqual([50]);
    expect(result.matches[0]?.date.getFullYear()).toBe(50);
  });

  it('handles the far end of the supported range', () => {
    const result = findMatchingYears({
      month: 12,
      day: 31,
      weekday: 'friday',
      startYear: 9999,
      endYear: 9999
    });

    expect(result.count).toBe(1);
    expect(result.matches[0]?.year).toBe(9999);
  });

  it('rejects empty string inputs when parsing', () => {
    expect(() =>
      parseAndFindMatchingYears({
        month: '7',
        day: '23',
        weekday: 'friday',
        startYear: '',
        endYear: '2050'
      })
    ).toThrow(DATE_WEEKDAY_ERRORS.EMPTY_INPUT);
  });

  it('rejects non-integer numeric strings when parsing', () => {
    expect(() =>
      parseAndFindMatchingYears({
        month: '7.5',
        day: '23',
        weekday: 'friday',
        startYear: '2000',
        endYear: '2050'
      })
    ).toThrow(DATE_WEEKDAY_ERRORS.EMPTY_INPUT);
  });

  it('formats a summary with matching years', () => {
    const result = findMatchingYears({
      month: 7,
      day: 23,
      weekday: 'friday',
      startYear: 2021,
      endYear: 2027
    });

    expect(formatMatchingYearsResult(result)).toBe(
      'Found 2 matching years\n\nFriday, July 23, 2021\nFriday, July 23, 2027'
    );
  });

  it('formats a singular summary for one match', () => {
    const result = findMatchingYears({
      month: 7,
      day: 23,
      weekday: 'friday',
      startYear: 2021,
      endYear: 2021
    });

    expect(formatMatchingYearsResult(result)).toBe(
      'Found 1 matching year\n\nFriday, July 23, 2021'
    );
  });
});
