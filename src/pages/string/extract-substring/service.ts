import { reverseString } from 'utils/string';

export function extractSubstring(
  input: string,
  start: number,
  length: number,
  multiLine: boolean,
  reverse: boolean
): string {
  if (!input) return '';
  // edge Cases
  if (start <= 0) throw new Error('Start index must be greater than zero.');
  if (length < 0)
    throw new Error('Length value must be greater than or equal to zero.');
  if (length === 0) return '';

  let array: string[];
  let result: string[] = [];

  const extract = (str: string, start: number, length: number): string => {
    const end = start - 1 + length;
    if (start - 1 >= str.length) return '';
    return str.substring(start - 1, Math.min(end, str.length));
  };

  if (!multiLine) {
    result.push(extract(input, start, length));
  } else {
    array = input.split('\n');
    for (const word of array) {
      result.push(extract(word, start, length));
    }
  }
  result = reverse ? result.map((word) => reverseString(word)) : result;
  return result.join('\n');
}
