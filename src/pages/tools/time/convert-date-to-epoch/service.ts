import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(utc);
dayjs.extend(customParseFormat);

// Common date formats to try parsing
const DATE_FORMATS = [
  'YYYY-MM-DD HH:mm:ss',
  'YYYY-MM-DD HH:mm',
  'YYYY-MM-DD',
  'MM/DD/YYYY HH:mm:ss',
  'MM/DD/YYYY HH:mm',
  'MM/DD/YYYY',
  'DD/MM/YYYY HH:mm:ss',
  'DD/MM/YYYY HH:mm',
  'DD/MM/YYYY',
  'YYYY-MM-DDTHH:mm:ss.SSSZ', // ISO format
  'YYYY-MM-DDTHH:mm:ssZ',
  'YYYY-MM-DDTHH:mm:ss',
  'ddd MMM DD YYYY HH:mm:ss' // JavaScript date string format
];

function parseDate(dateString: string): dayjs.Dayjs | null {
  const trimmedInput = dateString.trim();

  if (!trimmedInput) {
    return null;
  }

  // First try to parse as a timestamp (if it's all digits)
  if (/^\d+$/.test(trimmedInput)) {
    const timestamp = parseInt(trimmedInput, 10);
    // Check if it's a valid timestamp (reasonable range)
    if (timestamp > 0 && timestamp < 4102444800) {
      // Up to year 2100
      return dayjs.unix(timestamp);
    }
  }

  // Try to parse with various formats
  for (const format of DATE_FORMATS) {
    const parsed = dayjs(trimmedInput, format, true);
    if (parsed.isValid()) {
      return parsed;
    }
  }

  // Try default dayjs parsing as fallback
  const defaultParsed = dayjs(trimmedInput);
  if (defaultParsed.isValid()) {
    return defaultParsed;
  }

  return null;
}

function convertSingleDateToEpoch(
  dateString: string,
  lineNumber: number
): string {
  if (dateString.trim() === '') {
    return '';
  }

  const parsedDate = parseDate(dateString);

  if (!parsedDate) {
    throw new Error(
      `Invalid date format on line ${lineNumber}: "${dateString}"`
    );
  }

  // Convert to UTC and get Unix timestamp
  return parsedDate.utc().unix().toString();
}

export function convertDateToEpoch(input: string): string {
  const result: string[] = [];
  const lines = input.split('\n');

  lines.forEach((line, index) => {
    const epoch = convertSingleDateToEpoch(line, index + 1);
    result.push(epoch);
  });

  return result.join('\n');
}
