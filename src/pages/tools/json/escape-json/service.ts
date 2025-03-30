export const escapeJson = (input: string, wrapInQuotesFlag: boolean) => {
  const escapedJson = JSON.stringify(input);
  if (!wrapInQuotesFlag) {
    return escapedJson.slice(1, -1);
  }
  return escapedJson;
};
