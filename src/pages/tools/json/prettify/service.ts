import { InitialValuesType } from './types';
export const beautifyJson = (text: string, options: InitialValuesType) => {
  const { indentationType, spacesCount } = options;

  let parsedJson;
  try {
    parsedJson = JSON.parse(text);
  } catch (e) {
    throw new Error('Invalid JSON string');
  }

  const indent = indentationType === 'tab' ? '\t' : spacesCount;

  return JSON.stringify(parsedJson, null, indent);
};
