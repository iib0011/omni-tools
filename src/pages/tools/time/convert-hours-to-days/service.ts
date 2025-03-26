import { containsOnlyDigits } from '@utils/string';

function compute(input: string, accuracy: number) {
  if (!containsOnlyDigits(input)) {
    return '';
  }
  const hours = parseFloat(input);
  const days = (hours / 24).toFixed(accuracy);
  return parseFloat(days);
}

export function convertHoursToDays(
  input: string,
  accuracy: string,
  daysFlag: boolean
): string {
  if (!containsOnlyDigits(accuracy)) {
    throw new Error('Accuracy contains non digits.');
  }

  const result: string[] = [];

  const lines = input.split('\n');

  lines.forEach((line) => {
    const parts = line.split(' ');
    const hours = parts[0]; // Extract the number before the space
    const days = compute(hours, Number(accuracy));
    result.push(daysFlag ? `${days} days` : `${days}`);
  });

  return result.join('\n');
}
