export const stringifyJson = (
  input: string,
  indentationType: 'tab' | 'space',
  spacesCount: number,
  escapeHtml: boolean
): string => {
  let parsedInput;
  try {
    parsedInput = JSON.parse(input);
  } catch (e) {
    throw new Error('Invalid JSON');
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
