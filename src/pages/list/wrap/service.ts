export type SplitOperatorType = 'symbol' | 'regex';

function wrap(array: string[], left: string, right: string): string[] {
  return array.map((element) => left + element + right);
}

export function wrapList(
  splitOperatorType: SplitOperatorType,
  input: string,
  splitSeparator: string,
  joinSeparator: string,
  deleteEmptyItems: boolean,
  left: string = '',
  right: string = ''
): string {
  let array: string[];
  let wrappedArray: string[];
  switch (splitOperatorType) {
    case 'symbol':
      array = input.split(splitSeparator);
      break;
    case 'regex':
      array = input.split(new RegExp(splitSeparator));
      break;
  }
  if (deleteEmptyItems) {
    array = array.filter(Boolean);
  }
  wrappedArray = wrap(array, left, right);
  return wrappedArray.join(joinSeparator);
}
