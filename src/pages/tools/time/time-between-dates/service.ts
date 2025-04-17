import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import duration from 'dayjs/plugin/duration';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);

export const unitHierarchy = [
  'years',
  'months',
  'days',
  'hours',
  'minutes',
  'seconds',
  'milliseconds'
] as const;

export type TimeUnit = (typeof unitHierarchy)[number];
export type TimeDifference = Record<TimeUnit, number>;

// Mapping common abbreviations to IANA time zone names
export const tzMap: { [abbr: string]: string } = {
  EST: 'America/New_York',
  EDT: 'America/New_York',
  CST: 'America/Chicago',
  CDT: 'America/Chicago',
  MST: 'America/Denver',
  MDT: 'America/Denver',
  PST: 'America/Los_Angeles',
  PDT: 'America/Los_Angeles',
  GMT: 'Etc/GMT',
  UTC: 'Etc/UTC'
  // add more mappings as needed
};

// Parse a date string with a time zone abbreviation,
// e.g. "02/02/2024 14:55 EST"
export const parseWithTZ = (dateTimeStr: string): dayjs.Dayjs => {
  const parts = dateTimeStr.trim().split(' ');
  const tzAbbr = parts.pop()!; // extract the timezone part (e.g., EST)
  const dateTimePart = parts.join(' ');
  const tzName = tzMap[tzAbbr];
  if (!tzName) {
    throw new Error(`Timezone abbreviation ${tzAbbr} not supported`);
  }
  // Parse using the format "MM/DD/YYYY HH:mm" in the given time zone
  return dayjs.tz(dateTimePart, 'MM/DD/YYYY HH:mm', tzName);
};

export const calculateTimeBetweenDates = (
  startDate: Date,
  endDate: Date
): TimeDifference => {
  let start = dayjs(startDate);
  let end = dayjs(endDate);

  // Swap dates if start is after end
  if (end.isBefore(start)) {
    [start, end] = [end, start];
  }

  // Calculate each unit incrementally so that the remainder is applied for subsequent units.
  const years = end.diff(start, 'year');
  const startPlusYears = start.add(years, 'year');

  const months = end.diff(startPlusYears, 'month');
  const startPlusMonths = startPlusYears.add(months, 'month');

  const days = end.diff(startPlusMonths, 'day');
  const startPlusDays = startPlusMonths.add(days, 'day');

  const hours = end.diff(startPlusDays, 'hour');
  const startPlusHours = startPlusDays.add(hours, 'hour');

  const minutes = end.diff(startPlusHours, 'minute');
  const startPlusMinutes = startPlusHours.add(minutes, 'minute');

  const seconds = end.diff(startPlusMinutes, 'second');
  const startPlusSeconds = startPlusMinutes.add(seconds, 'second');

  const milliseconds = end.diff(startPlusSeconds, 'millisecond');

  return {
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
    milliseconds
  };
};

// Calculate duration between two date strings with timezone abbreviations
export const getDuration = (
  startStr: string,
  endStr: string
): TimeDifference => {
  const start = parseWithTZ(startStr);
  const end = parseWithTZ(endStr);

  if (end.isBefore(start)) {
    throw new Error('End date must be after start date');
  }

  return calculateTimeBetweenDates(start.toDate(), end.toDate());
};

export const formatTimeDifference = (
  difference: TimeDifference,
  includeUnits: TimeUnit[] = unitHierarchy.slice(0, -2)
): string => {
  // First normalize the values (convert 24 hours to 1 day, etc.)
  const normalized = { ...difference };

  // Convert milliseconds to seconds
  if (normalized.milliseconds >= 1000) {
    const additionalSeconds = Math.floor(normalized.milliseconds / 1000);
    normalized.seconds += additionalSeconds;
    normalized.milliseconds %= 1000;
  }

  // Convert seconds to minutes
  if (normalized.seconds >= 60) {
    const additionalMinutes = Math.floor(normalized.seconds / 60);
    normalized.minutes += additionalMinutes;
    normalized.seconds %= 60;
  }

  // Convert minutes to hours
  if (normalized.minutes >= 60) {
    const additionalHours = Math.floor(normalized.minutes / 60);
    normalized.hours += additionalHours;
    normalized.minutes %= 60;
  }

  // Convert hours to days if 24 or more
  if (normalized.hours >= 24) {
    const additionalDays = Math.floor(normalized.hours / 24);
    normalized.days += additionalDays;
    normalized.hours %= 24;
  }

  const timeUnits: { key: TimeUnit; value: number; label: string }[] = [
    { key: 'years', value: normalized.years, label: 'year' },
    { key: 'months', value: normalized.months, label: 'month' },
    { key: 'days', value: normalized.days, label: 'day' },
    { key: 'hours', value: normalized.hours, label: 'hour' },
    { key: 'minutes', value: normalized.minutes, label: 'minute' },
    { key: 'seconds', value: normalized.seconds, label: 'second' },
    {
      key: 'milliseconds',
      value: normalized.milliseconds,
      label: 'millisecond'
    }
  ];

  const parts = timeUnits
    .filter(({ key }) => includeUnits.includes(key))
    .map(({ value, label }) => {
      if (value === 0) return '';
      return `${value} ${label}${value === 1 ? '' : 's'}`;
    })
    .filter(Boolean);

  if (parts.length === 0) {
    return '0 minutes';
  }

  return parts.join(', ');
};

export const getTimeWithTimezone = (
  dateString: string,
  timeString: string,
  timezone: string
): Date => {
  // If timezone is "local", return the local date
  if (timezone === 'local') {
    const dateTimeString = `${dateString}T${timeString}`;
    return dayjs(dateTimeString).toDate();
  }

  // Check if the timezone is a known abbreviation
  if (tzMap[timezone]) {
    const dateTimeString = `${dateString} ${timeString}`;
    return dayjs
      .tz(dateTimeString, 'YYYY-MM-DD HH:mm', tzMap[timezone])
      .toDate();
  }

  // Handle GMT+/- format
  const match = timezone.match(/^GMT(?:([+-]\d{1,2})(?::(\d{2}))?)?$/);
  if (!match) {
    throw new Error('Invalid timezone format');
  }

  const dateTimeString = `${dateString}T${timeString}Z`;
  const utcDate = dayjs.utc(dateTimeString);

  if (!utcDate.isValid()) {
    throw new Error('Invalid date or time format');
  }

  const offsetHours = match[1] ? parseInt(match[1], 10) : 0;
  const offsetMinutes = match[2] ? parseInt(match[2], 10) : 0;
  const totalOffsetMinutes =
    offsetHours * 60 + (offsetHours < 0 ? -offsetMinutes : offsetMinutes);

  return utcDate.subtract(totalOffsetMinutes, 'minute').toDate();
};

export const formatTimeWithLargestUnit = (
  difference: TimeDifference,
  largestUnit: TimeUnit
): string => {
  const largestUnitIndex = unitHierarchy.indexOf(largestUnit);
  const unitsToInclude = unitHierarchy.slice(
    largestUnitIndex,
    unitHierarchy.length // Include milliseconds if it's the largest unit requested
  );
  return formatTimeDifference(difference, unitsToInclude);
};
