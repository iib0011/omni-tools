export type SplitOperatorType = 'symbol' | 'regex';

function leftUnwrap(
  row: string,
  left: string = '',
  multiLevel: boolean
): string {
  if (left === '') return row; // Prevent infinite loop if left is an empty string
  while (row.startsWith(left)) {
    row = row.slice(left.length);
    if (!multiLevel) {
      break;
    }
  }
  return row;
}

function rightUnwrap(
  row: string,
  right: string = '',
  multiLevel: boolean
): string {
  if (right === '') return row; // Prevent infinite loop if right is an empty string
  while (row.endsWith(right)) {
    row = row.slice(0, row.length - right.length);
    if (!multiLevel) {
      break;
    }
  }
  return row;
}

export function unwrapList(
  splitOperatorType: SplitOperatorType,
  input: string,
  splitSeparator: string,
  joinSeparator: string,
  deleteEmptyItems: boolean,
  multiLevel: boolean,
  trimItems: boolean,
  left: string = '',
  right: string = ''
): string {
  let array: string[];
  let unwrappedArray: string[] = [];
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

  // for each element of array unwrap left side then right side and push the result to a final array
  for (let row of array) {
    row = leftUnwrap(row, left, multiLevel);
    row = rightUnwrap(row, right, multiLevel);
    unwrappedArray.push(row);
  }
  // trim items if needed
  if (trimItems) {
    unwrappedArray = unwrappedArray.map((item) => item.trim());
  }
  return unwrappedArray.join(joinSeparator);
}
