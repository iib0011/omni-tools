type TimeUnit =
  | 'milliseconds'
  | 'seconds'
  | 'minutes'
  | 'hours'
  | 'days'
  | 'months'
  | 'years';

interface TimeDifference {
  milliseconds: number;
  seconds: number;
  minutes: number;
  hours: number;
  days: number;
  months: number;
  years: number;
}

export const calculateTimeBetweenDates = (
  startDate: Date,
  endDate: Date,
  unit: TimeUnit = 'milliseconds'
): TimeDifference | number => {
  // Ensure endDate is after startDate
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

  // If specific unit requested, return just that value
  if (unit !== 'milliseconds') {
    return { milliseconds, seconds, minutes, hours, days, months, years }[unit];
  }

  // Otherwise return the complete breakdown
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
  includeUnits: TimeUnit[] = [
    'years',
    'months',
    'days',
    'hours',
    'minutes',
    'seconds'
  ]
): string => {
  const parts: string[] = [];

  if (includeUnits.includes('years') && difference.years > 0) {
    parts.push(
      `${difference.years} ${difference.years === 1 ? 'year' : 'years'}`
    );
  }

  if (includeUnits.includes('months') && difference.months % 12 > 0) {
    const remainingMonths = difference.months % 12;
    parts.push(
      `${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`
    );
  }

  if (includeUnits.includes('days') && difference.days % 30 > 0) {
    const remainingDays = difference.days % 30;
    parts.push(`${remainingDays} ${remainingDays === 1 ? 'day' : 'days'}`);
  }

  if (includeUnits.includes('hours') && difference.hours % 24 > 0) {
    const remainingHours = difference.hours % 24;
    parts.push(`${remainingHours} ${remainingHours === 1 ? 'hour' : 'hours'}`);
  }

  if (includeUnits.includes('minutes') && difference.minutes % 60 > 0) {
    const remainingMinutes = difference.minutes % 60;
    parts.push(
      `${remainingMinutes} ${remainingMinutes === 1 ? 'minute' : 'minutes'}`
    );
  }

  if (includeUnits.includes('seconds') && difference.seconds % 60 > 0) {
    const remainingSeconds = difference.seconds % 60;
    parts.push(
      `${remainingSeconds} ${remainingSeconds === 1 ? 'second' : 'seconds'}`
    );
  }

  if (parts.length === 0) {
    if (includeUnits.includes('milliseconds')) {
      parts.push(
        `${difference.milliseconds} ${
          difference.milliseconds === 1 ? 'millisecond' : 'milliseconds'
        }`
      );
    } else {
      parts.push('0 seconds');
    }
  }

  return parts.join(', ');
};

export const getTimeWithTimezone = (
  dateString: string,
  timeString: string,
  timezone: string
): Date => {
  // Combine date and time
  const dateTimeString = `${dateString}T${timeString}`;

  // Create a date object in the local timezone
  const dateObject = new Date(dateTimeString);

  // If timezone is provided, adjust the date
  if (timezone && timezone !== 'local') {
    // Create date string with the timezone identifier
    const dateWithTimezone = new Date(
      dateTimeString + timezone.replace('GMT', '')
    );
    return dateWithTimezone;
  }

  return dateObject;
};
