import { containsOnlyDigits } from '@utils/string';

function compute(
  timeArray: string[],
  lineNumber: number,
  onlySeconds: boolean,
  zeroPrint: boolean,
  zeroPadding: boolean
): string {
  if (timeArray[0] == '') {
    return '';
  }
  if (timeArray.length > 3) {
    throw new Error(`Time contains more than 3 parts on line ${lineNumber}`);
  }
  [...timeArray, '0', '0'].forEach((time, index) => {
    if (!containsOnlyDigits(time)) {
      throw new Error(
        `Time doesn't contain valid ${
          ['hours', 'minutes', 'seconds'][index]
        } on line ${lineNumber}`
      );
    }
  });

  const slicedArray = onlySeconds
    ? timeArray.slice(0, 2)
    : timeArray.slice(0, 1);

  if (zeroPrint) {
    onlySeconds ? slicedArray.push('0') : slicedArray.push('0', '0');
  }

  return zeroPadding
    ? slicedArray
        .map((unit) => String(unit).padStart(2, '0')) // Ensures two-digit format
        .join(':')
    : slicedArray.join(':');
}

export function truncateClockTime(
  input: string,
  onlySeconds: boolean,
  zeroPrint: boolean,
  zeroPadding: boolean
): string {
  const result: string[] = [];

  const lines = input.split('\n');

  lines.forEach((line, index) => {
    const timeArray = line.split(':');
    const truncatedTime = compute(
      timeArray,
      index + 1,
      onlySeconds,
      zeroPrint,
      zeroPadding
    );
    result.push(truncatedTime);
  });

  return result.join('\n');
}
