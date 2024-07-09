export type SplitOperatorType = 'symbol' | 'regex';

export function truncateList(
  splitOperatorType: SplitOperatorType,
  input: string,
  splitSeparator: string,
  joinSeparator: string,
  end: boolean,
  length?: number
): string {
  let array: string[];
  let truncatedArray: string[];
  switch (splitOperatorType) {
    case 'symbol':
      array = input.split(splitSeparator);
      break;
    case 'regex':
      array = input.split(new RegExp(splitSeparator));
      break;
  }
  if (length !== undefined) {
    if (length < 0) {
      throw new Error('Length value must be a positive number.');
    }
    truncatedArray = end
      ? array.slice(0, length)
      : array.slice(array.length - length, array.length);
    return truncatedArray.join(joinSeparator);
  }
  throw new Error("Length value isn't a value number.");
}
