export type NumberExtractionType = 'smart' | 'delimiter';

function getAllNumbers(text: string): number[] {
  const matches = text.match(/-?\d+(?:\.\d+)?/g);
  return matches ? matches.map(Number) : [];
}
function getDelimitedNumbers(text: string, separator: string): number[] {
  const normalizedSeparator = separator.replace(/\\n/g, '\n').trim();
  const pattern = normalizedSeparator
    ? new RegExp(
        normalizedSeparator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*'
      )
    : /\s+/;

  return text
    .split(pattern)
    .map((part) => part.trim())
    .filter((part) => part !== '' && !Number.isNaN(Number(part)))
    .map(Number);
}

export const compute = (
  input: string,
  extractionType: NumberExtractionType,
  printRunningSum: boolean,
  separator: string
): string => {
  console.log(
    'COMPUTE CALLED WITH:',
    JSON.stringify(input),
    'separator:',
    JSON.stringify(separator)
  );

  const numbers =
    extractionType === 'smart'
      ? getAllNumbers(input)
      : getDelimitedNumbers(input, separator);

  if (printRunningSum) {
    let sum = 0;
    return (
      numbers.map((n) => (sum += n)).join('\n') + (numbers.length ? '\n' : '')
    );
  }

  return numbers.reduce((acc, n) => acc + n, 0).toString();
};
