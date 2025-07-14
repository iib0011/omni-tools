import { UpdateField } from '@components/options/ToolOptions';
import { getToolsByCategory } from '@tools/index';
import { ToolCategory } from '@tools/defineTool';
import { I18nNamespaces } from '../i18n';

// Here starting the shared values for string manipulation.

/**
 * This map is used to replace special characters with their visual representations.
 * It is useful for displaying strings in a more readable format, especially in tools
 **/

export const specialCharMap: { [key: string]: string } = {
  '': '␀',
  ' ': '␣',
  '\n': '↲',
  '\t': '⇥',
  '\r': '␍',
  '\f': '␌',
  '\v': '␋'
};

// Here starting the utility functions for string manipulation.

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
 * @returns True if the input contains only digits including float, false otherwise.
 */
export function containsOnlyDigits(input: string): boolean {
  return /^\d+(\.\d+)?$/.test(input.trim());
}

/**
 * unquote a string if properly quoted.
 * @param value - The string to unquote.
 * @param quoteCharacter - The character used for quoting (e.g., '"', "'").
 * @returns The unquoted string if it was quoted, otherwise the original string.
 */
export function unquoteIfQuoted(value: string, quoteCharacter: string): string {
  if (
    quoteCharacter &&
    value.startsWith(quoteCharacter) &&
    value.endsWith(quoteCharacter)
  ) {
    return value.slice(1, -1); // Remove first and last character
  }
  return value;
}

/**
 * Count the occurence of items.
 * @param array - array get from user with a custom delimiter.
 * @param ignoreItemCase - boolean status to ignore the case i .
 * @returns Dict of Items count {[Item]: occcurence}.
 */
export function itemCounter(
  array: string[],
  ignoreItemCase: boolean
): { [key: string]: number } {
  const dict: { [key: string]: number } = {};
  for (const item of array) {
    let key = ignoreItemCase ? item.toLowerCase() : item;

    if (key in specialCharMap) {
      key = specialCharMap[key];
    }

    dict[key] = (dict[key] || 0) + 1;
  }
  return dict;
}

export const getToolCategoryTitle = (categoryName: string): string =>
  getToolsByCategory().find((category) => category.type === categoryName)!
    .rawTitle;

// Type guard to check if a value is a valid I18nNamespaces
const isValidI18nNamespace = (value: string): value is I18nNamespaces => {
  const validNamespaces: I18nNamespaces[] = [
    'string',
    'number',
    'video',
    'list',
    'json',
    'time',
    'csv',
    'pdf',
    'audio',
    'xml',
    'translation',
    'image'
  ];
  return validNamespaces.includes(value as I18nNamespaces);
};

export const getI18nNamespaceFromToolCategory = (
  category: ToolCategory
): I18nNamespaces => {
  // Map image-related categories to 'image'
  if (['png', 'image-generic'].includes(category)) {
    return 'image';
  } else if (['gif'].includes(category)) {
    return 'video';
  }
  // Use type guard to check if category is a valid I18nNamespaces
  if (isValidI18nNamespace(category)) {
    return category;
  }

  return 'translation';
};
