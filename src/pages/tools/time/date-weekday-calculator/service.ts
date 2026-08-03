import dayjs from 'dayjs';
import {
  FindMatchingYearsInput,
  FindMatchingYearsResult,
  MatchingYear,
  Weekday
} from './types';

export const DATE_WEEKDAY_ERRORS = {
  INVALID_MONTH: 'Month must be between 1 and 12',
  INVALID_DAY: 'Day must be between 1 and 31',
  INVALID_DATE: 'Invalid day for the selected month',
  INVALID_WEEKDAY: 'Invalid weekday',
  INVALID_YEAR: 'Years must be integers between 1 and 9999',
  INVALID_YEAR_RANGE: 'Start year must be less than or equal to end year',
  EMPTY_INPUT: 'All fields are required'
} as const;

const WEEKDAY_TO_DAYJS: Record<Weekday, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6
};

/** Max valid day per month; February allows 29 (skipped in non-leap years). */
export const MAX_DAY_BY_MONTH = [
  31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31
];

const MIN_YEAR = 1;
const MAX_YEAR = 9999;

function isWeekday(value: string): value is Weekday {
  return value in WEEKDAY_TO_DAYJS;
}

function createDate(year: number, month: number, day: number): Date {
  const date = new Date(year, month - 1, day);
  // The Date constructor maps years 0-99 to 1900-1999, so set the year explicitly.
  date.setFullYear(year);
  return date;
}

/** False when the day overflowed into the next month, e.g. Feb 29 in a non-leap year. */
function dateExists(
  date: Date,
  year: number,
  month: number,
  day: number
): boolean {
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function findMatchingYears(
  input: FindMatchingYearsInput
): FindMatchingYearsResult {
  const { month, day, weekday, startYear, endYear } = input;

  if (
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(startYear) ||
    !Number.isFinite(endYear)
  ) {
    throw new Error(DATE_WEEKDAY_ERRORS.EMPTY_INPUT);
  }

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error(DATE_WEEKDAY_ERRORS.INVALID_MONTH);
  }

  if (!Number.isInteger(day) || day < 1 || day > 31) {
    throw new Error(DATE_WEEKDAY_ERRORS.INVALID_DAY);
  }

  if (day > MAX_DAY_BY_MONTH[month - 1]) {
    throw new Error(DATE_WEEKDAY_ERRORS.INVALID_DATE);
  }

  if (!isWeekday(weekday)) {
    throw new Error(DATE_WEEKDAY_ERRORS.INVALID_WEEKDAY);
  }

  if (
    !Number.isInteger(startYear) ||
    !Number.isInteger(endYear) ||
    startYear < MIN_YEAR ||
    endYear > MAX_YEAR ||
    startYear > MAX_YEAR ||
    endYear < MIN_YEAR
  ) {
    throw new Error(DATE_WEEKDAY_ERRORS.INVALID_YEAR);
  }

  if (startYear > endYear) {
    throw new Error(DATE_WEEKDAY_ERRORS.INVALID_YEAR_RANGE);
  }

  const targetWeekday = WEEKDAY_TO_DAYJS[weekday];
  const matches: MatchingYear[] = [];

  for (let year = startYear; year <= endYear; year += 1) {
    const date = createDate(year, month, day);

    if (
      !dateExists(date, year, month, day) ||
      date.getDay() !== targetWeekday
    ) {
      continue;
    }

    matches.push({
      year,
      date,
      formatted: dayjs(date).format('dddd, MMMM D, YYYY')
    });
  }

  return { matches, count: matches.length };
}

export type FormatMatchingYearsMessages = {
  noMatches: string;
  foundMatches: (count: number) => string;
};

export function formatMatchingYearsResult(
  result: FindMatchingYearsResult,
  messages: FormatMatchingYearsMessages = {
    noMatches: 'No matching years found in the selected range.',
    foundMatches: (count) =>
      count === 1 ? 'Found 1 matching year' : `Found ${count} matching years`
  }
): string {
  if (result.count === 0) {
    return messages.noMatches;
  }

  return `${messages.foundMatches(result.count)}\n\n${result.matches
    .map((match) => match.formatted)
    .join('\n')}`;
}

function parseRequiredInt(value: string): number {
  const trimmed = value.trim();
  if (trimmed === '') {
    throw new Error(DATE_WEEKDAY_ERRORS.EMPTY_INPUT);
  }
  if (!/^\d+$/.test(trimmed)) {
    throw new Error(DATE_WEEKDAY_ERRORS.EMPTY_INPUT);
  }
  return Number.parseInt(trimmed, 10);
}

export function parseAndFindMatchingYears(values: {
  month: string;
  day: string;
  weekday: string;
  startYear: string;
  endYear: string;
}): FindMatchingYearsResult {
  const weekday = values.weekday.trim();

  if (weekday === '') {
    throw new Error(DATE_WEEKDAY_ERRORS.EMPTY_INPUT);
  }

  return findMatchingYears({
    month: parseRequiredInt(values.month),
    day: parseRequiredInt(values.day),
    weekday: weekday as Weekday,
    startYear: parseRequiredInt(values.startYear),
    endYear: parseRequiredInt(values.endYear)
  });
}
