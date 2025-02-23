import { reverseString } from 'utils/string';

export function createPalindrome(
  input: string,
  lastChar: boolean // only checkbox is need here to handle it [instead of two combo boxes]
) {
  if (!input) return '';
  let result: string;
  let reversedString: string;

  // reverse the whole input if lastChar enabled
  reversedString = lastChar
    ? reverseString(input)
    : reverseString(input.slice(0, -1));
  result = input.concat(reversedString);
  return result;
}

export function createPalindromeList(
  input: string,
  lastChar: boolean,
  multiLine: boolean
): string {
  if (!input) return '';
  let array: string[];
  const result: string[] = [];

  if (!multiLine) return createPalindrome(input, lastChar);
  else {
    array = input.split('\n');
    for (const word of array) {
      result.push(createPalindrome(word, lastChar));
    }
  }
  return result.join('\n');
}
