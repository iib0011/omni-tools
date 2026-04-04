import { containsOnlyDigits } from '@utils/string';

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

// Changing a Date Object Into Unix
function computeDatetoUnix(input: string, useLocalTime: boolean) {
  if (useLocalTime) {
    // Get User Time Zone
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log('Time Zone is ', timeZone);
  }

  // Not Using Local Time (Either UTC is Given or Assume +00)
}

export function convertUnixToDate(
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
