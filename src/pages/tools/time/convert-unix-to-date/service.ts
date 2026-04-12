import { containsOnlyDigits } from '@utils/string';
import InitialValuesType from './types';
import { parseDateInput } from '@utils/time';

// Unix to Date
function computeUnixToDate(input: string, useLocalTime: boolean): string {
  if (!containsOnlyDigits(input)) {
    return '';
  }

  if (input.length > 10) return 'ms not supported, divide by 1000';

  const timestamp = parseInt(input, 10);

  const date = new Date(timestamp * 1000); // Convert from seconds to milliseconds
  if (isNaN(date.getTime())) return '';

  if (useLocalTime) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } else {
    return date.toISOString().replace('T', ' ').replace('Z', '');
  }
}

// Date to Unix
function computeDateToUnix(input: string, useLocalTime: boolean): string {
  try {
    const { dateTime, utcOffset } = parseDateInput(input);
    const normalized = dateTime.includes(':')
      ? dateTime
      : `${dateTime}T00:00:00`;

    if (useLocalTime) {
      const localOffsetMinutes = new Date().getTimezoneOffset();
      const sign = localOffsetMinutes <= 0 ? '+' : '-';
      const absMinutes = Math.abs(localOffsetMinutes);
      const hh = String(Math.floor(absMinutes / 60)).padStart(2, '0');
      const mm = String(absMinutes % 60).padStart(2, '0');
      const unix = Date.parse(`${normalized}${sign}${hh}:${mm}`) / 1000;
      return isNaN(unix) ? '' : `${unix}`;
    }

    if (utcOffset) {
      const valid = utcOffset.match(/^[+-](0\d|1[0-4]):(00|15|30|45)$|^Z$/);
      if (!valid) return '';
      const unix =
        Date.parse(`${normalized}${utcOffset === 'Z' ? 'Z' : utcOffset}`) /
        1000;
      return isNaN(unix) ? '' : `${unix}`;
    }

    // Default: treat as UTC
    const unix = Date.parse(`${normalized}Z`) / 1000;
    return isNaN(unix) ? '' : `${unix}`;
  } catch {
    return '';
  }
}

export function UnixDateConverter(
  input: string,
  options: InitialValuesType
): string {
  if (!input) return '';

  const { mode, useLocalTime, withLabel } = options;

  const lines = input.split('\n');

  if (mode === 'unix-to-date') {
    const label = !useLocalTime && withLabel ? ' UTC' : '';
    return lines
      .map((line) => {
        const formattedDate = computeUnixToDate(line.trim(), useLocalTime);
        return formattedDate ? `${formattedDate}${label}` : '';
      })
      .join('\n');
  }

  return lines
    .map((line) => computeDateToUnix(line.trim(), useLocalTime))
    .join('\n');
}
