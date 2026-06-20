export const stringifyJson = (
  input: string,
  indentationType: 'tab' | 'space',
  spacesCount: number,
  escapeHtml: boolean
): string => {
  try {
    const parsedInput = JSON.parse(input);

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
  } catch (e) {
    throw new Error('Invalid JSON input');
  }
};
