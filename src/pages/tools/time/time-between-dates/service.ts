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

export const calculateTimeBetweenDates = (
  startDate: Date,
  endDate: Date
): TimeDifference => {
  if (endDate < startDate) {
    const temp = startDate;
    startDate = endDate;
    endDate = temp;
  }

  const milliseconds = endDate.getTime() - startDate.getTime();
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  // Approximate months and years
  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth();
  const endYear = endDate.getFullYear();
  const endMonth = endDate.getMonth();

  const months = (endYear - startYear) * 12 + (endMonth - startMonth);
  const years = Math.floor(months / 12);

  return {
    milliseconds,
    seconds,
    minutes,
    hours,
    days,
    months,
    years
  };
};

export const formatTimeDifference = (
  difference: TimeDifference,
  includeUnits: TimeUnit[] = unitHierarchy.slice(0, -1)
): string => {
  const timeUnits: { key: TimeUnit; value: number; divisor?: number }[] = [
    { key: 'years', value: difference.years },
    { key: 'months', value: difference.months, divisor: 12 },
    { key: 'days', value: difference.days, divisor: 30 },
    { key: 'hours', value: difference.hours, divisor: 24 },
    { key: 'minutes', value: difference.minutes, divisor: 60 },
    { key: 'seconds', value: difference.seconds, divisor: 60 }
  ];

  const parts = timeUnits
    .filter(({ key }) => includeUnits.includes(key))
    .map(({ key, value, divisor }) => {
      const remaining = divisor ? value % divisor : value;
      return remaining > 0 ? `${remaining} ${key}` : '';
    })
    .filter(Boolean);

  if (parts.length === 0) {
    if (includeUnits.includes('milliseconds')) {
      return `${difference.milliseconds} millisecond${
        difference.milliseconds === 1 ? '' : 's'
      }`;
    }
    return '0 seconds';
  }

  return parts.join(', ');
};

export const getTimeWithTimezone = (
  dateString: string,
  timeString: string,
  timezone: string
): Date => {
  // Combine date and time
  const dateTimeString = `${dateString}T${timeString}Z`; // Append 'Z' to enforce UTC parsing
  const utcDate = new Date(dateTimeString);

  if (isNaN(utcDate.getTime())) {
    throw new Error('Invalid date or time format');
  }

  // If timezone is "local", return the local date
  if (timezone === 'local') {
    return utcDate;
  }

  // Extract offset from timezone (e.g., "GMT+5:30" or "GMT-4")
  const match = timezone.match(/^GMT(?:([+-]\d{1,2})(?::(\d{2}))?)?$/);
  if (!match) {
    throw new Error('Invalid timezone format');
  }

  const offsetHours = match[1] ? parseInt(match[1], 10) : 0;
  const offsetMinutes = match[2] ? parseInt(match[2], 10) : 0;

  const totalOffsetMinutes =
    offsetHours * 60 + (offsetHours < 0 ? -offsetMinutes : offsetMinutes);

  // Adjust the UTC date by the timezone offset
  return new Date(utcDate.getTime() - totalOffsetMinutes * 60 * 1000);
};

// Helper function to format time based on largest unit
export const formatTimeWithLargestUnit = (
  difference: TimeDifference,
  largestUnit: TimeUnit
): string => {
  const conversionFactors: Record<TimeUnit, number> = {
    years: 365.2425, // Leap years considered
    months: 30.436875, // Average month length
    days: 24, // Hours per day
    hours: 60, // Minutes per hour
    minutes: 60, // Seconds per minute
    seconds: 1000, // Milliseconds per second
    milliseconds: 1
  };

  const largestUnitIndex = unitHierarchy.indexOf(largestUnit);
  const unitsToInclude = unitHierarchy.slice(largestUnitIndex);

  // Deep copy to avoid mutating original object
  const convertedDifference = { ...difference };

  let carryOver = 0;
  for (let i = 0; i < largestUnitIndex; i++) {
    const unit = unitHierarchy[i];
    const nextUnit = unitHierarchy[i + 1];

    if (nextUnit) {
      carryOver =
        (convertedDifference[unit] || 0) * (conversionFactors[unit] || 1);
      convertedDifference[nextUnit] =
        (convertedDifference[nextUnit] || 0) + carryOver;
      convertedDifference[unit] = 0;
    }
  }

  return formatTimeDifference(convertedDifference, unitsToInclude);
};
