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
): string => {
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
  if (printRunningSum) {
    let result: string = '';
    let sum: number = 0;
    for (const i of numbers) {
      sum = sum + i;
      result = result + sum + '\n';
    }
    return result;
  } else
    return numbers
      .reduce((previousValue, currentValue) => previousValue + currentValue, 0)
      .toString();
};
