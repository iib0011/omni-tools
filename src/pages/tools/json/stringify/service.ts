import { InitialValuesType } from './types';
import JSON5 from 'json5';

export const stringifyJson = (
  input: string,
  options: InitialValuesType
): string => {
  const { indentationType, spacesCount, escapeHtml } = options;
  let parsedInput;
  try {
    // Json5 safer than eval
    parsedInput = JSON5.parse(input);
  } catch (e) {
    throw new Error('Invalid JavaScript object/array');
  }

  const indent = indentationType === 'tab' ? '\t' : ' '.repeat(spacesCount);

  let result = JSON.stringify(parsedInput, null, indent);

  if (escapeHtml) {
    result = result
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  return result;
};
