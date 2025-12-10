import { InitialValuesType } from './types';
import { humanTimeValidation } from 'utils/time';

export function convertTimeToDecimal(
  input: string,
  options: InitialValuesType
): string {
  if (!input) return '';

  const dp = parseInt(options.decimalPlaces, 10);
  if (isNaN(dp) || dp < 0) {
    return 'Invalid decimal places value.';
  }

  // Multiple lines processing
  const lines = input.split('\n');
  if (!lines) return '';

  const result: string[] = [];

  lines.forEach((line) => {
    line = line.trim();
    if (!line) return;

    const { isValid, hours, minutes, seconds } = humanTimeValidation(line);

    if (!isValid) {
      result.push('Incorrect input format use `HH:MM:(SS)` or `HH.MM.(SS )`.');
      return;
    }

    const decimalTime = hours + minutes / 60 + seconds / 3600;
    result.push(decimalTime.toFixed(dp).toString());
  });

  return result.join('\n');
}
