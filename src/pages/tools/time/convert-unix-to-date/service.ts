import { containsOnlyDigits } from '@utils/string';

export function convertString(
  input: string,
  mode: string,
  useLocalTime: boolean,
  withLabel: boolean
): string {
  if (mode === 'unix-to-date') {
    return convertUnixToDate(input, withLabel, useLocalTime);
  } else {
    return convertDateToUnix(input, useLocalTime);
  }
}

// Unix to Date
function computeUnixToDate(input: string, useLocalTime: boolean): string {
  if (!containsOnlyDigits(input)) {
    return '';
  }
  const timestamp = parseInt(input, 10);
  const date = new Date(timestamp * 1000); // Convert from seconds to milliseconds

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

function convertUnixToDate(
  input: string,
  withLabel: boolean,
  useLocalTime: boolean
): string {
  const result: string[] = [];

  const lines = input.split('\n');

  lines.forEach((line) => {
    const parts = line.split(' ');
    const timestamp = parts[0];
    const formattedDate = computeUnixToDate(timestamp, useLocalTime);

    const label = !useLocalTime && withLabel ? ' UTC' : '';
    result.push(formattedDate ? `${formattedDate}${label}` : '');
  });

  return result.join('\n');
}

// Date to Unix
function computeDateToUnix(input: string, useLocalTime: boolean): string {
  try {
    // Extract Data
    const splitInput = input.split(' ');
    const timeFrame = splitInput[0] + ' ' + splitInput[1];
    const utcOffset = splitInput.length > 2 ? splitInput[2] : null;

    // Convert into Unix (This Has The Local Offset)
    const localUnixValue: number = Date.parse(timeFrame) / 1000;

    // Unsuccesful Conversion
    if (isNaN(localUnixValue)) {
      return 'Invalid Date Time';
    }

    // Case 1: Base Scenario (Assume Time with GMT +00)
    if (!useLocalTime && !utcOffset) {
      const processedDateTime = convertToGMTZero(localUnixValue);
      return `${processedDateTime}`;
    }

    // Case 2: Time Given with Custom Offset
    if (!useLocalTime && utcOffset) {
      // Verify Offset (-12:00 to +14.00 in 15 Minute Intervals)
      const regexMatch = utcOffset.match(/^[+-](0\d|1[0-4]):(00|15|30|45)$/);

      // Invalid Regex
      if (!regexMatch) {
        return 'Invalid Date Time';
      }

      // Variables to Be Processed
      const hours = Number(regexMatch[1]);
      const minutes = Number(regexMatch[2]) + hours * 60;
      const offset = minutes * 60;

      // Remove The Offset to The Time (Opposite of First Symbol - If Input Time is +08:00 Then We Need to Deduct by 8 Hours)
      const processedDateTime = convertToGMTZero(localUnixValue) - offset;
      return `${processedDateTime}`;
    }

    // Case 3: Local (Time Given is Local Time)
    if (useLocalTime) {
      return `${localUnixValue}`;
    }
  } catch (err) {
    // Not Using Local Time (Either UTC is Given or Assume +00)
    console.log('Error', err);
    return 'Invalid Date Time';
  }
}

function convertToGMTZero(localUnixValue: number): number {
  // Get A Reference Object
  const refTimeDate = new Date();
  const offsetMinutes = refTimeDate.getTimezoneOffset();

  // Remove the Offset
  const processedDateTime = localUnixValue - offsetMinutes * 60;
  return processedDateTime;
}

function convertDateToUnix(input: string, useLocalTime: boolean): string {
  // Empty Input
  if (!input) return '';

  const result: string[] = [];
  const lines = input.split('\n');

  // Process Input Lines
  lines.forEach((line) => {
    const formattedDate = computeDateToUnix(line, useLocalTime);
    result.push(formattedDate);
  });

  return result.join('\n');
}
