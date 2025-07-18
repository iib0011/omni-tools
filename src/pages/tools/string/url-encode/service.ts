import { InitialValuesType } from './types';

export function encodeString(
  input: string,
  options: InitialValuesType
): string {
  if (!input) return '';
  if (!options.nonSpecialChar) {
    return encodeURIComponent(input);
  }

  let result = '';
  for (const char of input) {
    const hex = char.codePointAt(0)!.toString(16).toUpperCase();
    result += '%' + hex.padStart(2, '0');
  }
  return result;
}
