export const beautifyJson = (
  text: string,
  indentationType: 'tab' | 'space',
  spacesCount: number
) => {
  let parsedJson;
  try {
    parsedJson = JSON.parse(text);
  } catch (e) {
    throw new Error('Invalid JSON string');
  }

  const indent = indentationType === 'tab' ? '\t' : spacesCount;

  return JSON.stringify(parsedJson, null, indent);
};
