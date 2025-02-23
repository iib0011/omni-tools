import { reverseString } from 'utils/string';

export function stringReverser(
  input: string,
  multiLine: boolean,
  emptyItems: boolean,
  trim: boolean
) {
  let array: string[] = [];
  let result: string[] = [];

  // split the input in multiLine mode
  if (multiLine) {
    array = input.split('\n');
  } else {
    array.push(input);
  }

  // handle empty items
  if (emptyItems) {
    array = array.filter(Boolean);
  }
  // Handle trim
  if (trim) {
    array = array.map((line) => line.trim());
  }

  result = array.map((element) => reverseString(element));
  return result.join('\n');
}
