import { containsOnlyDigits } from '@utils/string';

function compute(seconds: string, paddingFlag: boolean): string {
  if (!containsOnlyDigits(seconds)) {
    return '';
  }
  const hours = Math.floor(Number(seconds) / 3600);
  const minutes = Math.floor((Number(seconds) % 3600) / 60);
  const secs = Number(seconds) % 60;
  return paddingFlag
    ? [hours, minutes, secs]
        .map((unit) => String(unit).padStart(2, '0')) // Ensures two-digit format
        .join(':')
    : [hours, minutes, secs].join(':');
}

export function convertSecondsToTime(
  input: string,
  paddingFlag: boolean
): string {
  const result: string[] = [];

  const lines = input.split('\n');

  lines.forEach((line) => {
    const seconds = line.trim();
    const time = compute(seconds, paddingFlag);
    result.push(time);
  });

  return result.join('\n');
}
