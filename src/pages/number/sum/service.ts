export type NumberExtractionType = 'smart' | 'delimiter';

function getAllNumbers(text: string): number[] {
  const regex = /\d+/g;
  const matches = text.match(regex);
  return matches ? matches.map(Number) : [];
}

export const compute = (
  input: string,
  extractionType: NumberExtractionType,
  printRunningSum: boolean,
  separator: string
) => {
  let numbers: number[] = [];
  if (extractionType === 'smart') {
    numbers = getAllNumbers(input);
  } else {
    const parts = input.split(separator);
    // Filter out and convert parts that are numbers
    numbers = parts
      .filter((part) => !isNaN(Number(part)) && part.trim() !== '')
      .map(Number);
  }
  return numbers.reduce(
    (previousValue, currentValue) => previousValue + currentValue,
    0
  );
};
