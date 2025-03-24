import { UpdateField } from '@components/options/ToolOptions';

export function capitalizeFirstLetter(string: string | undefined) {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function isNumber(number: any): boolean {
  return !isNaN(parseFloat(number)) && isFinite(number);
}

export const updateNumberField = <T>(
  val: string,
  key: keyof T,
  updateField: UpdateField<T>
) => {
  if (val === '') {
    // @ts-ignore
    updateField(key, '');
  } else if (isNumber(val)) {
    // @ts-ignore
    updateField(key, Number(val));
  }
};

export const replaceSpecialCharacters = (str: string) => {
  return str
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\r/g, '\r')
    .replace(/\\b/g, '\b')
    .replace(/\\f/g, '\f')
    .replace(/\\v/g, '\v');
};

export function reverseString(input: string): string {
  return input.split('').reverse().join('');
}

/**
 * Checks if the input string contains only digits.
 * @param input - The string to validate.
 * @returns True if the input contains only digits, false otherwise.
 */
export function containsOnlyDigits(input: string): boolean {
  return /^-?\d+(\.\d+)?$/.test(input.trim());
}
