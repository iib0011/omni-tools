import { containsOnlyDigits } from '@utils/string';

function recursiveTimeToSeconds(
  timeArray: string[],
  index: number = 0
): number {
  if (index >= timeArray.length) {
    return 0;
  }

  const multipliers = [3600, 60, 1];
  return (
    Number(timeArray[index]) * multipliers[index] +
    recursiveTimeToSeconds(timeArray, index + 1)
  );
}

function compute(timeArray: string[], lineNumber: number): string {
  if (timeArray[0] == '') {
    return '';
  }
  if (timeArray.length > 3) {
    throw new Error(`Time contains more than 3 parts on line ${lineNumber}`);
  }

  const normalizedArray = [...timeArray, '0', '0'];

  normalizedArray.forEach((time, index) => {
    if (!containsOnlyDigits(time)) {
      throw new Error(
        `Time doesn't contain valid ${
          ['hours', 'minutes', 'seconds'][index]
        } on line ${lineNumber}`
      );
    }
  });

  return recursiveTimeToSeconds(timeArray).toString();
}

export function convertTimetoSeconds(input: string): string {
  const result: string[] = [];

  const lines = input.split('\n');

  lines.forEach((line, index) => {
    const timeArray = line.split(':');
    const seconds = compute(timeArray, index + 1);
    result.push(seconds);
  });

  return result.join('\n');
}
