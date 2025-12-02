import { InitialValuesType } from './types';

export function convertTimeToDecimal(
  input: string,
  options: InitialValuesType
): string {
  if (!input || (!input.includes(':') && !input.includes('.'))) {
    return '';
  }

  let splitTime = input.split(/[.:]/);

  let hours = parseInt(splitTime[0]);
  let minutes = parseInt(splitTime[1]);
  let seconds = splitTime[2] ? parseInt(splitTime[2]) : 0;

  let decimalTime = hours + minutes / 60;

  if (seconds !== 0) {
    decimalTime += seconds / 3600;
  }

  return decimalTime.toFixed(parseInt(options.decimalPlaces)).toString();
}
