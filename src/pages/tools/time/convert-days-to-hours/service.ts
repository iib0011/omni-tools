import { containsOnlyDigits } from '@utils/string';

function compute(input: string) {
  if (!containsOnlyDigits(input)) {
    return '';
  }
  const days = parseFloat(input);
  const hours = days * 24;
  return hours;
}

export function convertDaysToHours(input: string, hoursFlag: boolean): string {
  const result: string[] = [];

  const lines = input.split('\n');

  lines.forEach((line) => {
    const parts = line.split(' ');
    const days = parts[0]; // Extract the number before the space
    const hours = compute(days);
    result.push(hoursFlag ? `${hours} hours` : `${hours}`);
  });

  return result.join('\n');
}
